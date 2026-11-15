# Inventario backend `playhoot` - dominios y datos

Alcance: paquetes de dominio y su persistencia. Solo lectura; no se juzga ni se propone nada. Fecha del inventario: 2026-11-15. Repo en `repos/playhoot`, ultimo commit `19a1ece` (7-nov-2026), 319 commits.
Convencion: **[V]** verificado en codigo; **[D]** dicho por doc y no contrastado; **[I]** inferido. Cuando doc y codigo difieren se reporta el codigo y se anota en la seccion "Discrepancias doc/codigo".

## 0. Resumen estructural

| Paquete | Go files (tests) | Estado |
|---|---|---|
| `identity` | 92 (43) | Real, completo para identity-v1 + AI OAuth + grants (grants sin commitear) |
| `game` | 64 (27) | Real: juego, ediciones, tarjeta, publicacion, plantillas (paso 1) |
| `play` | 423 (211) | Real y es el grueso: `play/session` (durable) + `play/runtime` (en vivo, sandbox, replay) |
| `discovery` | 2 (0) | Stub: tipos + `templatecatalog` que devuelve listas vacias |
| `composer` | 6 (3) | Real, un grupo `gameauthoring` (lecturas) |
| `orchestrator` | 26 (14) | Real, dos grupos `gameauthoring` y `playlifecycle` (escrituras) |
| `community` | 0 | Solo `README.md` ("TBD") |
| `profile` | 0 | Solo `README.md` (incompleto: "Profile creation (including signup)") |
| `sessionhistory` | 0 | Solo `README.md` ("Storing histories for plays; metrics, analytics") |
| `utils` | 5 (2) | Real: `RunInDBTransaction`, `DBServicer`, `DisposableTestDB`, `ratelimit` |
| `logging` | 2 (1) | Real: request log estructurado por pasos (`Step`, `LogFields`) |
| `monitoring` | 7 (1) | Real a medias: metricas y `Alert` solo escriben al log; backend externo con `TODO` |
| `third_party/qjs` | 15 | Fork vendorizado y parcheado de `fastschema/qjs v0.0.6` (QuickJS en WASM), `replace` en `go.mod` |
| `local` | 0 Go | Datos del emulador GCS (`local/gcs`, `local/gcs-data` ignorado por git) |
| `plans` | 0 Go | Dos `.docx` (plan de identidad, plan de session runtime) |
| `api`, `deploy`, `docs`, `.claude` | fuera de alcance | (otro agente) |

Otros top-level con Go: solo `main.go`, `migrations.go`, `comment_standard_test.go` en raiz (fuera de alcance salvo para trazar quien llama a quien).

Hechos transversales [V]:
- **Un solo Postgres, sin FKs**: ninguna migracion declara FOREIGN KEY; las referencias son columnas indexadas (`game_id`, `user_id`, `game_version_id`...) mantenidas por la aplicacion. Entre dominios la referencia es `*_uuid` logico (`owner_uuid`, `created_by_user_uuid`, `user_uuid`).
- **Migraciones en SQL crudo con gormigrate**, tabla compartida `migrations`; cada dominio expone `Migrate(db)`; `migrations.go` las corre en orden `game` -> `play/session` -> `identity`. Seeds (`Seed`) solo `game` y `play`, solo fuera de produccion. Pre-lanzamiento las migraciones se editan en sitio (el commit lo dice, memoria del usuario tambien), no hay migraciones correctivas.
- **Sin literales en SQL**: estados como constantes Go interpoladas o bind params.
- **No hay imports directos dominio->dominio** [V]: `identity`, `game`, `play`, `discovery` solo importan su propio arbol + `logging`/`monitoring`/`utils`. Solo `composer` y `orchestrator` (y `api`, `main.go`) importan varios dominios. Detalle en cada seccion.
- Convencion de capas: `usecases/<verbo>` (operacion independiente, `Service`), `workflows/<nombre>` (`Manager` + un `step_*.go` por paso), `internal/business/<comportamiento>` (reglas puras), `internal/repo` por usecase/workflow (interfaces estrechas por paso, mockgen), `internal/migrations`.
- Idempotencia por tabla de "requests" con clave unica (`*_requests`) en identity (guest), game (create, card image, edition, release) y play (create session, change attempts).
- Historial ("data trailing", estandar `docs/engineering/standards/data-history.md`): valores escritos una vez llevan `<evento>_at`; valores que cambian mas de una vez tienen tabla `*_changes`/`*_events` append-only escrita en la misma transaccion. Detalle por tabla abajo.

## 1. `identity`

**Proposito** [V]: identidad estable de la persona (`UserUUID`), guests y cuentas (solo Google + proveedor `local` ficticio), credenciales propias (JWT de acceso HS256 15 min + refresh opaco rotatorio), catalogo de operaciones con nivel minimo de autenticacion, y servidor de autorizacion OAuth 2.1 para clientes de IA (MCP). Mas "resource links" y "resource grants" (secretos de uso acotado sobre un recurso opaco).

### 1.1 Estructura

Contrato publico: `identity/identity.go` (tipos, `Operation`, `Level`, outcomes, errores; solo stdlib). Reglas puras: `identity/internal/business/{accesstoken, aiauth, displayname, login, operationlevel, refreshtoken, resourcegrant, resourcelink}`.

| Paquete | Tipo | Que hace |
|---|---|---|
| `usecases/authorize` | usecase | `Authorize(token, operation)`: verifica JWT sin leer BD, aplica nivel minimo del catalogo; operacion no catalogada = forbidden + `monitoring.Alert` |
| `usecases/listoperations` | usecase | Publica el catalogo operacion->nivel (`GET /v1/identity/operations`) |
| `usecases/createguest` | usecase | Crea guest con nombre normalizado + sesion de credenciales; idempotente por `idempotency_key`; ventana de reuso 5 min (`ReplayWindow`) |
| `usecases/refreshcredentials` | usecase | Refresh: access nuevo; rota refresh si el actual tiene >5 h (`replaced_by_id`); acepta el predecesor inmediato 5 min (`PreviousGrace`); si no `refresh_invalid` |
| `usecases/endsession` | usecase | Logout: desactiva la sesion del refresh token; idempotente |
| `usecases/setdisplayname` | usecase | Fija nombre visible (max 64 runas), registra cambio |
| `usecases/resourcelinks` | usecase | Links secretos `phl_` a un recurso (kind+id opacos), 1 abierto por user+recurso, 7 dias |
| `usecases/resourcegrants` | usecase | **Sin commitear**: grants de un solo uso `phg_` (ver 1.8) |
| `usecases/aiauthorization` | usecase | Servidor OAuth de IA: DCR, authorize+PKCE S256, consentimiento, token, refresh con rotacion, revocacion RFC 7009, listar/revocar conexiones |
| `workflows/accountlogin` | workflow | Login de cuenta (3 pasos, abajo) |
| `loginproviders` | puerto + impls | `Provider` (ver 1.6) |

**Workflow `accountlogin`** (`Manager`; `step_start.go`, `step_callback.go`, `step_complete.go`) [V]:
1. `StartLogin(provider, codeChallenge, guestUserUUID)`: registra intento (state, nonce, challenge S256, verifier PKCE hacia el proveedor, guest opcional; vida 5 min) y devuelve URL de autorizacion.
2. `HandleCallback(provider, state, code, providerError)`: marca el intento respondido una sola vez (antes de hablar con el proveedor), intercambia el codigo fuera de transaccion, resuelve (issuer, subject)->User: existente / `linked_guest` (la cuenta hereda el UserUUID del guest) / `created` (User nuevo sin display name); emite codigo one-time de 60 s. Errores: cancelled / failed / unavailable.
3. `CompleteLogin(code, codeVerifier, replacesRefreshToken)`: valida verifier (el codigo se consume aunque falle), abre sesion de la cuenta y termina la del guest reemplazado en la misma transaccion.
- "Maquina de estados" = eventos append-only en `identity_login_attempt_events`: `started`, `answered`, `cancelled`, `failed`, `unavailable`, `code_issued`, `completed`, `rejected` (con `reason`). El estado actual vive en columnas de `identity_login_attempts` (answered_at, login_code, completed_at...).

