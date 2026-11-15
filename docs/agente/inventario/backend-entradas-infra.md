# Inventario backend `playhoot` — entradas, cableado, infraestructura, convenciones y proceso

Fecha del inventario: 2026-11-15. Repo: `c:\Users\Usuario\Documents\project\repos\playhoot` (rama `main`, módulo Go `github.com/diegobermudez03/playhoot`, Go 1.25.0).
Alcance: puntos de entrada, wiring, infra, convenciones y artefactos de proceso. Los internos de dominio (identity, game, play) los cubre otro inventario.
Leyenda: **[V]** verificado leyendo código/ejecutando; **[I]** inferido. Cuando doc y código discrepan se reporta el código y se anota la discrepancia (sección 9).

---

## 0. Resumen cuantitativo

| Concepto | Cantidad |
|---|---|
| Rutas REST declaradas (patrones `METHOD /path`) | 80 (52 games, 11 identity, 12 oauth, 3 mcp, 1 clienttelemetry, 1 play) [V] |
| Rutas WebSocket | 4 (todas en `api/play`) [V] |
| Preflights `OPTIONS` | generados automáticamente 1 por path REST único (`api/server.go: preflightRoutes`) [V] |
| Herramientas MCP | 22 [V] |
| Variables de entorno de runtime (main + gcs.go) | 31 (8 obligatorias) [V] |
| Variables solo-test | 10 (`TEST_DATABASE_*` x7, `GCS_TEST_*` x2, `GAME_TOOLCHAIN_TEST_DIR`) [V] |
| Migraciones gormigrate | 22 (game 4, play/session 10, identity 8) [V] |
| Declaraciones de métricas (`metrics.New*`) | 136 en código no-test [V] |
| Archivos Go no-test / test / mocks generados | 386 / 347 / 85 (`*_mock_test.go`) [V] |
| Docs bajo `docs/` | 205 archivos (122 en `docs/archive/`, 83 vigentes); 126 `.md` en el repo fuera del archivo [V] |
| ADRs vigentes | 3 globales + 1 GAME + 3 IDENTITY + 8 SESSION (0028–0035) + 1 PDR [V] |
| `go build ./...` / `go vet ./...` | PASS / PASS [V] |
| `go test ./...` | 110 paquetes `ok`, 0 fallos; los tests de repo contra BD se SKIPean sin `TEST_DATABASE_*` [V] |

---

## 1. API HTTP (`api/`)

### 1.1 Composición (`api/server.go`) [V]

- `api.NewServer(...)` recibe ~15 dependencias (todas interfaces estrechas declaradas en `api/`), crea un `http.ServeMux` y registra **6 route groups** en este orden: `identity`, `clienttelemetry`, `play`, `games`, `oauth`, `mcp`.
- Cada grupo implementa `RESTRoutes()` y `WebSocketRoutes()` devolviendo `[]routing.Route{Pattern, Handler, Authorization, Limits, RefuseLimit, Middlewares}` (`api/internal/routing/route.go`). Los handlers no tocan el mux ni llaman `logging.Start`.
- Cadena de middlewares por ruta REST (`chain`, el primero es el más externo): `restObservability` (log + métricas) → `cors.Responses` → `route.Authorization` → `throttle.Requests` → `route.Middlewares` → handler. WS: `wsObservability` → `Authorization` → `throttle` → middlewares (owner/joinCode) → handler.
- Todos los errores JSON usan `httpx.ErrorResponse{code?, message}`.
- Familias de métricas por prefijo de ruta (para no superar 1000 series/métrica): `/.well-known/ /oauth/ /mcp /ai/` → `api_ai_*`; `/v1/games/{gameUUID}/draft*`, `/v1/templates*`, `/v1/asset-uploads/` → `api_authoring_*`; resto → `api_http_*`; preflights → `api_http_preflight*`; WS handshakes → métricas propias (`api/metrics.go`).

### 1.2 Niveles de autenticación (catálogo `identity/internal/business/operationlevel`) [V]

| Operación (`identity.Operation`) | Nivel mínimo |
|---|---|
| `CREATE_SESSION`, `JOIN_SESSION_AS_ADMIN`, `CREATE_GAME`, `EDIT_GAME`, `CONNECT_AI` | account (cuenta real) |
| `JOIN_SESSION_AS_PLAYER`, `REPORT_CLIENT_TELEMETRY`, `VIEW_OWN_IDENTITY`, `SET_OWN_DISPLAY_NAME` | guest |

`auth.Require(authorizer, op)` extrae `Authorization: Bearer <JWT HS256 15 min>`, llama `identity.Authorize(token, op)` (no lee BD; el token trae `UserUUID`, nivel y display name) y deja el `identity.User` en el contexto. `auth.Optional` deja pasar sin token pero rechaza un token inválido. `auth.RequireWebSocket` acepta además el token como subprotocolo `base64url.bearer.authorization.playhoot.<b64url(token)>`.
Respuestas: 401 `token_required|token_malformed|token_invalid` (+`WWW-Authenticate: Bearer`), 403 `operation_forbidden`.

### 1.3 Rutas — identity (`api/identity/`, 11 rutas) [V]

| Ruta | Handler | Auth | Llama a |
|---|---|---|---|
| `POST /v1/guests` | `create_guest.go` | ninguna; límite extra 200/h por IP | `createguest.CreateGuest(displayName, idempotencyKey)` |
| `GET /v1/identity/operations` | `list_operations.go` | ninguna | `listoperations.ListOperations` |
| `POST /v1/identity/refresh` | `refresh.go` | ninguna (refresh token en body) | `refreshcredentials.Refresh` |
| `POST /v1/identity/logout` | `logout.go` | ninguna (refresh token) | `endsession.EndSession` |
| `POST /v1/identity/login/start` | `login.go` | `Optional(VIEW_OWN_IDENTITY)` (guest opcional para enlazar) | `accountlogin.StartLogin(provider, codeChallenge, guestUserUUID)` |
| `GET /v1/identity/login/{provider}/callback` | `login.go` | ninguna (redirige al navegador a `WEB_SIGN_IN_COMPLETE_URL`) | `accountlogin.HandleCallback` |
| `POST /v1/identity/login/complete` | `login.go` | ninguna (code + PKCE verifier) | `accountlogin.CompleteLogin` |
| `GET /v1/identity/login/providers` | `login.go` | ninguna | `loginproviders.Enabled` |
| `GET /v1/identity/login/local/authorize` | `login.go` | ninguna; solo responde si el proveedor local está activo | `loginproviders.LocalAuthorizePage` |
| `GET /v1/identity/me` | `me.go` | `Require(VIEW_OWN_IDENTITY)` (guest) | no llama dominio: devuelve el `User` del contexto |
| `PUT /v1/identity/me/display-name` | `display_name.go` | `Require(SET_OWN_DISPLAY_NAME)` (guest) | `setdisplayname.SetDisplayName` |

### 1.4 Rutas — play / sesiones (`api/play/`) [V]

| Ruta | Tipo | Auth | Llama a |
|---|---|---|---|
| `POST /v1/sessions` (`create_session.go`) | REST | `Require(CREATE_SESSION)` account | `orchestrator/playlifecycle.Manager.CreateSession` → `game checkplayability` + `play/session sessionlifecycle.CreateSession` (idempotente por `idempotency_key`; 409 `active_session_limit`) |
| `GET /v1/play/join/sessions/{sessionUUID}/admin` (`admin_join.go`) | WS | `RequireWebSocket(JOIN_SESSION_AS_ADMIN)` account + `requireOwner` | `runtime.AttachAdmin(sessionUUID, userUUID, ownerEpoch)` (`liveconnection.Controller`) |
| `GET /v1/play/join/sessions/{sessionUUID}/player` (`player_join.go`) | WS | `RequireWebSocket(JOIN_SESSION_AS_PLAYER)` guest + `requireOwner` | `runtime.AttachPlayer(sessionUUID, player, ownerEpoch)`; query `?device=desktop|mobile` |
| `GET /v1/play/join/{joinCode}` | WS | igual que player | `resolvejoincode.ResolveJoinCode` → `requireOwner` → `AttachPlayer` |
| `GET /v1/play/previews/{previewUUID}/connect` (`preview_connect.go`) | WS | `RequireWebSocket(EDIT_GAME)` account | `previews.AttachPreview(previewUUID, ownerUUID)` (solo esta instancia; sin owner routing) |

