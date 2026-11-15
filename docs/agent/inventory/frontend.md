# `playhoot_frontend` frontend inventory

Inventory date: 2026-11-15. Read-only on the repo (except this file). Source of truth: the code; where the repo's documentation disagrees, **[DRIFT]** is noted. What is not verified in code is marked **[inferred]**.
Repo path: `c:\Users\Usuario\Documents\project\repos\playhoot_frontend` (51 commits; HEAD `c508a3b template configurations`).

---

## 1. Stack and layout

### 1.1 Stack (verified in `package.json`, `vite.config.ts`, `eslint.config.js`, `tsconfig.base.json`)

| Aspect | Value |
| --- | --- |
| Monorepo | npm workspaces: `apps/*`, `packages/*`, `packages/features/*`, `fixtures/games/*`. Node >= 22.12, ESM |
| Language | TypeScript ~6.0.3, `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax` |
| UI | React 19.3 + react-dom (only in `apps/web` and `packages/game-react`) |
| Bundler / dev server | Vite 8 + `@vitejs/plugin-react` 6 (`apps/web/vite.config.ts`). Proxy `/v1` (REST + WS) to `PLAYHOOT_BACKEND_URL` or `http://localhost:8081`. Dev plugin `fixtureGames()` serves `/__fixtures/games/*` |
| Router | `react-router` 7.18 (`createBrowserRouter`, `apps/web/src/app/router.tsx`). SPA only in "data router" mode, no loaders/actions |
| State | `zustand` 5 (vanilla `createStore` stores in packages; `useStore` in the UI). No Redux/Query. Global state in `@playhoot/app-core` (`createAppState`) |
| Styles | CSS Modules + global `tokens.css`/`motion.css` (ADR-0003). No Tailwind or third-party component kit |
| i18n | `react-intl` 12 / FormatJS, typed ICU catalogs `es` (source of ids: `en.ts`), `en`, `pt-BR` in `apps/web/src/i18n/messages/`; lint `formatjs/no-literal-string-in-jsx` (ADR-0004) |
| Contract validation | `zod` 4 in `@playhoot/protocol` (schemas for WS messages and HTTP responses) |
| Fonts | `@fontsource-variable/fredoka` (display), `@fontsource-variable/nunito` (body), `@fontsource/roboto` (Google button only) |
| Tests | Vitest 5 (`vitest.config.ts`, includes `apps/**/src/**/*.test.*`, `packages/**/src/**/*.test.*`), 53 `*.test.ts(x)` files. No e2e or browser component tests |
| Lint / formatting | ESLint 10 flat config (+ `typescript-eslint`, `react-hooks`, `formatjs`) with boundary rules between packages; Prettier 3 |
| Game toolchain | `rolldown` 1.2 + `acorn` + `typescript` in `packages/game-tools` |

### 1.2 Apps and packages (who imports whom, from each `package.json`)