Niveles: `anonymous < guest < account`. Catalogo (`operationlevel`) [V]: `CREATE_SESSION` account, `JOIN_SESSION_AS_ADMIN` account, `JOIN_SESSION_AS_PLAYER` guest, `REPORT_CLIENT_TELEMETRY` guest, `VIEW_OWN_IDENTITY` guest, `SET_OWN_DISPLAY_NAME` guest, `CREATE_GAME` account, `EDIT_GAME` account, `CONNECT_AI` account. No hay roles ni permisos por objeto: cada dominio decide los suyos.

### 1.2 Superficie exportada (metodos que otros llaman)

| Metodo | Tipo | Significado |
|---|---|---|
| `Authorize` | lectura | token -> `User{UUID, DisplayName, Level}` + `allowed/unauthenticated/forbidden` |
| `ListOperations` | lectura | catalogo |
| `CreateGuest` | escritura | guest + credenciales |
| `Refresh` | escritura | renueva credenciales |
| `EndSession` | escritura | logout |
| `SetDisplayName` | escritura | nombre visible |
| `StartLogin`/`HandleCallback`/`CompleteLogin` | escritura | login de cuenta |
| `CreateResourceLink`/`RevokeResourceLink` | escritura | link secreto a recurso |
| `ResourceLinkStatus` | lectura | hay link vivo? (nunca devuelve el link) |
| `ResolveResourceLink` | lectura | token -> user+kind+id (`valid/unknown/expired/revoked`) |
| `CreateResourceGrant`/`ClaimResourceGrant`/`ReleaseResourceGrant` | escritura | grant de un uso |
| `RegisterClient`, `StartAuthorization`, `DecideAuthorization`, `ExchangeToken`, `Revoke`, `RevokeConnection` | escritura | OAuth de IA |
| `ReadAuthorization`, `VerifyAccessToken`, `ListConnections` | lectura | OAuth de IA |

### 1.3 Datos propios (14 tablas) [V]

| Tabla | Columnas clave / proposito | Indices / unicos / enums |
|---|---|---|
| `identity_users` | `user_uuid` (publico), `display_name` NULL (cuenta nueva sin nombre) | UNIQUE user_uuid |
| `identity_accounts` | `user_id` - marca "registrado" | UNIQUE user_id |
| `identity_sessions` | una fila por refresh token: `session_uuid`, `refresh_token` (en claro), `issued_at`, `started_at`, `expires_at` NULL (guest nunca expira), `deactivated_at`, `replaced_by_id` | UNIQUE refresh_token; UNIQUE parcial `session_uuid` WHERE deactivated_at IS NULL; idx user_id |
| `identity_guest_requests` | idempotencia de guest: `idempotency_key`, `display_name`, `user_uuid`, `session_uuid` | UNIQUE idempotency_key |
| `identity_external_identities` | (`issuer`,`subject`)->`user_id`; `email`,`name` solo observados | UNIQUE(issuer,subject); idx user_id |
| `identity_login_attempts` | `state`, `provider`, `code_challenge`, `nonce`, `provider_code_verifier`, `guest_user_id`, `answered_at`, `user_id`, `login_code`, `login_code_expires_at`, `completed_at` | UNIQUE state, UNIQUE login_code |
| `identity_login_attempt_events` | historial del intento (`event`, `reason`, `observed_email`, `observed_name`) | idx attempt_id |
| `identity_display_name_changes` | historial de nombres (`from_name`,`to_name`) | idx user_id |
| `identity_resource_links` | `resource_kind`,`resource_id`,`token_sha256`,`expires_at`,`revoked_at` | UNIQUE token_sha256; UNIQUE parcial (user_id,kind,id) WHERE revoked_at IS NULL |
| `identity_resource_grants` | `uuid`,`resource_kind`,`resource_id`,`scope`,`token_sha256`,`expires_at`,`used_at` (se puede limpiar al `Release`) | UNIQUE uuid, token_sha256; idx (user_id, expires_at) |
| `identity_ai_clients` | cliente OAuth registrado (DCR): `client_id`, `redirect_uris` JSONB, `grant_types` | UNIQUE client_id |
| `identity_ai_authorization_requests` | peticion de consentimiento: `request_id`, `code_challenge`, `scope`, `resource`, decision (`decided_at`,`approved`), `code_sha256`, `code_expires_at`, `code_used_at` | UNIQUE request_id, code_sha256 |
| `identity_ai_sessions` | una conexion por IA aprobada: `connection_id`, `revoked_at`, `revoke_reason` | `revoke_reason` in {`user`,`client`,`code_reuse`,`refresh_reuse`}; idx (user_id, created_at) |
| `identity_ai_refresh_tokens` | `token_sha256`, `expires_at`, `used_at` (rotacion) | UNIQUE token_sha256; idx (session_row_id, created_at) |

- Historial: `identity_login_attempt_events`, `identity_display_name_changes` (append-only); write-once: `deactivated_at`, `replaced_by_id`, `revoked_at`, `used_at`, `decided_at`. Logins y eventos se conservan para siempre (decision de cierre ADR-0003).
- Soft-delete: no hay `deleted_at`. Se borra fisicamente solo `identity_resource_grants` expirados hace >1 dia (al crear otro grant del mismo user) [V].
- Secretos: solo hashes SHA-256 de links, grants, codigos y refresh de IA. El refresh de usuario (`phr_`) se guarda tal cual [V].
- No hay tabla de cola/outbox. No hay email ni perfil (la unica "data personal" es `email`/`name` observados de Google y `display_name`).

### 1.4 Dependencias cruzadas
Imports: solo `logging`, `monitoring`, `utils` [V]. Llamado por: `api` (autorizacion, login, guests, OAuth), `orchestrator/gameauthoring` (crear/revocar AI link), `composer/gameauthoring` (`ResourceLinkStatus`), `api/games` (grants, resolver de links). No importa `game`/`play`; `game.ResourceKind="game"` es convencion que nombra el recurso al llamar (Identity no sabe que es un juego).

### 1.5 Puertos de integracion
- `loginproviders.Provider` (`AuthorizationURL`, `Exchange`): impl **Google real** (`google.go`: PKCE S256, ID token RS256 verificado, email solo si verificado; habilitado por `GOOGLE_OAUTH_CLIENT_ID/SECRET/REDIRECT_URL`; **nunca verificado contra Google real** segun doc, ningun entorno lo configura) y **local ficticio** (`local.go`, `IDENTITY_LOCAL_PROVIDER=true`, solo dev/test, pagina para elegir nombre).
- No hay puerto de email, SMS, pagos ni storage en identity.

### 1.6 Limites de negocio [V]
| Limite | Valor | Fuente |
|---|---|---|
| Access token | 15 min (claims: sub, exp, level, nombre) | const `accesstoken.Lifetime`; clave `IDENTITY_ACCESS_TOKEN_KEY` (>=32 B, obligatoria en prod) |
| Refresh de cuenta | expira a 30 d sin uso / 90 d desde login; guests nunca expiran | `refreshtoken` |
| Rotacion de refresh / gracia predecesor | 5 h / 5 min | `refreshtoken` |
| Intento de login / codigo | 5 min / 60 s | `login` |
| Guest: replay de clave | 5 min | `createguest.ReplayWindow` |
| Guests por IP cliente | 200/hora | `api/identity/handler.go:97` (limite en el borde, no en el dominio) |
| Display name | 64 runas | `displayname.MaxLength` |
| Resource link | 7 dias; 1 abierto por user+recurso | `resourcelink` |
| Resource grant | 15 min, **20 vivos por user** (`ErrTooManyResourceGrants`), scope <=256 B | `resourcegrant` |
| IA: access JWT / refresh / peticion / codigo | 1 h / 30 d / 10 min / 2 min; max 8 redirect URIs, nombre 100 runas | `aiauth` |
| IA scope | unico `games` (leer/crear/cambiar juegos; nunca publicar) | `aiauth.ScopeGames` |

