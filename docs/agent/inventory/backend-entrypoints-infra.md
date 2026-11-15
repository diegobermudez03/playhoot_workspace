# `playhoot` backend inventory — entry points, wiring, infrastructure, conventions and process

Inventory date: 2026-11-15. Repo: `c:\Users\Usuario\Documents\project\repos\playhoot` (branch `main`, Go module `github.com/diegobermudez03/playhoot`, Go 1.25.0).
Scope: entry points, wiring, infra, conventions and process artifacts. Domain internals (identity, game, play) are covered by another inventory.
Legend: **[V]** verified by reading code/running; **[I]** inferred. When docs and code disagree, the code is reported and the discrepancy is noted (section 9).

---

## 0. Quantitative summary

| Item | Count |
|---|---|
| Declared REST routes (`METHOD /path` patterns) | 80 (52 games, 11 identity, 12 oauth, 3 mcp, 1 clienttelemetry, 1 play) [V] |
| WebSocket routes | 4 (all in `api/play`) [V] |
| `OPTIONS` preflights | auto-generated, 1 per unique REST path (`api/server.go: preflightRoutes`) [V] |
| MCP tools | 22 [V] |
| Runtime environment variables (main + gcs.go) | 31 (8 required) [V] |
| Test-only variables | 10 (`TEST_DATABASE_*` x7, `GCS_TEST_*` x2, `GAME_TOOLCHAIN_TEST_DIR`) [V] |
| gormigrate migrations | 22 (game 4, play/session 10, identity 8) [V] |
| Metric declarations (`metrics.New*`) | 136 in non-test code [V] |
| Non-test / test / generated mock Go files | 386 / 347 / 85 (`*_mock_test.go`) [V] |
| Docs under `docs/` | 205 files (122 in `docs/archive/`, 83 current); 126 `.md` in the repo outside the archive [V] |
| Current ADRs | 3 global + 1 GAME + 3 IDENTITY + 8 SESSION (0028–0035) + 1 PDR [V] |
| `go build ./...` / `go vet ./...` | PASS / PASS [V] |
| `go test ./...` | 110 packages `ok`, 0 failures; DB-backed repo tests SKIP without `TEST_DATABASE_*` [V] |

---

## 1. HTTP API (`api/`)

### 1.1 Composition (`api/server.go`) [V]

- `api.NewServer(...)` receives ~15 dependencies (all narrow interfaces declared in `api/`), creates an `http.ServeMux` and registers **6 route groups** in this order: `identity`, `clienttelemetry`, `play`, `games`, `oauth`, `mcp`.
- Each group implements `RESTRoutes()` and `WebSocketRoutes()` returning `[]routing.Route{Pattern, Handler, Authorization, Limits, RefuseLimit, Middlewares}` (`api/internal/routing/route.go`). Handlers do not touch the mux or call `logging.Start`.
- Middleware chain per REST route (`chain`, the first is the outermost): `restObservability` (log + metrics) → `cors.Responses` → `route.Authorization` → `throttle.Requests` → `route.Middlewares` → handler. WS: `wsObservability` → `Authorization` → `throttle` → middlewares (owner/joinCode) → handler.
- All JSON errors use `httpx.ErrorResponse{code?, message}`.
- Metric families by route prefix (to stay under 1000 series/metric): `/.well-known/ /oauth/ /mcp /ai/` → `api_ai_*`; `/v1/games/{gameUUID}/draft*`, `/v1/templates*`, `/v1/asset-uploads/` → `api_authoring_*`; the rest → `api_http_*`; preflights → `api_http_preflight*`; WS handshakes → their own metrics (`api/metrics.go`).

### 1.2 Authentication levels (catalog `identity/internal/business/operationlevel`) [V]

| Operation (`identity.Operation`) | Minimum level |
|---|---|
| `CREATE_SESSION`, `JOIN_SESSION_AS_ADMIN`, `CREATE_GAME`, `EDIT_GAME`, `CONNECT_AI` | account (real account) |
| `JOIN_SESSION_AS_PLAYER`, `REPORT_CLIENT_TELEMETRY`, `VIEW_OWN_IDENTITY`, `SET_OWN_DISPLAY_NAME` | guest |

`auth.Require(authorizer, op)` extracts `Authorization: Bearer <JWT HS256 15 min>`, calls `identity.Authorize(token, op)` (does not read the DB; the token carries `UserUUID`, level and display name) and leaves the `identity.User` in the context. `auth.Optional` lets requests through without a token but rejects an invalid token. `auth.RequireWebSocket` also accepts the token as the subprotocol `base64url.bearer.authorization.playhoot.<b64url(token)>`.
Responses: 401 `token_required|token_malformed|token_invalid` (+`WWW-Authenticate: Bearer`), 403 `operation_forbidden`.

### 1.3 Routes — identity (`api/identity/`, 11 routes) [V]

| Route | Handler | Auth | Calls |
|---|---|---|---|
| `POST /v1/guests` | `create_guest.go` | none; extra limit 200/h per IP | `createguest.CreateGuest(displayName, idempotencyKey)` |
| `GET /v1/identity/operations` | `list_operations.go` | none | `listoperations.ListOperations` |
| `POST /v1/identity/refresh` | `refresh.go` | none (refresh token in body) | `refreshcredentials.Refresh` |
| `POST /v1/identity/logout` | `logout.go` | none (refresh token) | `endsession.EndSession` |
| `POST /v1/identity/login/start` | `login.go` | `Optional(VIEW_OWN_IDENTITY)` (optional guest to link) | `accountlogin.StartLogin(provider, codeChallenge, guestUserUUID)` |
| `GET /v1/identity/login/{provider}/callback` | `login.go` | none (redirects the browser to `WEB_SIGN_IN_COMPLETE_URL`) | `accountlogin.HandleCallback` |
| `POST /v1/identity/login/complete` | `login.go` | none (code + PKCE verifier) | `accountlogin.CompleteLogin` |
| `GET /v1/identity/login/providers` | `login.go` | none | `loginproviders.Enabled` |
| `GET /v1/identity/login/local/authorize` | `login.go` | none; only responds if the local provider is enabled | `loginproviders.LocalAuthorizePage` |
| `GET /v1/identity/me` | `me.go` | `Require(VIEW_OWN_IDENTITY)` (guest) | does not call the domain: returns the `User` from the context |
| `PUT /v1/identity/me/display-name` | `display_name.go` | `Require(SET_OWN_DISPLAY_NAME)` (guest) | `setdisplayname.SetDisplayName` |

### 1.4 Routes — play / sessions (`api/play/`) [V]

| Route | Type | Auth | Calls |
|---|---|---|---|
| `POST /v1/sessions` (`create_session.go`) | REST | `Require(CREATE_SESSION)` account | `orchestrator/playlifecycle.Manager.CreateSession` → `game checkplayability` + `play/session sessionlifecycle.CreateSession` (idempotent by `idempotency_key`; 409 `active_session_limit`) |
| `GET /v1/play/join/sessions/{sessionUUID}/admin` (`admin_join.go`) | WS | `RequireWebSocket(JOIN_SESSION_AS_ADMIN)` account + `requireOwner` | `runtime.AttachAdmin(sessionUUID, userUUID, ownerEpoch)` (`liveconnection.Controller`) |
| `GET /v1/play/join/sessions/{sessionUUID}/player` (`player_join.go`) | WS | `RequireWebSocket(JOIN_SESSION_AS_PLAYER)` guest + `requireOwner` | `runtime.AttachPlayer(sessionUUID, player, ownerEpoch)`; query `?device=desktop|mobile` |
| `GET /v1/play/join/{joinCode}` | WS | same as player | `resolvejoincode.ResolveJoinCode` → `requireOwner` → `AttachPlayer` |
| `GET /v1/play/previews/{previewUUID}/connect` (`preview_connect.go`) | WS | `RequireWebSocket(EDIT_GAME)` account | `previews.AttachPreview(previewUUID, ownerUUID)` (this instance only; no owner routing) |