`requireOwner` → `ownership.LocateOrClaimOwner(sessionUUID)` (`play/runtime/usecases/ownership`); hoy el epoch es constante `singleInstanceEpoch = 1` y el caso `OwnerElsewhere` devuelve 503 "forwarding not implemented" (monoinstancia) [V].

### 1.5 Rutas — games / authoring (`api/games/`, 52 rutas = 32 `/v1` + 20 `/ai/v1`) [V]

Auth `edit` = `Require(EDIT_GAME)` account; `create` = `Require(CREATE_GAME)` account. El dueño del juego lo decide Game Management (`FindEditableVersion`), no Identity.

**Web/API autenticada (`/v1`)**

| Ruta(s) | Auth | Llama a |
|---|---|---|
| `POST /v1/games` | create | `orchestrator/gameauthoring.CreateGame(user, name, idemKey, templateGameUUID)` (game `gamelifecycle` + play `versiondrafting`) |
| `GET /v1/games` | edit | `gamecard.ListGames` |
| `GET\|PATCH /v1/games/{g}` | edit | `gamecard.ReadCard` / `UpdateCard` |
| `PUT /v1/games/{g}/logo`, `POST …/logo/remove`, `POST …/photos`, `POST …/photos/{id}/remove` | edit | `gamecard.UploadImage/RemoveImage` (bytes pasan por el backend) |
| `POST /v1/games/{g}/publish`, `POST …/editions` | edit | `orchestrator/gameauthoring.Publish` / `OpenEdition` |
| `GET …/draft` | edit | composer `ReadDraft` (tras `EnsureDraft` si falta en Play) |
| `POST …/draft/changes`, `POST …/draft/restore`, `POST …/draft/template` | edit | orchestrator `ApplyDraftChanges`, `RestoreDraftRevision`, `UseTemplate` |
| `GET …/draft/revisions`, `…/changed`, `…/diff`, `…/files`, `…/build` | edit | composer `ListDraftRevisions`, `ReadDraftChanges`, `ReadDraftDiff`, `ReadDraft(withContent)`, `ReadDraftBuild(wait≤20 s)` |
| `POST …/draft/simulations`, `GET …/draft/simulations/{id}/state` | edit | composer `SimulateDraft`/`SimulateSavedScenarios`, `ReadSimulationState` (sandbox + `keepsimulationresults`) |
| `POST …/draft/previews` | edit | orchestrator `StartPreview` |
| `PUT …/draft/assets/{key}`, `POST …/draft/assets/{key}/remove` | edit | orchestrator `UploadDraftAsset`/`RemoveDraftAsset` |
| `GET /v1/templates`, `/v1/templates/search`, `/v1/templates/{id}`, `/v1/templates/{id}/files` | create | composer `BrowseTemplates/SearchTemplates/InspectTemplate/ReadTemplateFiles` (`discovery/templatecatalog` + `game/findtemplate`) |
| `POST\|GET /v1/games/{g}/ai-link`, `POST …/ai-link/revoke` | edit | orchestrator `CreateAILink`/`RevokeAILink`; composer `AILinkStatus` (Identity `resourcelinks`) |
| `PUT /v1/asset-uploads/{token}` | token de un solo uso (grant `phg_`), límite por cliente 10/s,120/min | `resourcegrants.ClaimResourceGrant` → `UploadDraftAsset` (ruta nueva, **sin commitear**) |

**Enlace para IA externas (`/ai/v1/{token}/…`)** — auth `aiLinkAccess`: resuelve el token del path con `identity.ResolveResourceLink` (token `phl_`, 7 días, un enlace vivo por juego, solo se guarda el SHA-256); actúa como el dueño, nivel account, `origin=api`, solo sobre ese juego; cabeceras `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex`; 401 `ai_link_invalid`; límite 20/s y 300/min por dueño. Espejo de las rutas `/v1`:

| Ruta | Equivale a |
|---|---|
| `GET /ai/v1/{token}` | página de contexto: **Markdown** por defecto (fuentes inline si <150 KiB) o `?format=json` (`playhoot.ai-context.v1`, sin contenido de fuentes) |
| `GET /ai/v1/{token}/files/{path...}`, `GET …/files` | lectura de archivo(s) |
| `GET …/changed`, `…/diff`, `…/revisions`, `…/build` | lecturas de borrador |
| `GET …/sdk/{page...}` | página de la guía SDK (`readsdkguide`, `text/markdown`) |
| `POST …/changes`, `POST …/restore`, `POST …/template` | escrituras de borrador |
| `GET …/templates`, `…/templates/search`, `…/templates/{id}`, `…/templates/{id}/files` | catálogo de plantillas |
| `POST …/simulations`, `GET …/simulations/{id}/state` | simulación |
| `PUT …/assets/{key}`, `POST …/assets/{key}/remove` | assets |
| `POST …/assets/{key}/upload-url` | `resourcegrants.CreateResourceGrant` → URL de un solo uso `PUT /v1/asset-uploads/{token}` (15 min, máx 20 vivos por usuario; **nuevo, sin commitear**) |

No hay en `/ai` rutas para crear juego, publicar, previews ni listar juegos (esas solo en REST autenticado/MCP) [V].

### 1.6 Rutas — OAuth para IA (`api/oauth/`, 12 rutas) y MCP [V]

| Ruta | Auth | Llama a (`identity/usecases/aiauthorization`) |
|---|---|---|
| `GET /.well-known/oauth-protected-resource` y `…/mcp` | ninguna | metadata RFC 9728 |
| `GET /.well-known/oauth-authorization-server` | ninguna | metadata RFC 8414 |
| `POST /oauth/register` | ninguna; 5/min y 30/h por IP | `RegisterClient` (DCR RFC 7591, solo clientes públicos) |
| `GET /oauth/authorize` | ninguna | `StartAuthorization` → redirige a `<PUBLIC_WEB_BASE_URL>/connect-ai?request=<id>` |
| `POST /oauth/token` | ninguna | `ExchangeToken` (authorization_code+PKCE S256, refresh_token) |
| `POST /oauth/revoke` | ninguna | `Revoke` (RFC 7009) |
| `GET /v1/ai-authorizations/{requestID}`, `POST …/approve`, `POST …/deny` | `Require(CONNECT_AI)` account | `ReadAuthorization`, `DecideAuthorization` |
| `GET /v1/ai-connections`, `POST /v1/ai-connections/{id}/revoke` | `Require(CONNECT_AI)` | `ListConnections`, `RevokeConnection` |

Otras: `POST /v1/client-telemetry` (`api/clienttelemetry`, `Require(REPORT_CLIENT_TELEMETRY)` guest; lote ≤100 eventos/16 KiB; siempre 204; catálogo cerrado en `catalog.go` → métricas). No hay `/metrics`, `/health` ni `/readyz` [V: no existe ninguna ruta].

### 1.7 Transporte realtime y puente al dominio [V]