### 1.7 Trabajo a medias / pendiente
- **WIP sin commitear (resource grants)** [V por `git status`]: `identity/internal/business/resourcegrant/`, `identity/internal/migrations/20261107000000_identity_resource_grants.go`, `identity/usecases/resourcegrants/` (nuevos), mas cambios en `identity/identity.go` (tipos `CreatedResourceGrant`, `ClaimedResourceGrant`, `ErrTooManyResourceGrants`), `migration.go` (registro) y `CURRENT_STATE.md`. Su fin: subir assets de juegos por URL de un solo uso para agentes IA (`api/games/asset_upload_url.go`, tambien nuevo; `PUT /v1/asset-uploads/{token}`; MCP `request_asset_upload`). Funcional y con doc/CHECKLIST ya marcados `[x]` (2026-11-07), solo falta commit.
- Sin implementar (doc "Identity Phase 2"): pantalla de cuenta, listar/terminar sesiones por dispositivo, Google real, retencion de guests abandonados, rotacion de clave de firma, **reconciliacion/merge de identidades** (login a cuenta existente desde guest = cambia de usuario sin fusionar), revocacion no alcanza access tokens emitidos ni WebSockets abiertos.
- No hay roles/permisos, ni MFA, ni password, ni otros proveedores.

## 2. `game` (Game Management)

**Proposito** [V]: dueno del ciclo de vida de autoria: Game (tarjeta: nombre, descripcion, logo, fotos, visibilidad), ediciones (cada una = version de Play en construccion), releases (publicacion) y marca de "plantilla". No tiene scripts ni versiones ejecutables (son de Play). Paquete `game` raiz = contrato (tipos, solo stdlib).

### 2.1 Estructura

| Paquete | Tipo | Que hace |
|---|---|---|
| `usecases/checkplayability` | usecase | `IsPlayable(game, user)`: publicado, no borrado y (publico o del user); **cableado** (lo usa `orchestrator/playlifecycle`) |
| `usecases/checkvisibility` | usecase | `IsVisible(game)` por `visibility`; **sin cablear** en `main.go` [V: no aparece] |
| `usecases/findeditableversion` | usecase | `FindEditableVersion(game, user)`: version de la edicion abierta si el user es dueño; `found/not_found/not_editable`; devuelve `BaseVersionUUID` y `Template` |
| `usecases/findtemplate` | usecase | `FindTemplate(game)`: publicado, no borrado, `template_allowed`; devuelve version publicada mas reciente |
| `workflows/gamelifecycle` | workflow | Ver abajo |
| `workflows/gamecard` | workflow | Tarjeta: `ListGames`, `ReadCard`, `UpdateCard`, `UploadImage`, `RemoveImage` |
| `internal/business/{card, edition}` | reglas | texto/imagenes de tarjeta; estados de edicion |
| `internal/businessservice` | reglas legado | `IsPlayableVisibility`, normaliza visibilidad (README dice que es patron antiguo) |

**Workflow `gamelifecycle`** (`Manager`, un `step_*.go` por paso) [V]:
- `CreateGame(owner, name, idempotencyKey, template*)`: 1 transaccion = reclama `game_create_requests` + crea Game privado no publicado con nombre + primera edicion `EDITING` (su uuid = uuid de la version de Play); registra plantilla en request y edicion; conflicto si misma clave con otro nombre/plantilla. Metrica `game_create_total`.
- `BeginPublication(owner, game, revision, visibility, key)` -> `FindPublication`, `FindPendingPublication`, `CompletePublication(release, languages)`, `AbandonPublication(release, reason)`: crea `game_releases` (secuencia por juego, 1 pendiente por juego), exige nombre (`name_required`), solo visibilidad `public`/`private`; completar = edicion `EDITING->PUBLISHED` + `games.published_at` (una vez) + visibilidad + release `completed_at` con `languages`.
- `OpenEdition(owner, game, key)`: nueva edicion `EDITING` de un juego ya publicado (no si hay edicion abierta o release pendiente); idempotente por `game_edition_requests`.
- **Estados** [V]: edicion `EDITING -> PUBLISHED` (inmutable); release: pendiente (sin `completed_at`/`abandoned_at`) -> `completed` | `abandoned` (con `abandon_reason`); `visibility` valores: `draft`, `private`, `hidden`, `public` (solo `private` y `public` se publican; `draft`/`hidden` existen como constantes, `Hidden` y `Public` son "jugables" en `businessservice`, pero `checkplayability` solo acepta `public`/dueño de `private`).

**Workflow `gamecard`**: texto con limites (ver 2.7); `UploadImage` corta por tamaño, valida PNG/JPEG/WebP por bytes, registra intencion en `game_card_objects` antes de guardar en `games/card-images/<sha256>`, idempotente por clave. Imagenes se leen con URL firmada (15 min) generada por el `imageStore` (`PresignGet`).

### 2.2 Superficie exportada
Escrituras: `CreateGame`, `BeginPublication`, `CompletePublication`, `AbandonPublication`, `OpenEdition`, `UpdateCard`, `UploadImage`, `RemoveImage`. Lecturas: `IsPlayable`, `IsVisible`, `FindEditableVersion`, `FindTemplate`, `FindPublication`, `FindPendingPublication`, `ListGames`, `ReadCard`.

### 2.3 Datos propios (10 tablas) [V]

| Tabla | Clave / proposito | Notables |
|---|---|---|
| `games` | `uuid`, `name`, `description`, `owner_uuid`, `visibility`, `published_at` (una vez), `template_allowed`, `template_featured` (bool, default false), `created_at/updated_at`, `deleted_at` | UNIQUE uuid. **`deleted_at` solo se lee como filtro; no se encontro codigo que lo escriba** |
| `game_histories` | historial de `name`,`description`,`visibility`,`is_published` (solo campos cambiados; creacion = todos) | append-only |
| `game_editions` | `uuid` (= uuid version Play), `game_id`, `status` (`EDITING`/`PUBLISHED`), `template_game_uuid`, `template_version_uuid`, `published_at` | UNIQUE parcial 1 `EDITING` por juego |
| `game_edition_status_changes` | historial de estado de edicion | append-only |
| `game_create_requests` | idempotencia: UNIQUE(owner_uuid, idempotency_key), `name`, `template_game_uuid`, `game_id` (una vez) | |
| `game_card_images` | imagen mostrada: `kind` logo/photo, `sha256`, `object_key`, `removed_at` (una vez) | idx parcial WHERE removed_at IS NULL; sirve de historial de imagenes |
| `game_card_objects` | registro de objetos guardados (se registra antes de subir bytes): UNIQUE sha256, `deleted_at` | estandar object-storage |
| `game_card_image_requests` | idempotencia de subida: UNIQUE(game_id, key) | |
| `game_releases` | `uuid`, `edition_id`, `sequence`, `revision`, `visibility`, `owner_uuid`, `idempotency_key`, `completed_at`, `abandoned_at`, `abandon_reason`, `languages` JSONB | UNIQUE(game_id,sequence), UNIQUE(game_id,key), UNIQUE parcial 1 pendiente por juego |
| `game_edition_requests` | idempotencia de abrir edicion | UNIQUE(game_id,key) |

Sin cola/outbox. Sin categorias/tags en tablas (solo `discovery` tiene tipos de categoria sin datos).

### 2.4 Dependencias cruzadas
Imports: solo `game` + `logging`/`monitoring`/`utils` [V]. Llamado por `orchestrator/gameauthoring` y `playlifecycle`, `composer/gameauthoring`, y directamente por `api` (`gamecard` en `api.Games.Cards`, lectura/edicion de tarjeta sin coordinacion). No conoce `play`: solo referencia la version por uuid.
Nota de acoplamiento fisico: `gamecard.New(db, store)` recibe el mismo bucket GCS que usa `play` (instancia inyectada en `main.go`, sin import).