`requireOwner` → `ownership.LocateOrClaimOwner(sessionUUID)` (`play/runtime/usecases/ownership`); today the epoch is the constant `singleInstanceEpoch = 1` and the `OwnerElsewhere` case returns 503 "forwarding not implemented" (single-instance) [V].

### 1.5 Routes — games / authoring (`api/games/`, 52 routes = 32 `/v1` + 20 `/ai/v1`) [V]

Auth `edit` = `Require(EDIT_GAME)` account; `create` = `Require(CREATE_GAME)` account. Game ownership is decided by Game Management (`FindEditableVersion`), not Identity.

**Authenticated web/API (`/v1`)**

| Route(s) | Auth | Calls |
|---|---|---|
| `POST /v1/games` | create | `orchestrator/gameauthoring.CreateGame(user, name, idemKey, templateGameUUID)` (game `gamelifecycle` + play `versiondrafting`) |
| `GET /v1/games` | edit | `gamecard.ListGames` |
| `GET\|PATCH /v1/games/{g}` | edit | `gamecard.ReadCard` / `UpdateCard` |
| `PUT /v1/games/{g}/logo`, `POST …/logo/remove`, `POST …/photos`, `POST …/photos/{id}/remove` | edit | `gamecard.UploadImage/RemoveImage` (bytes go through the backend) |
| `POST /v1/games/{g}/publish`, `POST …/editions` | edit | `orchestrator/gameauthoring.Publish` / `OpenEdition` |
| `GET …/draft` | edit | composer `ReadDraft` (after `EnsureDraft` if missing in Play) |
| `POST …/draft/changes`, `POST …/draft/restore`, `POST …/draft/template` | edit | orchestrator `ApplyDraftChanges`, `RestoreDraftRevision`, `UseTemplate` |
| `GET …/draft/revisions`, `…/changed`, `…/diff`, `…/files`, `…/build` | edit | composer `ListDraftRevisions`, `ReadDraftChanges`, `ReadDraftDiff`, `ReadDraft(withContent)`, `ReadDraftBuild(wait≤20 s)` |
| `POST …/draft/simulations`, `GET …/draft/simulations/{id}/state` | edit | composer `SimulateDraft`/`SimulateSavedScenarios`, `ReadSimulationState` (sandbox + `keepsimulationresults`) |
| `POST …/draft/previews` | edit | orchestrator `StartPreview` |
| `PUT …/draft/assets/{key}`, `POST …/draft/assets/{key}/remove` | edit | orchestrator `UploadDraftAsset`/`RemoveDraftAsset` |
| `GET /v1/templates`, `/v1/templates/search`, `/v1/templates/{id}`, `/v1/templates/{id}/files` | create | composer `BrowseTemplates/SearchTemplates/InspectTemplate/ReadTemplateFiles` (`discovery/templatecatalog` + `game/findtemplate`) |
| `POST\|GET /v1/games/{g}/ai-link`, `POST …/ai-link/revoke` | edit | orchestrator `CreateAILink`/`RevokeAILink`; composer `AILinkStatus` (Identity `resourcelinks`) |
| `PUT /v1/asset-uploads/{token}` | single-use token (grant `phg_`), per-client limit 10/s,120/min | `resourcegrants.ClaimResourceGrant` → `UploadDraftAsset` (new route, **uncommitted**) |

**Link for external AIs (`/ai/v1/{token}/…`)** — auth `aiLinkAccess`: resolves the path token with `identity.ResolveResourceLink` (token `phl_`, 7 days, one live link per game, only the SHA-256 is stored); acts as the owner, account level, `origin=api`, only on that game; headers `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex`; 401 `ai_link_invalid`; limit 20/s and 300/min per owner. Mirror of the `/v1` routes:

| Route | Equivalent to |
|---|---|
| `GET /ai/v1/{token}` | context page: **Markdown** by default (inline sources if <150 KiB) or `?format=json` (`playhoot.ai-context.v1`, no source contents) |
| `GET /ai/v1/{token}/files/{path...}`, `GET …/files` | file read(s) |
| `GET …/changed`, `…/diff`, `…/revisions`, `…/build` | draft reads |
| `GET …/sdk/{page...}` | SDK guide page (`readsdkguide`, `text/markdown`) |
| `POST …/changes`, `POST …/restore`, `POST …/template` | draft writes |
| `GET …/templates`, `…/templates/search`, `…/templates/{id}`, `…/templates/{id}/files` | template catalog |
| `POST …/simulations`, `GET …/simulations/{id}/state` | simulation |
| `PUT …/assets/{key}`, `POST …/assets/{key}/remove` | assets |
| `POST …/assets/{key}/upload-url` | `resourcegrants.CreateResourceGrant` → single-use URL `PUT /v1/asset-uploads/{token}` (15 min, max 20 live per user; **new, uncommitted**) |

`/ai` has no routes to create a game, publish, previews or list games (those exist only in authenticated REST/MCP) [V].

### 1.6 Routes — OAuth for AI (`api/oauth/`, 12 routes) and MCP [V]

| Route | Auth | Calls (`identity/usecases/aiauthorization`) |
|---|---|---|
| `GET /.well-known/oauth-protected-resource` and `…/mcp` | none | RFC 9728 metadata |
| `GET /.well-known/oauth-authorization-server` | none | RFC 8414 metadata |
| `POST /oauth/register` | none; 5/min and 30/h per IP | `RegisterClient` (DCR RFC 7591, public clients only) |
| `GET /oauth/authorize` | none | `StartAuthorization` → redirects to `<PUBLIC_WEB_BASE_URL>/connect-ai?request=<id>` |
| `POST /oauth/token` | none | `ExchangeToken` (authorization_code+PKCE S256, refresh_token) |
| `POST /oauth/revoke` | none | `Revoke` (RFC 7009) |
| `GET /v1/ai-authorizations/{requestID}`, `POST …/approve`, `POST …/deny` | `Require(CONNECT_AI)` account | `ReadAuthorization`, `DecideAuthorization` |
| `GET /v1/ai-connections`, `POST /v1/ai-connections/{id}/revoke` | `Require(CONNECT_AI)` | `ListConnections`, `RevokeConnection` |

Others: `POST /v1/client-telemetry` (`api/clienttelemetry`, `Require(REPORT_CLIENT_TELEMETRY)` guest; batch ≤100 events/16 KiB; always 204; closed catalog in `catalog.go` → metrics). There is no `/metrics`, `/health` or `/readyz` [V: no such route exists].

### 1.7 Realtime transport and bridge to the domain [V]

