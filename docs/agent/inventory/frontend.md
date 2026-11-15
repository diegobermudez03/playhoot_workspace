# Inventario del frontend `playhoot_frontend`

Fecha del inventario: 2026-11-15. Solo lectura sobre el repo (salvo este archivo). Fuente de verdad: el codigo; donde la documentacion del repo discrepa se anota **[DRIFT]**. Lo no verificado en codigo se marca **[inferido]**.
Ruta del repo: `c:\Users\Usuario\Documents\project\repos\playhoot_frontend` (51 commits; HEAD `c508a3b template configurations`).

---

## 1. Stack y layout

### 1.1 Stack (verificado en `package.json`, `vite.config.ts`, `eslint.config.js`, `tsconfig.base.json`)

| Aspecto | Valor |
| --- | --- |
| Monorepo | npm workspaces: `apps/*`, `packages/*`, `packages/features/*`, `fixtures/games/*`. Node >= 22.12, ESM |
| Lenguaje | TypeScript ~6.0.3, `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax` |
| UI | React 19.3 + react-dom (solo en `apps/web` y `packages/game-react`) |
| Bundler / dev server | Vite 8 + `@vitejs/plugin-react` 6 (`apps/web/vite.config.ts`). Proxy `/v1` (REST + WS) a `PLAYHOOT_BACKEND_URL` o `http://localhost:8081`. Plugin dev `fixtureGames()` sirve `/__fixtures/games/*` |
| Router | `react-router` 7.18 (`createBrowserRouter`, `apps/web/src/app/router.tsx`). Solo SPA en modo "data router", sin loaders/actions |
| Estado | `zustand` 5 (stores vanilla `createStore` en packages; `useStore` en la UI). Sin Redux/Query. Estado global en `@playhoot/app-core` (`createAppState`) |
| Estilos | CSS Modules + `tokens.css`/`motion.css` globales (ADR-0003). Sin Tailwind ni kit de componentes de terceros |
| i18n | `react-intl` 12 / FormatJS, catalogos ICU tipados `es` (fuente de ids: `en.ts`), `en`, `pt-BR` en `apps/web/src/i18n/messages/`; lint `formatjs/no-literal-string-in-jsx` (ADR-0004) |
| Validacion de contratos | `zod` 4 en `@playhoot/protocol` (schemas de mensajes WS y respuestas HTTP) |
| Fuentes | `@fontsource-variable/fredoka` (display), `@fontsource-variable/nunito` (cuerpo), `@fontsource/roboto` (solo boton de Google) |
| Tests | Vitest 5 (`vitest.config.ts`, incluye `apps/**/src/**/*.test.*`, `packages/**/src/**/*.test.*`), 53 archivos `*.test.ts(x)`. No hay e2e ni tests de componentes en navegador |
| Lint / formato | ESLint 10 flat config (+ `typescript-eslint`, `react-hooks`, `formatjs`) con reglas de frontera entre paquetes; Prettier 3 |
| Toolchain de juegos | `rolldown` 1.2 + `acorn` + `typescript` en `packages/game-tools` |

### 1.2 Apps y paquetes (quien importa a quien, de `package.json` de cada uno)

| Workspace | Proposito | Depende de (dependencies `@playhoot/*`) |
| --- | --- | --- |
| `apps/web` (`@playhoot/web`) | Host web: shell React, router, presentacion, adaptadores de plataforma (credenciales, iframe, cache), design system, sonido, telemetria, i18n. Composition root `src/app/services.ts` | app-core, communication, device, protocol, game-host, feature-game-authoring, feature-session-host, feature-session-join, feature-session-play, feature-sign-in |
| `apps/mobile` | NO existe codigo: solo `README.md` ("NOT STARTED") | n/a |
| `packages/protocol` | Contratos: paths HTTP, schemas zod, mensajes WS (player/admin/preview), puente Game<->Host (`./bridge`, `./bridge/validation`) | zod |
| `packages/app-core` | Estado global: credencial, `AuthSnapshot`, niveles de acceso (`anonymous<guest<account`), catalogo de operaciones, idioma | zustand |
| `packages/communication` | Clientes HTTP/WS: `http.ts`, `identityClient`, `gamesClient`, `sessionsClient`, `aiAccessClient`, `telemetryReporter`, `sessionConnection`, `adminConnection`, `previewConnection`, `viewState` | app-core, protocol |
| `packages/device` | `DeviceCapabilities` + store de capacidades/clase de pantalla | zustand |
| `packages/game-host` | GameHost: carga/verifica artefacto, handshake del puente, proyecciones, assets, limites (`bridgeGuard`), viewport | communication, protocol |
| `packages/game-sdk` | API que ve el juego dentro del iframe (`createPlayhoot`), solo `@playhoot/protocol/bridge` | protocol |
| `packages/game-core` | Declaraciones compartidas de juego (`defineCommands`, campos, validacion, fases, idiomas, brief) | (ninguno) |
| `packages/game-server` | Runtime del script de servidor (`defineGame`, `reject`...) que corre en el sandbox del backend | game-core |
| `packages/game-react` | Superficie React del cliente del juego (`mountGame`, hooks, `Button`/`Choices`/`TextAnswer`, `Scoreboard`...) sobre React Aria | game-core, game-sdk |
| `packages/game-tools` | CLI `build <proyecto>`: reglas de fuente, typecheck, bundles server/client, manifest, smoke run | game-core, game-react, game-server |
| `packages/features/sign-in` | Estado logico de invitado, login con proveedor, nombre | app-core, communication, protocol |
| `packages/features/session-join` | `createJoinSession` (conectar -> lobby -> started -> closed, reconexion) | app-core, communication, protocol |
| `packages/features/session-host` | `createHostSession` (conexion admin del creador) | app-core, communication, protocol |
| `packages/features/session-play` | `createSessionPlay` (corre el juego via GameHost sobre el "live link" de Join/Host/Preview) | game-host |
| `packages/features/game-authoring` | `createGameAuthoring`, `createGamePreview`, `createGamePublishing`, `createScenarioRunner`, `createAiLinkSharing`, `createTemplateBrowser`, `createMyGamesList`, `createAiConsent`, `createAiConnectionsList`, `parsePastedChange` | communication, game-core, protocol |
| `fixtures/games/{space-drift,parques}` | Juegos canvas reales (artefactos HTML) construidos con el SDK; `npm run fixtures` | game-sdk |
| `fixtures/sdk-games/{tap-race,number-guess,pairs,drift,quiz,know-me}` | Proyectos de juego completos del SDK v1 (no son workspaces; se compilan en tests) | n/a |

Fronteras impuestas por lint (`eslint.config.js`): los packages no importan apps ni `react-dom`/`react-native`/`react-router`; `game-sdk` solo `@playhoot/protocol/bridge`, sin UI; `game-core`/`game-server` solo `game-core` y sin React; `game-react` y fixtures solo via `game-sdk`.
Nota: `packages/features/*` y `game-host` importan solo `zustand`/`communication`; ninguno importa React (verificado por lint de packages).

### 1.3 Scripts raiz (`package.json`)