| Workspace | Purpose | Depends on (`@playhoot/*` dependencies) |
| --- | --- | --- |
| `apps/web` (`@playhoot/web`) | Web host: React shell, router, presentation, platform adapters (credentials, iframe, cache), design system, sound, telemetry, i18n. Composition root `src/app/services.ts` | app-core, communication, device, protocol, game-host, feature-game-authoring, feature-session-host, feature-session-join, feature-session-play, feature-sign-in |
| `apps/mobile` | NO code exists: only `README.md` ("NOT STARTED") | n/a |
| `packages/protocol` | Contracts: HTTP paths, zod schemas, WS messages (player/admin/preview), Game<->Host bridge (`./bridge`, `./bridge/validation`) | zod |
| `packages/app-core` | Global state: credential, `AuthSnapshot`, access levels (`anonymous<guest<account`), operation catalog, language | zustand |
| `packages/communication` | HTTP/WS clients: `http.ts`, `identityClient`, `gamesClient`, `sessionsClient`, `aiAccessClient`, `telemetryReporter`, `sessionConnection`, `adminConnection`, `previewConnection`, `viewState` | app-core, protocol |
| `packages/device` | `DeviceCapabilities` + capabilities/screen class store | zustand |
| `packages/game-host` | GameHost: loads/verifies artifact, bridge handshake, projections, assets, limits (`bridgeGuard`), viewport | communication, protocol |
| `packages/game-sdk` | API the game sees inside the iframe (`createPlayhoot`), only `@playhoot/protocol/bridge` | protocol |
| `packages/game-core` | Shared game declarations (`defineCommands`, fields, validation, phases, languages, brief) | (none) |
| `packages/game-server` | Server script runtime (`defineGame`, `reject`...) that runs in the backend sandbox | game-core |
| `packages/game-react` | React surface of the game client (`mountGame`, hooks, `Button`/`Choices`/`TextAnswer`, `Scoreboard`...) on top of React Aria | game-core, game-sdk |
| `packages/game-tools` | CLI `build <project>`: source rules, typecheck, server/client bundles, manifest, smoke run | game-core, game-react, game-server |
| `packages/features/sign-in` | Logical guest state, provider login, name | app-core, communication, protocol |
| `packages/features/session-join` | `createJoinSession` (connect -> lobby -> started -> closed, reconnection) | app-core, communication, protocol |
| `packages/features/session-host` | `createHostSession` (creator's admin connection) | app-core, communication, protocol |
| `packages/features/session-play` | `createSessionPlay` (runs the game via GameHost over the Join/Host/Preview "live link") | game-host |
| `packages/features/game-authoring` | `createGameAuthoring`, `createGamePreview`, `createGamePublishing`, `createScenarioRunner`, `createAiLinkSharing`, `createTemplateBrowser`, `createMyGamesList`, `createAiConsent`, `createAiConnectionsList`, `parsePastedChange` | communication, game-core, protocol |
| `fixtures/games/{space-drift,parques}` | Real canvas games (HTML artifacts) built with the SDK; `npm run fixtures` | game-sdk |
| `fixtures/sdk-games/{tap-race,number-guess,pairs,drift,quiz,know-me}` | Full SDK v1 game projects (not workspaces; compiled in tests) | n/a |

Boundaries enforced by lint (`eslint.config.js`): packages do not import apps or `react-dom`/`react-native`/`react-router`; `game-sdk` only `@playhoot/protocol/bridge`, no UI; `game-core`/`game-server` only `game-core` and no React; `game-react` and fixtures only via `game-sdk`.
Note: `packages/features/*` and `game-host` import only `zustand`/`communication`; none imports React (verified by package lint).

### 1.3 Root scripts (`package.json`)

| Script | Does |
| --- | --- |
| `dev` | `vite` of `@playhoot/web` (port 5173, strictPort) |
| `build` | typecheck of `@playhoot/web` + `vite build` |
| `typecheck` | `tsc --noEmit` in all workspaces (`--workspaces --if-present`) |
| `lint` | `eslint .` |
| `format` / `format:check` | `prettier --write .` / `--check .` |
| `test` / `test:watch` | `vitest run` / `vitest` |
| `check` | typecheck + lint + format:check + test + `node scripts/check-assets.mjs` (what AGENTS.md requires before calling something done) |
| `assets` | `scripts/check-assets.mjs`: lists existing/missing assets of the `assets.json` registry and fails if any is not documented in `docs/design/ASSETS.md` |
| `fixtures` | build of the two canvas games (`space-drift`, `parques`) |
| `game` | `node --experimental-strip-types packages/game-tools/src/cli.ts` (CLI `build`) |
| (no script) `scripts/dev-host.mjs` | Dev tool: signs in with the local provider, creates a Session, prints the link, connects as admin and starts on Enter |

---

## 2. Screens and routes

**Path-based navigation with inputs in the URL** (invariant 11: "the URL determines navigation"). Query params used: `next` (return after authenticating, validated by `safeNext`), `code` (host's join code), `game` (gameUUID to create a session), `section` (workspace section), `request` (AI authorization id). Tokens never go in the URL; the one-time login `code` is read and deleted before rendering (`src/captureSignIn.ts`, `platform/signInCompletion.ts`).
URL composition in `apps/web/src/features/paths.ts` (the backend never returns URLs, ADR-0002).

Access: each protected route uses `RequireOperation` (`features/access.tsx`) against the `GET /v1/identity/operations` catalog; if the level is missing it redirects to `/sign-in/guest` (if a guest is enough) or `/sign-in` (if an account is required) with `?next=`. This is UX only; the backend decides.

| Path | Component | Shows | Account needed | Navigates to |
| --- | --- | --- | --- | --- |
| `/` | `<Navigate>` (router.tsx) | Redirect; "no home page yet" | none | `/join` |
| `/join` | `EnterCodeRoute` | Logo + tagline + `CodeInput` (6 chars) + buttons "Create a session", "Create a game", "My games" | none (the 3 buttons use `useNavigateToOperation`) | `/join/:code`; `/sessions/new`; `/games/new`; `/games` (going through sign-in if the level is missing) |
| `/sign-in` | `SignInRoute` | Google button (if the backend offers it), "local account" button (dev only), notice if a guest is active | none (if already an account -> `next` or `/`) | full-page redirect to the provider; `next ?? /` |
| `/sign-in/guest` | `GuestSignInRoute` | Name field ("Let's play!") + link to sign in/sign up | none | `next ?? /`; `/sign-in?next=` |
| `/sign-in/complete` | `SignInCompleteRoute` | Return from the provider: exchanges `code`, shows error if it fails | none | `next ?? /`; `/sign-in` |
| (screen, not route) | `DisplayNameScreen` | `RootLayout` shows it instead of any page while an account has no display name | account without name | (same URL) |
| `/sessions/new` | `CreateSessionRoute` | "Creating..." (animated owl) or error (`game-unavailable`, `active-limit`, other) with retry | account (`CREATE_SESSION`) | `/sessions/:uuid/host?code=` (replace) |
| `/sessions/:sessionUUID/host` (`?code=`) | `HostRoute` | Creator's lobby (code/link, players, min/max limits, Start, "Join to play", Cancel with confirmation); match: watch any participant's game (read-only) or play; end/errors | account (`JOIN_SESSION_AS_ADMIN`) | `/join` (close); embeds `PlayerSession` if the creator plays |
| `/join/:joinCode` and `/sessions/:sessionUUID/play` | `SessionRoute` (parent without path, 2 children) | A single instance keeps the connection: connecting -> lobby (invitation, players with presence) -> game (iframe, seat, player list, leave) -> results | guest or account (`JOIN_SESSION_AS_PLAYER`) | from `/join/:code` to `/sessions/:uuid/play` (replace once the Session is known); `/join` on leave |
| `/games` | `MyGamesRoute` | "My games" list (name, published/visibility, open edition, date) | account (`EDIT_GAME`) | `/games/:id/edit`; `/games/new` |
| `/games/new` | `CreateGameRoute` | Name form + `TemplatePicker` (featured templates, search, inspection) or starter project | account (`CREATE_GAME`) | `/games/:id/edit` (replace) |
| `/games/:gameUUID/edit` (`?section=`) | `GameWorkspaceRoute` | Workspace with 9 sections (see 7) | account (`EDIT_GAME`) | `/sessions/new?game=<uuid>` (from Publish) |
| `/connect-ai` (`?request=`) | `ConnectAiRoute` | OAuth/MCP consent of an AI (name, return host, what it can/cannot do); Allow/Deny | account [inferred: the path has no `RequireOperation`; the route calls an endpoint that requires Bearer] | full navigation to the AI app's URL (`redirect_url`) |
| `/account/ai-connections` | `AiConnectionsRoute` | "Connected AIs": list and revoke (with confirmation) | account [inferred, same as above] | (none) |
| `/design` | `DesignRoute` | Living style guide (tokens, components, screens with fake state, sound board). **`import.meta.env.DEV` only** | none | (none) |
| `/dev/game-host` | `GameHostLabRoute` | GameHost lab: real Space Drift against a local fake Session. **DEV only** | none | (none) |
| `*` | `NotFoundRoute` | 404 with "Go home" | none | `/` |

Global elements (not routes): `AppShell` (top bar: logo -> `/`, language selector, sound button, `AccountButton`), `AccountButton` ("sign in" icon if nobody; menu with initial: guest -> "Sign in"; account -> "My games", "Connected AIs", "Sign out"), `RouteError` (error boundary that reports telemetry).
`RootLayout` rebuilds all pages when the identity changes (`identityKey`, also across tabs via the `storage` event).
Total: 15 production route patterns (including the wildcard `*`: `/`, `/join`, `/sign-in`, `/sign-in/guest`, `/sign-in/complete`, `/sessions/new`, `/sessions/:uuid/host`, `/join/:code`, `/sessions/:uuid/play`, `/games`, `/games/new`, `/games/:id/edit`, `/connect-ai`, `/account/ai-connections`) + 2 dev-only (`/design`, `/dev/game-host`) = 17. There is no home, discovery, profile or game detail.

Graph (summary):
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

## 3. HTTP / WebSocket calls

All go through `packages/communication` (client) with paths/schemas from `packages/protocol`. The UI does not use `fetch`/`WebSocket` directly except: `GameHostLabRoute` (dev, `fetch` of fixtures), `sound/soundPlayer.ts` (`fetch` of local audio), and `game-host` (`artifact.ts`, `assets.ts`: `fetch` of signed storage URLs, without credentials). The instances live in `services.ts` (composition root): `http`, `identity`, `sessionsApi`, `gamesApi`, `aiAccess`, `telemetry`, `sessions`, `admins`, `previews`.

HTTP transport (`http.ts`): automatic Bearer from `app.credentials`, credential renewal in the transport (ADR-0009, single retry after `token_invalid`), `onCredentialRejected -> signOut`, raw bodies and extra headers (`Idempotency-Key`), typed errors in `Result<T,E>` (`result.ts`).

### 3.1 HTTP endpoints (44) -> client function -> screens

| Endpoint | Client function | Screens / features that use it |
| --- | --- | --- |
| `GET /v1/identity/operations` | `IdentityClient.listOperations` | Startup (`startServices.loadOperations`, retry 1-30 s); feeds `RequireOperation` on all protected routes |
| `POST /v1/guests` | `identity.createGuest` | `/sign-in/guest` (`createGuestSignIn`) |
| `POST /v1/identity/refresh` | `identity.refresh` | Transport/app-core (startup, 1 min before expiry, return to tab, `token_invalid`), also after setting the name |
| `POST /v1/identity/logout` | `identity.logout` | Account menu "Sign out" (`app.signOut`) |
| `PUT /v1/identity/me/display-name` | `identity.setDisplayName` | `DisplayNameScreen` (`createDisplayNameSetup`) |
| `GET /v1/identity/login/providers` | `identity.listLoginProviders` | `/sign-in` (`accountSignIn.loadProviders`, retry) |
| `POST /v1/identity/login/start` | `identity.startLogin` | `/sign-in` (PKCE S256; with a guest Bearer it "inherits" the account) |
| `POST /v1/identity/login/complete` | `identity.completeLogin` | `/sign-in/complete` (`replaces_refresh_token` = guest) |
| `POST /v1/sessions` | `SessionsClient.createSession` | `/sessions/new` (direct call from the component, see 4) |
| `POST /v1/client-telemetry` | `telemetryReporter` (batches 30 s / on hide with keepalive) | Join, Session Play, `RouteError` (classified in `src/telemetry/`, ADR-0007) |
| `GET /v1/ai-authorizations/{id}` | `AiAccessClient.readAuthorization` | `/connect-ai` |
| `POST /v1/ai-authorizations/{id}/approve` | `aiAccess.approve` (via `decide`) | `/connect-ai` |
| `POST /v1/ai-authorizations/{id}/deny` | `aiAccess.deny` | `/connect-ai` |
| `GET /v1/ai-connections` | `aiAccess.listConnections` | `/account/ai-connections` |
| `POST /v1/ai-connections/{id}/revoke` | `aiAccess.revokeConnection` | `/account/ai-connections` |
| `GET /v1/games` | `GamesClient.listGames` | `/games` (`createMyGamesList`) |
| `POST /v1/games` | `gamesClient.createGame` | `/games/new` (direct call; supports `template`) |
| `GET /v1/templates` | `browseTemplates` | `TemplatePicker` in `/games/new` and in workspace `history` |
| `GET /v1/templates/search` | `searchTemplates` | same |
| `GET /v1/templates/{id}` | `inspectTemplate` | same |
| `GET /v1/templates/{id}/files` | `readTemplateFiles` | same (inspection) |
| `POST /v1/games/{id}/draft/template` | `useTemplate` | workspace `history` ("Start over from a template") |
| `GET /v1/games/{id}` | `readCard` | workspace (`publish`, and initial load of `createGamePublishing`) |
| `PATCH /v1/games/{id}` | `updateCard` | `publish` (name/description) |
| `PUT /v1/games/{id}/logo` | `uploadLogo` | `publish` |
| `POST /v1/games/{id}/logo/remove` | `removeLogo` | `publish` |
| `POST /v1/games/{id}/photos` | `uploadPhoto` | `publish` (up to 8 photos) |
| `POST /v1/games/{id}/photos/{photoUUID}/remove` | `removePhoto` | `publish` |
| `POST /v1/games/{id}/publish` | `publish` | `publish` (public/private, blockers) |
| `POST /v1/games/{id}/editions` | `openEdition` | `publish` ("Create new version") |
| `GET /v1/games/{id}/draft?content=true` | `readDraft` | whole workspace (load and after each revision) |
| `POST /v1/games/{id}/draft/changes` | `applyChange` | `ai` (apply pasted change), `files` (save file) |
| `POST /v1/games/{id}/draft/restore` | `restoreRevision` | `history` |
| `GET /v1/games/{id}/draft/revisions` | `listRevisions` | `history` (paginated by 100) |
| `GET /v1/games/{id}/draft/diff` | `diffRevisions` | `history` (compare) |
| `PUT /v1/games/{id}/draft/assets/{key}` | `uploadAsset` | `assets` |
| `POST /v1/games/{id}/draft/assets/{key}/remove` | `removeAsset` | `assets` |
| `GET /v1/games/{id}/draft/build?revision=&wait=20` | `readBuild` | `build` / workspace header (long poll) |
| `GET /v1/games/{id}/ai-link` | `readAiLink` | `share` |
| `POST /v1/games/{id}/ai-link` | `createAiLink` | `share` (the link is shown only once, in memory only) |
| `POST /v1/games/{id}/ai-link/revoke` | `revokeAiLink` | `share` |
| `POST /v1/games/{id}/draft/previews` | `createPreview` | `preview` ("Test game") |
| `POST /v1/games/{id}/draft/simulations` | `runSimulation` | `scenarios` (pasted scenario, `{scenario_path}` or `{all:true}`) |
| `GET /v1/games/{id}/draft/simulations/{resultID}/state` | `readSimulationState` | `scenarios` (inspect state) |
| `GET <signed storage URL>` (HTML artifact and assets) | `game-host` `createArtifactLoader` / `createAssetLoader` (no credentials, verify SHA-256) | Session Play, host (watch player), preview |

Note: `GET /v1/identity/me` exists in the contract (`BACKEND_CONTRACT.md`) and there is a `VIEW_OWN_IDENTITY` operation, but **no client calls it** (verified by grep). Endpoints in the contract `.md` not consumed: that one and `GET /v1/identity/login/{provider}/callback` (visited by the browser, provider redirect).

### 3.2 Realtime protocol (WebSocket) — `packages/protocol/src/realtime`, `packages/communication`

| Connection | Path | Client | Who uses it |
| --- | --- | --- | --- |
| Player by code | `/v1/play/join/{joinCode}?device=desktop\|mobile` | `SessionConnector` -> `SessionConnection` (`sessionConnection.ts`) | `/join/:code` |
| Player by Session | `/v1/play/join/sessions/{uuid}/player?device=...` | same | `/sessions/:uuid/play`; reconnection; creator who plays |
| Admin (creator) | `/v1/play/join/sessions/{uuid}/admin` | `AdminConnector` -> `AdminConnection` (`adminConnection.ts`) | `/sessions/:uuid/host` |
| Preview (creator tests their draft) | `/v1/play/previews/{previewUUID}/connect` | `PreviewConnector` -> `PreviewConnection` (`previewConnection.ts`) | workspace `preview` |

- Auth: the token travels as the subprotocol `base64url.bearer.authorization.playhoot.<token>` + subprotocol `playhoot.v1` (browsers cannot set headers on WS).
- Client -> server (player): `sample{sequence,inputs}` (full snapshot, sequence per connection, coalesced to 60/s, <= 32 KiB), `command{token,name,payload}` (idempotent by token, retries `rate_limited` with the same token), `resync`, `leave`, `game_fault{kind,detail}` (game failure report: `artifact_unreachable`, `artifact_hash_mismatch`, `ready_timeout`, `unsupported_bridge_version`, `container_violation`, `bridge_abuse`).
- Server -> player (zod): `rejected`, `lobby_update` (with min/max limits), `roster_update` (presence: active/reconnecting/disconnected/left), `session_started` (UUID, participants, `frontend{url,sha256,viewport,assets}`), `player_view` (FULL/patches/ack), `command_result`, `session_ended`, `lobby_closed`, `leave_result`.
- Admin: `start_session`, `cancel_session`, `select_perspective{participant_id}`, `resync`; responses `*_result{outcome}`, plus `lobby_update`, `session_started` (without the creator's participant), `player_view` of the observed participant, `session_ended`, `rejected`. Admin and player are **always separate connections** even if the creator plays.
- Preview: `act_as`, `sample`, `command`, `resync`, `pause`, `resume`, `end`; server `preview_started`, `acting_as`, `paused`, `resumed`, `error`, `preview_ended{reason}`, and participant views.
- Views: `createViewTracker`/`applyViewPatch` (`viewState.ts`) rebuild state with FULL/patches/ack-only; a gap -> automatic `resync`. Close classification (`unreachable`, `session-ended`, `left`, `replaced`, `disconnected`, `retryable`, `protocol`, `game-data-invalid`). Reconnection in the features (1 s, 2 s, 4 s; 3 attempts; never after `replaced`; during a game the phase stays `started` with `connection: 'reconnecting'`).
- Backend values are never treated as a closed list (`docs/engineering/standards/backend-contract-values.md`).

---

## 4. Layers (UI / state-logic / external calls)

Repo model (ARCHITECTURE.md §4): `Presentation -> Feature State -> Communication ports -> Backend`.

| Layer | Where | Concrete examples |
| --- | --- | --- |
| Presentation (UI) | `apps/web/src/features/<feature>/*.tsx`, `apps/web/src/ui/*` | `session-join/SessionScreen.tsx` receives `state`, `layout`, `actions` via props and does `switch (view.phase)`; `session-play/PlayScreen.tsx` receives everything via props (`layout`, `players`, `game`, `onLeave`) |
| Feature state + logic | `packages/features/*/src/*.ts` (vanilla zustand stores, no React or router) | `session-join/src/joinSession.ts`, `session-host/src/hostSession.ts`, `game-authoring/src/gameAuthoring.ts`, `sign-in/src/guestSignIn.ts` |
| Global state | `packages/app-core` (`createAppState`: auth, language, operations) + `packages/device` | `apps/web/src/app/ServicesContext.tsx` exposes hooks `useAuth`, `useOperationAccess`, `useDeviceCapabilities` |
| External calls | `packages/communication` (+ `protocol`) | `gamesClient.ts`, `identityClient.ts`, `sessionConnection.ts`; built once in `apps/web/src/app/services.ts` |
| Platform adapters | `apps/web/src/platform/*` | `browserCredentialStore.ts` (localStorage `playhoot.credential.v2`), `iframeGameContainer.ts`, `browserArtifactCache.ts` (Cache Storage), `browserDeviceCapabilities.ts` |

How it connects: the route (`*Route.tsx`) creates the feature instance in a `useEffect` (`createJoinSession(...)`, `createGameAuthoring(...)`), stores it with `useState`, destroys it with `dispose()`, and passes `useStore(feature.store)` to a screen. "Leaving a route discards the state" (invariant 12).

Compliance with the requirement "pure UI / one state+logic layer / external calls layer" (objective findings):
- State+logic and calls are separated into packages with boundary lint. The UI does not import `communication` directly except types and constructors from `services.ts`.
- **Verified exceptions** where the UI calls a client without going through feature state: `CreateGameRoute.tsx` (`services.gamesApi.createGame(...)`) and `CreateSessionRoute.tsx` (`services.sessionsApi.createSession(...)`) make the call, manage the idempotency key and `creating/failed` states in `useState`; `SignInRoute.tsx` implements a provider retry with `setTimeout` in the component; `GameWorkspaceRoute.tsx`/`HostGameView.tsx`/`PreviewSection.tsx` build feature instances inside the UI's own hooks (`useGameAuthoring`, `useWatchedPlay`, `usePreviewPlay`).
- Presentation is not 100% "dumb": `SessionScreen.tsx` and `PlayScreen.tsx` play sound (`useSound`), use `setTimeout`, local UI state and `useEffect`; `SessionRoute.tsx` contains navigation logic (replace URL, copy invitation to the clipboard), and `HostRoute.tsx` (561 lines) computes status texts. `outcomeCopy.ts` maps results to message ids (presentation).
- Text rule: feature state does not produce text, it exposes `kind`s (docs/engineering/standards/user-facing-text.md, rule 5).
- There is no dedicated "service/use-case" layer ("No service/use-case layer re-implementing backend logic", ARCHITECTURE.md §4.2). The feature stores call themselves "Feature State".

### Responsive: separate implementations or a single one

Hybrid, decided per route (`features/layout.ts`: `selectLayout` -> `'compact' | 'wide'` according to `orientation === 'landscape' && displayClass !== 'compact'`, via `useLayout()` which reads the `packages/device` store):
- **Separate JSX variants at the route edge** (different render): `EnterCodeRoute.tsx` (`SplitStage` vs `Stage`), `SignInRoute.tsx`, `GuestSignInRoute.tsx`, `DisplayNameScreen.tsx`, `PlayScreen.tsx` (side rail vs top bar; immersive game with `AppShell immersive`).
- **Same structure with different classes depending on `layout`**: lobby (`SessionScreen.tsx`, `HostRoute.tsx`: `lobbyGrid`/`lobbyGridWide`), workspace (`GameWorkspaceRoute.tsx`: `navWide`/`navCompact`, `bodyWide`/`bodyCompact`).
- **A single fluid implementation** for the rest: type `clamp()` tokens, 5 `@media` in total (`AccountButton`, `GameWorkspace`, `Card`, `Logo`, `tokens.css` reduced-motion). Single-message screens (connecting, results) have a single skeleton.
- There are no per-platform separate implementations (`apps/mobile` does not exist). Doc: `docs/design/DESIGN_SYSTEM.md` "Responsive behavior".

---

## 5. Game runtime on the client

- **Loading/embedding** (`packages/game-host/src/gameHost.ts`, `artifact.ts`, `apps/web/src/platform/iframeGameContainer.ts`; ADR-0005/0006): `startGameHost`: `fetch` of the artifact (single self-contained HTML) from a signed URL **without credentials** -> SHA-256 verification -> cache by hash (Cache Storage `playhoot-game-artifacts-v1`) -> container -> `ready` handshake with version negotiation (10 s timeout) -> `start` with context + current projection.
- **Isolation (verified in code)**: `<iframe sandbox="allow-scripts">` with the HTML via `srcdoc`; `<meta>` CSP placed first in the `<head>`: `default-src 'none'; script-src 'unsafe-inline' blob:; style-src 'unsafe-inline' blob:; img/media/font-src blob: data:; connect-src 'none'; base-uri 'none'; form-action 'none'`. Nested frames and declarative shadow roots are removed from the HTML and a guard script is injected (deletes WebRTC, `parseHTMLUnsafe`, watches with `MutationObserver` and stops the game if it inserts a frame). The host page declares `frame-src 'none'` (`index.html`). Messages are only accepted from that iframe. The iframe always has the game's logical size and is scaled and centered with bars (`fitGameViewport`, never stretched).
- **Bridge** (`packages/protocol/src/bridge`, versions 1 and 2): `postMessage` messages with the `playhoot.bridge` mark. Game -> Host: `ready`, `sample`, `command`, `request_asset`. Host -> game: `start`, `presentation` (v2: scale, on-screen size, safe area, density, pointer, preferences), `update` (full projection/events/errors/translated ack), `command_result`, `asset`, `incompatible`. Tokens, connection sequences and the real WS **never reach the game**. Zod validation of each game message in the Host, limits per type and total (`bridgeGuard.ts`; a game outside limits for 5 s in a row is stopped as `bridge-abuse`), every failure is reported to the backend as `game_fault`.
- **Assets** (ADR-0008, `assets.ts`): only keys that the backend listed in `frontend.assets`; download without credentials, verifies size and SHA-256, cache by hash (`playhoot-game-assets-v1`), bytes transferred to the game (blob URLs).
- **Game client SDK**:
  - `packages/game-sdk`: `createPlayhoot()` with `ready`, `onProjection`, `onEvent`, `onError`, `onUpdate`, `sample`, `command`, `assets`/`load`/`preload`, `presentation()`/`onPresentation()` (v2); transport chosen at runtime: `window.parent` or React Native WebView channel (`webViewTransport`) — prepared for mobile, with no mobile app.
  - `packages/game-react`: `mountGame`, `useView`, `useCommand`, `useInputs`, `useAsset`, `usePhase`, `usePlayer`, `useGameEvent`, `useGameError`, `usePresentation`, `useText`/`defineTexts`/`useLanguage`; components `Screen`, `Stack`, `Grid`, `Panel`, `Text`, `Button`, `Choices`, `TextAnswer`, `Countdown`, `Scoreboard`, `AssetImage` (React Aria 3.53.1).
  - `packages/game-core` + `game-server`: server/shared side (`defineCommands`, `defineInputs`, `defineGame`, declarative phases, `addPoints`/`ranking`, field validation with vectors shared with the backend `packages/game-core/src/testdata/field-vectors.json`). `sdkVersion = '1.0.0'`.
  - `packages/game-tools`: `npm run game -- build <project>` (source rules profile `sdk-v1`, typecheck, rolldown -> `server.js` + `client.html`, `manifest.json`, `build.json`).
- **SDK guide for AI agents**: `apps/web/public/docs/sdk/v1/*.md` (21 files, ~1100 lines): `index`, `capabilities`, `project`, `server`, `client`, `ui`, `phases`, `config`, `templates`, `policies`, `assets`, `brief`, `building`, `changes`, `scenarios` + `examples/{drift,know-me,number-guess,pairs,quiz,tap-race}.md`. Served statically at `/docs/sdk/v1/*.md`; `packages/game-tools/src/guide.test.ts` keeps it aligned with the SDK. Requires production to serve it without SPA fallback (repo note).
- **Commands/samples/projections**: the Host owns the SAMPLE sequence, the idempotent COMMAND tokens, the view revision/baseline and the resync; the game only sees `projection`, `events`, `errors`, `ack` translated to its own ids and reduced results (`executed`/`rejected`/`unavailable`).
- **Replay**: a replay player **does not exist** (neither in `communication` nor in `game-host`; the plan places it as step 12, outside the project).
- **Other uses of the same GameHost**: host spectator view (`HostGameView.tsx`, read-only), creator preview (`PreviewSection.tsx`, one GameHost run per synthetic participant), dev lab.

---

## 6. Design system

- **Where it is defined**: `apps/web/src/ui/tokens.css` (palette, semantics, type, shape, spacing, shadows, durations, easing, per-seat colors `--player-1..8`, owl colors), `ui/motion.css` (motion vocabulary), components in `apps/web/src/ui/`, doc `docs/design/DESIGN_SYSTEM.md` (accepted 2026-10-20), ADR-0003 (CSS Modules + tokens). Rule: no color/duration/shadow value inside a component; derived values with `color-mix`.
- **Theme**: dark only (`color-scheme: dark`), "game night": indigo background `#141134`, surface `#211c52`, primary action amber `#ffc53d`, coral accent `#ff6f91`, mint success `#4ee0a6`, red danger `#ff6b6b`; 8 player colors (amber, coral, mint, sky, violet, lime, orange, teal). There is no light theme (open question in the doc).
- **Typography**: Fredoka (display/titles) and Nunito (body), self-hosted via `@fontsource-variable`; Roboto only for the Google button. Sizes as tokens with `clamp()`.
- **Shape**: radii 10/16/24/32/pill; base spacing 4 px; "pressure edge" `--edge: 4px` under buttons/tiles/avatars (game-piece look); cards radius 32 with a subtle gradient `linear-gradient(180deg, sheen, transparent 40%)`.
- **Own components** (12): `AppShell` (+`Stage`, `SplitStage`), `Avatar`, `Button` (primary/secondary/danger/ghost, md/lg, block, loading, prop `sound`), `Card`, `CodeInput`, `CodeTiles`, `Confetti`, `Logo` (wordmark "play**hoot**"), `Owl` (Hoot mascot with moods happy/sleepy/surprised, blinking, hop/shake), `Starfield` (fixed stars with twinkle), `TextField`. Plus `AccountButton`, `LanguagePicker`, `SoundToggle`, `Notice`. There is no third-party component library in the host (only React Aria inside the game SDK).
- **Icons**: loose inline SVGs (e.g. `PersonIcon` in `AccountButton.tsx`); no icon library. **Emoji: 0 occurrences** in `apps/web/src` (grep). Gradients: 7 CSS uses, all subtle (card sheen, sky background with 2 radials in `tokens.css`, row highlight).
- **Animation**: pure CSS, 19 `@keyframes`; global classes `motion-rise/pop/fade/bump/hop/shake/cascade` (each `Stage` enters in cascade); respects `prefers-reduced-motion`. No animation library.
- **Sound**: Web Audio player (`src/sound/`), mute persisted in localStorage, placeholder tones if the file is missing, looping lobby music.
- **Brand assets**: registry `src/assets/assets.json` (19 assets); only `favicon.svg`, `assets/brand/google-g.svg` and `site.webmanifest` exist in `public/`. **Missing** (per `docs/design/ASSETS.md`, 17 MISSING): PWA icons 192/512/maskable/apple-touch, `og-share.png`, all sounds/music.
- **Current look summary (objective)**: dark night page with stars and two radial glows; dark cards with rounded borders centered in a column (480 px, or 960 px "wide"); a single amber button as the primary action; vector owl as mascot/loading indicator; letter tiles for the code; rounded text. No catalog card grids (there is no catalog), no emoji, no default kit.
- Living guide in dev: `/design`.

---

## 7. Game creation / authoring UI

Route `/games/new` + `/games/:gameUUID/edit?section=` (`apps/web/src/features/game-authoring/`, state in `packages/features/game-authoring`). The creator **does not write code in the web app with an integrated AI**: they work with their own external AI (Claude, ChatGPT...) that reads a link/MCP and proposes changes; the web app shows, applies and tests.

| Section (`?section=`) | Component | Function |
| --- | --- | --- |
| `ai` ("My AI's changes", default) | `AiChangesSection` + `BriefSummary` | Paste the change JSON (`playhoot.project-change.v1`, strict parsing `parsePastedChange`, added/modified/deleted summary), `Apply change`; shows the brief (`brief.json`: agreed game and phase) |
| `files` | `FilesSection` | View/edit a file, save as a new revision |
| `assets` ("Resources") | `AssetsSection` | Declare/upload/replace/remove image, audio, video; shows state, size, dimensions/duration (uncommitted work) |
| `build` ("Build") | `BuildSection`, `BuildStatusBadge`, `DiagnosticList` | Build state of the current revision (long poll), diagnostics per line |
| `preview` ("Test game") | `PreviewSection` | Private match of the current build with N synthetic participants, play as each one, pause/resume/restart/end, note if the draft advanced |
| `scenarios` ("Scenarios") | `ScenariosSection` | Paste scenario (`playhoot.scenario.v1`), run the current/saved/all, summary + copyable full JSON, inspect state |
| `history` ("History") | `HistorySection` + `TemplatePicker` | Revisions (paginated), compare (diff), restore, "start from a template" |
| `share` ("Share with my AI") | `ShareSection` | Create/renew/revoke the link for the AI; copyable message and link (shown only once, in memory) |
| `publish` ("Card and publishing") | `PublishSection` | Card (name, description, logo, up to 8 photos), publish current revision as public/private with blockers, new version/edition, create a session of the game |

Other creation/account screens: `CreateGameRoute` (name + `TemplatePicker` with featured templates/categories/search/inspection; if the catalog is empty only the starter project is offered), `MyGamesRoute`, `ConnectAiRoute` (OAuth/MCP consent), `AiConnectionsRoute`.
A published game without an open edition opens in `publish` and the draft sections explain how to open an edition (`PublishedNotice`).
Pending in the CHECKLIST (`docs/projects/active/game-creation-web-v1/CHECKLIST.md`): quiz/know-me as templates (waiting for backend step 2), stable codes in diagnostics and build log, built-in sound/icon library (V). **[DRIFT]** `CURRENT_STATE.md` does not mention `TemplatePicker`, templates, `brief`, diff or "Scenarios with expectations"; they are in code and in the CHECKLIST.
**There is no**: integrated AI chat, visual editor, own assistant, automatic captures (declared out of scope in `PROJECT.md`).

---

## 8. Documentation and process artifacts

### 8.1 `docs/` tree
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
(The root `docs/` of the parent repo `repos/docs` is something else: product plans 04/06/07/08, cited by `PROJECT.md` as `../docs/...`.)

### 8.2 What each document contains
- `AGENTS.md` (+ `CLAUDE.md` = `@AGENTS.md`): agent bootstrap: determine the execution surface (Conversational AI / Codebase Agent / Independent Reviewer), read `docs/ai/OPERATING_MODEL.md`, route context with `docs/ai/KNOWLEDGE_MAP.md` (do not scan all the Markdown), use `CONVERSATIONAL_ORCHESTRATOR.md` for natural requests, processes/protocols in `docs/ai/`, verify against code and report contradictions as **drift**, do not treat ideas/TODOs as decisions, escalate material decisions. Sections: two repos (the backend is the authority for business and contracts), project state, standards, Logic Mirror, **Assets** ("build as if every asset existed": register in `assets.json`, use by id, placeholder, document in `ASSETS.md`), Commands (`npm run check` before reporting done), temporary `HUMAN_REVIEW.md`/`AI_CONTEXT.md`.
- `ARCHITECTURE.md` (CANONICAL): 15 invariants (§20): backend authority; trusted Host / untrusted game; same web and mobile artifact; the game never receives tokens or the WS; versioned and validated bridge; responsive platform with game in a fixed-aspect viewport (letterbox); **adaptive presentation with separate variants chosen at the edge, not scattered conditionals**; presentation / feature / global state are distinct; Feature State knows semantic operations, not transports; URL determines navigation and the feature is rebuilt from URL + backend; leaving a route discards state; device awareness only in presentation/adapters; frontend visibility does not replace authorization; initial goal = Join+Play slice. Repo layout, placement rules (feature package = state/ports; presentation in each app), layers per feature, navigation (URL table, `/` only redirects), GameHost/bridge, errors/observability, "Deliberately open".
- `CURRENT_STATE.md`: table "Area | State | Notes" of what is implemented + "Placeholders left" + "Identity Phase 2 (planned)". **[DRIFT]** header says `Last updated: 2026-10-20` but contains entries up to 2026-11-03; says "261 tests in 32 files" (there are 53 files / 494 tests); does not cover templates/brief/scenarios with expectations or the uncommitted changes; the Google button is described as "disabled for now" in `docs/logic/README.md` but the code enables it if the backend offers it.
- `README.md` (root): short description, commands, links.
- `docs/architecture/BACKEND_CONTRACT.md`: reference snapshot of the HTTP/WS contract that the backend implements (gaps G1-G9, endpoints, WS, limits). "The backend code wins."
- `docs/logic/` (**Logic Mirror**): documentation designed for the human who does not read TypeScript. `FLOWS.md` (18 step-by-step flows with state and external-call tables) and `mirror/*.go` (**pseudocode with Go syntax that does not compile**): `routes.go` (each URL -> view), `view_*.go` (one per screen, with events and `// -> X` comments, `// code: route#symbol`), `state_*.go` (what each event does to the state), `external.go` (each backend call as a bare function: `// endpoint: ...`, `// answer: ...`, `// code: packages/communication/...`). It is walked as a call trace from `routes.go`. Rule: **any change to an external call, state shape, transition, screen event or navigation updates that folder in the same change**; each new control adds a row in "Where is each button?"; if the mirror disagrees with the code it is a bug (the code rules). `external.go` is modified uncommitted (3 lines, assets width/height/duration).
- `docs/projects/**`: a Project groups WORK; `PROJECT.md` (dashboard), optional `CHECKLIST.md`, `works/WORK-NNNN-*.md`, `internal/AI_CONTEXT.md` (resumable context, not canonical). Active: `game-creation-web-v1` (checklist with 35 items done and 3 open). Completed: `session-play-v1` (join+play slice, 2026-11-01), `identity-web-v1` (6 WORK: credential, real guest, local login, Google, close, authentication levels). The game-creation `PROJECT.md` declares a **realignment 2026-11-05**: the flow must comply with `../docs/08_Playhoot_Checklist_Flujo_de_Creacion.md`, which wins over the plan and previous decisions.
- `docs/work/**`: WORK lifecycle (spec -> READY -> IMPLEMENTING -> review -> close); no active standalone WORK. `docs/decisions/**`: ADR-0001..0009 all ACCEPTED (next ADR-0010). `docs/engineering/**`: NON-authoritative Radar and 2 accepted standards (backend values; user-facing text/languages). `docs/design/**`: design system and asset registry.

### 8.3 Rules currently given to an agent working here (summary)
1. Read AGENTS.md -> OPERATING_MODEL -> KNOWLEDGE_MAP; load only the relevant context; use the Orchestrator (look for an open Project/WORK before creating anything).
2. Code and tests are the authority on what is implemented; doc/code contradictions = report as drift; do not resolve silently.
3. Human decides; escalate material decisions (product, architecture, security, contract, dependencies, standards); do not invent standards from patterns.
4. Backend = authority on business and contracts; backend changes only under the human's direction and with the backend's `AGENTS.md`.
5. Architecture: invariants 1-15 of `ARCHITECTURE.md`; package boundary enforced by lint; adaptive presentation by variants at the edge.
6. i18n: no literal text in JSX/props (lint), es/en/pt-BR catalogs with parity (test), full ICU sentences, feature state does not produce text, never show the backend `message`.
7. Backend values: never closed lists; general default; schema accepts strings where the list can grow.
8. Styles: tokens only, ADR-0003; assets: register/use by id/document; `npm run check` must pass.
9. **Logic Mirror**: update `docs/logic/**` in the same change that touches calls/state/navigation.
10. Keep `AI_CONTEXT.md` of active projects up to date at checkpoints; do not overwrite design authority of active workspaces/projects; `HUMAN_REVIEW.md` as the review surface.
11. Run `npm run check` before reporting work as done.
(The user's memory additionally indicates a "chat first; docs are my own memory, never gates" workflow that is NOT in this repo; it is external instruction.)

---

## 9. Concept coverage

| Concept | State | Detail |
| --- | --- | --- |
| Game discovery / search | **absent** (for players) / partial for creators | There is no home, catalog or game search. There is **template** search/filter when creating (`TemplatePicker`, `GET /v1/templates[/search]`). `/` only redirects to `/join` |
| Game detail page | **absent** (player side) / partial | Only the creator's "Card and publishing" (`PublishSection`: name, description, logo, photos); there is no public view of a card |
| Join by code/link | **exists** | `/join` (+`CodeInput`), `/join/:joinCode`, `/sessions/:uuid/play`; copy invitation link in the lobby |
| Lobby | **exists** | `SessionScreen`/`HostRoute` (players with presence, min/max limits, invitation, music) |
| In-session game | **exists** | GameHost in sandbox iframe, reconnection, overlays, rail/bar, rotation hint |
| Host admin view (change perspective, kick) | **partial** | Exists: start, cancel, also play, watch any participant's game read-only (`select_perspective`). **No kick exists** (grep with no results) |
| Session history + replay | **absent** | No screens or clients; replay outside the project (plan step 12) |
| Profile | **absent** | Only `DisplayNameScreen` (set initial name); "Identity Phase 2" (account screen, change name, active sessions) planned, not built |
| Guest account + upgrade | **exists** | `/sign-in/guest` (`POST /v1/guests`); upgrade: `login/start` with guest Bearer + `login/complete` with `replaces_refresh_token` (the guest becomes the account, same identity) |
| Login / sign-up (Google) | **exists** (Google "built", not verified against real Google) | `/sign-in` with Google (if the backend offers it) and fake local provider in dev; PKCE S256; `CURRENT_STATE` says real verification is deferred |
| My games | **exists** | `/games` (list: name, published, visibility, edition) |
| Game creation: external AI link | **exists** | `share` (`ai-link` link), `ai` (paste changes), MCP: consent `/connect-ai` and `/account/ai-connections` |
| Game creation: integrated AI chat | **absent** | Declared out of scope ("Playhoot's own AI agent") |
| Version management | **partial** | Draft revisions (list, diff, restore), publish revision, "new version" (`openEdition`); there is no UI for multiple published versions/rollback between published versions [inferred: there is no endpoint for it] |
| Reports / cases | **absent** | Only automatic `game_fault` reports (WS) and telemetry; no report UI |
| Notifications (bell/inbox) | **absent** | No code |
| Plans / subscription / purchases | **absent** | No code or operations |
| Teacher mode (classes, students, materials, activities, grades) | **absent** | No code; `PROJECT.md` declares it a "teacher product layer" out of scope |
| Student mode | **absent** | No code |
| Admin dashboard | **absent** | No code (`/design` and `/dev/*` are development only) |
| PWA (manifest/service worker) | **partial** | `public/site.webmanifest` (standalone, colors, 3 referenced icons) and `<link rel=manifest>`; **the PNG icons do not exist** (MISSING in ASSETS.md); **there is no service worker** (grep `serviceWorker` with no results); Cache Storage only for game artifacts and assets |
| SEO (SSR/prerender/meta) | **absent / minimal** | Pure Vite SPA; only static metas in `apps/web/index.html` (description, theme-color, og:*, twitter:card); `og-share.png` does not exist; no SSR, prerender or per-route meta (fixed `<title>` "Playhoot"). `<html lang>` is synced with the language |
| Mobile app | **absent** (half-prepared) | `apps/mobile/README.md` only; the SDK already chooses the React Native WebView transport and `ARCHITECTURE.md` describes it (React Native + Expo + `NativeGameHost`), with no code |

---

## 10. Health check

### 10.1 `git status --short` (11 modified files, 0 untracked)
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
Characterization of the work in progress (5 lines):
1. A single coherent change (+57/-3 lines, `git diff --stat`): "S2. Asset measurements and agent uploads" (backend S, 2026-11-07).
2. Protocol/client: `DraftAsset` gains nullable `width`, `height`, `durationMs` (`duration_ms`) (`packages/protocol/src/http/games.ts`, `gamesClient.ts` + test).
3. UI: `AssetsSection.tsx` shows "W x H px" or seconds next to the asset state; 2 new i18n keys in es/en/pt-BR.
4. SDK guide `assets.md`: an agent does not pass files through its context; it requests a single-use upload URL (`request_asset_upload` MCP or `POST <link>/assets/<key>/upload-url`) and does a PUT; `upload_asset` base64 only up to 256 KiB.
5. Docs synced in the same change: `BACKEND_CONTRACT.md`, `docs/logic/mirror/external.go` and CHECKLIST item S2 (consistent with the Logic Mirror rule).

### 10.2 Checks run (no dev servers)
| Command | Result |
| --- | --- |
| `npm run typecheck` (all workspaces) | **PASS** (exit 0, no errors) |
| `npm run lint` (`eslint .`) | **PASS** (exit 0, no warnings) |
| `npx vitest run` (does not require backend) | **PASS**: 53 files, 494 tests, 32 s |
| `format:check`, `assets`, `build` | not run (outside what was asked) |

**[DRIFT]** `CURRENT_STATE.md` claims 32 files / 261 tests; the reality is 53 / 494.

---

## Final verification notes
- Checked against code: routes (`router.tsx`), HTTP/WS clients (`communication`, `protocol`), layers (cited files), iframe container, CSS tokens, absence of concepts (grep of kick/replay/notification/teacher/student/grade/serviceWorker/prerender with no results in `apps` and `packages` code).
- Not run: dev server startup, e2e against backend, browser. The endpoint count (44) comes from counting functions of `gamesClient` (29), `identityClient` (8), `aiAccessClient` (5), `sessionsClient` (1), `telemetryReporter` (1).
- [inferred]: account level required by `/connect-ai` and `/account/ai-connections` (no `RequireOperation` on those routes); that there is no endpoint for multiple published versions (it does not appear in `protocol`).