- **Upgrade** (`api/internal/wsx`): library `github.com/coder/websocket`; mandatory subprotocol `playhoot.v1`; Origin check against `WEBSOCKET_ALLOWED_ORIGINS` (+ the host itself); `SetReadLimit(32 KiB)`; only JSON text frames with a `"type"` field (binary closes the connection).
- **Admission**: `api/internal/live.Controller` reserves a slot (default 2000 connections/instance, 10 per user, 100 simultaneous refusals) before the upgrade; rejections readable by the browser are sent as a `{"type":"rejected","reason":…}` message over a freshly upgraded connection, which is then closed (lingers 2 s).
- **Bridge**: the handler calls an `Attach*` on the Runtime and receives a **struct of closures** (`runtime.AdminConnection` / `PlayerConnection`): commands (`StartSession`, `Command`, `Sample`, `Resync`, `Leave`, `ReportGameFault`, `LimitHit`) and *blocking streams* (`NextLobbyUpdate`, `Started`, `NextView`, `Ended`, `Disconnect`). `live.Serve(ctx, conn, disconnect, loops…)` runs one reader per message type ("lanes" with `Rate`+`Capacity`) and emitters in goroutines owned by the controller; orderly shutdown on `Shutdown`. The domain does not know about WebSocket [V].
- **Per-connection limits**: 120 msg/s and 6000/min; 256 KiB/s and 4 MiB/min (excess → close 1008). Player: `sample` 60/s (queue 64, dropped), `command` 20/s (replies `rate_limited` without spending the token), `resync`/`leave` dropped. Admin: `select_perspective` 5/s, start/cancel 2/s. Preview: control 10/s. Keepalive: ping 15 s, pong 10 s, write timeout 10 s.
- **Server→client messages**: `rejected`, `lobby_update`, `lobby_closed`, `session_started` (includes `frontend{signed url, sha256, expires_at, viewport, assets[]}`), `session_ended`, `player_view` (full/diff with `revision`, `consumed_through_sample_sequence`), `roster_update`, `command_result`, `leave_result`, `select_perspective_result`, `start_session_result`, `cancel_session_result`; preview: `preview_started`, `acting_as`, `paused`, `resumed`, `preview_ended`, `error`.
- **Client→server**: player `leave`, `sample`, `command{token,name,payload}`, `resync`, `game_fault`; admin `select_perspective`, `start_session`, `cancel_session`, `resync`; preview `act_as`, `pause`, `resume`, `end` (+ game traffic with player limits).

### 1.8 Cross-cutting middlewares [V]

| Middleware | Location | Behavior |
|---|---|---|
| Per-request log / trace | `api/server.go restObservability/wsObservability` | `logging.Start` + `defer FinishRequestLog(ctx, slog.Default(), pattern)`; ONE structured log per request |
| Endpoint metrics | `api/metrics.go` | counter per (route, status) + duration histogram, centralized; `statusRecorder` |
| CORS | `api/internal/cors` | `CORS_ALLOWED_ORIGINS` (list or `*`; empty = none); no credentials (Bearer only); preflight 204 without rate limit; allowed headers `Authorization, Content-Type, Idempotency-Key`; exposes `Retry-After`; `Max-Age` 1 h |
| Authorization | `api/internal/auth` | see 1.2; metrics `api_authorization_total` / `_duration_seconds` by `decision` |
| Rate limit | `api/internal/throttle` + `utils/ratelimit` (window per *keyed bucket*, **in memory, per instance**) | default 5/s and 30/min per user; 20/s and 300/min per IP (authenticated → key `UserUUID`; otherwise → IP). Real IP via `TRUSTED_PROXY_HOPS` over `X-Forwarded-For`. 429 `rate_limited` + `Retry-After`; on WS it is answered as `rejected` |
| Request ID | **no** `X-Request-ID` exists; `trace_id` (UUID) is generated per request and not returned to the client (only the `X-Playhoot-Revision` header on AI file read) [V] |
| Server HTTP limits | `main.go` | ReadHeader 10 s, Read 15 s, Write 30 s, Idle 60 s, MaxHeader 64 KiB; MCP raises its deadlines (read 5 min, write 2 min, body ≤72 MiB) |

---

## 2. MCP server and "AI context / creation link" surface

### 2.1 MCP server (`api/mcp/`) [V]

- **Transport**: Streamable HTTP on `POST|GET|DELETE /mcp`, official SDK `github.com/modelcontextprotocol/go-sdk v1.7.0`; **stateless**, JSON responses (`JSONResponse: true`), `DisableLocalhostProtection`. Implementation `playhoot` v`1`, with fixed `Instructions` (stable context: what Playhoot is, workflow, "you cannot publish").
- **Auth**: OAuth 2.1. AI access token = JWT HS256 `typ at+jwt`, audience = MCP resource (`api.MCPResource(PUBLIC_API_BASE_URL)`), single scope `games`, 1 h, verified against the connection on every call (`aiauthorization.VerifyAccessToken`). Key derived from `IDENTITY_ACCESS_TOKEN_KEY` (a user token and an AI token are not interchangeable). No token → 401 with `WWW-Authenticate` pointing to `/.well-known/oauth-protected-resource/mcp`. The call acts as the token's `UserUUID` with account level. Limit 20/s and 300/min per user (`games.AIRequestLimits`). **Publishing is not a tool.**
- **Principle**: 1 MCP operation = 1 endpoint = 1 service method; tools call `games.Handler` directly (same functions as the HTTP routes), not over HTTP.

### 2.2 Tools (22) [V; underlying method V unless marked]

| Tool | What it does | `games` operation → service |
|---|---|---|
| `list_my_games` | lists the user's games | `ListGames` → `gamecard.ListGames` |
| `create_game` | creates an unpublished game (optional template) | `CreateGame` → `orchestrator.CreateGame` |
| `browse_templates` | featured templates and categories | `BrowseTemplates` → composer (`templatecatalog`) |
| `search_templates` | search by text/category/players/page | `SearchTemplates` → composer |
| `inspect_template` | card, brief, manifest, files (no code) | `InspectTemplate` → composer |
| `read_template_files` | reads files of a template (1..50) | `ReadTemplateFiles` → composer |
| `use_template` | resets the draft onto a template (new revision) | `UseTemplate` → `orchestrator.UseTemplate` |
| `get_game_context` | state: revision, files (hash/size), build, assets, attempts, notes.md, brief.json, guide URL | `ReadContext` → composer `ReadDraft` + link state |
| `read_files` | file contents of a revision | `ReadFiles` → `loadDraft(withContent)` |
| `list_changes_since` | changes since a revision | `ReadChanges` → composer `ReadDraftChanges` |
| `apply_changes` | changes sources (find/replace edits, files, delete) with `base_revision` and `idempotency_key` | `ApplyChanges` → `orchestrator.ApplyDraftChanges` |
| `restore_revision` | new revision with the content of a previous one | `RestoreRevision` → `orchestrator.RestoreDraftRevision` |
| `list_revisions` | revisions with provenance (kind/origin/actor/…), paginated | `ListRevisions` → composer |
| `diff_revisions` | unified diff between 2 revisions (8 KiB/file, 64 KiB total) | `ReadDiff` → composer `ReadDraftDiff` |
| `get_sdk_index` | compact index of the SDK guide (`capabilities.md`) | `ReadSDKPage` → `readsdkguide` |
| `get_sdk_doc` | one page of the SDK guide (Markdown) | `ReadSDKPage` → `readsdkguide` |
| `request_asset_upload` | single-use URL to upload an asset without going through the model's context (img 5 MiB, audio 10 MiB, video 50 MiB, 100 MiB total) | `RequestAssetUpload` → composer + `resourcegrants` (**new, uncommitted**) |
| `upload_asset` | uploads a small file (≤256 KiB) in base64 | `UploadAsset` → `orchestrator.UploadDraftAsset` |
| `remove_asset` | removes the asset for a key (new revision) | `RemoveAsset` → `orchestrator.RemoveDraftAsset` |
| `get_build` | build state (QUEUED/RUNNING/SUCCEEDED/FAILED/SUPERSEDED) with `wait_seconds` ≤20 | `ReadBuild` → composer `ReadDraftBuild` |
| `simulate` | runs a `playhoot.scenario.v1` scenario (virtual clock, expectations, holds) / `scenario_path` / `all` | `Simulate` → composer `SimulateDraft`/`SimulateSavedScenarios` |
| `read_simulation_state` | reads global or per-player state of a saved result (30 min) | `ReadSimulationState` → composer |