### 2.5 Puertos
`gamecard.imageStore` (`Put`, `PresignGet`): satisfecho por `play/session/storage.Store` (GCS real / emulador / `Unconfigured` / fake en memoria en tests).

### 2.6 Limites de negocio [V]
| Limite | Valor | Fuente |
|---|---|---|
| Nombre / descripcion | 80 / 2000 runas | `card.MaxNameRunes/MaxDescriptionRunes` |
| Fotos por tarjeta | 8 (+1 logo) | `card.MaxPhotos` |
| Peso imagen | logo 2 MiB, foto 5 MiB; PNG/JPEG/WebP por bytes | `card.MaxImageBytes` |
| Publicar | nombre obligatorio | `card.PublishBlockers` |
| Release pendiente / edicion abierta | 1 por juego | indices parciales |
No hay tope de juegos por usuario ni cuota de ningun tipo en `game`.

### 2.7 Trabajo a medias
- **Nadie escribe `template_allowed`/`template_featured`**: grep en codigo y tests no encuentra escritura (solo la columna y el `WHERE` de `findtemplate`). El doc dice "set only by seeds and tests"; los seeds de `game` marcan juegos publicos pero no plantilla [V]. Hoy no hay forma de crear una plantilla salvo SQL manual.
- `games.deleted_at` sin writer; `checkvisibility` sin cablear; visibilidades `draft`/`hidden` sin flujo.
- `game/CURRENT_STATE.md` contradice el codigo (ver Discrepancias).
- Seed: `seed_20261103000000_game_play_seed_games` registra los 4 juegos semilla de Play como publicados/publicos (dueño `00000000-0000-4000-8000-000000000001`).

## 3. `play`

Carpeta (no paquete Go): cada subpaquete expone su contrato en su raiz. Proposito [V]: `play/session` = estado **durable** de Sessions, versiones de juego, borradores, builds, previews, replays; `play/runtime` = ejecucion **en vivo** (un controller por Session en memoria, sandbox QuickJS, simulacion, grabacion de replay). Fuentes: `play/README.md`, `play/CURRENT_STATE.md`, ADRs 0028-0035 en `play/docs/decisions/`.

### 3.1 `play/session` - usecases

| Usecase | Que hace |
|---|---|
| `checkadminjoin` | `EligibleToJoinAsAdmin`: RUNNING o LOBBY vigente y el user es creador |
| `checkplayerjoin` | `EligibleToJoinAsPlayer`: LOBBY vigente (RUNNING = `session_started`) |
| `checklivesession` | `CheckLiveSession`: vivo / not_found / ended / lobby_expired (lo pide `ownership`) |
| `resolvejoincode` | `ResolveJoinCode` (case-insensitive): `found/expired/session_started/invalid` |
| `frontendaccess` | `FrontendAccess(session)`: URLs firmadas a paquete frontend + assets, 1 lote por version compartido por Sessions y instancias (24 h; reuso si vence >5 min tras `expires_at`) |
| `loadruntimemanifest` | manifest + input requirements de la version de la Session |
| `loadsessionlimits` | deadlines de la Session (lobby, expires_at) |
| `recordgamefault` | un `game_fault` de un participante (solo RUNNING, solo participante) |
| `recordlimithits` | vuelca cada 5 s los limites alcanzados (`SERVER_LIMIT`) en `play_game_fault_reports` |
| `storereplaychunk` | escribe el objeto del chunk y luego lo registra |
| `keepsimulationresults` | `KeepSimulationResult`, `FindSimulationResult`, `CountSimulations` |
| `readsdkguide` | `ReadPage`: pagina de la guia SDK del checkout del toolchain (<=256 KiB) |

### 3.2 `play/session` - workflows y batch

**`sessionlifecycle`** (`Manager`, pasos): `CreateSession`, `CheckStartEligibility`, `CommitStart`, `EndSession`, `LoadRunningSession`, `RecordOwnerHeartbeat`, `SaveCheckpoint`.
- `CreateSession(user, game, key)`: 1 transaccion: reclama `play_create_session_requests` -> lock del creador (advisory) -> cuenta Sessions activas (lobby vigente o running) -> si `>= maxActive` termina `active_session_limit` -> busca version actual del juego (inexistente = `game_unavailable`; no ejecutable = dato roto + alerta) -> crea Session `LOBBY` + codigo de 6 caracteres (alfabeto sin 0/O/1/I/L, max 10 intentos) -> completa el request. Metrica `play_session_create_total{outcome}`.
- `CommitStart`: roster P1..Pn + checkpoint inicial + `RUNNING` + libera codigos, 1 transaccion. `EndSession(cause, changedBy)`: unica via a estado terminal.
- **Maquina de estados de Session** [V] (`sessionstatus`, `endcause`): `LOBBY -> RUNNING`; terminales `FINISHED`, `CANCELLED`, `EXPIRED`, `ABORTED`. Causa -> estado (desde): `GAME_FINISHED`->FINISHED (RUNNING); `HOST_CANCELLED`->CANCELLED (LOBBY,RUNNING); `ALL_PLAYERS_LEFT`->CANCELLED (RUNNING); `PLATFORM_TERMINATED`->CANCELLED (LOBBY,RUNNING); `LOBBY_EXPIRED`->EXPIRED (LOBBY); `INACTIVITY_TIMEOUT`->EXPIRED (RUNNING); `MAX_LIFETIME`->EXPIRED (LOBBY,RUNNING); `GAME_START_FAILURE`->ABORTED (LOBBY); `SCRIPT_FAILURE`, `UNRECOVERABLE_INFRA_FAILURE`, `OWNER_LOST`->ABORTED (RUNNING).

**`versiondrafting`** (borradores de fuentes de una version `DRAFT`, `Manager`): `CreateDraftVersion`, `ApplyChanges`, `ApplyTemplate`, `RestoreRevision`, `ReadDraft`, `ListRevisions`, `RevisionChanges`, `DiffRevisions`, `UploadAsset`, `RemoveAsset`, `ReadBuild` (long poll <=20 s), `LoadBuiltRevision`, `SignBuiltFrontend`, `CheckPublication`, `FreezeVersion`, `CleanUnusedObjects`.
- Cambio (`ApplyChanges`) en 1 transaccion: reclama intento (idempotencia por clave + hash de peticion) -> decide `not_editable` / `conflict` (base != actual, optimista) / `invalid` (diagnosticos por path) / `unchanged` / `applied` (siguiente revision, encola build, marca `SUPERSEDED` los builds `QUEUED` anteriores de la version). Soporta `Edits` (find/replace con diff unificado).
- Subida de asset: slot de memoria (4 por instancia, espera 2 s, `ErrUploadsBusy`) -> lee con corte al limite del tipo, hash, tipo real por bytes -> registra en `play_asset_objects` -> guarda direccionado por contenido -> liga la clave en una revision nueva.
- **Maquina de estados de version** [V]: `DRAFT -> EXECUTABLE` por `FreezeVersion` (inmutable, `play_games.current_version_id` apunta a ella; `already_frozen` idempotente; `revision_changed` si el draft se movio). Un juego tiene como maximo 1 `DRAFT` (indice parcial).
- Revision: `kind` template/edition/change/restore/asset; `actor` person/ai/platform; `origin` web/api/mcp (NULL si la hizo la plataforma). Intentos: `change`, `restore`, `asset_upload`, `asset_removal`, `template`.
- Bloqueos de publicacion: `build_not_for_current_revision`, `build_not_succeeded`, `missing_required_assets`, `revision_changed`.