- **Upgrade** (`api/internal/wsx`): librería `github.com/coder/websocket`; subprotocolo obligatorio `playhoot.v1`; chequeo de Origin contra `WEBSOCKET_ALLOWED_ORIGINS` (+ el propio host); `SetReadLimit(32 KiB)`; solo frames de texto JSON con campo `"type"` (binario cierra la conexión).
- **Admisión**: `api/internal/live.Controller` reserva cupo (default 2000 conexiones/instancia, 10 por usuario, 100 refusals simultáneos) antes del upgrade; rechazos legibles por el navegador se envían como mensaje `{"type":"rejected","reason":…}` sobre una conexión recién actualizada y se cierra (lingers 2 s).
- **Puente**: el handler llama a una `Attach*` del Runtime y recibe una **struct de closures** (`runtime.AdminConnection` / `PlayerConnection`): comandos (`StartSession`, `Command`, `Sample`, `Resync`, `Leave`, `ReportGameFault`, `LimitHit`) y *streams bloqueantes* (`NextLobbyUpdate`, `Started`, `NextView`, `Ended`, `Disconnect`). `live.Serve(ctx, conn, disconnect, loops…)` ejecuta un lector por tipo de mensaje ("lanes" con `Rate`+`Capacity`) y emisores en goroutines propiedad del controller; apagado ordenado al `Shutdown`. El dominio no conoce WebSocket [V].
- **Límites por conexión**: 120 msg/s y 6000/min; 256 KiB/s y 4 MiB/min (exceso → cierre 1008). Player: `sample` 60/s (cola 64, se descarta), `command` 20/s (responde `rate_limited` sin gastar token), `resync`/`leave` descartados. Admin: `select_perspective` 5/s, start/cancel 2/s. Preview: control 10/s. Keepalive: ping 15 s, pong 10 s, write timeout 10 s.
- **Mensajes servidor→cliente**: `rejected`, `lobby_update`, `lobby_closed`, `session_started` (incluye `frontend{url firmada, sha256, expires_at, viewport, assets[]}`), `session_ended`, `player_view` (full/diff con `revision`, `consumed_through_sample_sequence`), `roster_update`, `command_result`, `leave_result`, `select_perspective_result`, `start_session_result`, `cancel_session_result`; preview: `preview_started`, `acting_as`, `paused`, `resumed`, `preview_ended`, `error`.
- **Cliente→servidor**: player `leave`, `sample`, `command{token,name,payload}`, `resync`, `game_fault`; admin `select_perspective`, `start_session`, `cancel_session`, `resync`; preview `act_as`, `pause`, `resume`, `end` (+ tráfico de juego con límites de player).

### 1.8 Middlewares transversales [V]

| Middleware | Ubicación | Comportamiento |
|---|---|---|
| Log por request / trace | `api/server.go restObservability/wsObservability` | `logging.Start` + `defer FinishRequestLog(ctx, slog.Default(), pattern)`; UN log estructurado por request |
| Métricas de endpoint | `api/metrics.go` | contador por (ruta, status) + histograma de duración, centrales; `statusRecorder` |
| CORS | `api/internal/cors` | `CORS_ALLOWED_ORIGINS` (lista o `*`; vacío = ninguno); sin credenciales (solo Bearer); preflight 204 sin rate limit; headers permitidos `Authorization, Content-Type, Idempotency-Key`; expone `Retry-After`; `Max-Age` 1 h |
| Autorización | `api/internal/auth` | ver 1.2; métricas `api_authorization_total` / `_duration_seconds` por `decision` |
| Rate limit | `api/internal/throttle` + `utils/ratelimit` (ventana por *keyed bucket*, **en memoria, por instancia**) | por defecto 5/s y 30/min por usuario; 20/s y 300/min por IP (autenticado → clave `UserUUID`; si no → IP). IP real con `TRUSTED_PROXY_HOPS` sobre `X-Forwarded-For`. 429 `rate_limited` + `Retry-After`; en WS se responde como `rejected` |
| Request ID | **no existe** `X-Request-ID`; `trace_id` (UUID) se genera por request, no se devuelve al cliente (solo cabecera `X-Playhoot-Revision` en lectura de archivo AI) [V] |
| Límites HTTP del servidor | `main.go` | ReadHeader 10 s, Read 15 s, Write 30 s, Idle 60 s, MaxHeader 64 KiB; MCP sube sus deadlines (read 5 min, write 2 min, body ≤72 MiB) |

---

## 2. Servidor MCP y superficie "AI context / creation link"

### 2.1 Servidor MCP (`api/mcp/`) [V]

- **Transporte**: Streamable HTTP en `POST|GET|DELETE /mcp`, SDK oficial `github.com/modelcontextprotocol/go-sdk v1.7.0`; **stateless**, respuestas JSON (`JSONResponse: true`), `DisableLocalhostProtection`. Implementación `playhoot` v`1`, con `Instructions` fijas (contexto estable: qué es Playhoot, flujo de trabajo, "no puedes publicar").
- **Auth**: OAuth 2.1. Token de acceso de IA = JWT HS256 `typ at+jwt`, audience = recurso MCP (`api.MCPResource(PUBLIC_API_BASE_URL)`), scope único `games`, 1 h, verificado contra la conexión en cada llamada (`aiauthorization.VerifyAccessToken`). Clave derivada de `IDENTITY_ACCESS_TOKEN_KEY` (un token de usuario y uno de IA no son intercambiables). Sin token → 401 con `WWW-Authenticate` apuntando a `/.well-known/oauth-protected-resource/mcp`. La llamada actúa como el `UserUUID` del token con nivel account. Límite 20/s y 300/min por usuario (`games.AIRequestLimits`). **Publicar no es una herramienta.**
- **Principio**: 1 operación MCP = 1 endpoint = 1 método de servicio; las tools llaman directamente a `games.Handler` (mismas funciones que las rutas HTTP), no por HTTP.

### 2.2 Herramientas (22) [V; método subyacente V salvo marcado]

| Tool | Qué hace | Operación `games` → servicio |
|---|---|---|
| `list_my_games` | lista juegos del usuario | `ListGames` → `gamecard.ListGames` |
| `create_game` | crea juego no publicado (plantilla opcional) | `CreateGame` → `orchestrator.CreateGame` |
| `browse_templates` | plantillas destacadas y categorías | `BrowseTemplates` → composer (`templatecatalog`) |
| `search_templates` | búsqueda por texto/categoría/jugadores/página | `SearchTemplates` → composer |
| `inspect_template` | tarjeta, brief, manifest, archivos (sin código) | `InspectTemplate` → composer |
| `read_template_files` | lee archivos de una plantilla (1..50) | `ReadTemplateFiles` → composer |
| `use_template` | reinicia el borrador sobre una plantilla (nueva revisión) | `UseTemplate` → `orchestrator.UseTemplate` |
| `get_game_context` | estado: revisión, archivos (hash/size), build, assets, intentos, notes.md, brief.json, URL de la guía | `ReadContext` → composer `ReadDraft` + estado de link |
| `read_files` | contenido de archivos de una revisión | `ReadFiles` → `loadDraft(withContent)` |
| `list_changes_since` | cambios desde una revisión | `ReadChanges` → composer `ReadDraftChanges` |
| `apply_changes` | cambia fuentes (edits find/replace, files, delete) con `base_revision` e `idempotency_key` | `ApplyChanges` → `orchestrator.ApplyDraftChanges` |
| `restore_revision` | nueva revisión con contenido de una anterior | `RestoreRevision` → `orchestrator.RestoreDraftRevision` |
| `list_revisions` | revisiones con procedencia (kind/origin/actor/…) paginadas | `ListRevisions` → composer |
| `diff_revisions` | diff unificado entre 2 revisiones (8 KiB/archivo, 64 KiB total) | `ReadDiff` → composer `ReadDraftDiff` |
| `get_sdk_index` | índice compacto de la guía SDK (`capabilities.md`) | `ReadSDKPage` → `readsdkguide` |
| `get_sdk_doc` | una página de la guía SDK (Markdown) | `ReadSDKPage` → `readsdkguide` |
| `request_asset_upload` | URL de un solo uso para subir un asset sin pasar por el contexto del modelo (img 5 MiB, audio 10 MiB, vídeo 50 MiB, 100 MiB total) | `RequestAssetUpload` → composer + `resourcegrants` (**nuevo, sin commitear**) |
| `upload_asset` | sube archivo pequeño (≤256 KiB) en base64 | `UploadAsset` → `orchestrator.UploadDraftAsset` |
| `remove_asset` | quita el asset de una clave (nueva revisión) | `RemoveAsset` → `orchestrator.RemoveDraftAsset` |
| `get_build` | estado del build (QUEUED/RUNNING/SUCCEEDED/FAILED/SUPERSEDED) con `wait_seconds` ≤20 | `ReadBuild` → composer `ReadDraftBuild` |
| `simulate` | corre escenario `playhoot.scenario.v1` (reloj virtual, expectativas, holds) / `scenario_path` / `all` | `Simulate` → composer `SimulateDraft`/`SimulateSavedScenarios` |
| `read_simulation_state` | lee estado global o de jugador de un resultado guardado (30 min) | `ReadSimulationState` → composer |

Tools que cambian estado exigen `idempotency_key` nueva por cambio [V: instrucciones].

### 2.3 Creation link (HTTP, sin OAuth) para IA que solo lee/escribe por URL [V]