Tools that change state require a fresh `idempotency_key` per change [V: instructions].

### 2.3 Creation link (HTTP, no OAuth) for AIs that only read/write by URL [V]

- The owner (web) creates the link with `POST /v1/games/{g}/ai-link`; the response carries the URL `<PUBLIC_API_BASE_URL>/ai/v1/<token>` (token `phl_…` in the path; renewing = creating another and revoking the previous one; 7 days). Revoke: `POST …/ai-link/revoke`; status: `GET …/ai-link`.
- The AI opens `GET /ai/v1/{token}` (Markdown with instructions, URLs for each operation, format of the `playhoot.project-change.v1` envelope, scenario format) and uses the routes in 1.5. Linked SDK guide: `<PUBLIC_WEB_BASE_URL>/docs/sdk/v1/index.md`, also served by `GET /ai/v1/{token}/sdk/{page}`.
- Variants: `?format=json` returns `playhoot.ai-context.v1` (URLs: self, changes, changed, revisions, diff, sdk, templates, template, restore, build, files, assets, simulations).

---

## 3. `main.go` wiring, workers, configuration

### 3.1 Startup (`main.go`, modified uncommitted: adds `resourcegrants.New(db)` in `AILinks.Grants`) [V]

1. `sandbox.RunAsWorkerIfRequested()` first: if `os.Args[1]=="__playhoot_jsexecutor_worker__"` the binary acts as the sandbox worker and exits.
2. `readEnvVariables()` (loads `.env` with godotenv unless `ENVIRONMENT=production`), `openPostgres` (GORM+pgx, ping), `PostgresMigrate` (game → session → identity), `storage.Open` (GCS or `Unconfigured`).
3. Outside production: `PostgresSeed` (game and session seeds) and `sessionmigration.SeedObjects` in the bucket if `GCS_BUCKET` is set.
4. Construction by **manual constructor injection** (no DI container): `sandbox.NewHost` → `sessionlifecycle.New(db, store, maxActive)` → `playlifecycle.New(checkplayability, sessionLifecycle)` → `versiondrafting.New(db, store, buildSignal)` → `gametoolchain.Open(GAME_TOOLCHAIN_DIR)` → `versionbuilding.New(...)` → `resourcelinks` → `liveconnection.NewPreviews` → `gamelifecycle`, `gamecard` → `orchestrator/gameauthoring.New(9 collaborators)` → `composer/gameauthoring.New(7)` → `ownership.New` → `replayrecording.New` → `liveconnection.New(... 15 collaborators)` → Identity (`authorize`, `createguest`, `refreshcredentials`, `loginproviders`, `accountlogin`, `aiauthorization`) → `api.NewServer(...)`.
5. Background workers (2 goroutines with cancelable context, all instances):
   - `reconcilesessions.Run` (5 min interval): closes expired lobbies and running sessions past their lifetime/lease (durable DB-backed job).
   - `versionbuilding.Run` (`DefaultWorkers = 1`): builds DRAFT revisions; queue in Postgres (`play_draft_builds`), in-process wake-up with `buildsignal`.
   - Inside the runtime (not started by main): one controller per session (tick 100 ms, checkpoint 5 s, limits 1 s), `limitaudit` (flush 5 s), `replayrecording` (chunks to object storage), ownership heartbeat 30 s.
6. Shutdown (SIGINT/SIGTERM, 8 s): `httpServer.Shutdown` → `server.Shutdown` (closes WS) → reverse defers: stop builds, reconcile, `liveConnections.Close`, `replayRecorder.Close`, `previews.Close`, `sandboxHost.Close`, store, DB.

### 3.2 Environment variables (`.env.example` + reads in code; `.env` values NOT reviewed) [V]

| Variable | Req. | Purpose |
|---|---|---|
| `ENVIRONMENT` | yes | `production` ⇒ does not load `.env`, does not seed, requires keys/URLs; `development/local/test` allow the local provider |
| `HTTP_PORT` | yes | HTTP port (e.g. 8081) |
| `DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME/SSL_MODE` | yes (6) | Postgres |
| `GCS_PROJECT_ID`, `GCS_BUCKET` | no (both or neither) | object storage; empty ⇒ `Unconfigured` (every call fails) |
| `STORAGE_EMULATOR_HOST` | no | local fake-gcs (do not set in prod); read in `objectstore/gcs.go` |
| `GAME_TOOLCHAIN_DIR` | no | checkout of the frontend repo (game build + SDK guide); empty ⇒ every build fails "as a platform failure" |
| `PUBLIC_API_BASE_URL` | prod | public origin of the API (AI links, OAuth issuer/resource); dev: `http://localhost:<HTTP_PORT>` |
| `PUBLIC_WEB_BASE_URL` | prod | public origin of the web app (`/connect-ai` consent, SDK guide); dev: `http://localhost:5173` |
| `CORS_ALLOWED_ORIGINS`, `WEBSOCKET_ALLOWED_ORIGINS` | no | allowed origins (`*` or list); empty = none |
| `TRUSTED_PROXY_HOPS` | no | proxies that add `X-Forwarded-For` (1 behind Cloud Run) |
| `LIVE_MAX_CONNECTIONS` | no | WS cap per instance (default 2000) |
| `RUNTIME_MAX_LIVE_SESSIONS` | no | cap of live sessions (default 500 per the example) |
| `PLAY_MAX_ACTIVE_SESSIONS_PER_CREATOR` | no | active sessions per creator (default 1) |
| `SANDBOX_MAX_CONTEXTS`, `SANDBOX_MAX_CONCURRENT_EXECUTIONS` | no | max worker processes (default 32) / concurrent executions (default CPU count) |
| `REPLAY_STATE_SAMPLE_EVERY_N_TICKS`, `REPLAY_CHUNK_DURATION`, `REPLAY_MAX_PENDING_CHUNKS` | no | replay recording tuning |
| `IDENTITY_ACCESS_TOKEN_KEY` | prod (≥32 bytes) | JWT signing; if missing outside prod a random one is generated (tokens die with the process) |
| `IDENTITY_LOCAL_PROVIDER` | no | fake login provider; the server **refuses to start** with `true` if `ENVIRONMENT` is not development/local/test |
| `WEB_SIGN_IN_COMPLETE_URL` | prod | web route where login callbacks redirect (dev: `/sign-in/complete`) |
| `GOOGLE_OAUTH_CLIENT_ID/CLIENT_SECRET/REDIRECT_URL` | no (all 3 or none) | Google OIDC; the redirect must end in `/v1/identity/login/google/callback` |

Tests only: `TEST_DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME/BASE_NAME/SSL_MODE` (fallback to `DATABASE_*`), `GCS_TEST_PROJECT_ID`, `GCS_TEST_BUCKET`, `GAME_TOOLCHAIN_TEST_DIR`.

### 3.3 Feature flags [V]