**`versionbuilding`** (worker de builds): `Run`, `RequeueInterrupted`, `RunNextBuild`. Cola = tabla `play_game_version_builds` (`FOR UPDATE SKIP LOCKED`, indice parcial de `QUEUED`); 1 worker por instancia (`DefaultWorkers=1`), despertado por `buildsignal` y cada 5 s. **Estados de build** [V]: `QUEUED -> RUNNING -> SUCCEEDED | FAILED`; `QUEUED -> SUPERSEDED`; `RUNNING -> QUEUED` solo al reiniciar. Reusa un build exitoso con mismo `inputs_sha256`; construye via puerto `gamebuild.Builder`, valida con `scriptcheck` perfil `sdk-v1` y parser de manifest; falla de infraestructura = etapa `infrastructure`, nunca culpa del juego.

**`previewlifecycle`**: `OpenPreview`, `EndPreview`, `FindPreview`. Previews de un build `SUCCEEDED`, 1 por juego (indice parcial `ended_at IS NULL`; abrir uno reemplaza el anterior `replaced`). Razones de fin: `finished`, `idle`, `ended_by_owner`, `replaced`, `script_failure`, `unavailable`.

**Batch `batches/reconcilesessions`** (`Run` cada 5 min en toda instancia; `ReconcileSessions`): termina lobbies vencidos (`LOBBY_EXPIRED`), RUNNING pasadas de `expires_at` (`MAX_LIFETIME` o `GAME_FINISHED` si el replay quedo finalizado) y RUNNING con `owner_lease_expires_at` vencido (`OWNER_LOST`); pagina de 100, `lock_timeout` 5 s.

### 3.3 `play/runtime`

| Pieza | Que hace |
|---|---|
| `workflows/liveconnection` | `ControllerResolver` (`AttachAdmin`, `AttachPlayer`, `TerminateSession`, `Close`) y `Previews` (`StartPreview`, `AttachPreview`). El controller (un goroutine principal por Session) ejecuta admision de lobby, SAMPLEs, COMMANDs, start, ticks de 100 ms, reintentos, checkpoints (cada >=5 s), recuperacion perezosa, reattach/rejoin/leave, desconexion con gracia de transporte 3 s, auditoria de limites, fin de Session. Un `step_*.go` por operacion (36 archivos) |
| `workflows/replayrecording` | `Recorder` (`StartRecording`, `Offer`, `Finish`, `StopRecording`, `Close`): chunks de `REPLAY_CHUNK_DURATION` (60 s) zstd; cola acotada por instancia (`REPLAY_MAX_PENDING_CHUNKS`=64, 5 intentos) |
| `usecases/ownership` | `LocateOrClaimOwner`, `ReleaseOwner`: **placeholder** (siempre `owned_here`, epoca 1, sin registro) |
| `usecases/simulategame` | `Simulate`, `Result`, `ReadState`: juega un escenario `playhoot.scenario.v1` en reloj virtual sobre el script de un build, sin controller |
| `usecases/limitaudit` | `Hit`, `Run`, `Flush` |
| `sandbox` | `Host`: un proceso worker por contexto (re-exec del binario), QuickJS-WASM sin capacidades del host; `scriptcheck` valida scripts (perfiles `handwritten`, `sdk-v1`) |
| `replay` | contrato de lo que ofrece un juego en marcha al recorder |
| `internal/business/{boundaryplan, checkpoint, gamemanifest, jsonpatch, livelimits, viewpatch}` | logica pura compartida controller/simulacion |
`play/internal/business/{commands, inputs, inputrequirements, scenariodoc}`: reglas compartidas runtime/session.
Contrato en vivo (`play/runtime/runtime.go`): `AdminConnection` y `PlayerConnection` son structs de funciones (`StartSession`, `CancelSession`, `SelectPerspective`, `Sample`, `Command`, `Leave`, `Resync`, `ReportGameFault`, `NextView`, `NextLobbyUpdate`, `Started`, `Ended`, `Disconnect`...). Presencia de participante: `active/reconnecting/disconnected/left` (no persistida).

### 3.4 Superficie exportada (resumen)
- Escrituras durables: `CreateSession`, `CommitStart`, `EndSession`, `SaveCheckpoint`, `RecordOwnerHeartbeat`, `RecordGameFault`, `RecordLimitHits`, `StoreReplayChunk`, `KeepSimulationResult`, todo `versiondrafting` de escritura, `OpenPreview`, `EndPreview`.
- Lecturas: `CheckStartEligibility`, `LoadRunningSession`, `EligibleToJoin*`, `CheckLiveSession`, `ResolveJoinCode`, `FrontendAccess`, `LoadRuntimeManifest`, `LoadSessionLimits`, `ReadDraft`, `ListRevisions`, `RevisionChanges`, `DiffRevisions`, `ReadBuild`, `LoadBuiltRevision`, `CheckPublication`, `FindPreview`, `FindSimulationResult`, `ReadPage`.
- En vivo: `AttachAdmin`, `AttachPlayer`, `StartPreview`, `AttachPreview`, `LocateOrClaimOwner`, `Simulate`.

### 3.5 Datos propios (23 tablas, todas `play_`) [V]

| Tabla | Proposito / columnas clave | Indices notables / enums |
|---|---|---|
| `play_games` | juego visto por Play: `game_uuid`, `current_version_id` | UNIQUE game_uuid |
| `play_game_versions` | `uuid`, `status` (`DRAFT`/`EXECUTABLE`), `manifest` JSONB, locators script/frontend (key,sha256,size), `script_profile`, `aspect_ratio`, `languages`, `current_revision`, `executable_at` | UNIQUE parcial 1 DRAFT por juego; idx sha256 de script/frontend |
| `play_sessions` | `uuid`, `game_version_id`, `created_by_user_uuid`, `status`, `end_cause`, `lobby_expires_at`, `expires_at`, `owner_lease_expires_at` | 3 indices parciales por deadline (lobby / running expiry / owner lease) |
| `play_session_join_codes` | `code`, `expires_at`, `released_at` | UNIQUE parcial `code` WHERE released_at IS NULL; idx (code,id) |
| `play_session_status_changes` | historial de estado (`from/to_status`, `end_cause`, `changed_by_user_uuid` NULL=plataforma) | append-only |
| `play_session_participants` | roster al iniciar: `user_uuid`, `participant_id` (P1..), `display_name` | UNIQUE(session,participant_id), UNIQUE(session,user_uuid) |
| `play_session_checkpoints` | ultimo checkpoint (`content` BYTEA, `context_revision`) | UNIQUE session_id (se sobrescribe) |
| `play_replays` | manifiesto de replay por Session (`final_session_time_ms`, `finalized_at`) | UNIQUE session_id |
| `play_replay_chunks` | chunk almacenado (`recording_uuid`, `chunk_index`, tiempos, `final`, `object_key`, `sha256`) | UNIQUE(recording_uuid, chunk_index) |
| `play_create_session_requests` | idempotencia: UNIQUE(user_uuid, key), `game_uuid`, `outcome`, `session_id` | |
| `play_game_fault_reports` | auditoria: `source` CLIENT/SERVER, `kind`, `detail` JSONB, `occurrences`; solo inserta | kinds: ARTIFACT_UNREACHABLE, ARTIFACT_HASH_MISMATCH, READY_TIMEOUT, UNSUPPORTED_BRIDGE_VERSION, CONTAINER_VIOLATION, BRIDGE_ABUSE, INVALID_SAMPLE, INVALID_COMMAND, SERVER_LIMIT |
| `play_game_version_assets` | assets por clave logica (`type` image/audio/video, `mime_type`, `object_key` NULL = ya no existe) | UNIQUE(version,key) |
| `play_game_version_signed_urls` | lote vigente de URLs firmadas por version | UNIQUE game_version_id |
| `play_game_version_input_requirements` | `uses_keyboard`, `uses_pointer_hover`, `uses_pointer_press`, `devices` (`desktop`/`mobile` reservado/`both`) | UNIQUE version; idx (devices, version) |
| `play_game_version_revisions` | revisiones de fuentes: `number`, `files` JSONB, `assets` JSONB, `kind`, `origin`, `actor`, `parent_revision`, `restored_from`, `from_*`, `sdk` | UNIQUE(version, number); write-once = historial |
| `play_source_files` | contenido de archivos por hash (compartido) | UNIQUE sha256 |
| `play_game_version_change_attempts` | intentos con idempotencia: `idempotency_key`, `request_sha256`, `base_revision`, `origin`, `outcome`, `diagnostics` | UNIQUE(version, key); idx recientes |
| `play_asset_objects` | objetos de asset registrados antes de subir: `sha256`, `mime_type`, `width`, `height`, `duration_ms` (NULL si desconocido), `deleted_at` | UNIQUE sha256; idx limpieza |
| `play_game_version_builds` | build por (version, revision): `status`, `inputs_sha256`, `toolchain_version`, `diagnostics`, artefactos, `manifest`, `aspect_ratio`, `languages`, `uses_*`, `reused_build_id` | UNIQUE(version,revision); idx parcial `QUEUED` (cola); idx (version, inputs) |
| `play_game_version_build_status_changes` | historial de estado de build | append-only |
| `play_build_artifact_objects` | artefactos registrados antes de subir; `deleted_at` | UNIQUE sha256 |
| `play_previews` | `uuid`, `revision`, `owner_user_uuid`, `participants`, `expires_at`, `ended_at`, `end_reason` | UNIQUE parcial 1 preview vivo por version |
| `play_simulation_results` | resultado JSONB por simulacion, vida 30 min (registro 7 dias para conteo) | idx por expiracion |