- El dueño (web) crea el enlace con `POST /v1/games/{g}/ai-link`; la respuesta trae la URL `<PUBLIC_API_BASE_URL>/ai/v1/<token>` (token `phl_…` en el path; renovar = crear otro y revocar el anterior; 7 días). Revocar: `POST …/ai-link/revoke`; estado: `GET …/ai-link`.
- La IA abre `GET /ai/v1/{token}` (Markdown con instrucciones, URLs de cada operación, formato del envelope `playhoot.project-change.v1`, formato de escenarios) y usa las rutas de 1.5. Guía SDK enlazada: `<PUBLIC_WEB_BASE_URL>/docs/sdk/v1/index.md`, también servida por `GET /ai/v1/{token}/sdk/{page}`.
- Variantes: `?format=json` devuelve `playhoot.ai-context.v1` (URLs: self, changes, changed, revisions, diff, sdk, templates, template, restore, build, files, assets, simulations).

---

## 3. Cableado `main.go`, workers, configuración

### 3.1 Arranque (`main.go`, modificado sin commitear: añade `resourcegrants.New(db)` en `AILinks.Grants`) [V]

1. `sandbox.RunAsWorkerIfRequested()` primero: si `os.Args[1]=="__playhoot_jsexecutor_worker__"` el binario actúa como worker del sandbox y sale.
2. `readEnvVariables()` (carga `.env` con godotenv salvo `ENVIRONMENT=production`), `openPostgres` (GORM+pgx, ping), `PostgresMigrate` (game → session → identity), `storage.Open` (GCS o `Unconfigured`).
3. Fuera de producción: `PostgresSeed` (game y session seeds) y `sessionmigration.SeedObjects` en el bucket si hay `GCS_BUCKET`.
4. Construcción por **inyección manual de constructores** (sin contenedor DI): `sandbox.NewHost` → `sessionlifecycle.New(db, store, maxActive)` → `playlifecycle.New(checkplayability, sessionLifecycle)` → `versiondrafting.New(db, store, buildSignal)` → `gametoolchain.Open(GAME_TOOLCHAIN_DIR)` → `versionbuilding.New(...)` → `resourcelinks` → `liveconnection.NewPreviews` → `gamelifecycle`, `gamecard` → `orchestrator/gameauthoring.New(9 colaboradores)` → `composer/gameauthoring.New(7)` → `ownership.New` → `replayrecording.New` → `liveconnection.New(... 15 colaboradores)` → Identity (`authorize`, `createguest`, `refreshcredentials`, `loginproviders`, `accountlogin`, `aiauthorization`) → `api.NewServer(...)`.
5. Workers de fondo (2 goroutines con contexto cancelable, todas las instancias):
   - `reconcilesessions.Run` (intervalo 5 min): cierra lobbies vencidos y sesiones running pasadas de su vida/lease (job durable sobre BD).
   - `versionbuilding.Run` (`DefaultWorkers = 1`): construye revisiones DRAFT; cola en Postgres (`play_draft_builds`), despertar en proceso con `buildsignal`.
   - Dentro del runtime (no arrancados por main): un controller por sesión (tick 100 ms, checkpoint 5 s, límites 1 s), `limitaudit` (flush 5 s), `replayrecording` (chunks a object storage), heartbeat de ownership 30 s.
6. Apagado (SIGINT/SIGTERM, 8 s): `httpServer.Shutdown` → `server.Shutdown` (cierra WS) → defers inversos: detener builds, reconcile, `liveConnections.Close`, `replayRecorder.Close`, `previews.Close`, `sandboxHost.Close`, store, BD.

### 3.2 Variables de entorno (`.env.example` + lecturas en código; valores de `.env` NO revisados) [V]

| Variable | Obl. | Propósito |
|---|---|---|
| `ENVIRONMENT` | sí | `production` ⇒ no carga `.env`, no siembra, exige claves/URLs; `development/local/test` permiten proveedor local |
| `HTTP_PORT` | sí | puerto HTTP (ej. 8081) |
| `DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME/SSL_MODE` | sí (6) | Postgres |
| `GCS_PROJECT_ID`, `GCS_BUCKET` | no (ambas o ninguna) | object storage; vacías ⇒ `Unconfigured` (toda llamada falla) |
| `STORAGE_EMULATOR_HOST` | no | fake-gcs local (no definir en prod); leído en `objectstore/gcs.go` |
| `GAME_TOOLCHAIN_DIR` | no | checkout del repo frontend (build de juegos + guía SDK); vacío ⇒ todo build falla "como de la plataforma" |
| `PUBLIC_API_BASE_URL` | prod | origen público de la API (links IA, issuer/resource OAuth); dev: `http://localhost:<HTTP_PORT>` |
| `PUBLIC_WEB_BASE_URL` | prod | origen público del web (consent `/connect-ai`, guía SDK); dev: `http://localhost:5173` |
| `CORS_ALLOWED_ORIGINS`, `WEBSOCKET_ALLOWED_ORIGINS` | no | orígenes permitidos (`*` o lista); vacío = ninguno |
| `TRUSTED_PROXY_HOPS` | no | proxies que añaden `X-Forwarded-For` (1 tras Cloud Run) |
| `LIVE_MAX_CONNECTIONS` | no | tope WS por instancia (default 2000) |
| `RUNTIME_MAX_LIVE_SESSIONS` | no | tope de sesiones vivas (default 500 según example) |
| `PLAY_MAX_ACTIVE_SESSIONS_PER_CREATOR` | no | sesiones activas por creador (default 1) |
| `SANDBOX_MAX_CONTEXTS`, `SANDBOX_MAX_CONCURRENT_EXECUTIONS` | no | procesos worker máx (default 32) / ejecuciones concurrentes (default nº CPU) |
| `REPLAY_STATE_SAMPLE_EVERY_N_TICKS`, `REPLAY_CHUNK_DURATION`, `REPLAY_MAX_PENDING_CHUNKS` | no | afinado de grabación de replays |
| `IDENTITY_ACCESS_TOKEN_KEY` | prod (≥32 bytes) | firma de JWT; si falta fuera de prod se genera aleatoria (tokens mueren con el proceso) |
| `IDENTITY_LOCAL_PROVIDER` | no | proveedor de login ficticio; el server **se niega a arrancar** con `true` si `ENVIRONMENT` no es development/local/test |
| `WEB_SIGN_IN_COMPLETE_URL` | prod | ruta web donde callbacks de login redirigen (dev: `/sign-in/complete`) |
| `GOOGLE_OAUTH_CLIENT_ID/CLIENT_SECRET/REDIRECT_URL` | no (las 3 o ninguna) | Google OIDC; la redirect debe terminar en `/v1/identity/login/google/callback` |

Solo tests: `TEST_DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME/BASE_NAME/SSL_MODE` (fallback a `DATABASE_*`), `GCS_TEST_PROJECT_ID`, `GCS_TEST_BUCKET`, `GAME_TOOLCHAIN_TEST_DIR`.

### 3.3 Feature flags [V]

No hay sistema de feature flags. El comportamiento condicionado por entorno es: `ENVIRONMENT=production` (seeds/.env/requeridos), `IDENTITY_LOCAL_PROVIDER`, presencia de las 3 variables de Google, `GCS_*` vacío (storage no configurado), `GAME_TOOLCHAIN_DIR` vacío (builds y guía SDK no disponibles), `STORAGE_EMULATOR_HOST`.

---

## 4. Infraestructura y runtime

### 4.1 Local y despliegue [V]

- `docker-compose.yaml`: `postgres:17-alpine` (volumen `postgres_data`, healthcheck), `fsouza/fake-gcs-server:1.52.2` en `:4443` (buckets = directorios de `local/gcs/`: `playhoot-dev`, `playhoot-test`; objetos en `local/gcs-data/`, ignorado por git) y `adminer` en `:8080`. La app **no** está en compose (se corre con `go run`).
- `deploy/`: solo `README.md` + `gcs-cors.json` (CORS del bucket: GET/HEAD desde `${PLATFORM_WEB_ORIGIN}`; el GameHost del frontend verifica SHA-256 con `fetch` de URLs firmadas). **No hay Dockerfile, CI, IaC ni manifiestos** (`ls`, sin `.github`) [V]. Menciones de Cloud Run y "VM de GCP efímera" aparecen solo en comentarios/docs [I: destino previsto GCP/Cloud Run].
- `.vscode/settings.json`: gofmt on save (`golang.go`) + organize imports.
- Binario `playhoot.exe` (72 MB) en la raíz **está versionado en git** (`git ls-files`); `.env` no (en `.gitignore`).