There is no feature flag system. Environment-conditioned behavior is: `ENVIRONMENT=production` (seeds/.env/required), `IDENTITY_LOCAL_PROVIDER`, presence of the 3 Google variables, empty `GCS_*` (storage not configured), empty `GAME_TOOLCHAIN_DIR` (builds and SDK guide unavailable), `STORAGE_EMULATOR_HOST`.

---

## 4. Infrastructure and runtime

### 4.1 Local and deployment [V]

- `docker-compose.yaml`: `postgres:17-alpine` (volume `postgres_data`, healthcheck), `fsouza/fake-gcs-server:1.52.2` on `:4443` (buckets = directories of `local/gcs/`: `playhoot-dev`, `playhoot-test`; objects in `local/gcs-data/`, ignored by git) and `adminer` on `:8080`. The app is **not** in compose (run with `go run`).
- `deploy/`: only `README.md` + `gcs-cors.json` (bucket CORS: GET/HEAD from `${PLATFORM_WEB_ORIGIN}`; the frontend GameHost verifies SHA-256 with `fetch` of signed URLs). **There is no Dockerfile, CI, IaC or manifests** (`ls`, no `.github`) [V]. Mentions of Cloud Run and "ephemeral GCP VM" appear only in comments/docs [I: intended target GCP/Cloud Run].
- `.vscode/settings.json`: gofmt on save (`golang.go`) + organize imports.
- Binary `playhoot.exe` (72 MB) in the root **is versioned in git** (`git ls-files`); `.env` is not (in `.gitignore`).

### 4.2 Database [V]

- PostgreSQL (17 in compose), GORM v1.31 + `pgx/v5`, no pool tuning in `openPostgres`.
- Migrations: `gormigrate/v2` (single `migrations` table, `UseTransaction: true`, `ValidateUnknownMigrations:false` because the 3 domains share the table). `migrations.go` calls `gamemigrations.Migrate` → `sessionmigrations.Migrate` → `identitymigrations.Migrate` at startup (every instance). Timestamp IDs `YYYYMMDDHHMMSS_name.go` in `<domain>/internal/migrations` (identity: `identity/internal/migrations`; game: `game/internal/storage/migrations`; play: `play/session/internal/migrations`).
- Current pre-launch policy: **migrations edited in place** (no corrective ones; the human recreates the local DB) — e.g. `20261102000000_play_draft_assets.go` modified uncommitted [V: diff + CHECKLIST]. No `CHECK` or FK (standard `database-constraints.md`).
- Seeds (non-prod only): test games `space_drift`, `parques`, `tap_race` + objects in the bucket (`play/session/internal/migrations/seed_*.go`, `game/internal/storage/migrations/seed.go`).

### 4.3 Object storage and authentication providers [V]

- Storage: **Google Cloud Storage only** (`cloud.google.com/go/storage`) behind the `objectstore.Store` interface (`play/session/internal/objectstore`: `gcs.go`, `fake.go` for tests, `unconfigured.go`). Local: fake-gcs emulator. Content: backend scripts, version frontend packages, assets, card images (`games/card-images/<sha256>`), replay chunks. Download to players via signed URLs (only when the backend does not touch the bytes — standard `object-storage.md`).
- Auth providers: (a) **Google OIDC** (PKCE S256, verified RS256 ID token) implemented but "not verified against real Google" (LAUNCH_READINESS); (b) **fake local provider** (`/v1/identity/login/local/authorize`, dev/test only); (c) real **guests** (`POST /v1/guests`, linked to the account on first login); (d) **own OAuth 2.1 server for AI** (section 1.6). There is no email/password.

### 4.4 Game backend script sandbox [V]

- **Language/runtime**: JavaScript in **QuickJS compiled to WebAssembly**, run with **wazero** through `github.com/fastschema/qjs v0.0.6` **vendored and patched** in `third_party/qjs/` (`replace` in `go.mod`; `PLAYHOOT_PATCH.md`: no mounted host directory, deterministic wazero clocks/sleep/randomness, memory fixes). `goja` is used only for static script analysis (`play/runtime/sandbox/scriptcheck`, profiles `handwritten` and `sdk-v1`).
- **Launch**: one worker process **per context = per session**, which is a **re-exec of the same binary** (`os.Executable()` + arg `__playhoot_jsexecutor_worker__`, `cmd.Env = []`, empty environment). `sandbox.Host` (`host.go`) manages them; the worker dies when stdin closes.
- **Protocol**: line-delimited JSON over stdin/stdout. Request `{operation: load|start|execute|project|restore, script, profile, participants, randomSeed, steps[{sessionTime, transitions|command|update|playerDisconnected|playerRejoined}], state, prngState, …}`; one JSON response per line with `MemoryBytes`.
- **Limits**: 64 MiB QuickJS memory, 1 MiB stack, 5 s execution budget (the host kills the worker), 256 KiB output, worker Go heap 160 MiB; `SANDBOX_MAX_CONTEXTS` default 32; no network/files/own clock/randomness (`determinism.go`: deterministic `Date`/`Math.random`, exportable mulberry32).
- **Where it lives**: `play/runtime/sandbox/` (host, worker, protocol, `scriptcheck/`), `third_party/qjs/`. Used by the live runtime, previews and simulations (`play/runtime/usecases/simulategame`).
- Old documentation mentions a "JavaScript executor" as a separate service (ADR-0016, archived); **today it is in-process with child workers** (SESSION-ADR-0028/0030).

### 4.5 Game SDK and toolchain [V]

- The **SDK lives in the frontend repo** (`../playhoot_frontend/packages`: `game-core, game-server, game-react, game-sdk, game-tools, game-host, protocol, …`), not in this repo.
- The backend uses it as a **per-checkout toolchain** (`GAME_TOOLCHAIN_DIR`): `play/session/internal/gamebuild/node.go` runs `node packages/game-tools/src/cli.ts` (one process per build, timeout 60 s, heap 512 MB, minimal inherited environment) producing server script, client bundle, manifest, aspect ratio, languages and `InputRequirements`.
- **Versioning**: `Builder.Version()` = hash of the sources of `game-core, game-server, game-react, game-sdk, game-tools, protocol` (excl. tests) + lockfile; stored per build (`toolchain_version`) and per revision (`sdk`). Builds are reused if sources+assets+toolchain match. [Documented gap: Node version and SDK string not yet included — CHECKLIST T pending.]
- **Serving**: the SDK guide (`apps/web/public/docs/sdk/v1/*.md`) is read by `readsdkguide`/`internal/sdkguide` from the same checkout (page-name regex, ≤256 KiB) and served by MCP (`get_sdk_*`) and `/ai/v1/{token}/sdk/…`; the web app publishes it at `<PUBLIC_WEB_BASE_URL>/docs/sdk/v1/`. A game's frontend reaches the player as a signed GCS URL in `session_started`.
- Script profile `sdk-v1` (top-level only functions and literal `const`s; constants frozen once; `play_game_versions.script_profile` mandatory).

### 4.6 Caches / queues [V]

None external (no Redis/Rabbit/Pub-Sub). In-memory state: rate limiters, live-session controllers, previews (max 50), `buildsignal` (worker wake-up). Durable queues/jobs in Postgres (`play_draft_builds`, simulation results `play_simulation_results` with TTL 30 min/7 days, `reconcilesessions`). Session ownership is single-instance (fixed epoch); multi-instance deferred to "launch" (LAUNCH_READINESS).

---

## 5. Observability

### 5.1 Logging (`logging/request_log.go`) [V]