- Historial/"data trailing": `play_session_status_changes`, `play_game_version_build_status_changes`, revisiones write-once, `play_game_fault_reports`. Excepcion documentada: `owner_lease_expires_at` se sobrescribe sin historial; datos de alta frecuencia en vivo = checkpoints + replay, no filas.
- **Cola**: `play_game_version_builds` actua de cola de trabajos (poll + `SKIP LOCKED`); no hay tabla txqueue/outbox/dead-letter generica. Los chunks de replay usan una cola **en memoria** por instancia (se descartan los mas viejos si se llena).
- Soft-delete: no hay; `deleted_at` en tablas de objetos marca borrado de bytes (limpieza), no de entidades; borrado de asset = fila con `object_key` NULL.
- Seeds (`seed_*`): 4 juegos de prueba con versiones EXECUTABLE (Seed game `1111...`, Space Drift `3333...`, Parques `4444...`, Tap Race `5555...`), un juego "no disponible" `2222...`.

### 3.6 Dependencias cruzadas
Imports: solo `play`+`logging`+`monitoring`+`utils` [V]. **No importa `game` ni `identity`**: recibe `userUUID`/`gameUUID` como strings; el nombre visible lo construye el API (`runtime.Player`). Llamado por `orchestrator` (`playlifecycle.CreateSession`, `gameauthoring`: drafts, previews, publish/freeze), `composer/gameauthoring` (lecturas de draft/build, `simulategame`), y **directamente por `api`** (liveconnection, ownership, `resolvejoincode`; sin pasar por orchestrator/composer porque son operaciones de un solo dominio). `main.go` cablea todo.

### 3.7 Puertos de integracion
| Puerto | Impls |
|---|---|
| `objectstore.Store` (`Get`,`Put`,`PresignGet`,`Delete`) (`play/session/internal/objectstore`, abierto por `play/session/storage.Open`) | GCS real (soporta emulador via `STORAGE_EMULATOR_HOST`), `Unconfigured` (falla toda llamada si no hay `GCS_*`), fake en memoria; `storetest/contract.go` |
| `gamebuild.Builder` (`Version`, `Build`) | Node real (proceso `packages/game-tools/src/cli.ts build`, timeout 60 s, 512 MiB heap, de `GAME_TOOLCHAIN_DIR`), `Unconfigured` (builds fallan como `infrastructure`), fake en tests |
| Sandbox | un solo motor: QuickJS-WASM (wazero) en workers; sin puerto alterno [V que no hay interfaz de recambio visible; I] |
| IA / email / pagos | **ninguno**: no hay llamadas a proveedores LLM desde el backend; la IA es cliente externo que entra por MCP/OAuth/AI link |

### 3.8 Limites de negocio [V salvo nota]
| Limite | Valor | Origen |
|---|---|---|
| Sessions activas por creador | **1** por defecto | `PLAY_MAX_ACTIVE_SESSIONS_PER_CREATOR` (env; el doc dice que luego dependera de suscripcion) |
| Lobby TTL / codigo de union | 30 min / 6 caracteres | const `defaultLobbyTTL` |
| Vida maxima de Session | 4 h | `sessionlifetime.Max` |
| Inactividad (RUNNING sin SAMPLE distinto ni COMMAND) | 10 min | runtime |
| Owner lease | 10 min, heartbeat cada 30 s | `defaultOwnerLease` |
| Sessions vivas por instancia | 500 (`server_busy`) | `RUNTIME_MAX_LIVE_SESSIONS` |
| Admins por Session | 8 | `liveLimits` |
| SAMPLEs por participante | 120/s y 3600/min | `livelimits` |
| COMMANDs participante / Session | 10/s,120/min / 60/s,600/min; 4 pendientes por participante | `livelimits` |
| Cola de timeline | 128 por participante, 2048 por Session; 256 ops por boundary | `livelimits` |
| Boundaries | 25/s y 1200/min; tick 100 ms | `livelimits` |
| Tokens de COMMAND recordados | 1000 por participante | runtime |
| Sandbox | 64 MiB memoria, 1 MiB stack, 5 s por llamada; `SANDBOX_MAX_CONTEXTS` (32), `SANDBOX_MAX_CONCURRENT_EXECUTIONS` (CPUs) | sandbox |
| Previews | 50 por instancia, 1 por juego, 10 min idle | `DefaultMaxLivePreviews` |
| Simulaciones | 10 min de juego, 2000 pasos, 50 observaciones, 10 s reales, 8 MiB, 2 a la vez por instancia | simulategame |
| Fuentes de borrador | 100 archivos, 256 KiB por archivo, 2 MiB total | `draftsources` |
| Assets | imagen 5 MiB, audio 10 MiB, video 50 MiB; 100 MiB por version; 4 subidas en memoria por instancia | `gameversion` |
| Aspect ratios ofrecidos | 16:9, 9:16, 4:3, 3:4, 1:1 (1080 en el lado corto) | `aspect_ratio.go` |
| Builds | 1 worker por instancia | `DefaultWorkers` |
| Replay | chunk 60 s; 64 pendientes | env `REPLAY_*` |
No hay cuotas por usuario de juegos, builds, previews ni simulaciones diarias (salvo conteo de simulaciones por version, `CountSimulations`, sin tope [V que no hay tope aplicado en `play`]).

### 3.9 Trabajo a medias / placeholders [V segun `play/CURRENT_STATE.md` y codigo]
- `ownership` (registro de dueño, lease compartido) placeholder; `ReleaseOwner` no hace nada; **una sola instancia soportada**.
- `ControllerResolver.TerminateSession` listo pero nadie lo llama (decision del humano).
- Replay: solo el lado productor; **no hay playback ni politica de retencion**.
- Persistencia de presencia de participantes en checkpoints: no.
- `game_fault` solo audita; nada lo lee ni marca juegos.
- `sandbox/scriptcheck` ya se usa en el build (`sdk-v1`); su perfil `handwritten` no tiene llamador en publicacion.
- Dispositivos: `mobile` reservado; no hay directorio de juegos filtrable por `devices`.
- Directorios vacios (restos locales, git no los trackea): `play/session/workflows/sessionlifecycle/internal/{activity,completion,expiration,platform,timers,visibility}` [V].
- WIP sin commitear en Play (mismo cambio de assets para agentes): `play/session/asset_limits.go`, `internal/business/gameversion/asset_media.go` (+test) nuevos; modificados `drafting.go`, migracion `20261102000000_play_draft_assets.go` (columnas `width/height/duration_ms` editadas en sitio), `versiondrafting` (repo/assets, `step_read_draft`, `step_upload_asset`, tests), `play/CURRENT_STATE.md`. Medidas de media (PNG/JPEG/WebP/SVG/WAV/MP4/Ogg/MP3/WebM) leidas de cabeceras al subir.
- Storage en produccion: sin bucket ni CORS configurados "en ningun entorno" [D].