### 4.2 Base de datos [V]

- PostgreSQL (17 en compose), GORM v1.31 + `pgx/v5`, sin tuning de pool en `openPostgres`.
- Migraciones: `gormigrate/v2` (tabla única `migrations`, `UseTransaction: true`, `ValidateUnknownMigrations:false` porque los 3 dominios comparten tabla). `migrations.go` llama `gamemigrations.Migrate` → `sessionmigrations.Migrate` → `identitymigrations.Migrate` al arrancar (cada instancia). IDs con timestamp `YYYYMMDDHHMMSS_nombre.go` en `<dominio>/internal/migrations` (identity: `identity/internal/migrations`; game: `game/internal/storage/migrations`; play: `play/session/internal/migrations`).
- Política vigente pre-lanzamiento: **migraciones editadas en el lugar** (sin correctivas; el humano recrea la BD local) — p.ej. `20261102000000_play_draft_assets.go` modificada sin commitear [V: diff + CHECKLIST]. Sin `CHECK` ni FK (estándar `database-constraints.md`).
- Seeds (solo no-prod): juegos de prueba `space_drift`, `parques`, `tap_race` + objetos en el bucket (`play/session/internal/migrations/seed_*.go`, `game/internal/storage/migrations/seed.go`).

### 4.3 Object storage y proveedores de autenticación [V]

- Storage: **solo Google Cloud Storage** (`cloud.google.com/go/storage`) tras la interfaz `objectstore.Store` (`play/session/internal/objectstore`: `gcs.go`, `fake.go` para tests, `unconfigured.go`). Local: emulador fake-gcs. Contenido: scripts de backend, paquetes de frontend de versiones, assets, imágenes de tarjeta (`games/card-images/<sha256>`), chunks de replay. Descarga a jugadores por URLs firmadas (solo cuando el backend no toca los bytes — estándar `object-storage.md`).
- Auth providers: (a) **Google OIDC** (PKCE S256, ID token RS256 verificado) implementado pero "no verificado contra Google real" (LAUNCH_READINESS); (b) **proveedor local ficticio** (`/v1/identity/login/local/authorize`, solo dev/test); (c) **guests** reales (`POST /v1/guests`, se enlazan a la cuenta en el primer login); (d) **servidor OAuth 2.1 propio para IA** (sección 1.6). No hay email/password.

### 4.4 Sandbox de scripts de backend de juegos [V]

- **Lenguaje/runtime**: JavaScript en **QuickJS compilado a WebAssembly**, ejecutado con **wazero** a través de `github.com/fastschema/qjs v0.0.6` **vendorizado y parcheado** en `third_party/qjs/` (`replace` en `go.mod`; `PLAYHOOT_PATCH.md`: sin directorio host montado, relojes/sleep/aleatoriedad de wazero deterministas, fixes de memoria). `goja` se usa solo para el análisis estático de scripts (`play/runtime/sandbox/scriptcheck`, perfiles `handwritten` y `sdk-v1`).
- **Lanzamiento**: un proceso worker **por contexto = por sesión**, que es un **re-exec del mismo binario** (`os.Executable()` + arg `__playhoot_jsexecutor_worker__`, `cmd.Env = []`, entorno vacío). `sandbox.Host` (`host.go`) los gestiona; el worker muere al cerrarse stdin.
- **Protocolo**: JSON por líneas sobre stdin/stdout. Request `{operation: load|start|execute|project|restore, script, profile, participants, randomSeed, steps[{sessionTime, transitions|command|update|playerDisconnected|playerRejoined}], state, prngState, …}`; una respuesta JSON por línea con `MemoryBytes`.
- **Límites**: 64 MiB memoria QuickJS, pila 1 MiB, presupuesto de ejecución 5 s (el host mata el worker), salida 256 KiB, heap Go del worker 160 MiB; `SANDBOX_MAX_CONTEXTS` default 32; sin red/archivos/reloj/aleatoriedad propios (`determinism.go`: `Date`/`Math.random` deterministas, mulberry32 exportable).
- **Dónde vive**: `play/runtime/sandbox/` (host, worker, protocolo, `scriptcheck/`), `third_party/qjs/`. Usado por runtime en vivo, previews y simulaciones (`play/runtime/usecases/simulategame`).
- La documentación vieja menciona un "JavaScript executor" como servicio separado (ADR-0016, archivado); **hoy es in-process con workers hijos** (SESSION-ADR-0028/0030).

### 4.5 SDK de juegos y toolchain [V]

- El **SDK vive en el repo frontend** (`../playhoot_frontend/packages`: `game-core, game-server, game-react, game-sdk, game-tools, game-host, protocol, …`), no en este repo.
- El backend lo usa como **toolchain por checkout** (`GAME_TOOLCHAIN_DIR`): `play/session/internal/gamebuild/node.go` ejecuta `node packages/game-tools/src/cli.ts` (proceso por build, timeout 60 s, heap 512 MB, entorno heredado mínimo) produciendo server script, client bundle, manifest, aspect ratio, idiomas e `InputRequirements`.
- **Versionado**: `Builder.Version()` = hash de las fuentes de `game-core, game-server, game-react, game-sdk, game-tools, protocol` (excl. tests) + lockfile; se guarda por build (`toolchain_version`) y por revisión (`sdk`). Reuso de builds si fuentes+assets+toolchain coinciden. [Gap documentado: versión de Node y string de SDK aún no incluidos — CHECKLIST T pendiente.]
- **Servido**: la guía SDK (`apps/web/public/docs/sdk/v1/*.md`) la lee `readsdkguide`/`internal/sdkguide` del mismo checkout (regex de nombre de página, ≤256 KiB) y la sirven MCP (`get_sdk_*`) y `/ai/v1/{token}/sdk/…`; el web la publica en `<PUBLIC_WEB_BASE_URL>/docs/sdk/v1/`. El frontend de un juego llega al jugador como URL firmada de GCS en `session_started`.
- Perfil de script `sdk-v1` (top-level solo funciones y `const` literales; constantes congeladas una vez; `play_game_versions.script_profile` obligatorio).

### 4.6 Cachés / colas [V]

Ninguna externa (sin Redis/Rabbit/Pub-Sub). Estado en memoria: rate limiters, controllers de sesiones vivas, previews (máx 50), `buildsignal` (despertar de workers). Colas/jobs durables en Postgres (`play_draft_builds`, resultados de simulación `play_simulation_results` con TTL 30 min/7 días, `reconcilesessions`). Ownership de sesiones monoinstancia (epoch fijo); multi-instancia diferida a "launch" (LAUNCH_READINESS).

---

## 5. Observabilidad

### 5.1 Logging (`logging/request_log.go`) [V]

Patrón "**un log estructurado por unidad de trabajo**": el entry point llama `ctx = logging.Start(ctx)` y `defer logging.FinishRequestLog(ctx, slog.Default(), pattern)`; todo el código inferior solo usa `logging.Step(ctx,"x").Close()`, `logging.LogFields(ctx, logging.Field(k,v))`, `LogError`, `LogLoopFields`. Sin `Start` en el ctx, las llamadas **no hacen nada** (estándar `logging.md`). Solo `api` puede iniciar logs: cada request REST, cada handshake WS y cada mensaje WS. Salida: `slog` por defecto (**no hay `slog.SetDefault` en main** → handler texto por defecto) [V].
Correlación estilo OpenTelemetry: `trace_id` (se hereda del ctx o se acuña), `span_id` nuevo por `Start`, `parent_span_id` (el span envolvente). Una conexión WS = trace compartido; cada mensaje/cierre = span hijo. `logging.WithTraceID` permite continuar una traza externa (aún sin uso). `LogStandalone` para líneas sin request.

Ejemplo (observabilidad central de REST, `api/server.go`):