| Script | Hace |
| --- | --- |
| `dev` | `vite` de `@playhoot/web` (puerto 5173, strictPort) |
| `build` | typecheck de `@playhoot/web` + `vite build` |
| `typecheck` | `tsc --noEmit` en todos los workspaces (`--workspaces --if-present`) |
| `lint` | `eslint .` |
| `format` / `format:check` | `prettier --write .` / `--check .` |
| `test` / `test:watch` | `vitest run` / `vitest` |
| `check` | typecheck + lint + format:check + test + `node scripts/check-assets.mjs` (lo que AGENTS.md exige antes de dar algo por hecho) |
| `assets` | `scripts/check-assets.mjs`: lista assets del registro `assets.json` existentes/faltantes y falla si alguno no esta documentado en `docs/design/ASSETS.md` |
| `fixtures` | build de los dos juegos canvas (`space-drift`, `parques`) |
| `game` | `node --experimental-strip-types packages/game-tools/src/cli.ts` (CLI `build`) |
| (sin script) `scripts/dev-host.mjs` | Herramienta dev: inicia sesion con proveedor local, crea Session, imprime link, se conecta como admin e inicia con Enter |

---

## 2. Pantallas y rutas

Navegacion **basada en path con inputs en la URL** (invariante 11: "la URL determina la navegacion"). Query params usados: `next` (retorno tras autenticar, validado por `safeNext`), `code` (join code del host), `game` (gameUUID para crear sesion), `section` (seccion del workspace), `request` (id de autorizacion IA). Los tokens nunca van en URL; el `code` one-time de login se lee y borra antes de renderizar (`src/captureSignIn.ts`, `platform/signInCompletion.ts`).
Composicion de URLs en `apps/web/src/features/paths.ts` (el backend nunca devuelve URLs, ADR-0002).

Acceso: cada ruta protegida usa `RequireOperation` (`features/access.tsx`) contra el catalogo `GET /v1/identity/operations`; si falta nivel redirige a `/sign-in/guest` (si basta invitado) o `/sign-in` (si requiere cuenta) con `?next=`. Es solo UX; el backend decide.

| Path | Componente | Muestra | Cuenta necesaria | Navega a |
| --- | --- | --- | --- | --- |
| `/` | `<Navigate>` (router.tsx) | Redireccion; "no hay home page todavia" | ninguna | `/join` |
| `/join` | `EnterCodeRoute` | Logo + tagline + `CodeInput` (6 chars) + botones "Crear una partida", "Crear un juego", "Mis juegos" | ninguna (los 3 botones usan `useNavigateToOperation`) | `/join/:code`; `/sessions/new`; `/games/new`; `/games` (pasando por sign-in si falta nivel) |
| `/sign-in` | `SignInRoute` | Boton Google (si el backend lo ofrece), boton "cuenta local" (solo dev), aviso si hay invitado activo | ninguna (si ya es cuenta -> `next` o `/`) | redireccion de pagina completa al proveedor; `next ?? /` |
| `/sign-in/guest` | `GuestSignInRoute` | Campo nombre ("A jugar!") + enlace a iniciar sesion/registrarse | ninguna | `next ?? /`; `/sign-in?next=` |
| `/sign-in/complete` | `SignInCompleteRoute` | Vuelta del proveedor: canjea `code`, muestra error si falla | ninguna | `next ?? /`; `/sign-in` |
| (pantalla, no ruta) | `DisplayNameScreen` | `RootLayout` la muestra en lugar de cualquier pagina mientras una cuenta no tenga display name | cuenta sin nombre | (misma URL) |
| `/sessions/new` | `CreateSessionRoute` | "Creando..." (buho animado) o error (`game-unavailable`, `active-limit`, otro) con reintentar | cuenta (`CREATE_SESSION`) | `/sessions/:uuid/host?code=` (replace) |
| `/sessions/:sessionUUID/host` (`?code=`) | `HostRoute` | Lobby del creador (codigo/enlace, jugadores, limites min/max, Iniciar, "Unirme a jugar", Cancelar con confirmacion); partida: ver el juego de cualquier participante (solo lectura) o jugar; final/errores | cuenta (`JOIN_SESSION_AS_ADMIN`) | `/join` (cierre); embebe `PlayerSession` si el creador juega |
| `/join/:joinCode` y `/sessions/:sessionUUID/play` | `SessionRoute` (padre sin path, 2 hijos) | Una sola instancia mantiene la conexion: conectando -> lobby (invitacion, jugadores con presencia) -> juego (iframe, asiento, lista de jugadores, salir) -> resultados | invitado o cuenta (`JOIN_SESSION_AS_PLAYER`) | de `/join/:code` a `/sessions/:uuid/play` (replace al conocer la Session); `/join` al salir |
| `/games` | `MyGamesRoute` | Lista "Mis juegos" (nombre, publicado/visibilidad, edicion abierta, fecha) | cuenta (`EDIT_GAME`) | `/games/:id/edit`; `/games/new` |
| `/games/new` | `CreateGameRoute` | Formulario nombre + `TemplatePicker` (plantillas destacadas, busqueda, inspeccion) o proyecto inicial | cuenta (`CREATE_GAME`) | `/games/:id/edit` (replace) |
| `/games/:gameUUID/edit` (`?section=`) | `GameWorkspaceRoute` | Workspace con 9 secciones (ver 7) | cuenta (`EDIT_GAME`) | `/sessions/new?game=<uuid>` (desde Publicar) |
| `/connect-ai` (`?request=`) | `ConnectAiRoute` | Consentimiento OAuth/MCP de una IA (nombre, host de retorno, que puede/no puede); Permitir/Denegar | cuenta [inferido: el path no tiene `RequireOperation`; la ruta llama a un endpoint que exige Bearer] | navegacion completa a la URL de la app IA (`redirect_url`) |
| `/account/ai-connections` | `AiConnectionsRoute` | "IAs conectadas": lista y revocar (con confirmacion) | cuenta [inferido, igual que arriba] | (ninguna) |
| `/design` | `DesignRoute` | Style guide vivo (tokens, componentes, pantallas con estado falso, tablero de sonidos). **Solo `import.meta.env.DEV`** | ninguna | (ninguna) |
| `/dev/game-host` | `GameHostLabRoute` | Laboratorio de GameHost: Space Drift real contra Session falsa local. **Solo DEV** | ninguna | (ninguna) |
| `*` | `NotFoundRoute` | 404 con "Ir al inicio" | ninguna | `/` |

Elementos globales (no rutas): `AppShell` (barra superior: logo -> `/`, selector de idioma, boton de sonido, `AccountButton`), `AccountButton` (icono "iniciar sesion" si nadie; menu con inicial: invitado -> "Iniciar sesion"; cuenta -> "Mis juegos", "IAs conectadas", "Cerrar sesion"), `RouteError` (error boundary que reporta telemetria).
`RootLayout` reconstruye todas las paginas cuando cambia la identidad (`identityKey`, tambien entre pestanas via evento `storage`).
Total: 15 patrones de ruta de produccion (incluido el comodin `*`: `/`, `/join`, `/sign-in`, `/sign-in/guest`, `/sign-in/complete`, `/sessions/new`, `/sessions/:uuid/host`, `/join/:code`, `/sessions/:uuid/play`, `/games`, `/games/new`, `/games/:id/edit`, `/connect-ai`, `/account/ai-connections`) + 2 solo-dev (`/design`, `/dev/game-host`) = 17. No hay home, descubrimiento, perfil ni detalle de juego.

Grafo (resumen):
```
/ -> /join -> /join/:code -> /sessions/:uuid/play -> /join
/join -> /sessions/new -> /sessions/:uuid/host?code= -> (juega embebido) / -> /join
/join -> /games/new -> /games/:id/edit?section=ai|files|assets|build|preview|scenarios|history|share|publish
/join -> /games -> /games/:id/edit ; /games -> /games/new
/games/:id/edit?section=publish -> /sessions/new?game=<uuid> -> host
cualquier ruta protegida -> /sign-in/guest|/sign-in ?next= -> (proveedor) -> /sign-in/complete -> next
AI externa -> /connect-ai?request= -> (URL de la IA)
menu cuenta -> /games, /account/ai-connections
```