## 4. `discovery`
**Proposito** [V]: README declara reviews, catalogo de juegos publicos replicado de `game` y estadisticas. **Real hoy**: solo tipos de catalogo de plantillas (`discovery/templates.go`: `TemplateEntry`, `TemplateCategory`, `TemplateQuery`, `TemplatePage`, `MaxTemplatesPage=20`) y `usecases/templatecatalog.Service` (`Featured`, `Categories`, `Search`) que **devuelven listas vacias** ("paso 2": replicar plantillas, destacar, categorias y busqueda, aun no).
- Tablas: ninguna. Imports: solo `discovery`+`logging`. Llamado por `composer/gameauthoring` (`BrowseTemplates`, `SearchTemplates`) y por `api/games` + `api/mcp`.
- Reviews, replicacion de catalogo publico, estadisticas: ausentes.

## 5. `composer` (lecturas entre dominios)
Real, sin estado ni tablas. Un grupo `gameauthoring` (`Manager`): cada lectura primero pide a Game Management si el user puede editar (`FindEditableVersion`) y solo entonces lee Play; version que Play aun no tiene = `Missing` (el API pide al orchestrator `EnsureDraft` y relee).
Metodos (todas lecturas salvo que `SimulateDraft`/`SimulateSavedScenarios` ejecutan codigo pero no persisten, salvo `keepsimulationresults`): `AILinkStatus`, `ReadDraft`, `ListDraftRevisions`, `ReadDraftChanges`, `ReadDraftDiff`, `ReadDraftBuild`, `SimulateDraft`, `SimulateSavedScenarios` (hasta 10), `ReadSimulationState`, `BrowseTemplates`, `SearchTemplates`, `InspectTemplate` (card + manifest + brief + config declarada, nunca el codigo), `ReadTemplateFiles`.
Imports: `game`, `play` (session y runtime), `identity`, `discovery`. Es el unico sitio (con orchestrator) donde conviven dominios; **no hay import dominio->dominio fuera de composer/orchestrator/api/main** [V].

## 6. `orchestrator` (escrituras entre dominios)
Real, **sin estado propio ni tablas**; la idempotencia y los reintentos los llevan los dominios (clave pasada de largo). Sin cola, sin saga persistida: reparacion "on demand" (decision 2026-11-02: sin job de fondo). Metricas `orchestrator_game_authoring_draft_repairs_total{outcome}`, `..._releases_resumed_total`, `..._cleanup_failures_total`.

| Grupo / operacion | Pasos |
|---|---|
| `playlifecycle.CreateSession` | 1) Game: `IsPlayable(game,user)` (no -> `game_unavailable`) 2) Play: `CreateSession` (propaga `ErrIdempotencyConflict`) |
| `gameauthoring.CreateGame` | (opcional `FindTemplate`) -> Game `CreateGame` -> Play `CreateDraftVersion(game, version, start)`; reintento con misma clave completa lo que falto |
| `ApplyDraftChanges`, `RestoreDraftRevision`, `UploadDraftAsset`, `RemoveDraftAsset`, `UseTemplate` | Game `FindEditableVersion` (autoriza) -> Play write; si Play no tiene la version (`ErrDraftNotFound`) la crea y repite una vez |
| `EnsureDraft` | solo autorizacion + creacion si falta (para lecturas del composer) |
| `StartPreview` | autorizar+reparar -> Play `StartPreview` |
| `CreateAILink` / `RevokeAILink` | Game decide si es dueño -> Identity crea/revoca link (kind `game`) |
| `Publish` | 0) reanuda release pendiente 1) (opcional) renombra tarjeta 2) `FindEditableVersion` 3) Play `CheckPublication` 4) Game `BeginPublication` 5) Play `FreezeVersion` 6) Game `CompletePublication` (o `AbandonPublication` si Play rechaza) 7) `CleanUnusedObjects` best effort |
| `OpenEdition` | reanuda release pendiente -> Game `OpenEdition` -> Play `CreateDraftVersion(from=base)` |

Imports: `game`, `identity` (3), `play` [V]. README del orchestrator dice (obsoleto) que el lado Game de `CreateSession` es un placeholder; el codigo usa `checkplayability` real.

## 7. Paquetes tecnicos y vacios
- **`utils`**: `RunInDBTransaction[T]`, `DBServicer`, `DisposableTestDB` (BD de test desechable), `ratelimit` (`Limit{Count,Per}`, limiter con varias ventanas; usado por `api` y `play/runtime`). Sin estado ni transporte.
- **`logging`**: request log estructurado por pasos/campos/loops, trace/span id; usado en todos los dominios.
- **`monitoring`**: `Alert(ctx,msg)` = campo `alert_msg` en el log + `fmt.Println` (TODO: sistema real); `monitoring/metrics` = `Counter/Gauge/Histogram/Label`, cada medicion se escribe al request log (TODO: backend de metricas). `alerts.go` y `instrument.go` son los dos `TODO` de produccion en estos paquetes.
- **`third_party/qjs`**: fork parcheado (`PLAYHOOT_PATCH.md`): sin montar directorio host, reloj/aleatoriedad falsos de wazero (deterministas), arreglos de use-after-free y fuga de C strings; `qjs.wasm` de upstream sin cambios.
- **`community`**, **`profile`**, **`sessionhistory`**: carpetas con solo `README.md`, cero Go. `ARCHITECTURE.md` los lista como "preguntas de frontera no resueltas" junto con `discovery`.
- **`local`**: archivos de datos del emulador GCS (buckets `playhoot-dev`, `playhoot-test`); no es codigo.
- **`plans`**: documentos `.docx` de plan; no es codigo.

## 8. Migraciones (todas, por timestamp)

Orden real de ejecucion: `game` (4) -> `play/session` (10) -> `identity` (8); luego seeds de `game` y `play` fuera de produccion. Cada una es una sola migracion gormigrate en `internal/migrations` o `internal/storage/migrations`.

| # | Dominio | ID | Tablas que crea |
|---|---|---|---|
| 1 | game | `20260822000000_games` | `games` (incluye `template_allowed/featured` editados en sitio) |
| 2 | game | `20260822000003_game_histories` | `game_histories` |
| 3 | play | `20261015000000_play_sessions` | `play_games`, `play_game_versions`, `play_sessions`, `play_session_join_codes`, `play_session_status_changes`, `play_session_participants`, `play_session_checkpoints`, `play_replays`, `play_replay_chunks`, `play_create_session_requests` |
| 4 | play | `20261023000000_play_game_fault_reports` | `play_game_fault_reports` |
| 5 | play | `20261026000000_play_game_version_assets` | `play_game_version_assets` |
| 6 | play | `20261026100000_play_game_version_signed_urls` | `play_game_version_signed_urls` |
| 7 | play | `20261028000000_play_game_version_input_requirements` | `play_game_version_input_requirements` |
| 8 | identity | `20261029000000_identity_core` | `identity_users`, `identity_accounts`, `identity_sessions`, `identity_guest_requests` |
| 9 | identity | `20261029010000_identity_logins` | `identity_external_identities`, `identity_login_attempts` |
| 10 | identity | `20261029020000_identity_trails` | `identity_login_attempt_events`, `identity_display_name_changes` (+ altera users/external_identities) |
| 11 | identity | `20261029030000_identity_guest_link` | columna `identity_login_attempts.guest_user_id` |
| 12 | identity | `20261031000000_identity_provider_pkce` | columna `provider_code_verifier` |
| 13 | game | `20261101000000_game_editions` | `game_editions`, `game_edition_status_changes`, `game_create_requests` |
| 14 | play | `20261101100000_play_draft_versions` | `play_game_version_revisions`, `play_source_files`, `play_game_version_change_attempts` |
| 15 | identity | `20261102000000_identity_resource_links` | `identity_resource_links` |
| 16 | play | `20261102000000_play_draft_assets` | `play_asset_objects` (modificada sin commitear: width/height/duration_ms) |
| 17 | play | `20261102200000_play_draft_builds` | `play_game_version_builds`, `play_game_version_build_status_changes`, `play_build_artifact_objects` |
| 18 | play | `20261102300000_play_previews` | `play_previews` |
| 19 | game | `20261103000000_game_publishing` | `game_card_images`, `game_card_objects`, `game_card_image_requests`, `game_releases`, `game_edition_requests` |
| 20 | identity | `20261103100000_identity_ai_authorization` | `identity_ai_clients`, `identity_ai_authorization_requests`, `identity_ai_sessions`, `identity_ai_refresh_tokens` |
| 21 | play | `20261106000000_play_simulation_results` | `play_simulation_results` |
| 22 | identity | `20261107000000_identity_resource_grants` | `identity_resource_grants` (**sin commitear**) |