"**One structured log per unit of work**" pattern: the entry point calls `ctx = logging.Start(ctx)` and `defer logging.FinishRequestLog(ctx, slog.Default(), pattern)`; all code below only uses `logging.Step(ctx,"x").Close()`, `logging.LogFields(ctx, logging.Field(k,v))`, `LogError`, `LogLoopFields`. Without `Start` in the ctx, the calls **do nothing** (standard `logging.md`). Only `api` can start logs: every REST request, every WS handshake and every WS message. Output: default `slog` (**there is no `slog.SetDefault` in main** → default text handler) [V].
OpenTelemetry-style correlation: `trace_id` (inherited from the ctx or minted), new `span_id` per `Start`, `parent_span_id` (the enclosing span). One WS connection = shared trace; each message/close = child span. `logging.WithTraceID` allows continuing an external trace (still unused). `LogStandalone` for lines without a request.

Example (central REST observability, `api/server.go`):

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

Use in the domain (one line): `logging.LogFields(ctx, logging.Field("game_uuid", gameUUID))` (e.g. `api/games/handler.go caller`).

### 5.2 Metrics (`monitoring/metrics/`, standard `metrics.md`) [V]

- API: `metrics.NewLabel(name, closedValues...)`, `NewCounter/NewGauge/NewHistogram(name, help, labels...)`; `Inc/Add/Set/Observe/ObserveDuration(ctx, labelValues...)`. Label values are a **closed set** declared up front; cap of 1000 combinations per metric (if exceeded, **panic on declaration**); snake_case names, counters `_total`, durations `_seconds`, help mandatory; misuse = panic.
- **Logic owner = metric owner**: business results are declared by the domain that produces them (e.g. `play_session_join_codes_resolved_total{outcome}`); **entry points do not register business metrics**.
- **Endpoint metrics** (transport) are central in `api/server.go`/`api/metrics.go`: `api_http_requests_total{route,status}`, `api_http_request_duration_seconds{route}` (+ families `api_ai_*`, `api_authoring_*`, `api_http_preflights_total`, WS handshakes with `limit_refusal`); edge components measure their own (`api_authorization_total{decision}`, `api_http_rate_limited_total{key}`, `api_live_connections_active/_closed_total{close_cause}/_duration_seconds`).
- **Difference from service outcomes**: endpoint metrics only say "what happened in the HTTP exchange" (status, duration); service metrics say "what it meant for the domain" (outcome).
- **Actual emission**: `record()` validates and **only writes the measurement to the request log** (`LogLoopFields(ctx,"metrics",…)`); `// TODO: forward the measurement to the metrics backend` — **there is no exporter/backend** and `monitoring.Alert` only logs + `fmt.Println` (`// TODO` alerting) [V]. Metrics/alerts/dashboards provider is in LAUNCH_READINESS.

Example (declaration and use of a service metric, `play/session/usecases/resolvejoincode/service.go`):

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
Only `trace_id/span_id/parent_span_id` in logs; no OpenTelemetry/exporter; no propagation between services (monolith); no request ID visible to the client.

---

## 6. Engineering conventions

### 6.1 Commands [V unless marked]

| Action | Command |
|---|---|
| Build | `go build ./...` (≈32 s cold) |
| Vet | `go vet ./...` |
| Unit tests (no DB) | `go test ./...` (runs; repo tests are skipped) |
| Tests with DB | export `TEST_DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME/SSL_MODE` (or `DATABASE_*` already exported; **`go test` does not read `.env`**) with Postgres from `docker compose up -d postgres`; each package creates a disposable DB `<name>_<suffix>` and drops it at the end |
| Mocks | `go generate ./...` — 85 `//go:generate mockgen -package=… -destination=*_mock_test.go . <ifaces>` directives (`mockgen` in `~/go/bin`) |
| Lint | **no linter configured** (no `.golangci`/Makefile/CI); `staticcheck` and `mockgen` exist on the machine [I: optional use] |
| Run app | `docker compose up -d` and `go run .` (requires `.env` copied from `.env.example`) [I: no explicit doc, deduced from `main.go`/compose] |
| Start with toolchain | `GAME_TOOLCHAIN_DIR=../playhoot_frontend` (Node in PATH) |

### 6.2 Tests (`docs/engineering/standards/testing.md`) [V]
- Table-driven with `map[string]func(t, deps) test` ("tests map → setup callback → test struct"); case names with underscores; `testify/require`, mocks `go.uber.org/mock/gomock` (`svcMocks`); `expectErr` (bool) is asserted, not messages; sentinel only if it is a contract (`require.ErrorAssertionFunc`); panics only "there is a panic".
- Repo tests against a **real disposable DB** (no mocked SQL driver): `utils.DisposableTestDB{Key,NameSuffix,Migrate}` with `Run(m)` in `TestMain`, one DB per package/domain migrated once, advisory lock `7302190014` to create/sweep orphans; thin per-domain wrappers (`play/session/internal/testdb`, `identity/internal/testdb`, `game/internal/testdb`). Without `TEST_DATABASE_*` → `t.Skip`. Data accumulates across cases; each case seeds what it needs; writes are verified by re-reading the DB.
- Other skips: `fixturescenarios`/`gamebuild` (need frontend checkout/Node), `objectstore` (needs `GCS_TEST_*`), etc.
- State: 110 packages OK on this machine without a DB; DB integration coverage was **not exercised** here (CHECKLIST L itself admits Postgres tests "not executed (no Docker)").

### 6.3 `comment_standard_test.go` (root, `package main`) [V]
Walks all `.go` files (skips `.git` and `third_party`, ignores generated files in the last one) and fails if:
1. `TestNoInternalDocCitationsInComments`: a comment cites ADR/`WORK-NNNN`/`Blocker N`/`Slice N`/`docs/(work|engineering|ai)/`.
2. `TestExportedDocCommentsStayAtPublicContract`: the comment of an exported symbol names a lower-layer package that its signature does not expose (list: `engine`, `engineservice`, `gorm`).
3. `TestDocCommentLength`: any doc comment (package, decl., type, value, field) exceeds **5 lines**.
Complements `standards/code-comments.md` (503 lines).

### 6.4 Repositories/SQL (`repositories.md`, project decision memory) [V]
Reads/updates/deletes with **raw SQL** (`Scan(&struct)` verifying `RowsAffected`); **inserts with GORM `Create()`** on an unexported row struct with `TableName()` (conflict → `Clauses(clause.OnConflict{DoNothing:true})`); a manual `INSERT` only if trivial (columns+values, `ON CONFLICT DO NOTHING`, `RETURNING`; no subqueries or functions/casts); no state literals in SQL (Go constants as parameters); transactions via helper (`RunInDBTransaction[T]`, no `db.Begin()` in workflows); the repo does not decide business policy; repo names = persistence operation, not business command; exposed types named by entity, not `row`.

### 6.5 Documents under `docs/engineering/` (17 files) [V]