---

## 3. Llamadas HTTP / WebSocket

Todas pasan por `packages/communication` (cliente) con paths/schemas de `packages/protocol`. La UI no usa `fetch`/`WebSocket` directamente salvo: `GameHostLabRoute` (dev, `fetch` de fixtures), `sound/soundPlayer.ts` (`fetch` de audio local), y `game-host` (`artifact.ts`, `assets.ts`: `fetch` de URLs firmadas de almacenamiento, sin credenciales). Las instancias viven en `services.ts` (composition root): `http`, `identity`, `sessionsApi`, `gamesApi`, `aiAccess`, `telemetry`, `sessions`, `admins`, `previews`.

Transporte HTTP (`http.ts`): Bearer automatico desde `app.credentials`, renovacion de credencial en el transporte (ADR-0009, reintento unico tras `token_invalid`), `onCredentialRejected -> signOut`, cuerpos crudos y cabeceras extra (`Idempotency-Key`), errores tipados en `Result<T,E>` (`result.ts`).

### 3.1 Endpoints HTTP (44) -> funcion cliente -> pantallas

| Endpoint | Funcion cliente | Pantallas / features que la usan |
| --- | --- | --- |
| `GET /v1/identity/operations` | `IdentityClient.listOperations` | Arranque (`startServices.loadOperations`, reintento 1-30 s); alimenta `RequireOperation` en todas las rutas protegidas |
| `POST /v1/guests` | `identity.createGuest` | `/sign-in/guest` (`createGuestSignIn`) |
| `POST /v1/identity/refresh` | `identity.refresh` | Transporte/app-core (arranque, 1 min antes de expirar, vuelta a pestana, `token_invalid`), tambien tras fijar nombre |
| `POST /v1/identity/logout` | `identity.logout` | Menu de cuenta "Cerrar sesion" (`app.signOut`) |
| `PUT /v1/identity/me/display-name` | `identity.setDisplayName` | `DisplayNameScreen` (`createDisplayNameSetup`) |
| `GET /v1/identity/login/providers` | `identity.listLoginProviders` | `/sign-in` (`accountSignIn.loadProviders`, reintento) |
| `POST /v1/identity/login/start` | `identity.startLogin` | `/sign-in` (PKCE S256; con Bearer de invitado "hereda" la cuenta) |
| `POST /v1/identity/login/complete` | `identity.completeLogin` | `/sign-in/complete` (`replaces_refresh_token` = invitado) |
| `POST /v1/sessions` | `SessionsClient.createSession` | `/sessions/new` (llamada directa desde el componente, ver 4) |
| `POST /v1/client-telemetry` | `telemetryReporter` (lotes 30 s / al ocultar con keepalive) | Join, Session Play, `RouteError` (clasificado en `src/telemetry/`, ADR-0007) |
| `GET /v1/ai-authorizations/{id}` | `AiAccessClient.readAuthorization` | `/connect-ai` |
| `POST /v1/ai-authorizations/{id}/approve` | `aiAccess.approve` (via `decide`) | `/connect-ai` |
| `POST /v1/ai-authorizations/{id}/deny` | `aiAccess.deny` | `/connect-ai` |
| `GET /v1/ai-connections` | `aiAccess.listConnections` | `/account/ai-connections` |
| `POST /v1/ai-connections/{id}/revoke` | `aiAccess.revokeConnection` | `/account/ai-connections` |
| `GET /v1/games` | `GamesClient.listGames` | `/games` (`createMyGamesList`) |
| `POST /v1/games` | `gamesClient.createGame` | `/games/new` (llamada directa; admite `template`) |
| `GET /v1/templates` | `browseTemplates` | `TemplatePicker` en `/games/new` y en workspace `history` |
| `GET /v1/templates/search` | `searchTemplates` | idem |
| `GET /v1/templates/{id}` | `inspectTemplate` | idem |
| `GET /v1/templates/{id}/files` | `readTemplateFiles` | idem (inspeccion) |
| `POST /v1/games/{id}/draft/template` | `useTemplate` | workspace `history` ("Empezar de nuevo desde una plantilla") |
| `GET /v1/games/{id}` | `readCard` | workspace (`publish`, y carga inicial de `createGamePublishing`) |
| `PATCH /v1/games/{id}` | `updateCard` | `publish` (nombre/descripcion) |
| `PUT /v1/games/{id}/logo` | `uploadLogo` | `publish` |
| `POST /v1/games/{id}/logo/remove` | `removeLogo` | `publish` |
| `POST /v1/games/{id}/photos` | `uploadPhoto` | `publish` (hasta 8 fotos) |
| `POST /v1/games/{id}/photos/{photoUUID}/remove` | `removePhoto` | `publish` |
| `POST /v1/games/{id}/publish` | `publish` | `publish` (publico/privado, bloqueadores) |
| `POST /v1/games/{id}/editions` | `openEdition` | `publish` ("Crear nueva version") |
| `GET /v1/games/{id}/draft?content=true` | `readDraft` | workspace completo (carga y tras cada revision) |
| `POST /v1/games/{id}/draft/changes` | `applyChange` | `ai` (aplicar cambio pegado), `files` (guardar archivo) |
| `POST /v1/games/{id}/draft/restore` | `restoreRevision` | `history` |
| `GET /v1/games/{id}/draft/revisions` | `listRevisions` | `history` (paginado de 100) |
| `GET /v1/games/{id}/draft/diff` | `diffRevisions` | `history` (comparar) |
| `PUT /v1/games/{id}/draft/assets/{key}` | `uploadAsset` | `assets` |
| `POST /v1/games/{id}/draft/assets/{key}/remove` | `removeAsset` | `assets` |
| `GET /v1/games/{id}/draft/build?revision=&wait=20` | `readBuild` | `build` / cabecera del workspace (long poll) |
| `GET /v1/games/{id}/ai-link` | `readAiLink` | `share` |
| `POST /v1/games/{id}/ai-link` | `createAiLink` | `share` (el enlace se muestra una sola vez, solo en memoria) |
| `POST /v1/games/{id}/ai-link/revoke` | `revokeAiLink` | `share` |
| `POST /v1/games/{id}/draft/previews` | `createPreview` | `preview` ("Probar juego") |
| `POST /v1/games/{id}/draft/simulations` | `runSimulation` | `scenarios` (escenario pegado, `{scenario_path}` o `{all:true}`) |
| `GET /v1/games/{id}/draft/simulations/{resultID}/state` | `readSimulationState` | `scenarios` (inspeccionar estado) |
| `GET <URL firmada de almacenamiento>` (artefacto HTML y assets) | `game-host` `createArtifactLoader` / `createAssetLoader` (sin credenciales, verifican SHA-256) | Session Play, host (ver jugador), preview |

Nota: `GET /v1/identity/me` existe en el contrato (`BACKEND_CONTRACT.md`) y hay operacion `VIEW_OWN_IDENTITY`, pero **no hay cliente que lo llame** (verificado por grep). Endpoints del `.md` del contrato no consumidos: ese y `GET /v1/identity/login/{provider}/callback` (lo visita el navegador, redireccion del proveedor).

### 3.2 Protocolo realtime (WebSocket) — `packages/protocol/src/realtime`, `packages/communication`