Seeds: `seed_20261103000000_game_play_seed_games` (game); `play` seeds: `20261015000000_play_games`, `20261018000000_space_drift`, `20261020000000_space_drift_frontend`, `20261020100000_parques`, `20261026000000_space_drift_assets`, `20261028000000_input_requirements`, `20261101000000_tap_race` (+ `SeedObjects` sube scripts/paquetes al bucket si hay bucket).
Total: 47 tablas de dominio (identity 14, game 10, play 23) + `migrations` de gormigrate.

## 9. Mapa de dependencias (quien llama a quien) [V]

```
api ──► identity (authorize, guests, refresh, logins, oauth, grants, links)
api ──► game/workflows/gamecard (tarjeta), play/runtime (live, ownership), play/session/usecases/resolvejoincode
api ──► orchestrator/{playlifecycle, gameauthoring}  (escrituras)
api ──► composer/gameauthoring                       (lecturas)
orchestrator ──► game, play/session, identity (interfaces estrechas declaradas en cada operacion)
composer     ──► game, play/session, play/runtime/simulategame, identity, discovery
identity | game | play | discovery ──► solo logging, monitoring, utils
```
Orquestacion de `play/session` y `game` nunca se llaman entre si. Excepciones a "todo pasa por orchestrator/composer": llamadas de dominio unico desde `api` (por diseño de `ARCHITECTURE.md`), y el bucket GCS compartido inyectado por `main.go` en `gamecard` y en los workflows de Play.

## 10. Conceptos globales: existe / parcial / ausente

| Concepto | Estado | Donde / que |
|---|---|---|
| Notificaciones (email/push/in-app) | **ausente** | grep sin resultados; el email solo se observa del login de Google |
| Reportes / casos (denuncias de usuarios) | **ausente** | existen `play_game_fault_reports` (fallas tecnicas de juegos, auditoria) y telemetria de cliente en `api/clienttelemetry` (otro agente); no hay reporte de contenido ni casos |
| Planes / suscripciones / pagos / creditos | **ausente** | cero codigo; solo comentario "limite puede depender de suscripcion" en `PLAY_MAX_ACTIVE_SESSIONS_PER_CREATOR` |
| Classroom (clases/alumnos/notas) | **ausente** | solo menciones en comentarios del API sobre IP compartida de aulas |
| Admin de plataforma / backoffice | **ausente** | "admin" = el creador que controla una Session (`JOIN_SESSION_AS_ADMIN`), no rol de plataforma; Identity no tiene roles |
| txqueue / dead-letter / outbox | **ausente** | colas parciales: tabla de builds como cola de trabajo (`play_game_version_builds`), cola en memoria de chunks de replay; sin DLQ |
| Moderacion / revision de publicacion | **ausente** | publicar es automatico si hay nombre + build OK + assets requeridos; sin estado "en revision", sin revisor |
| Categorias / tags | **parcial** | tipos (`TemplateCategory`, campo `Categories` de `TemplateEntry`) y UI/MCP de busqueda; **sin tabla ni datos**, `templatecatalog` devuelve vacio |
| Plantillas | **parcial** | funcional end-to-end salvo la fuente: `games.template_allowed/featured`, `findtemplate`, `CreateGame(template)`, `UseTemplate`/`ApplyTemplate`, `composer.InspectTemplate`; **nada marca un juego como plantilla** y el catalogo esta vacio |
| Librerias de assets | **parcial** | assets viven por version (`play_game_version_assets`, `play_asset_objects` compartidos por hash entre juegos); sin biblioteca reutilizable/compartible por usuario ni catalogo |
| Replay / historial de sesiones | **parcial** | grabacion productora completa (`play_replays`, `play_replay_chunks`, objetos en bucket); **sin playback, sin retencion**; `sessionhistory` vacio; historial de estados de Session en `play_session_status_changes` |
| Analytics / outbox de eventos | **ausente** | metricas solo al log (sin backend); `sessionhistory` (metricas/analytics) vacio |
| Rate limiting | **existe** | `utils/ratelimit` (multi-ventana) usado en `play/runtime` (`livelimits`) y `api` (throttle por IP/usuario, lanes WS, guests 200/h, uploads por URL); topes de negocio por usuario: 1 Session activa, 20 grants vivos |
| Perfil de usuario / comunidad / discovery publico de juegos | **ausente** | `profile`, `community` solo README; `discovery` solo plantillas stub; sin catalogo de juegos publicos ni reviews |
| Historial de datos ("data trailing") | **existe** | estandar `data-history.md`; tablas `*_changes`/`*_events`/write-once descritas arriba |
| Idempotencia de comandos | **existe** | tablas `*_requests`/`*_attempts` en los tres dominios + `ErrIdempotencyConflict` |
| Borrado logico | **parcial** | `games.deleted_at` leido pero nunca escrito; sin borrado de usuarios/juegos |

## 11. Discrepancias doc/codigo (el codigo manda)
1. `game/CURRENT_STATE.md`: dice "no cross-domain caller", "`checkvisibility` unwired", y en la fila Game lifecycle "Publishing/new edition not implemented, not wired to API/orchestrator". Codigo: publicacion y `OpenEdition` implementados, `gamelifecycle`/`findeditableversion`/`findtemplate`/`checkplayability` cableados en `main.go`, orchestrator y composer los usan. Solo `checkvisibility` sigue sin cablear.
2. `game/CURRENT_STATE.md` (Templates): "`template_allowed/featured` set only by seeds and tests". No se encontro ninguna escritura en seeds ni tests.
3. `orchestrator/README.md`: "Game Management's side is a placeholder that always answers playable". Codigo: `checkplayability.IsPlayable` real (published + visibilidad/dueño).
4. `play/README.md`: "`objectstore` ... not wired, storetest does not build". `main.go` abre `storage.Open` y lo inyecta en Sessions, versiondrafting, versionbuilding, gamecard, replay. (No se compilo `storetest`.)
5. `play/CURRENT_STATE.md` y repo (AGENTS.md, KNOWLEDGE_MAP, ADR index): hablan de `session/`; el codigo vive en `play/` (drift ya declarado).
6. `play/CURRENT_STATE.md` (Sandbox): "scriptcheck ... nothing calls it yet" aparece en la fila de Sandbox; el build la usa con perfil `sdk-v1` (otras filas lo dicen).
7. `ARCHITECTURE.md` lista como dominios aceptados solo Game Management, Session Runtime e Identity y dice "No Infrastructure Service currently exists"; `discovery`, `community`, `profile`, `sessionhistory` son "preguntas no resueltas". Coherente con el codigo (discovery stub, los otros vacios).
8. `identity/CURRENT_STATE.md`: describe las 8 migraciones y grants; el codigo coincide, pero grants y su migracion estan sin commitear.