| Doc | Summary |
|---|---|
| `ENGINEERING_RADAR.md` (297 l.) | **Non-authoritative** recommendations/concerns (NOW≠READY, never authorizes implementing) |
| `LAUNCH_READINESS.md` (59 l.) | List of what is deferred to "right before the first deploy": real Google, metrics provider, storage/CORS/public URLs, toolchain in image, build worker isolation, multi-instance |
| `standards/INDEX.md` | Index of 15 canonical standards; "absence of a standard does not allow inventing one" |
| `code-comments.md` | Purpose/style of comments; no history/tasks; no citing internal docs; ≤5 lines |
| `cross-domain-reference-naming.md` | Cross-domain reference columns are named after the referenced public entity |
| `data-history.md` | Every visible change: write-once columns or history tables; causes recorded |
| `data-integrity.md` | Panic only if continuing is unsafe; otherwise logical error + `monitoring.Alert` |
| `database-constraints.md` | DB only PK/unique/indexes/types/NULL; **no CHECK or FK**; writers validate, readers do not assume validity (they alert) |
| `domain-logic-placement.md` | Locality by behavior; workflow vs use case; logic in type > pure function > capability package; no generic `businessservice` |
| `error-handling.md` | Expected business result (value, `nil` error) vs error; error logging boundary |
| `function-signatures.md` | Explicit parameters over ceremonial input structs; semantic types; return shape |
| `idempotency.md` | Natural vs command; mandatory token; replay vs conflict; ownership of responsibility |
| `logging.md` | Only `api` does `Start/Finish`; REST vs WS; trace/span/parent; per message on long connections |
| `metrics.md` | Logic owner declares the metric; closed labels; central endpoint metrics; names |
| `object-storage.md` | Signed URL only if the backend never touches the bytes; streaming upload with cutoff, hash and check; bytes first, content-based keys, intent record |
| `repositories.md` | See 6.4 |
| `testing.md` | See 6.2 |

---

## 7. Process/documentation artifacts

### 7.1 `docs/` tree (205 files; archive = 122)

```
docs/
  ai/ (29)      OPERATING_MODEL.md  KNOWLEDGE_MAP.md  README.md  CHANGELOG.md(374 l.)
                processes/ (8 human guides): AI_WORKFLOW_CHANGE, ARCHITECTURE_DISCUSSION, DOMAIN_DESIGN, ENGINEERING_STANDARD,
                           FEATURE_DEVELOPMENT, GUIDED_TECHNICAL_EXPLORATION, PRINCIPAL_ENGINEER_REVIEW, PRODUCT_DISCUSSION
                protocols/ (10 agent protocols): the 8 above + CONVERSATIONAL_ORCHESTRATOR(316 l.) + IMPLEMENTATION_REVIEW(587 l.)
                templates/domain/: CURRENT_STATE, DATA_MODEL, DOMAIN_README, FLOWS (.template.md) + README
                workspaces/: README.md, active/.gitkeep (empty)
  architecture/ SYSTEM_MAP.md  CROSS_DOMAIN_FLOWS.md
  decisions/    README.md INDEX.md  architecture/{ADR-0001,0005,0014,INDEX}  product/{PDR-0001,INDEX}  templates/{ARCHITECTURE_DECISION,PRODUCT_DECISION}
  engineering/  ENGINEERING_RADAR.md LAUNCH_READINESS.md standards/ (15 + INDEX) — see 6.5
  product/      IDEAS.md PRODUCT_STATE.md ROADMAP.md
  projects/     README.md  templates/PROJECT.template.md  active/game-creation-v1/{PROJECT.md,CHECKLIST.md}
                completed/identity-v1/{PROJECT.md, internal/AI_CONTEXT.md, works/WORK-0056…0062 (7)}
                completed/session-runtime-v1/{PROJECT.md, CHECKLIST.md, internal/AI_CONTEXT.md}
  work/         README.md  templates/WORK_SPEC.template.md  active/README.md  completed/README.md  (no active WORK)
  archive/pre-realtime-pivot/ (122 files: ADR/WORK/projects of the discrete turn-based design; only if history is requested)
```
Domain docs: `game/{README,CURRENT_STATE}.md + docs/{DATA_MODEL,FLOWS,decisions/GAME-ADR-0001,INDEX}`, `identity/{README,CURRENT_STATE}.md + docs/decisions/IDENTITY-ADR-0001..0003+INDEX`, `play/{README,CURRENT_STATE}.md + docs/{DATA_MODEL,FLOWS,decisions/SESSION-ADR-0028..0035+INDEX}`; README per package (`api`, `composer`, `orchestrator`, `monitoring`, `utils`, `deploy`, `discovery`, `community`, `profile`, `sessionhistory`). `plans/` tree (only 2 binaries): `plans/identity/05_Playhoot_Plan_de_Identidad_Basica.docx`, `plans/session_runtime/Playhoot_Session_Runtime_Architecture_Plan_with_TOC.docx`.

### 7.2 What each artifact contains and prescribes

| Artifact | Content / prescription |
|---|---|
| `AGENTS.md` (76 l.) | Agent bootstrap: determine surface (CONVERSATIONAL AI / CODEBASE AGENT / INDEPENDENT REVIEWER); read `OPERATING_MODEL.md`; load context only via `KNOWLEDGE_MAP.md`; for natural requests use `CONVERSATIONAL_ORCHESTRATOR.md` (look for an open initiative/WORK first); inspect code/tests/migrations for actual behavior; **report "drift"** doc↔code without silently resolving it; do not treat ideas/TODOs as decisions; **escalate** material decisions (product, architecture, persistence, security, infra, standards) instead of inventing them; do not read `docs/archive/`; do not infer new standards from patterns (use the ENGINEERING_STANDARD process); `HUMAN_REVIEW.md` = human review surface; `AI_CONTEXT.md` = temporary resumable context, not canonical; respect active workspaces. Old code in the git tag `pre-realtime-pivot` |
| `ARCHITECTURE.md` (190 l., CANONICAL, 27-Oct) | Modular monolith; accepted domains: Game Management, Session Runtime, Identity; **a domain does not invoke another** (cross-domain reads → Composer, writes → Orchestrator; mechanism per workflow); API = edge with no business state; cross-domain references by public UUID with no FK or access to another's persistence; no cross-domain transactions; "Application coordinates / Domain decides / Persistence stores" (ADR-0001); "Infrastructure Service" defined as a category; unresolved boundaries: profile, session history, discovery, community |
| `PROJECT_OVERVIEW.md` (614 l.) | Product vision (platform for creating multiplayer social games with AI); explicitly **without** implementation details; mentions pre-pivot concepts (Effect, Interaction, Presentation, "no own language") |
| `docs/projects/README.md` | A Project groups/orders WORK; **WORK is the only unit with a lifecycle**; invariants: every future result required for an active project must have a WORK (even if PLANNED); nothing committed only in PROJECT.md/AI_CONTEXT/ADR; finished WORK stays inside the project; the completed project moves to `projects/completed/` |
| `docs/work/README.md` | WORK lifecycle (DRAFT→READY→IMPLEMENTING→DONE/CANCELLED); DRAFT WORK has no authority to implement; `WORK-NNNN` IDs sequential and global; template `WORK_SPEC.template.md` |
| `docs/projects/active/game-creation-v1/` | `PROJECT.md` (goal, out of scope, decisions made in conversation 1–5 Nov, closing criteria) and `CHECKLIST.md` (sections B–U; done through S; T and U pending) as the real tracking mechanism |
| `docs/decisions/` | ADR/PDR: families by scope (`ADR-`, `GAME-ADR-`, `SESSION-ADR-`, `IDENTITY-ADR-`, `PDR-`), each with its INDEX; "decision record = why, not current truth"; immutable history |
| `docs/ai/OPERATING_MODEL.md` | "Human decides; conversational AI reasons; code agent implements; repo remembers". Principal engineer contract (question the framing, propose alternatives, teach); decision limits; `DISCOVERY` format to escalate and `DRIFT DETECTED`; "one thing, one owner"; sync only the docs whose knowledge changed; anti-overengineering (NOW/SOON/LATER/NOT NEEDED) |
| `docs/ai/protocols/IMPLEMENTATION_REVIEW.md` | Precondition to implement: a `docs/work/active/WORK-…` exists in READY state; implementation report; independent read-only review; fix/re-review loop |
| `.claude/` | Only an **empty** `worktrees/`. There is no `CLAUDE.md`, nor `settings.json`, nor skills/agents/hooks in the backend repo [V]. (A parent `AGENTS.md` exists in `repos/` that only says: each repo has its own documentation/tracking; `docs/` of `repos/` contains cross-repo plans) |