| Conexion | Path | Cliente | Quien la usa |
| --- | --- | --- | --- |
| Jugador por codigo | `/v1/play/join/{joinCode}?device=desktop\|mobile` | `SessionConnector` -> `SessionConnection` (`sessionConnection.ts`) | `/join/:code` |
| Jugador por Session | `/v1/play/join/sessions/{uuid}/player?device=...` | idem | `/sessions/:uuid/play`; reconexion; creador que juega |
| Admin (creador) | `/v1/play/join/sessions/{uuid}/admin` | `AdminConnector` -> `AdminConnection` (`adminConnection.ts`) | `/sessions/:uuid/host` |
| Preview (creador prueba su borrador) | `/v1/play/previews/{previewUUID}/connect` | `PreviewConnector` -> `PreviewConnection` (`previewConnection.ts`) | workspace `preview` |

- Auth: el token viaja como subprotocolo `base64url.bearer.authorization.playhoot.<token>` + subprotocolo `playhoot.v1` (los navegadores no ponen cabeceras en WS).
- Cliente -> servidor (jugador): `sample{sequence,inputs}` (snapshot completo, secuencia por conexion, coalescido a 60/s, <= 32 KiB), `command{token,name,payload}` (idempotente por token, reintenta `rate_limited` con el mismo token), `resync`, `leave`, `game_fault{kind,detail}` (reporte de fallos del juego: `artifact_unreachable`, `artifact_hash_mismatch`, `ready_timeout`, `unsupported_bridge_version`, `container_violation`, `bridge_abuse`).
- Servidor -> jugador (zod): `rejected`, `lobby_update` (con limites min/max), `roster_update` (presencia: active/reconnecting/disconnected/left), `session_started` (UUID, participantes, `frontend{url,sha256,viewport,assets}`), `player_view` (FULL/parches/ack), `command_result`, `session_ended`, `lobby_closed`, `leave_result`.
- Admin: `start_session`, `cancel_session`, `select_perspective{participant_id}`, `resync`; respuestas `*_result{outcome}`, mas `lobby_update`, `session_started` (sin participante del creador), `player_view` del participante observado, `session_ended`, `rejected`. Admin y jugador son **siempre conexiones separadas** aunque el creador juegue.
- Preview: `act_as`, `sample`, `command`, `resync`, `pause`, `resume`, `end`; servidor `preview_started`, `acting_as`, `paused`, `resumed`, `error`, `preview_ended{reason}`, y vistas del participante.
- Vistas: `createViewTracker`/`applyViewPatch` (`viewState.ts`) reconstruyen estado con FULL/parches/ack-only; hueco -> `resync` automatico. Clasificacion de cierre (`unreachable`, `session-ended`, `left`, `replaced`, `disconnected`, `retryable`, `protocol`, `game-data-invalid`). Reconexion en las features (1 s, 2 s, 4 s; 3 intentos; nunca tras `replaced`; durante juego la fase sigue `started` con `connection: 'reconnecting'`).
- Valores del backend nunca tratados como lista cerrada (`docs/engineering/standards/backend-contract-values.md`).

---

## 4. Capas (UI / estado-logica / llamadas externas)

Modelo del repo (ARCHITECTURE.md §4): `Presentacion -> Feature State -> Communication ports -> Backend`.

| Capa | Donde | Ejemplos concretos |
| --- | --- | --- |
| Presentacion (UI) | `apps/web/src/features/<feature>/*.tsx`, `apps/web/src/ui/*` | `session-join/SessionScreen.tsx` recibe `state`, `layout`, `actions` por props y hace `switch (view.phase)`; `session-play/PlayScreen.tsx` recibe todo por props (`layout`, `players`, `game`, `onLeave`) |
| Estado + logica de feature | `packages/features/*/src/*.ts` (stores zustand vanilla, sin React ni router) | `session-join/src/joinSession.ts`, `session-host/src/hostSession.ts`, `game-authoring/src/gameAuthoring.ts`, `sign-in/src/guestSignIn.ts` |
| Estado global | `packages/app-core` (`createAppState`: auth, idioma, operaciones) + `packages/device` | `apps/web/src/app/ServicesContext.tsx` expone hooks `useAuth`, `useOperationAccess`, `useDeviceCapabilities` |
| Llamadas externas | `packages/communication` (+ `protocol`) | `gamesClient.ts`, `identityClient.ts`, `sessionConnection.ts`; construidos una vez en `apps/web/src/app/services.ts` |
| Adaptadores de plataforma | `apps/web/src/platform/*` | `browserCredentialStore.ts` (localStorage `playhoot.credential.v2`), `iframeGameContainer.ts`, `browserArtifactCache.ts` (Cache Storage), `browserDeviceCapabilities.ts` |

Como se conecta: la ruta (`*Route.tsx`) crea la instancia de feature en un `useEffect` (`createJoinSession(...)`, `createGameAuthoring(...)`), la guarda con `useState`, la destruye con `dispose()`, y pasa `useStore(feature.store)` a una pantalla. "Salir de una ruta descarta el estado" (invariante 12).

Cumplimiento del requisito "UI pura / una capa de estado+logica / capa de llamadas externas" (hallazgos objetivos):
- Estado+logica y llamadas estan separados en paquetes con lint de frontera. La UI no importa `communication` directamente salvo tipos y constructores de `services.ts`.
- **Excepciones verificadas** donde la UI llama a un cliente sin pasar por estado de feature: `CreateGameRoute.tsx` (`services.gamesApi.createGame(...)`) y `CreateSessionRoute.tsx` (`services.sessionsApi.createSession(...)`) hacen la llamada, gestionan idempotency key y estados `creating/failed` en `useState`; `SignInRoute.tsx` implementa un reintento de proveedores con `setTimeout` en el componente; `GameWorkspaceRoute.tsx`/`HostGameView.tsx`/`PreviewSection.tsx` construyen instancias de feature dentro de hooks de la propia UI (`useGameAuthoring`, `useWatchedPlay`, `usePreviewPlay`).
- Presentacion no es 100% "tonta": `SessionScreen.tsx` y `PlayScreen.tsx` reproducen sonido (`useSound`), usan `setTimeout`, estado local de UI y `useEffect`; `SessionRoute.tsx` contiene logica de navegacion (reemplazar URL, copiar invitacion al portapapeles), y `HostRoute.tsx` (561 lineas) calcula textos de estado. `outcomeCopy.ts` mapea resultados a ids de mensaje (presentacion).
- Regla de textos: feature state no produce texto, expone `kind`s (docs/engineering/standards/user-facing-text.md, regla 5).
- No existe capa "service/use-case" propia ("No service/use-case layer re-implementing backend logic", ARCHITECTURE.md §4.2). Los stores de feature se llaman a si mismos "Feature State".

### Responsive: implementaciones separadas o una sola

Hibrido, decidido por ruta (`features/layout.ts`: `selectLayout` -> `'compact' | 'wide'` segun `orientation === 'landscape' && displayClass !== 'compact'`, via `useLayout()` que lee el store de `packages/device`):
- **Variantes JSX separadas en el borde de la ruta** (render distinto): `EnterCodeRoute.tsx` (`SplitStage` vs `Stage`), `SignInRoute.tsx`, `GuestSignInRoute.tsx`, `DisplayNameScreen.tsx`, `PlayScreen.tsx` (riel lateral vs barra superior; juego inmersivo con `AppShell immersive`).
- **Misma estructura con clases distintas segun `layout`**: lobby (`SessionScreen.tsx`, `HostRoute.tsx`: `lobbyGrid`/`lobbyGridWide`), workspace (`GameWorkspaceRoute.tsx`: `navWide`/`navCompact`, `bodyWide`/`bodyCompact`).
- **Una sola implementacion fluida** para el resto: tokens `clamp()` de tipo, 5 `@media` en total (`AccountButton`, `GameWorkspace`, `Card`, `Logo`, `tokens.css` reduced-motion). Las pantallas de un solo mensaje (conectando, resultados) tienen un solo esqueleto.
- No hay implementaciones separadas por plataforma (no existe `apps/mobile`). Doc: `docs/design/DESIGN_SYSTEM.md` "Responsive behavior".