```go
func restObservability(pattern string, requestMetrics *requestMetrics) routing.Middleware {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			ctx := logging.Start(r.Context())
			defer logging.FinishRequestLog(ctx, slog.Default(), pattern)
			started := requestMetrics.now()
			recorder := newStatusRecorder(w)
			next(recorder, r.WithContext(ctx))
			requestMetrics.record(ctx, pattern, recorder.status, requestMetrics.now().Sub(started))
		}
	}
}
```

Uso en dominio (una línea): `logging.LogFields(ctx, logging.Field("game_uuid", gameUUID))` (p.ej. `api/games/handler.go caller`).

### 5.2 Métricas (`monitoring/metrics/`, estándar `metrics.md`) [V]

- API: `metrics.NewLabel(name, closedValues...)`, `NewCounter/NewGauge/NewHistogram(name, help, labels...)`; `Inc/Add/Set/Observe/ObserveDuration(ctx, labelValues...)`. Valores de label **conjunto cerrado** declarado al inicio; tope 1000 combinaciones por métrica (si se excede **panic al declarar**); nombres snake_case, contadores `_total`, duraciones `_seconds`, help obligatorio; mal uso = panic.
- **Dueño de la lógica = dueño de la métrica**: los resultados de negocio los declara el dominio que los produce (p.ej. `play_session_join_codes_resolved_total{outcome}`); los **entry points no registran métricas de negocio**.
- **Métricas de endpoint** (transporte) son centrales en `api/server.go`/`api/metrics.go`: `api_http_requests_total{route,status}`, `api_http_request_duration_seconds{route}` (+ familias `api_ai_*`, `api_authoring_*`, `api_http_preflights_total`, handshakes WS con `limit_refusal`); componentes del edge miden lo suyo (`api_authorization_total{decision}`, `api_http_rate_limited_total{key}`, `api_live_connections_active/_closed_total{close_cause}/_duration_seconds`).
- **Diferencia con outcomes de servicio**: las de endpoint solo dicen "qué pasó en el intercambio HTTP" (status, duración); las de servicio dicen "qué significó para el dominio" (outcome).
- **Emisión real**: `record()` valida y **solo escribe la medición en el request log** (`LogLoopFields(ctx,"metrics",…)`); `// TODO: forward the measurement to the metrics backend` — **no hay exportador/backend** y `monitoring.Alert` solo hace log + `fmt.Println` (`// TODO` alerting) [V]. Proveedor de métricas/alertas/dashboards está en LAUNCH_READINESS.

Ejemplo (declaración y uso de una métrica de servicio, `play/session/usecases/resolvejoincode/service.go`):

```go
var (
	resolveOutcomeLabel = metrics.NewLabel("outcome",
		string(sessionpkg.JoinCodeFound), string(sessionpkg.JoinCodeInvalid),
		string(sessionpkg.JoinCodeExpired), string(sessionpkg.JoinCodeSessionStarted),
	)
	joinCodesResolved = metrics.NewCounter(
		"play_session_join_codes_resolved_total",
		"Join codes looked up to join a Session, by outcome.",
		resolveOutcomeLabel,
	)
)
// ... en ResolveJoinCode:
joinCodesResolved.Inc(ctx, resolveOutcomeLabel.Value(string(resolution.Outcome)))
```

### 5.3 Tracing / IDs [V]
Solo `trace_id/span_id/parent_span_id` en logs; sin OpenTelemetry/exportador; sin propagación entre servicios (monolito); sin request ID visible al cliente.

---

## 6. Convenciones de ingeniería

### 6.1 Comandos [V salvo marcado]

| Acción | Comando |
|---|---|
| Build | `go build ./...` (≈32 s en frío) |
| Vet | `go vet ./...` |
| Tests unitarios (sin BD) | `go test ./...` (corre; los de repo se saltan) |
| Tests con BD | exportar `TEST_DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME/SSL_MODE` (o `DATABASE_*` ya exportadas; **`go test` no lee `.env`**) con Postgres de `docker compose up -d postgres`; cada paquete crea una BD desechable `<nombre>_<sufijo>` y la borra al final |
| Mocks | `go generate ./...` — 85 directivas `//go:generate mockgen -package=… -destination=*_mock_test.go . <ifaces>` (`mockgen` en `~/go/bin`) |
| Lint | **no hay linter configurado** (sin `.golangci`/Makefile/CI); `staticcheck` y `mockgen` existen en la máquina [I: uso opcional] |
| Correr app | `docker compose up -d` y `go run .` (requiere `.env` copiado de `.env.example`) [I: no hay doc explícita, deducido de `main.go`/compose] |
| Arrancar con toolchain | `GAME_TOOLCHAIN_DIR=../playhoot_frontend` (Node en PATH) |

### 6.2 Tests (`docs/engineering/standards/testing.md`) [V]
- Table-driven con `map[string]func(t, deps) test` ("tests map → setup callback → test struct"); nombres de caso con guiones bajos; `testify/require`, mocks `go.uber.org/mock/gomock` (`svcMocks`); se afirma `expectErr` (bool), no mensajes; sentinel solo si es contrato (`require.ErrorAssertionFunc`); panics solo "hay panic".
- Repo tests contra **BD real desechable** (nada de driver SQL mockeado): `utils.DisposableTestDB{Key,NameSuffix,Migrate}` con `Run(m)` en `TestMain`, una BD por paquete/dominio migrada una vez, lock advisory `7302190014` para crear/barrer huérfanas; wrappers finos por dominio (`play/session/internal/testdb`, `identity/internal/testdb`, `game/internal/testdb`). Sin `TEST_DATABASE_*` → `t.Skip`. Los datos se acumulan entre casos; cada caso siembra lo que necesita; escrituras se verifican releyendo la BD.
- Otros skips: `fixturescenarios`/`gamebuild` (necesitan checkout frontend/Node), `objectstore` (necesita `GCS_TEST_*`), etc.
- Estado: 110 paquetes OK en esta máquina sin BD; la cobertura de integración con BD **no se ejercitó** aquí (el propio CHECKLIST L admite tests Postgres "no ejecutados (sin Docker)").

### 6.3 `comment_standard_test.go` (raíz, `package main`) [V]
Recorre todos los `.go` (salta `.git` y `third_party`, ignora archivos generados en el último) y falla si:
1. `TestNoInternalDocCitationsInComments`: un comentario cita ADR/`WORK-NNNN`/`Blocker N`/`Slice N`/`docs/(work|engineering|ai)/`.
2. `TestExportedDocCommentsStayAtPublicContract`: el comentario de un símbolo exportado nombra un paquete de capa baja que su firma no expone (lista: `engine`, `engineservice`, `gorm`).
3. `TestDocCommentLength`: algún doc comment (paquete, decl., tipo, valor, campo) supera **5 líneas**.
Complementa `standards/code-comments.md` (503 líneas).

### 6.4 Repositorios/SQL (`repositories.md`, memoria de decisiones del proyecto) [V]
Lecturas/updates/deletes con **SQL crudo** (`Scan(&struct)` verificando `RowsAffected`); **inserts con GORM `Create()`** sobre struct fila no exportada con `TableName()` (conflicto → `Clauses(clause.OnConflict{DoNothing:true})`); un `INSERT` manual solo trivial (columnas+valores, `ON CONFLICT DO NOTHING`, `RETURNING`; sin subqueries ni funciones/casts); sin literales de estado en SQL (constantes Go como parámetros); transacciones por helper (`RunInDBTransaction[T]`, no `db.Begin()` en workflows); el repo no decide política de negocio; nombres de repo = operación de persistencia, no comando de negocio; tipos expuestos nombrados por entidad, no `row`.

### 6.5 Documentos bajo `docs/engineering/` (17 archivos) [V]