### 7.3 Rules currently given to an agent in this repo
1. Read `AGENTS.md` → `OPERATING_MODEL` → `KNOWLEDGE_MAP` (do not scan all Markdown).
2. Implement only with WORK in READY state (IMPLEMENTATION_REVIEW protocol) and escalate material decisions (listed above); do not change standards without the ENGINEERING_STANDARD process; Radar/IDEAS authorize nothing.
3. Keep the `CURRENT_STATE.md`/`DATA_MODEL`/`FLOWS` of the touched domain in sync (only the affected ones) and report drift.
4. Binding engineering standards (section 6) + `comment_standard_test.go` enforces them mechanically (comments only).
5. Do not touch `docs/archive/`; do not cite ADR/WORK in code comments.

---

## 8. Repository health

| Check | Result |
|---|---|
| `go build ./...` | **PASS** (no errors, ~32 s) |
| `go vet ./...` | **PASS** (no output) |
| `go test ./...` | **PASS**: 110 packages `ok`, 0 `FAIL`, (slowest: `fixturescenarios` 19 s). **Does not need Docker/DB** to run: repo/integration tests execute `t.Skip` if `TEST_DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME/SSL_MODE` (or the equivalent `DATABASE_*`) are missing. With a DB, each package creates and drops its disposable DB. Tests that use the sandbox launch re-exec workers of the test binary (no services required) |
| `git status --short` | 33 entries: 25 modified (`M`) + 8 untracked (`??`) |

`git status --short` (summary): modified `api/README.md`, `api/games/{ai_context,draft_assets,handler,handler_mock_test,handler_test}.go`, `api/mcp/{handler,handler_test,tools}.go`, `api/metrics.go`, `docs/projects/active/game-creation-v1/CHECKLIST.md`, `identity/{CURRENT_STATE.md,identity.go,internal/migrations/migration.go}`, `main.go`, `play/CURRENT_STATE.md`, `play/session/drafting.go`, `play/session/internal/migrations/20261102000000_play_draft_assets.go`, `play/session/workflows/versiondrafting/{internal/repo/assets.go,internal/repo/repo_test.go,step_assets_test.go,step_read_draft.go,step_read_draft_mock_test.go,step_upload_asset.go,step_upload_asset_mock_test.go}`; new `api/games/asset_upload_url{,_test}.go`, `identity/internal/business/resourcegrant/`, `identity/internal/migrations/20261107000000_identity_resource_grants.go`, `identity/usecases/resourcegrants/`, `play/session/asset_limits.go`, `play/session/internal/business/gameversion/asset_media{,_test}.go`.

**Work in progress (5 lines)**
1. This is item **S** of the `game-creation-v1` CHECKLIST ("asset upload by the agent without going through the model's context"), marked `[x]` dated 2026-11-07 but **uncommitted** (last commit: `19a1ece template configurations`).
2. New single-use "grant" in Identity (`identity/usecases/resourcegrants`, `phg_` tokens, SHA-256 hash only, 15 min, ≤20 live per user, table `identity_resource_grants`, metric `identity_resource_grants_total`).
3. New surfaces: MCP `request_asset_upload`, `POST /ai/v1/{token}/assets/{key}/upload-url` and `PUT /v1/asset-uploads/{token}` (token auth, per-client limit 10/s); `main.go` wires `resourcegrants.New(db)` into `AILinks.Grants`.
4. Media measurement on upload (`gameversion.MeasureMedia`: dimensions/duration) stored in `play_asset_objects` (migration **edited in place**; the local DB must be recreated) and returned in asset reads and in the AI context.
5. Updates state docs (`identity`, `play` CURRENT_STATE, CHECKLIST) and `api/metrics.go` (the `/v1/asset-uploads/` route joins the `api_authoring_*` family). Build, vet and tests pass with this WIP.

---

## 9. Doc vs. code discrepancies (the code is reported) [V]

| Topic | Doc says | Code says |
|---|---|---|
| Session Runtime directory | `ARCHITECTURE.md`, `docs/decisions/INDEX.md`, ADR indexes and `SESSION-ADR-0028` point to `session/…` | The package is `play/` (`session/` no longer exists; `play/session` is a subpackage) |
| Access tokens | `ARCHITECTURE.md`: "opaque access tokens" | 15-min JWT HS256 (`accesstoken.go`) |
| Login providers | `ARCHITECTURE.md`: "Google as the only provider" | Google + fake local provider (dev/test) + AI OAuth server |
| `docs/architecture/SYSTEM_MAP.md` (15-Oct) | "authorize: fixed test tokens", "only `POST /sessions`", "live runtime not implemented", composer "README only" | Real auth, 84 routes, live runtime, composer implemented |
| Process vs practice | `projects/README` Invariant 1 and `IMPLEMENTATION_REVIEW`: every required result ⇒ `WORK-NNNN` under `works/`, implementation only with READY WORK | The active project `game-creation-v1` **has no `works/`**; tracked with `CHECKLIST.md` (letters B–U) and "Step N…" commits; `docs/work/active/` and `docs/ai/workspaces/active/` empty [I: actual practice departs from the written process] |
| `PROJECT_OVERVIEW.md` | Pre-pivot vocabulary (Effect/Interaction/Presentation, games without code) | Games = TypeScript SDK projects, JS sandbox (SESSION-ADR-0028) |
| `.env.example` | Mentions `RUNTIME_MAX_LIVE_SESSIONS=500` and `GAME_TOOLCHAIN_TEST_DIR` as optional | Consistent; does not list the 7 `TEST_DATABASE_*` variables that the tests do read |
| Binary artifact | — | `playhoot.exe` (72 MB) versioned in git |

---

## 10. Most relevant for a tech lead (synthesis)

1. **Already a very large surface**: 80 REST + 4 WS + 22 MCP tools; AI game creation (`/ai/v1` links, OAuth+MCP, simulation, builds) is implemented end to end, it is not a spec.
2. **De facto single-instance**: session ownership with fixed epoch, in-memory rate limits and caches, single build worker; multi-instance and forwarding are deferred (503 "forwarding not implemented").
3. **No real exported observability**: metrics and alerts are only written to the log (backend `TODO`); no `/metrics`, `/health`, request-id to the client or OpenTelemetry.
4. **No deployment pipeline**: no Dockerfile/CI/IaC; at runtime the backend depends on a checkout of the frontend repo + Node (`GAME_TOOLCHAIN_DIR`) to build and for the SDK guide; sandbox = re-exec workers of the binary itself (QuickJS/wazero, vendored patch).
5. **Heavy documentation process, misaligned with practice**: AGENTS/WORK/ADR/CHECKLIST with strict rules (escalate, READY WORK, drift), but the active project is run with a CHECKLIST without WORK; there are outdated documents (`session/` vs `play/`, SYSTEM_MAP, "opaque tokens").