---

## 5. Runtime del juego en el cliente

- **Carga/embebido** (`packages/game-host/src/gameHost.ts`, `artifact.ts`, `apps/web/src/platform/iframeGameContainer.ts`; ADR-0005/0006): `startGameHost`: `fetch` del artefacto (HTML unico autocontenido) a URL firmada **sin credenciales** -> verificacion SHA-256 -> cache por hash (Cache Storage `playhoot-game-artifacts-v1`) -> contenedor -> handshake `ready` con negociacion de version (timeout 10 s) -> `start` con contexto + proyeccion actual.
- **Aislamiento (verificado en codigo)**: `<iframe sandbox="allow-scripts">` con el HTML por `srcdoc`; `<meta>` CSP puesto primero en el `<head>`: `default-src 'none'; script-src 'unsafe-inline' blob:; style-src 'unsafe-inline' blob:; img/media/font-src blob: data:; connect-src 'none'; base-uri 'none'; form-action 'none'`. Se eliminan frames anidados y shadow roots declarativos del HTML y se inyecta un script guardia (borra WebRTC, `parseHTMLUnsafe`, vigila `MutationObserver` y detiene el juego si inserta un frame). La pagina anfitriona declara `frame-src 'none'` (`index.html`). Los mensajes solo se aceptan de ese iframe. El iframe siempre tiene el tamano logico del juego y se escala y centra con barras (`fitGameViewport`, nunca estirado).
- **Puente** (`packages/protocol/src/bridge`, versiones 1 y 2): mensajes `postMessage` con marca `playhoot.bridge`. Juego -> Host: `ready`, `sample`, `command`, `request_asset`. Host -> juego: `start`, `presentation` (v2: escala, tamano en pantalla, safe area, densidad, puntero, preferencias), `update` (proyeccion completa/eventos/errores/ack traducido), `command_result`, `asset`, `incompatible`. Tokens, secuencias de conexion y el WS real **nunca llegan al juego**. Validacion zod de cada mensaje del juego en el Host, limites por tipo y total (`bridgeGuard.ts`; un juego fuera de limites 5 s seguidos se detiene como `bridge-abuse`), todo fallo se reporta al backend como `game_fault`.
- **Assets** (ADR-0008, `assets.ts`): solo claves que el backend listo en `frontend.assets`; descarga sin credenciales, verifica tamano y SHA-256, cache por hash (`playhoot-game-assets-v1`), bytes transferidos al juego (blob URLs).
- **SDK del cliente del juego**:
  - `packages/game-sdk`: `createPlayhoot()` con `ready`, `onProjection`, `onEvent`, `onError`, `onUpdate`, `sample`, `command`, `assets`/`load`/`preload`, `presentation()`/`onPresentation()` (v2); transporte elegido en runtime: `window.parent` o canal de WebView de React Native (`webViewTransport`) — preparado para movil, sin app movil.
  - `packages/game-react`: `mountGame`, `useView`, `useCommand`, `useInputs`, `useAsset`, `usePhase`, `usePlayer`, `useGameEvent`, `useGameError`, `usePresentation`, `useText`/`defineTexts`/`useLanguage`; componentes `Screen`, `Stack`, `Grid`, `Panel`, `Text`, `Button`, `Choices`, `TextAnswer`, `Countdown`, `Scoreboard`, `AssetImage` (React Aria 3.53.1).
  - `packages/game-core` + `game-server`: lado servidor/compartido (`defineCommands`, `defineInputs`, `defineGame`, fases declarativas, `addPoints`/`ranking`, validacion de campos con vectores compartidos con el backend `packages/game-core/src/testdata/field-vectors.json`). `sdkVersion = '1.0.0'`.
  - `packages/game-tools`: `npm run game -- build <proyecto>` (reglas de fuente perfil `sdk-v1`, typecheck, rolldown -> `server.js` + `client.html`, `manifest.json`, `build.json`).
- **Guia SDK para agentes IA**: `apps/web/public/docs/sdk/v1/*.md` (21 archivos, ~1100 lineas): `index`, `capabilities`, `project`, `server`, `client`, `ui`, `phases`, `config`, `templates`, `policies`, `assets`, `brief`, `building`, `changes`, `scenarios` + `examples/{drift,know-me,number-guess,pairs,quiz,tap-race}.md`. Servida estatica en `/docs/sdk/v1/*.md`; `packages/game-tools/src/guide.test.ts` la mantiene alineada con el SDK. Requiere que produccion la sirva sin fallback SPA (nota del repo).
- **Comandos/muestras/proyecciones**: el Host es dueno de la secuencia SAMPLE, de los tokens idempotentes de COMMAND, de la revision/baseline de vista y del resync; el juego solo ve `projection`, `events`, `errors`, `ack` traducido a sus propios ids y resultados reducidos (`executed`/`rejected`/`unavailable`).
- **Replay**: **no existe** reproductor de replays (ni en `communication` ni en `game-host`; el plan lo ubica como paso 12, fuera del proyecto).
- **Otros usos del mismo GameHost**: vista de espectador del host (`HostGameView.tsx`, solo lectura), preview del creador (`PreviewSection.tsx`, una corrida de GameHost por participante sintetico), laboratorio dev.

---

## 6. Design system