| Doc | Resumen |
|---|---|
| `ENGINEERING_RADAR.md` (297 l.) | Recomendaciones/preocupaciones **no autoritativas** (NOW≠READY, nunca autoriza implementar) |
| `LAUNCH_READINESS.md` (59 l.) | Lista de lo diferido a "justo antes del primer deploy": Google real, proveedor de métricas, storage/CORS/URLs públicas, toolchain en imagen, aislamiento del build worker, multi-instancia |
| `standards/INDEX.md` | Índice de 15 estándares canónicos; "ausencia de estándar no permite inventar uno" |
| `code-comments.md` | Propósito/estilo de comentarios; sin historia/tareas; sin citar docs internos; ≤5 líneas |
| `cross-domain-reference-naming.md` | Columnas de referencia cross-domain se nombran por la entidad pública referenciada |
| `data-history.md` | Todo cambio visible: columnas write-once o tablas de historia; causas registradas |
| `data-integrity.md` | Panic solo si seguir es inseguro; si no, error lógico + `monitoring.Alert` |
| `database-constraints.md` | BD solo PK/unique/índices/tipos/NULL; **sin CHECK ni FK**; escritores validan, lectores no asumen validez (alertan) |
| `domain-logic-placement.md` | Localidad por comportamiento; workflow vs use case; lógica en tipo > función pura > paquete de capacidad; sin `businessservice` genérico |
| `error-handling.md` | Resultado de negocio esperado (valor, `nil` error) vs error; frontera de logging de errores |
| `function-signatures.md` | Parámetros explícitos sobre structs de entrada ceremoniales; tipos semánticos; forma de retorno |
| `idempotency.md` | Natural vs de comando; token obligatorio; replay vs conflicto; propiedad de la responsabilidad |
| `logging.md` | Solo `api` hace `Start/Finish`; REST vs WS; trace/span/parent; por mensaje en conexión larga |
| `metrics.md` | Dueño de la lógica declara la métrica; labels cerrados; métricas centrales de endpoint; nombres |
| `object-storage.md` | URL firmada solo si el backend nunca toca los bytes; subida en streaming con corte, hash y chequeo; bytes primero, claves por contenido, registro de intención |
| `repositories.md` | Ver 6.4 |
| `testing.md` | Ver 6.2 |

---

## 7. Artefactos de proceso/documentación

### 7.1 Árbol `docs/` (205 archivos; archive = 122)

```
docs/
  ai/ (29)      OPERATING_MODEL.md  KNOWLEDGE_MAP.md  README.md  CHANGELOG.md(374 l.)
                processes/ (8 guías humanas): AI_WORKFLOW_CHANGE, ARCHITECTURE_DISCUSSION, DOMAIN_DESIGN, ENGINEERING_STANDARD,
                           FEATURE_DEVELOPMENT, GUIDED_TECHNICAL_EXPLORATION, PRINCIPAL_ENGINEER_REVIEW, PRODUCT_DISCUSSION
                protocols/ (10 protocolos de agente): los 8 anteriores + CONVERSATIONAL_ORCHESTRATOR(316 l.) + IMPLEMENTATION_REVIEW(587 l.)
                templates/domain/: CURRENT_STATE, DATA_MODEL, DOMAIN_README, FLOWS (.template.md) + README
                workspaces/: README.md, active/.gitkeep (vacío)
  architecture/ SYSTEM_MAP.md  CROSS_DOMAIN_FLOWS.md
  decisions/    README.md INDEX.md  architecture/{ADR-0001,0005,0014,INDEX}  product/{PDR-0001,INDEX}  templates/{ARCHITECTURE_DECISION,PRODUCT_DECISION}
  engineering/  ENGINEERING_RADAR.md LAUNCH_READINESS.md standards/ (15 + INDEX) — ver 6.5
  product/      IDEAS.md PRODUCT_STATE.md ROADMAP.md
  projects/     README.md  templates/PROJECT.template.md  active/game-creation-v1/{PROJECT.md,CHECKLIST.md}
                completed/identity-v1/{PROJECT.md, internal/AI_CONTEXT.md, works/WORK-0056…0062 (7)}
                completed/session-runtime-v1/{PROJECT.md, CHECKLIST.md, internal/AI_CONTEXT.md}
  work/         README.md  templates/WORK_SPEC.template.md  active/README.md  completed/README.md  (sin WORK activo)
  archive/pre-realtime-pivot/ (122 archivos: ADR/WORK/proyectos del diseño discreto-por-turnos; solo si se pide historia)
```
Docs de dominio: `game/{README,CURRENT_STATE}.md + docs/{DATA_MODEL,FLOWS,decisions/GAME-ADR-0001,INDEX}`, `identity/{README,CURRENT_STATE}.md + docs/decisions/IDENTITY-ADR-0001..0003+INDEX`, `play/{README,CURRENT_STATE}.md + docs/{DATA_MODEL,FLOWS,decisions/SESSION-ADR-0028..0035+INDEX}`; README por paquete (`api`, `composer`, `orchestrator`, `monitoring`, `utils`, `deploy`, `discovery`, `community`, `profile`, `sessionhistory`). Árbol `plans/` (solo 2 binarios): `plans/identity/05_Playhoot_Plan_de_Identidad_Basica.docx`, `plans/session_runtime/Playhoot_Session_Runtime_Architecture_Plan_with_TOC.docx`.

### 7.2 Qué contiene y prescribe cada artefacto

| Artefacto | Contenido / prescripción |
|---|---|
| `AGENTS.md` (76 l.) | Bootstrap de agentes: determinar superficie (CONVERSATIONAL AI / CODEBASE AGENT / INDEPENDENT REVIEWER); leer `OPERATING_MODEL.md`; cargar contexto solo vía `KNOWLEDGE_MAP.md`; para pedidos naturales usar `CONVERSATIONAL_ORCHESTRATOR.md` (buscar iniciativa/WORK abierta primero); inspeccionar código/tests/migraciones para el comportamiento real; **reportar "drift"** doc↔código sin resolverlo en silencio; no tratar ideas/TODOs como decisiones; **escalar** decisiones materiales (producto, arquitectura, persistencia, seguridad, infra, estándares) en vez de inventarlas; no leer `docs/archive/`; no inferir estándares nuevos de patrones (usar el proceso ENGINEERING_STANDARD); `HUMAN_REVIEW.md` = superficie de revisión humana; `AI_CONTEXT.md` = contexto temporal reanudable, no canónico; respetar workspaces activos. Código antiguo en el tag git `pre-realtime-pivot` |
| `ARCHITECTURE.md` (190 l., CANONICAL, 27-oct) | Monolito modular; dominios aceptados: Game Management, Session Runtime, Identity; **un dominio no invoca a otro** (lecturas cross-domain → Composer, escrituras → Orchestrator; mecanismo por workflow); API = edge sin estado de negocio; referencias cross-domain por UUID público sin FK ni acceso a persistencia ajena; sin transacciones entre dominios; "Application coordina / Domain decide / Persistence guarda" (ADR-0001); "Infrastructure Service" definido como categoría; límites no resueltos: perfil, historial de sesiones, discovery, community |
| `PROJECT_OVERVIEW.md` (614 l.) | Visión de producto (plataforma de creación de juegos sociales multijugador con IA); explícitamente **sin** detalles de implementación; menciona conceptos pre-pivote (Effect, Interaction, Presentation, "sin lenguaje propio") |
| `docs/projects/README.md` | Un Project agrupa/ordena WORK; **WORK es la única unidad con ciclo de vida**; invariantes: todo resultado futuro requerido para un proyecto activo debe tener un WORK (aunque sea PLANNED); nada comprometido solo en PROJECT.md/AI_CONTEXT/ADR; WORK terminado permanece dentro del proyecto; el proyecto completo pasa a `projects/completed/` |
| `docs/work/README.md` | Ciclo de WORK (DRAFT→READY→IMPLEMENTING→DONE/CANCELLED); WORK DRAFT sin autoridad de implementar; IDs `WORK-NNNN` secuenciales globales; plantilla `WORK_SPEC.template.md` |
| `docs/projects/active/game-creation-v1/` | `PROJECT.md` (meta, fuera de alcance, decisiones tomadas en conversación 1–5 nov, criterios de cierre) y `CHECKLIST.md` (secciones B–U; hechas hasta S; pendientes T y U) como mecanismo real de seguimiento |
| `docs/decisions/` | ADR/PDR: familias por alcance (`ADR-`, `GAME-ADR-`, `SESSION-ADR-`, `IDENTITY-ADR-`, `PDR-`), cada una con su INDEX; "decision record = por qué, no verdad vigente"; historia inmutable |
| `docs/ai/OPERATING_MODEL.md` | "Humano decide; la IA conversacional razona; el agente de código implementa; el repo recuerda". Contrato de ingeniero principal (cuestionar el marco, proponer alternativas, enseñar); límites de decisión; formato `DISCOVERY` para escalar y `DRIFT DETECTED`; "una cosa, un dueño"; sincronizar solo los docs cuyo conocimiento cambió; anti-sobreingeniería (NOW/SOON/LATER/NOT NEEDED) |
| `docs/ai/protocols/IMPLEMENTATION_REVIEW.md` | Precondición para implementar: existe `docs/work/active/WORK-…` en estado READY; reporte de implementación; revisión independiente read-only; bucle fix/re-review |
| `.claude/` | Solo `worktrees/` **vacío**. No hay `CLAUDE.md`, ni `settings.json`, ni skills/agents/hooks en el repo backend [V]. (Existe `AGENTS.md` superior en `repos/` que solo dice: cada repo tiene su propia documentación/seguimiento; `docs/` de `repos/` contiene planes cross-repo) |