- **Donde se define**: `apps/web/src/ui/tokens.css` (paleta, semanticos, tipo, forma, espacio, sombras, duraciones, easing, colores por asiento `--player-1..8`, colores del buho), `ui/motion.css` (vocabulario de movimiento), componentes en `apps/web/src/ui/`, doc `docs/design/DESIGN_SYSTEM.md` (aceptado 2026-10-20), ADR-0003 (CSS Modules + tokens). Regla: ningun valor de color/duracion/sombra dentro de un componente; derivados con `color-mix`.
- **Tema**: solo oscuro (`color-scheme: dark`), "game night": fondo indigo `#141134`, superficie `#211c52`, accion primaria ambar `#ffc53d`, acento coral `#ff6f91`, exito menta `#4ee0a6`, peligro rojo `#ff6b6b`; 8 colores de jugador (ambar, coral, menta, cielo, violeta, lima, naranja, teal). No hay tema claro (pregunta abierta en el doc).
- **Tipografia**: Fredoka (display/titulos) y Nunito (cuerpo), autoalojadas via `@fontsource-variable`; Roboto solo para el boton de Google. Tamanos como tokens con `clamp()`.
- **Forma**: radios 10/16/24/32/pill; espacio base 4 px; "borde de presion" `--edge: 4px` bajo botones/fichas/avatares (aspecto de pieza de juego); cards radio 32 con degradado sutil `linear-gradient(180deg, sheen, transparent 40%)`.
- **Componentes propios** (12): `AppShell` (+`Stage`, `SplitStage`), `Avatar`, `Button` (primary/secondary/danger/ghost, md/lg, block, loading, prop `sound`), `Card`, `CodeInput`, `CodeTiles`, `Confetti`, `Logo` (wordmark "play**hoot**"), `Owl` (mascota Hoot con moods happy/sleepy/surprised, parpadeo, hop/shake), `Starfield` (estrellas fijas con parpadeo), `TextField`. Mas `AccountButton`, `LanguagePicker`, `SoundToggle`, `Notice`. No hay libreria de componentes de terceros en el host (solo React Aria dentro del SDK del juego).
- **Iconos**: SVG inline sueltos (p. ej. `PersonIcon` en `AccountButton.tsx`); sin libreria de iconos. **Emoji: 0 ocurrencias** en `apps/web/src` (grep). Gradientes: 7 usos CSS, todos sutiles (brillo de card, fondo del cielo con 2 radiales en `tokens.css`, resalte de fila).
- **Animacion**: CSS puro, 19 `@keyframes`; clases globales `motion-rise/pop/fade/bump/hop/shake/cascade` (cada `Stage` entra en cascada); respeta `prefers-reduced-motion`. Sin libreria de animacion.
- **Sonido**: reproductor Web Audio (`src/sound/`), mute persistido en localStorage, tonos placeholder si falta el archivo, musica de lobby en bucle.
- **Assets de marca**: registro `src/assets/assets.json` (19 assets); solo existen en `public/` `favicon.svg`, `assets/brand/google-g.svg` y `site.webmanifest`. **Faltan** (segun `docs/design/ASSETS.md`, 17 MISSING): iconos PWA 192/512/maskable/apple-touch, `og-share.png`, todos los sonidos/musica.
- **Look actual resumido (objetivo)**: pagina oscura nocturna con estrellas y dos resplandores radiales; cards oscuras de borde redondeado centradas en columna (480 px, o 960 px "wide"); un solo boton ambar como accion principal; buho vectorial como mascota/indicador de carga; fichas de letras para el codigo; texto redondeado. Sin grids de cards de catalogo (no hay catalogo), sin emoji, sin kit por defecto.
- Guia viva en dev: `/design`.

---

## 7. UI de creacion / autoria de juegos

Ruta `/games/new` + `/games/:gameUUID/edit?section=` (`apps/web/src/features/game-authoring/`, estado en `packages/features/game-authoring`). El creador **no escribe codigo en la web con IA integrada**: trabaja con su propia IA externa (Claude, ChatGPT...) que lee un enlace/MCP y propone cambios; la web muestra, aplica y prueba.

| Seccion (`?section=`) | Componente | Funcion |
| --- | --- | --- |
| `ai` ("Cambios de mi IA", por defecto) | `AiChangesSection` + `BriefSummary` | Pegar el JSON de cambio (`playhoot.project-change.v1`, parseo estricto `parsePastedChange`, resumen added/modified/deleted), `Aplicar cambio`; muestra el brief (`brief.json`: juego acordado y fase) |
| `files` | `FilesSection` | Ver/editar un archivo, guardar como nueva revision |
| `assets` ("Recursos") | `AssetsSection` | Declarar/subir/reemplazar/quitar imagen, audio, video; muestra estado, tamano, dimensiones/duracion (trabajo sin commit) |
| `build` ("Construccion") | `BuildSection`, `BuildStatusBadge`, `DiagnosticList` | Estado del build de la revision actual (long poll), diagnosticos por linea |
| `preview` ("Probar juego") | `PreviewSection` | Partida privada del build actual con N participantes sinteticos, jugar como cada uno, pausar/reanudar/reiniciar/terminar, nota si el borrador avanzo |
| `scenarios` ("Escenarios") | `ScenariosSection` | Pegar escenario (`playhoot.scenario.v1`), ejecutar el actual/guardados/todos, resumen + JSON completo copiable, inspeccionar estado |
| `history` ("Historial") | `HistorySection` + `TemplatePicker` | Revisiones (paginadas), comparar (diff), restaurar, "empezar desde una plantilla" |
| `share` ("Compartir con mi IA") | `ShareSection` | Crear/renovar/revocar el enlace para la IA; mensaje y enlace copiables (mostrado una sola vez, en memoria) |
| `publish` ("Ficha y publicacion") | `PublishSection` | Ficha (nombre, descripcion, logo, hasta 8 fotos), publicar revision actual como publico/privado con bloqueadores, nueva version/edicion, crear partida del juego |

Otras pantallas de creacion/cuenta: `CreateGameRoute` (nombre + `TemplatePicker` con plantillas destacadas/categorias/busqueda/inspeccion; si el catalogo esta vacio se ofrece solo el proyecto inicial), `MyGamesRoute`, `ConnectAiRoute` (consentimiento OAuth/MCP), `AiConnectionsRoute`.
Un juego publicado sin edicion abierta abre en `publish` y las secciones de borrador explican como abrir una edicion (`PublishedNotice`).
Pendientes en el CHECKLIST (`docs/projects/active/game-creation-web-v1/CHECKLIST.md`): quiz/know-me como plantillas (esperan paso 2 del backend), codigos estables en diagnosticos y log de build, libreria de sonidos/iconos built-in (V). **[DRIFT]** `CURRENT_STATE.md` no menciona `TemplatePicker`, plantillas, `brief`, diff ni "Escenarios con expectativas"; si estan en codigo y en el CHECKLIST.
**No hay**: chat de IA integrado, editor visual, asistente propio, capturas automaticas (declarado fuera de alcance en `PROJECT.md`).

---

## 8. Documentacion y artefactos de proceso

### 8.1 Arbol de `docs/`
```
docs/Playhoot_Frontend_Architecture_Plan.docx          (plan de arquitectura; §N)
docs/ai/{README,OPERATING_MODEL,KNOWLEDGE_MAP,CHANGELOG}.md
docs/ai/processes/{AI_WORKFLOW_CHANGE,ARCHITECTURE_DISCUSSION,ENGINEERING_STANDARD,FEATURE_DEVELOPMENT,GUIDED_TECHNICAL_EXPLORATION,PRINCIPAL_ENGINEER_REVIEW,PRODUCT_DISCUSSION}.md
docs/ai/protocols/{AI_WORKFLOW_CHANGE,ARCHITECTURE_DISCUSSION,CONVERSATIONAL_ORCHESTRATOR,ENGINEERING_STANDARD,FEATURE_DEVELOPMENT,GUIDED_TECHNICAL_EXPLORATION,IMPLEMENTATION_REVIEW,PRINCIPAL_ENGINEER_REVIEW,PRODUCT_DISCUSSION}.md
docs/ai/workspaces/{README.md,active/.gitkeep}
docs/architecture/BACKEND_CONTRACT.md
docs/decisions/{README.md,architecture/INDEX.md,templates/ARCHITECTURE_DECISION.template.md}
docs/decisions/architecture/ADR-0001..ADR-0009 (workspace-tooling, session-urls, css-modules-tokens, formatjs-icu, bridge-v1, game-isolation, client-telemetry, game-assets, credential-renewal)
docs/design/{DESIGN_SYSTEM.md,ASSETS.md}
docs/engineering/{ENGINEERING_RADAR.md,standards/{INDEX,backend-contract-values,user-facing-text}.md}
docs/logic/{README.md,FLOWS.md,mirror/*.go}   (mirror: external.go, routes.go, state_{app,connection,gameauthoring,gamehost,hostsession,joinsession,sessionplay}.go, view_{app_shell,enter_code,game_workspace,host,not_found,session,session_connecting,session_lobby,session_outcome,session_started,sign_in,sign_in_complete,sign_in_guest}.go)
docs/projects/{README.md,templates/PROJECT.template.md}
docs/projects/active/game-creation-web-v1/{PROJECT.md,CHECKLIST.md}
docs/projects/completed/identity-web-v1/{PROJECT.md,internal/AI_CONTEXT.md,works/WORK-0001..0006-*.md}
docs/projects/completed/session-play-v1/{PROJECT.md,CHECKLIST.md,internal/AI_CONTEXT.md}
docs/work/{README.md,active/README.md,completed/README.md,templates/WORK_SPEC.template.md}
```
(`docs/` raiz del repo padre `repos/docs` es otra cosa: planes 04/06/07/08 del producto, citados por `PROJECT.md` como `../docs/...`.)

### 8.2 Que contiene cada documento
- `AGENTS.md` (+ `CLAUDE.md` = `@AGENTS.md`): bootstrap de agentes: determinar superficie de ejecucion (Conversational AI / Codebase Agent / Independent Reviewer), leer `docs/ai/OPERATING_MODEL.md`, enrutar contexto con `docs/ai/KNOWLEDGE_MAP.md` (no escanear todo el Markdown), usar `CONVERSATIONAL_ORCHESTRATOR.md` para peticiones naturales, procesos/protocolos en `docs/ai/`, verificar contra codigo y reportar contradicciones como **drift**, no tratar ideas/TODOs como decisiones, escalar decisiones materiales. Secciones: dos repos (el backend es la autoridad de negocio y contratos), estado del proyecto, estandares, Logic Mirror, **Assets** ("construir como si todo asset existiera": registrar en `assets.json`, usar por id, placeholder, documentar en `ASSETS.md`), Comandos (`npm run check` antes de reportar hecho), `HUMAN_REVIEW.md`/`AI_CONTEXT.md` temporales.
- `ARCHITECTURE.md` (CANONICAL): 15 invariantes (§20): backend autoridad; Host confiable / juego no confiable; mismo artefacto web y movil; el juego nunca recibe tokens ni el WS; puente versionado y validado; plataforma responsive con juego en viewport de aspecto fijo (letterbox); **presentacion adaptativa con variantes separadas elegidas en el borde, no condicionales dispersos**; estado de presentacion / de feature / global son distintos; Feature State conoce operaciones semanticas, no transportes; URL determina navegacion y la feature se reconstruye de URL + backend; salir de una ruta descarta estado; device awareness solo en presentacion/adaptadores; visibilidad frontend no reemplaza autorizacion; meta inicial = slice Join+Play. Layout de repo, reglas de colocacion (feature package = estado/puertos; presentacion en cada app), capas por feature, navegacion (tabla de URLs, `/` solo redirige), GameHost/bridge, errores/observabilidad, "Deliberadamente abierto".
- `CURRENT_STATE.md`: tabla "Area | Estado | Notas" de lo implementado + "Placeholders dejados" + "Identity Phase 2 (planned)". **[DRIFT]** cabecera dice `Last updated: 2026-10-20` pero contiene entradas hasta 2026-11-03; dice "261 tests en 32 archivos" (hay 53 archivos / 494 tests); no recoge plantillas/brief/escenarios con expectativas ni los cambios no commiteados; el boton de Google se describe "disabled for now" en `docs/logic/README.md` pero el codigo lo habilita si el backend lo ofrece.
- `README.md` (raiz): descripcion corta, comandos, enlaces.
- `docs/architecture/BACKEND_CONTRACT.md`: instantanea de referencia del contrato HTTP/WS que el backend implementa (gaps G1-G9, endpoints, WS, limites). "El codigo del backend gana."
- `docs/logic/` (**Logic Mirror**): documentacion pensada para el humano que no lee TypeScript. `FLOWS.md` (18 flujos paso a paso con tablas de estado y de llamadas externas) y `mirror/*.go` (**pseudocodigo con sintaxis Go que no compila**): `routes.go` (cada URL -> vista), `view_*.go` (una por pantalla, con eventos y comentarios `// -> X`, `// code: ruta#simbolo`), `state_*.go` (que hace cada evento con el estado), `external.go` (cada llamada al backend como funcion pelada: `// endpoint: ...`, `// answer: ...`, `// code: packages/communication/...`). Se recorre como traza de llamadas desde `routes.go`. Regla: **cualquier cambio en una llamada externa, forma de estado, transicion, evento de pantalla o navegacion actualiza esa carpeta en el mismo cambio**; cada control nuevo suma una fila en "Where is each button?"; si el mirror discrepa del codigo es un bug (el codigo manda). `external.go` esta modificado sin commit (3 lineas, assets width/height/duration).
- `docs/projects/**`: un Project agrupa WORK; `PROJECT.md` (dashboard), `CHECKLIST.md` opcional, `works/WORK-NNNN-*.md`, `internal/AI_CONTEXT.md` (contexto reanudable, no canonico). Activo: `game-creation-web-v1` (checklist con 35 items hechos y 3 abiertos). Completados: `session-play-v1` (slice join+play, 2026-11-01), `identity-web-v1` (6 WORK: credencial, invitado real, login local, Google, cierre, niveles de autenticacion). `PROJECT.md` de game-creation declara **realineacion 2026-11-05**: el flujo debe cumplir `../docs/08_Playhoot_Checklist_Flujo_de_Creacion.md`, que gana sobre el plan y decisiones previas.
- `docs/work/**`: ciclo de vida de WORK (spec -> READY -> IMPLEMENTING -> review -> cierre); sin WORK standalone activos. `docs/decisions/**`: ADR-0001..0009 todos ACCEPTED (siguiente ADR-0010). `docs/engineering/**`: Radar NO autoritativo y 2 estandares aceptados (valores del backend; texto de cara al usuario/idiomas). `docs/design/**`: sistema de diseno y registro de assets.

### 8.3 Reglas que hoy se le dicen a un agente que trabaja aqui (resumen)
1. Leer AGENTS.md -> OPERATING_MODEL -> KNOWLEDGE_MAP; cargar solo el contexto relevante; usar el Orchestrator (buscar Project/WORK abierto antes de crear nada).
2. Codigo y tests son autoridad de lo implementado; contradicciones docs/codigo = reportar como drift; no resolver en silencio.
3. Humano decide; escalar decisiones materiales (producto, arquitectura, seguridad, contrato, dependencias, estandares); no inventar estandares desde patrones.
4. Backend = autoridad de negocio y contratos; cambios de backend solo bajo direccion del humano y con el `AGENTS.md` del backend.
5. Arquitectura: invariantes 1-15 de `ARCHITECTURE.md`; frontera de paquetes impuesta por lint; presentacion adaptativa por variantes en el borde.
6. i18n: ningun texto literal en JSX/props (lint), catalogos es/en/pt-BR con paridad (test), frases ICU completas, feature state no produce texto, nunca mostrar `message` del backend.
7. Valores del backend: nunca listas cerradas; default general; schema acepta strings donde la lista puede crecer.
8. Estilos: solo tokens, ADR-0003; assets: registrar/usar por id/documentar; `npm run check` debe pasar.
9. **Logic Mirror**: actualizar `docs/logic/**` en el mismo cambio que toque llamadas/estado/navegacion.
10. Mantener `AI_CONTEXT.md` de proyectos activos al dia en checkpoints; no sobrescribir autoridad de diseno de workspaces/proyectos activos; `HUMAN_REVIEW.md` como superficie de revision.
11. Correr `npm run check` antes de reportar trabajo como hecho.
(La memoria del usuario indica ademas un flujo "chat primero; docs son memoria propia, nunca compuertas" que NO esta en este repo; es instruccion externa.)

---

## 9. Cobertura de conceptos