### 7.3 Reglas que hoy se le dicen a un agente en este repo
1. Leer `AGENTS.md` → `OPERATING_MODEL` → `KNOWLEDGE_MAP` (no escanear todo el Markdown).
2. Implementar solo con WORK en estado READY (protocolo IMPLEMENTATION_REVIEW) y escalar decisiones materiales (listadas arriba); no cambiar estándares sin el proceso ENGINEERING_STANDARD; Radar/IDEAS no autorizan nada.
3. Mantener sincronizados los `CURRENT_STATE.md`/`DATA_MODEL`/`FLOWS` del dominio tocado (solo los afectados) y reportar drift.
4. Estándares de ingeniería vinculantes (sección 6) + `comment_standard_test.go` los hace cumplir mecánicamente (solo comentarios).
5. No tocar `docs/archive/`; no citar ADR/WORK en comentarios de código.

---

## 8. Salud del repo

| Chequeo | Resultado |
|---|---|
| `go build ./...` | **PASS** (sin errores, ~32 s) |
| `go vet ./...` | **PASS** (sin salida) |
| `go test ./...` | **PASS**: 110 paquetes `ok`, 0 `FAIL`, (el más lento: `fixturescenarios` 19 s). **No necesita Docker/BD** para ejecutarse: los tests de repo/integración ejecutan `t.Skip` si faltan `TEST_DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME/SSL_MODE` (o los `DATABASE_*` equivalentes). Con BD, cada paquete crea y borra su BD desechable. Los tests que usan el sandbox lanzan workers re-exec del binario de test (no requieren servicios) |
| `git status --short` | 33 entradas: 25 modificadas (`M`) + 8 no rastreadas (`??`) |

`git status --short` (resumen): modificados `api/README.md`, `api/games/{ai_context,draft_assets,handler,handler_mock_test,handler_test}.go`, `api/mcp/{handler,handler_test,tools}.go`, `api/metrics.go`, `docs/projects/active/game-creation-v1/CHECKLIST.md`, `identity/{CURRENT_STATE.md,identity.go,internal/migrations/migration.go}`, `main.go`, `play/CURRENT_STATE.md`, `play/session/drafting.go`, `play/session/internal/migrations/20261102000000_play_draft_assets.go`, `play/session/workflows/versiondrafting/{internal/repo/assets.go,internal/repo/repo_test.go,step_assets_test.go,step_read_draft.go,step_read_draft_mock_test.go,step_upload_asset.go,step_upload_asset_mock_test.go}`; nuevos `api/games/asset_upload_url{,_test}.go`, `identity/internal/business/resourcegrant/`, `identity/internal/migrations/20261107000000_identity_resource_grants.go`, `identity/usecases/resourcegrants/`, `play/session/asset_limits.go`, `play/session/internal/business/gameversion/asset_media{,_test}.go`.

**Trabajo en curso (5 líneas)**
1. Es el ítem **S** del CHECKLIST de `game-creation-v1` ("subida de assets por el agente sin pasar por el contexto del modelo"), marcado `[x]` con fecha 2026-11-07 pero **sin commitear** (último commit: `19a1ece template configurations`).
2. Nuevo "grant" de un solo uso en Identity (`identity/usecases/resourcegrants`, tokens `phg_`, solo hash SHA-256, 15 min, ≤20 vivos por usuario, tabla `identity_resource_grants`, métrica `identity_resource_grants_total`).
3. Nuevas superficies: MCP `request_asset_upload`, `POST /ai/v1/{token}/assets/{key}/upload-url` y `PUT /v1/asset-uploads/{token}` (auth por token, límite por cliente 10/s); `main.go` cablea `resourcegrants.New(db)` en `AILinks.Grants`.
4. Medición de media al subir (`gameversion.MeasureMedia`: dimensiones/duración) guardada en `play_asset_objects` (migración **editada en el lugar**; hay que recrear la BD local) y devuelta en lecturas de assets y en el contexto de IA.
5. Actualiza docs de estado (`identity`, `play` CURRENT_STATE, CHECKLIST) y `api/metrics.go` (la ruta `/v1/asset-uploads/` entra en la familia `api_authoring_*`). Build, vet y tests pasan con este WIP.

---

## 9. Discrepancias doc vs. código (se reporta el código) [V]

| Tema | Doc dice | Código dice |
|---|---|---|
| Directorio de Session Runtime | `ARCHITECTURE.md`, `docs/decisions/INDEX.md`, índices de ADR y `SESSION-ADR-0028` apuntan a `session/…` | El paquete es `play/` (`session/` ya no existe; `play/session` es subpaquete) |
| Tokens de acceso | `ARCHITECTURE.md`: "opaque access tokens" | JWT HS256 de 15 min (`accesstoken.go`) |
| Proveedores de login | `ARCHITECTURE.md`: "Google as the only provider" | Google + proveedor local ficticio (dev/test) + servidor OAuth de IA |
| `docs/architecture/SYSTEM_MAP.md` (15-oct) | "authorize: tokens de prueba fijos", "solo `POST /sessions`", "live runtime not implemented", composer "README only" | Auth real, 84 rutas, runtime en vivo, composer implementado |
| Proceso vs práctica | `projects/README` Invariante 1 y `IMPLEMENTATION_REVIEW`: todo resultado requerido ⇒ `WORK-NNNN` bajo `works/`, implementación solo con WORK READY | El proyecto activo `game-creation-v1` **no tiene `works/`**; se sigue con `CHECKLIST.md` (letras B–U) y commits "Step N…"; `docs/work/active/` y `docs/ai/workspaces/active/` vacíos [I: práctica real se aparta del proceso escrito] |
| `PROJECT_OVERVIEW.md` | Vocabulario pre-pivote (Effect/Interaction/Presentation, juegos sin código) | Juegos = proyectos TypeScript SDK, sandbox JS (SESSION-ADR-0028) |
| `.env.example` | Menciona `RUNTIME_MAX_LIVE_SESSIONS=500` y `GAME_TOOLCHAIN_TEST_DIR` como opcionales | Coherente; no lista las 7 variables `TEST_DATABASE_*` que los tests sí leen |
| Artefacto binario | — | `playhoot.exe` (72 MB) versionado en git |

---

## 10. Lo más relevante para un tech lead (síntesis)

1. **Superficie ya muy grande**: 80 REST + 4 WS + 22 tools MCP; la creación de juegos por IA (links `/ai/v1`, OAuth+MCP, simulación, builds) está implementada de punta a punta, no es spec.
2. **Monoinstancia de facto**: ownership de sesiones con epoch fijo, rate limits y cachés en memoria, build worker único; multi-instancia y forwarding están diferidos (503 "forwarding not implemented").
3. **Sin observabilidad real exportada**: métricas y alertas solo se escriben en el log (`TODO` de backend); sin `/metrics`, `/health`, request-id al cliente ni OpenTelemetry.
4. **Sin pipeline de despliegue**: no hay Dockerfile/CI/IaC; el backend depende en runtime de un checkout del repo frontend + Node (`GAME_TOOLCHAIN_DIR`) para construir y para la guía SDK; sandbox = workers re-exec del propio binario (QuickJS/wazero, patch vendorizado).
5. **Proceso documental pesado y desalineado con la práctica**: AGENTS/WORK/ADR/CHECKLIST con reglas estrictas (escalar, WORK READY, drift), pero el proyecto activo se lleva con CHECKLIST sin WORK; hay documentos obsoletos (`session/` vs `play/`, SYSTEM_MAP, "opaque tokens").