| Concepto | Estado | Detalle |
| --- | --- | --- |
| Descubrimiento / busqueda de juegos | **ausente** (para jugadores) / parcial para creadores | No hay home, catalogo ni busqueda de juegos. Existe busqueda/filtro de **plantillas** al crear (`TemplatePicker`, `GET /v1/templates[/search]`). `/` solo redirige a `/join` |
| Pagina de detalle de juego | **ausente** (lado jugador) / parcial | Solo la "Ficha y publicacion" del creador (`PublishSection`: nombre, descripcion, logo, fotos); no hay vista publica de una ficha |
| Unirse por codigo/enlace | **existe** | `/join` (+`CodeInput`), `/join/:joinCode`, `/sessions/:uuid/play`; copiar enlace de invitacion en lobby |
| Lobby | **existe** | `SessionScreen`/`HostRoute` (jugadores con presencia, limites min/max, invitacion, musica) |
| Juego en sesion | **existe** | GameHost en iframe sandbox, reconexion, overlays, riel/barra, pista de rotacion |
| Vista admin del host (cambiar perspectiva, expulsar) | **parcial** | Existe: iniciar, cancelar, jugar tambien, ver el juego de cualquier participante en solo lectura (`select_perspective`). **No existe expulsar/kick** (grep sin resultados) |
| Historial de sesiones + replay | **ausente** | Sin pantallas ni clientes; replay fuera del proyecto (paso 12 del plan) |
| Perfil | **ausente** | Solo `DisplayNameScreen` (fijar nombre inicial); "Identity Phase 2" (pantalla de cuenta, cambiar nombre, sesiones activas) planificada, no construida |
| Cuenta invitado + upgrade | **existe** | `/sign-in/guest` (`POST /v1/guests`); upgrade: `login/start` con Bearer de invitado + `login/complete` con `replaces_refresh_token` (el invitado pasa a ser la cuenta, misma identidad) |
| Login / registro (Google) | **existe** (Google "construido", sin verificar contra Google real) | `/sign-in` con Google (si lo ofrece el backend) y proveedor local fictitio en dev; PKCE S256; `CURRENT_STATE` dice que la verificacion real esta diferida |
| Mis juegos | **existe** | `/games` (lista: nombre, publicado, visibilidad, edicion) |
| Creacion de juegos: enlace de IA externa | **existe** | `share` (enlace `ai-link`), `ai` (pegar cambios), MCP: consentimiento `/connect-ai` y `/account/ai-connections` |
| Creacion de juegos: chat de IA integrado | **ausente** | Fuera de alcance declarado ("Playhoot's own AI agent") |
| Gestion de versiones | **parcial** | Revisiones del borrador (listar, diff, restaurar), publicar revision, "nueva version" (`openEdition`); no hay UI de multiples versiones publicadas/rollback entre versiones publicadas [inferido: no hay endpoint para ello] |
| Reportes / casos | **ausente** | Solo reportes automaticos `game_fault` (WS) y telemetria; sin UI de reportar |
| Notificaciones (campana/bandeja) | **ausente** | Sin codigo |
| Planes / suscripcion / compras | **ausente** | Sin codigo ni operaciones |
| Modo profesor (clases, alumnos, materiales, actividades, notas) | **ausente** | Sin codigo; `PROJECT.md` lo declara "teacher product layer" fuera de alcance |
| Modo estudiante | **ausente** | Sin codigo |
| Dashboard admin | **ausente** | Sin codigo (`/design` y `/dev/*` son solo desarrollo) |
| PWA (manifest/service worker) | **parcial** | `public/site.webmanifest` (standalone, colores, 3 iconos referenciados) y `<link rel=manifest>`; **los iconos PNG no existen** (MISSING en ASSETS.md); **no hay service worker** (grep `serviceWorker` sin resultados); Cache Storage solo para artefactos y assets de juegos |
| SEO (SSR/prerender/meta) | **ausente / minimo** | SPA pura de Vite; solo metas estaticas en `apps/web/index.html` (description, theme-color, og:*, twitter:card); `og-share.png` no existe; sin SSR, prerender ni meta por ruta (`<title>` fijo "Playhoot"). `<html lang>` si se sincroniza con el idioma |
| App movil | **ausente** (preparada a medias) | `apps/mobile/README.md` solamente; el SDK ya elige transporte de WebView de React Native y `ARCHITECTURE.md` la describe (React Native + Expo + `NativeGameHost`), sin codigo |

---

## 10. Health check

### 10.1 `git status --short` (11 archivos modificados, 0 sin seguimiento)
```
 M apps/web/public/docs/sdk/v1/assets.md
 M apps/web/src/features/game-authoring/sections/AssetsSection.tsx
 M apps/web/src/i18n/messages/{en,es,pt-BR}.ts
 M docs/architecture/BACKEND_CONTRACT.md
 M docs/logic/mirror/external.go
 M docs/projects/active/game-creation-web-v1/CHECKLIST.md
 M packages/communication/src/gamesClient.test.ts
 M packages/communication/src/gamesClient.ts
 M packages/protocol/src/http/games.ts
```
Caracterizacion del trabajo en curso (5 lineas):
1. Un solo cambio coherente (+57/-3 lineas, `git diff --stat`): "S2. Medidas de assets y subidas por agente" (backend S, 2026-11-07).
2. Protocolo/cliente: `DraftAsset` gana `width`, `height`, `durationMs` (`duration_ms`) nulables (`packages/protocol/src/http/games.ts`, `gamesClient.ts` + test).
3. UI: `AssetsSection.tsx` muestra "W x H px" o segundos junto al estado del asset; 2 claves i18n nuevas en es/en/pt-BR.
4. Guia SDK `assets.md`: un agente no pasa archivos por su contexto; pide una URL de subida de un solo uso (`request_asset_upload` MCP o `POST <link>/assets/<key>/upload-url`) y hace PUT; `upload_asset` base64 solo hasta 256 KiB.
5. Docs sincronizadas en el mismo cambio: `BACKEND_CONTRACT.md`, `docs/logic/mirror/external.go` y item S2 del CHECKLIST (consistente con la regla del Logic Mirror).

### 10.2 Verificaciones ejecutadas (sin servidores dev)
| Comando | Resultado |
| --- | --- |
| `npm run typecheck` (todos los workspaces) | **PASA** (exit 0, sin errores) |
| `npm run lint` (`eslint .`) | **PASA** (exit 0, sin avisos) |
| `npx vitest run` (no requiere backend) | **PASA**: 53 archivos, 494 tests, 32 s |
| `format:check`, `assets`, `build` | no ejecutados (fuera de lo pedido) |

**[DRIFT]** `CURRENT_STATE.md` afirma 32 archivos / 261 tests; la realidad es 53 / 494.

---

## Notas finales de verificacion
- Contrastado contra codigo: rutas (`router.tsx`), clientes HTTP/WS (`communication`, `protocol`), capas (archivos citados), contenedor iframe, tokens CSS, ausencia de conceptos (grep de kick/replay/notification/teacher/student/grade/serviceWorker/prerender sin resultados en codigo de `apps` y `packages`).
- No ejecutado: arranque de dev server, e2e contra backend, navegador. El conteo de endpoints (44) sale de contar funciones de `gamesClient` (29), `identityClient` (8), `aiAccessClient` (5), `sessionsClient` (1), `telemetryReporter` (1).
- [inferido]: nivel de cuenta requerido por `/connect-ai` y `/account/ai-connections` (sin `RequireOperation` en esas rutas); que no haya endpoint de versiones publicadas multiples (no aparece en `protocol`).
