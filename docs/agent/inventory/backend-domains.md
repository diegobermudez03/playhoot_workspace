# `playhoot` backend inventory - domains and data

Scope: domain packages and their persistence. Read only; nothing is judged or proposed. Inventory date: 2026-11-15. Repo at `repos/playhoot`, last commit `19a1ece` (Nov 7, 2026), 319 commits.
Convention: **[V]** verified in code; **[D]** stated by a doc and not cross-checked; **[I]** inferred. When doc and code differ, the code is reported and the difference is noted in the section "Doc/code discrepancies".

## 0. Structural summary

| Package | Go files (tests) | Status |
|---|---|---|
| `identity` | 92 (43) | Real, complete for identity-v1 + AI OAuth + grants (grants uncommitted) |
| `game` | 64 (27) | Real: game, editions, card, publishing, templates (step 1) |
| `play` | 423 (211) | Real and the bulk of the code: `play/session` (durable) + `play/runtime` (live, sandbox, replay) |
| `discovery` | 2 (0) | Stub: types + `templatecatalog`, which returns empty lists |
| `composer` | 6 (3) | Real, one `gameauthoring` group (reads) |
| `orchestrator` | 26 (14) | Real, two groups: `gameauthoring` and `playlifecycle` (writes) |
| `community` | 0 | Only `README.md` ("TBD") |
| `profile` | 0 | Only `README.md` (incomplete: "Profile creation (including signup)") |
| `sessionhistory` | 0 | Only `README.md` ("Storing histories for plays; metrics, analytics") |
| `utils` | 5 (2) | Real: `RunInDBTransaction`, `DBServicer`, `DisposableTestDB`, `ratelimit` |
| `logging` | 2 (1) | Real: structured request log by steps (`Step`, `LogFields`) |
| `monitoring` | 7 (1) | Partially real: metrics and `Alert` only write to the log; external backend left as `TODO` |
| `third_party/qjs` | 15 | Vendored and patched fork of `fastschema/qjs v0.0.6` (QuickJS in WASM), `replace` in `go.mod` |
| `local` | 0 Go | GCS emulator data (`local/gcs`, `local/gcs-data` ignored by git) |
| `plans` | 0 Go | Two `.docx` files (identity plan, session runtime plan) |
| `api`, `deploy`, `docs`, `.claude` | out of scope | (another agent) |

Other top-level Go: only `main.go`, `migrations.go`, `comment_standard_test.go` at the root (out of scope except to trace who calls whom).

Cross-cutting facts [V]:
- **A single Postgres, no FKs**: no migration declares FOREIGN KEY; references are indexed columns (`game_id`, `user_id`, `game_version_id`...) maintained by the application. Between domains the reference is a logical `*_uuid` (`owner_uuid`, `created_by_user_uuid`, `user_uuid`).
- **Migrations in raw SQL with gormigrate**, shared `migrations` table; each domain exposes `Migrate(db)`; `migrations.go` runs them in the order `game` -> `play/session` -> `identity`. Seeds (`Seed`) only for `game` and `play`, only outside production. Pre-launch, migrations are edited in place (the commit says so, the user's memory too); there are no corrective migrations.
- **No literals in SQL**: statuses are interpolated Go constants or bind params.
- **No direct domain->domain imports** [V]: `identity`, `game`, `play`, `discovery` only import their own tree + `logging`/`monitoring`/`utils`. Only `composer` and `orchestrator` (and `api`, `main.go`) import several domains. Detail in each section.
- Layer convention: `usecases/<verb>` (independent operation, `Service`), `workflows/<name>` (`Manager` + one `step_*.go` per step), `internal/business/<behavior>` (pure rules), `internal/repo` per use case/workflow (narrow interfaces per step, mockgen), `internal/migrations`.
- Idempotency via a "requests" table with a unique key (`*_requests`) in identity (guest), game (create, card image, edition, release) and play (create session, change attempts).
- Change history ("data trailing", standard `docs/engineering/standards/data-history.md`): values written once carry `<event>_at`; values that change more than once have an append-only `*_changes`/`*_events` table written in the same transaction. Detail per table below.

## 1. `identity`

**Purpose** [V]: stable identity of the person (`UserUUID`), guests and accounts (Google only + a fictitious `local` provider), own credentials (HS256 access JWT 15 min + rotating opaque refresh), operation catalog with minimum authentication level, and an OAuth 2.1 authorization server for AI clients (MCP). Plus "resource links" and "resource grants" (scoped-use secrets over an opaque resource).

### 1.1 Structure

Public contract: `identity/identity.go` (types, `Operation`, `Level`, outcomes, errors; stdlib only). Pure rules: `identity/internal/business/{accesstoken, aiauth, displayname, login, operationlevel, refreshtoken, resourcegrant, resourcelink}`.

| Package | Type | What it does |
|---|---|---|
| `usecases/authorize` | use case | `Authorize(token, operation)`: verifies the JWT without reading the DB, applies the catalog minimum level; an uncataloged operation = forbidden + `monitoring.Alert` |
| `usecases/listoperations` | use case | Publishes the operation->level catalog (`GET /v1/identity/operations`) |
| `usecases/createguest` | use case | Creates a guest with a normalized name + credentials session; idempotent by `idempotency_key`; 5 min reuse window (`ReplayWindow`) |
| `usecases/refreshcredentials` | use case | Refresh: new access token; rotates refresh if the current one is >5 h old (`replaced_by_id`); accepts the immediate predecessor for 5 min (`PreviousGrace`); otherwise `refresh_invalid` |
| `usecases/endsession` | use case | Logout: deactivates the refresh token's session; idempotent |
| `usecases/setdisplayname` | use case | Sets the display name (max 64 runes), records the change |
| `usecases/resourcelinks` | use case | Secret `phl_` links to a resource (opaque kind+id), 1 open per user+resource, 7 days |
| `usecases/resourcegrants` | use case | **Uncommitted**: single-use `phg_` grants (see 1.8) |
| `usecases/aiauthorization` | use case | AI OAuth server: DCR, authorize+PKCE S256, consent, token, refresh with rotation, RFC 7009 revocation, list/revoke connections |
| `workflows/accountlogin` | workflow | Account login (3 steps, below) |
| `loginproviders` | port + impls | `Provider` (see 1.6) |

**Workflow `accountlogin`** (`Manager`; `step_start.go`, `step_callback.go`, `step_complete.go`) [V]:
1. `StartLogin(provider, codeChallenge, guestUserUUID)`: records the attempt (state, nonce, S256 challenge, PKCE verifier toward the provider, optional guest; lifetime 5 min) and returns the authorization URL.
2. `HandleCallback(provider, state, code, providerError)`: marks the attempt answered exactly once (before talking to the provider), exchanges the code outside a transaction, resolves (issuer, subject)->User: existing / `linked_guest` (the account inherits the guest's UserUUID) / `created` (new User without display name); issues a one-time code valid for 60 s. Errors: cancelled / failed / unavailable.
3. `CompleteLogin(code, codeVerifier, replacesRefreshToken)`: validates the verifier (the code is consumed even if it fails), opens the account's session and ends the replaced guest's session in the same transaction.
- "State machine" = append-only events in `identity_login_attempt_events`: `started`, `answered`, `cancelled`, `failed`, `unavailable`, `code_issued`, `completed`, `rejected` (with `reason`). The current state lives in columns of `identity_login_attempts` (answered_at, login_code, completed_at...).

Levels: `anonymous < guest < account`. Catalog (`operationlevel`) [V]: `CREATE_SESSION` account, `JOIN_SESSION_AS_ADMIN` account, `JOIN_SESSION_AS_PLAYER` guest, `REPORT_CLIENT_TELEMETRY` guest, `VIEW_OWN_IDENTITY` guest, `SET_OWN_DISPLAY_NAME` guest, `CREATE_GAME` account, `EDIT_GAME` account, `CONNECT_AI` account. There are no roles or per-object permissions: each domain decides its own.

### 1.2 Exported surface (methods others call)

| Method | Type | Meaning |
|---|---|---|
| `Authorize` | read | token -> `User{UUID, DisplayName, Level}` + `allowed/unauthenticated/forbidden` |
| `ListOperations` | read | catalog |
| `CreateGuest` | write | guest + credentials |
| `Refresh` | write | renews credentials |
| `EndSession` | write | logout |
| `SetDisplayName` | write | display name |
| `StartLogin`/`HandleCallback`/`CompleteLogin` | write | account login |
| `CreateResourceLink`/`RevokeResourceLink` | write | secret link to a resource |
| `ResourceLinkStatus` | read | is there a live link? (never returns the link) |
| `ResolveResourceLink` | read | token -> user+kind+id (`valid/unknown/expired/revoked`) |
| `CreateResourceGrant`/`ClaimResourceGrant`/`ReleaseResourceGrant` | write | single-use grant |
| `RegisterClient`, `StartAuthorization`, `DecideAuthorization`, `ExchangeToken`, `Revoke`, `RevokeConnection` | write | AI OAuth |
| `ReadAuthorization`, `VerifyAccessToken`, `ListConnections` | read | AI OAuth |

### 1.3 Own data (14 tables) [V]

| Table | Key columns / purpose | Indexes / uniques / enums |
|---|---|---|
| `identity_users` | `user_uuid` (public), `display_name` NULL (new account without a name) | UNIQUE user_uuid |
| `identity_accounts` | `user_id` - "registered" marker | UNIQUE user_id |
| `identity_sessions` | one row per refresh token: `session_uuid`, `refresh_token` (in clear), `issued_at`, `started_at`, `expires_at` NULL (guest never expires), `deactivated_at`, `replaced_by_id` | UNIQUE refresh_token; partial UNIQUE `session_uuid` WHERE deactivated_at IS NULL; idx user_id |
| `identity_guest_requests` | guest idempotency: `idempotency_key`, `display_name`, `user_uuid`, `session_uuid` | UNIQUE idempotency_key |
| `identity_external_identities` | (`issuer`,`subject`)->`user_id`; `email`,`name` only observed | UNIQUE(issuer,subject); idx user_id |
| `identity_login_attempts` | `state`, `provider`, `code_challenge`, `nonce`, `provider_code_verifier`, `guest_user_id`, `answered_at`, `user_id`, `login_code`, `login_code_expires_at`, `completed_at` | UNIQUE state, UNIQUE login_code |
| `identity_login_attempt_events` | attempt change history (`event`, `reason`, `observed_email`, `observed_name`) | idx attempt_id |
| `identity_display_name_changes` | name change history (`from_name`,`to_name`) | idx user_id |
| `identity_resource_links` | `resource_kind`,`resource_id`,`token_sha256`,`expires_at`,`revoked_at` | UNIQUE token_sha256; partial UNIQUE (user_id,kind,id) WHERE revoked_at IS NULL |
| `identity_resource_grants` | `uuid`,`resource_kind`,`resource_id`,`scope`,`token_sha256`,`expires_at`,`used_at` (can be cleaned up on `Release`) | UNIQUE uuid, token_sha256; idx (user_id, expires_at) |
| `identity_ai_clients` | registered OAuth client (DCR): `client_id`, `redirect_uris` JSONB, `grant_types` | UNIQUE client_id |
| `identity_ai_authorization_requests` | consent request: `request_id`, `code_challenge`, `scope`, `resource`, decision (`decided_at`,`approved`), `code_sha256`, `code_expires_at`, `code_used_at` | UNIQUE request_id, code_sha256 |
| `identity_ai_sessions` | one connection per approved AI: `connection_id`, `revoked_at`, `revoke_reason` | `revoke_reason` in {`user`,`client`,`code_reuse`,`refresh_reuse`}; idx (user_id, created_at) |
| `identity_ai_refresh_tokens` | `token_sha256`, `expires_at`, `used_at` (rotation) | UNIQUE token_sha256; idx (session_row_id, created_at) |

- Change history: `identity_login_attempt_events`, `identity_display_name_changes` (append-only); write-once: `deactivated_at`, `replaced_by_id`, `revoked_at`, `used_at`, `decided_at`. Logins and events are kept forever (closing decision ADR-0003).
- Soft-delete: there is no `deleted_at`. Only `identity_resource_grants` expired more than 1 day ago are physically deleted (when creating another grant for the same user) [V].
- Secrets: only SHA-256 hashes of links, grants, codes and AI refresh tokens. The user refresh token (`phr_`) is stored as is [V].
- There is no queue/outbox table. There is no email or profile (the only "personal data" is the `email`/`name` observed from Google and `display_name`).

### 1.4 Cross dependencies
Imports: only `logging`, `monitoring`, `utils` [V]. Called by: `api` (authorization, login, guests, OAuth), `orchestrator/gameauthoring` (create/revoke AI link), `composer/gameauthoring` (`ResourceLinkStatus`), `api/games` (grants, link resolver). It does not import `game`/`play`; `game.ResourceKind="game"` is a convention that names the resource at call time (Identity does not know it is a game).

### 1.5 Integration ports
- `loginproviders.Provider` (`AuthorizationURL`, `Exchange`): **real Google** impl (`google.go`: PKCE S256, RS256 ID token verified, email only if verified; enabled by `GOOGLE_OAUTH_CLIENT_ID/SECRET/REDIRECT_URL`; **never verified against real Google** per doc, no environment configures it) and **fictitious local** (`local.go`, `IDENTITY_LOCAL_PROVIDER=true`, dev/test only, page to pick a name).
- There is no email, SMS, payments or storage port in identity.

### 1.6 Business limits [V]
| Limit | Value | Source |
|---|---|---|
| Access token | 15 min (claims: sub, exp, level, name) | const `accesstoken.Lifetime`; key `IDENTITY_ACCESS_TOKEN_KEY` (>=32 B, mandatory in prod) |
| Account refresh | expires after 30 d without use / 90 d from login; guests never expire | `refreshtoken` |
| Refresh rotation / predecessor grace | 5 h / 5 min | `refreshtoken` |
| Login attempt / code | 5 min / 60 s | `login` |
| Guest: key replay | 5 min | `createguest.ReplayWindow` |
| Guests per client IP | 200/hour | `api/identity/handler.go:97` (limit at the edge, not in the domain) |
| Display name | 64 runes | `displayname.MaxLength` |
| Resource link | 7 days; 1 open per user+resource | `resourcelink` |
| Resource grant | 15 min, **20 live per user** (`ErrTooManyResourceGrants`), scope <=256 B | `resourcegrant` |
| AI: access JWT / refresh / request / code | 1 h / 30 d / 10 min / 2 min; max 8 redirect URIs, name 100 runes | `aiauth` |
| AI scope | single `games` (read/create/change games; never publish) | `aiauth.ScopeGames` |

### 1.7 Work in progress / pending
- **Uncommitted WIP (resource grants)** [V via `git status`]: `identity/internal/business/resourcegrant/`, `identity/internal/migrations/20261107000000_identity_resource_grants.go`, `identity/usecases/resourcegrants/` (new), plus changes in `identity/identity.go` (types `CreatedResourceGrant`, `ClaimedResourceGrant`, `ErrTooManyResourceGrants`), `migration.go` (registration) and `CURRENT_STATE.md`. Its purpose: uploading game assets via single-use URL for AI agents (`api/games/asset_upload_url.go`, also new; `PUT /v1/asset-uploads/{token}`; MCP `request_asset_upload`). Functional and with doc/CHECKLIST already marked `[x]` (2026-11-07), only the commit is missing.
- Not implemented (doc "Identity Phase 2"): account screen, list/end sessions per device, real Google, retention of abandoned guests, signing key rotation, **identity reconciliation/merge** (login to an existing account from a guest = switches user without merging), revocation does not reach already-issued access tokens or open WebSockets.
- There are no roles/permissions, no MFA, no password, no other providers.

## 2. `game` (Game Management)

**Purpose** [V]: owner of the authoring lifecycle: Game (card: name, description, logo, photos, visibility), editions (each one = a Play version under construction), releases (publishing) and the "template" marker. It has no scripts or executable versions (those belong to Play). The root `game` package = contract (types, stdlib only).

### 2.1 Structure

| Package | Type | What it does |
|---|---|---|
| `usecases/checkplayability` | use case | `IsPlayable(game, user)`: published, not deleted and (public or the user's own); **wired** (used by `orchestrator/playlifecycle`) |
| `usecases/checkvisibility` | use case | `IsVisible(game)` by `visibility`; **not wired** in `main.go` [V: does not appear] |
| `usecases/findeditableversion` | use case | `FindEditableVersion(game, user)`: version of the open edition if the user is the owner; `found/not_found/not_editable`; returns `BaseVersionUUID` and `Template` |
| `usecases/findtemplate` | use case | `FindTemplate(game)`: published, not deleted, `template_allowed`; returns the most recent published version |
| `workflows/gamelifecycle` | workflow | See below |
| `workflows/gamecard` | workflow | Card: `ListGames`, `ReadCard`, `UpdateCard`, `UploadImage`, `RemoveImage` |
| `internal/business/{card, edition}` | rules | card text/images; edition states |
| `internal/businessservice` | legacy rules | `IsPlayableVisibility`, normalizes visibility (README says it is an old pattern) |

**Workflow `gamelifecycle`** (`Manager`, one `step_*.go` per step) [V]:
- `CreateGame(owner, name, idempotencyKey, template*)`: 1 transaction = claims `game_create_requests` + creates a private unpublished Game with a name + first `EDITING` edition (its uuid = the Play version's uuid); records the template in the request and the edition; conflict if the same key with a different name/template. Metric `game_create_total`.
- `BeginPublication(owner, game, revision, visibility, key)` -> `FindPublication`, `FindPendingPublication`, `CompletePublication(release, languages)`, `AbandonPublication(release, reason)`: creates `game_releases` (sequence per game, 1 pending per game), requires a name (`name_required`), only `public`/`private` visibility; completing = edition `EDITING->PUBLISHED` + `games.published_at` (once) + visibility + release `completed_at` with `languages`.
- `OpenEdition(owner, game, key)`: new `EDITING` edition of an already published game (not if there is an open edition or a pending release); idempotent by `game_edition_requests`.
- **States** [V]: edition `EDITING -> PUBLISHED` (immutable); release: pending (without `completed_at`/`abandoned_at`) -> `completed` | `abandoned` (with `abandon_reason`); `visibility` values: `draft`, `private`, `hidden`, `public` (only `private` and `public` get published; `draft`/`hidden` exist as constants, `Hidden` and `Public` are "playable" in `businessservice`, but `checkplayability` only accepts `public`/owner of `private`).

**Workflow `gamecard`**: text with limits (see 2.7); `UploadImage` cuts off by size, validates PNG/JPEG/WebP by bytes, records the intent in `game_card_objects` before saving to `games/card-images/<sha256>`, idempotent by key. Images are read with a signed URL (15 min) generated by the `imageStore` (`PresignGet`).

### 2.2 Exported surface
Writes: `CreateGame`, `BeginPublication`, `CompletePublication`, `AbandonPublication`, `OpenEdition`, `UpdateCard`, `UploadImage`, `RemoveImage`. Reads: `IsPlayable`, `IsVisible`, `FindEditableVersion`, `FindTemplate`, `FindPublication`, `FindPendingPublication`, `ListGames`, `ReadCard`.

### 2.3 Own data (10 tables) [V]

| Table | Key / purpose | Notable |
|---|---|---|
| `games` | `uuid`, `name`, `description`, `owner_uuid`, `visibility`, `published_at` (once), `template_allowed`, `template_featured` (bool, default false), `created_at/updated_at`, `deleted_at` | UNIQUE uuid. **`deleted_at` is only read as a filter; no code that writes it was found** |
| `game_histories` | history of `name`,`description`,`visibility`,`is_published` (only changed fields; creation = all) | append-only |
| `game_editions` | `uuid` (= Play version uuid), `game_id`, `status` (`EDITING`/`PUBLISHED`), `template_game_uuid`, `template_version_uuid`, `published_at` | partial UNIQUE 1 `EDITING` per game |
| `game_edition_status_changes` | edition status history | append-only |
| `game_create_requests` | idempotency: UNIQUE(owner_uuid, idempotency_key), `name`, `template_game_uuid`, `game_id` (once) | |
| `game_card_images` | displayed image: `kind` logo/photo, `sha256`, `object_key`, `removed_at` (once) | partial idx WHERE removed_at IS NULL; serves as image history |
| `game_card_objects` | registry of stored objects (recorded before uploading bytes): UNIQUE sha256, `deleted_at` | object-storage standard |
| `game_card_image_requests` | upload idempotency: UNIQUE(game_id, key) | |
| `game_releases` | `uuid`, `edition_id`, `sequence`, `revision`, `visibility`, `owner_uuid`, `idempotency_key`, `completed_at`, `abandoned_at`, `abandon_reason`, `languages` JSONB | UNIQUE(game_id,sequence), UNIQUE(game_id,key), partial UNIQUE 1 pending per game |
| `game_edition_requests` | open-edition idempotency | UNIQUE(game_id,key) |

No queue/outbox. No categories/tags in tables (only `discovery` has category types without data).

### 2.4 Cross dependencies
Imports: only `game` + `logging`/`monitoring`/`utils` [V]. Called by `orchestrator/gameauthoring` and `playlifecycle`, `composer/gameauthoring`, and directly by `api` (`gamecard` in `api.Games.Cards`, card read/edit without coordination). It does not know `play`: it only references the version by uuid.
Note on physical coupling: `gamecard.New(db, store)` receives the same GCS bucket that `play` uses (instance injected in `main.go`, no import).

### 2.5 Ports
`gamecard.imageStore` (`Put`, `PresignGet`): satisfied by `play/session/storage.Store` (real GCS / emulator / `Unconfigured` / in-memory fake in tests).

### 2.6 Business limits [V]
| Limit | Value | Source |
|---|---|---|
| Name / description | 80 / 2000 runes | `card.MaxNameRunes/MaxDescriptionRunes` |
| Photos per card | 8 (+1 logo) | `card.MaxPhotos` |
| Image size | logo 2 MiB, photo 5 MiB; PNG/JPEG/WebP by bytes | `card.MaxImageBytes` |
| Publish | name required | `card.PublishBlockers` |
| Pending release / open edition | 1 per game | partial indexes |
There is no cap on games per user nor any kind of quota in `game`.

### 2.7 Work in progress
- **Nobody writes `template_allowed`/`template_featured`**: grep in code and tests finds no write (only the column and the `WHERE` of `findtemplate`). The doc says "set only by seeds and tests"; the `game` seeds mark games as public but not as templates [V]. Today there is no way to create a template except manual SQL.
- `games.deleted_at` has no writer; `checkvisibility` not wired; visibilities `draft`/`hidden` have no flow.
- `game/CURRENT_STATE.md` contradicts the code (see Discrepancies).
- Seed: `seed_20261103000000_game_play_seed_games` registers Play's 4 seed games as published/public (owner `00000000-0000-4000-8000-000000000001`).

## 3. `play`

Folder (not a Go package): each subpackage exposes its contract at its root. Purpose [V]: `play/session` = **durable** state of Sessions, game versions, drafts, builds, previews, replays; `play/runtime` = **live** execution (one in-memory controller per Session, QuickJS sandbox, simulation, replay recording). Sources: `play/README.md`, `play/CURRENT_STATE.md`, ADRs 0028-0035 in `play/docs/decisions/`.

### 3.1 `play/session` - use cases

| Use case | What it does |
|---|---|
| `checkadminjoin` | `EligibleToJoinAsAdmin`: RUNNING or current LOBBY and the user is the creator |
| `checkplayerjoin` | `EligibleToJoinAsPlayer`: current LOBBY (RUNNING = `session_started`) |
| `checklivesession` | `CheckLiveSession`: live / not_found / ended / lobby_expired (requested by `ownership`) |
| `resolvejoincode` | `ResolveJoinCode` (case-insensitive): `found/expired/session_started/invalid` |
| `frontendaccess` | `FrontendAccess(session)`: signed URLs to the frontend package + assets, 1 batch per version shared across Sessions and instances (24 h; reused if it expires >5 min after `expires_at`) |
| `loadruntimemanifest` | manifest + input requirements of the Session's version |
| `loadsessionlimits` | Session deadlines (lobby, expires_at) |
| `recordgamefault` | one `game_fault` from a participant (RUNNING only, participant only) |
| `recordlimithits` | flushes the limits reached (`SERVER_LIMIT`) into `play_game_fault_reports` every 5 s |
| `storereplaychunk` | writes the chunk object and then registers it |
| `keepsimulationresults` | `KeepSimulationResult`, `FindSimulationResult`, `CountSimulations` |
| `readsdkguide` | `ReadPage`: SDK guide page from the toolchain checkout (<=256 KiB) |

### 3.2 `play/session` - workflows and batch

**`sessionlifecycle`** (`Manager`, steps): `CreateSession`, `CheckStartEligibility`, `CommitStart`, `EndSession`, `LoadRunningSession`, `RecordOwnerHeartbeat`, `SaveCheckpoint`.
- `CreateSession(user, game, key)`: 1 transaction: claims `play_create_session_requests` -> creator lock (advisory) -> counts active Sessions (current lobby or running) -> if `>= maxActive` ends with `active_session_limit` -> looks up the game's current version (nonexistent = `game_unavailable`; not executable = broken data + alert) -> creates a `LOBBY` Session + 6-character code (alphabet without 0/O/1/I/L, max 10 attempts) -> completes the request. Metric `play_session_create_total{outcome}`.
- `CommitStart`: roster P1..Pn + initial checkpoint + `RUNNING` + releases codes, 1 transaction. `EndSession(cause, changedBy)`: the only path to a terminal state.
- **Session state machine** [V] (`sessionstatus`, `endcause`): `LOBBY -> RUNNING`; terminal `FINISHED`, `CANCELLED`, `EXPIRED`, `ABORTED`. Cause -> state (from): `GAME_FINISHED`->FINISHED (RUNNING); `HOST_CANCELLED`->CANCELLED (LOBBY,RUNNING); `ALL_PLAYERS_LEFT`->CANCELLED (RUNNING); `PLATFORM_TERMINATED`->CANCELLED (LOBBY,RUNNING); `LOBBY_EXPIRED`->EXPIRED (LOBBY); `INACTIVITY_TIMEOUT`->EXPIRED (RUNNING); `MAX_LIFETIME`->EXPIRED (LOBBY,RUNNING); `GAME_START_FAILURE`->ABORTED (LOBBY); `SCRIPT_FAILURE`, `UNRECOVERABLE_INFRA_FAILURE`, `OWNER_LOST`->ABORTED (RUNNING).

**`versiondrafting`** (source drafts of a `DRAFT` version, `Manager`): `CreateDraftVersion`, `ApplyChanges`, `ApplyTemplate`, `RestoreRevision`, `ReadDraft`, `ListRevisions`, `RevisionChanges`, `DiffRevisions`, `UploadAsset`, `RemoveAsset`, `ReadBuild` (long poll <=20 s), `LoadBuiltRevision`, `SignBuiltFrontend`, `CheckPublication`, `FreezeVersion`, `CleanUnusedObjects`.
- Change (`ApplyChanges`) in 1 transaction: claims the attempt (idempotency by key + request hash) -> decides `not_editable` / `conflict` (base != current, optimistic) / `invalid` (diagnostics by path) / `unchanged` / `applied` (next revision, enqueues build, marks the version's earlier `QUEUED` builds as `SUPERSEDED`). Supports `Edits` (find/replace with unified diff).
- Asset upload: in-memory slot (4 per instance, waits 2 s, `ErrUploadsBusy`) -> reads with a cutoff at the type's limit, hash, real type by bytes -> registers in `play_asset_objects` -> stores content-addressed -> links the key in a new revision.
- **Version state machine** [V]: `DRAFT -> EXECUTABLE` via `FreezeVersion` (immutable, `play_games.current_version_id` points to it; `already_frozen` idempotent; `revision_changed` if the draft moved). A game has at most 1 `DRAFT` (partial index).
- Revision: `kind` template/edition/change/restore/asset; `actor` person/ai/platform; `origin` web/api/mcp (NULL if made by the platform). Attempts: `change`, `restore`, `asset_upload`, `asset_removal`, `template`.
- Publication blockers: `build_not_for_current_revision`, `build_not_succeeded`, `missing_required_assets`, `revision_changed`.

**`versionbuilding`** (build worker): `Run`, `RequeueInterrupted`, `RunNextBuild`. Queue = table `play_game_version_builds` (`FOR UPDATE SKIP LOCKED`, partial index of `QUEUED`); 1 worker per instance (`DefaultWorkers=1`), woken by `buildsignal` and every 5 s. **Build states** [V]: `QUEUED -> RUNNING -> SUCCEEDED | FAILED`; `QUEUED -> SUPERSEDED`; `RUNNING -> QUEUED` only on restart. Reuses a successful build with the same `inputs_sha256`; builds via port `gamebuild.Builder`, validates with `scriptcheck` profile `sdk-v1` and manifest parser; an infrastructure failure = `infrastructure` stage, never blamed on the game.

**`previewlifecycle`**: `OpenPreview`, `EndPreview`, `FindPreview`. Previews of a `SUCCEEDED` build, 1 per game (partial index `ended_at IS NULL`; opening one replaces the previous one as `replaced`). End reasons: `finished`, `idle`, `ended_by_owner`, `replaced`, `script_failure`, `unavailable`.

**Batch `batches/reconcilesessions`** (`Run` every 5 min on every instance; `ReconcileSessions`): ends expired lobbies (`LOBBY_EXPIRED`), RUNNING past `expires_at` (`MAX_LIFETIME` or `GAME_FINISHED` if the replay ended finalized) and RUNNING with expired `owner_lease_expires_at` (`OWNER_LOST`); pages of 100, `lock_timeout` 5 s.

### 3.3 `play/runtime`

| Piece | What it does |
|---|---|
| `workflows/liveconnection` | `ControllerResolver` (`AttachAdmin`, `AttachPlayer`, `TerminateSession`, `Close`) and `Previews` (`StartPreview`, `AttachPreview`). The controller (one main goroutine per Session) runs lobby admission, SAMPLEs, COMMANDs, start, 100 ms ticks, retries, checkpoints (every >=5 s), lazy recovery, reattach/rejoin/leave, disconnection with 3 s transport grace, limit audit, Session end. One `step_*.go` per operation (36 files) |
| `workflows/replayrecording` | `Recorder` (`StartRecording`, `Offer`, `Finish`, `StopRecording`, `Close`): `REPLAY_CHUNK_DURATION` (60 s) zstd chunks; bounded queue per instance (`REPLAY_MAX_PENDING_CHUNKS`=64, 5 attempts) |
| `usecases/ownership` | `LocateOrClaimOwner`, `ReleaseOwner`: **placeholder** (always `owned_here`, epoch 1, no registry) |
| `usecases/simulategame` | `Simulate`, `Result`, `ReadState`: plays a `playhoot.scenario.v1` scenario on a virtual clock over a build's script, without a controller |
| `usecases/limitaudit` | `Hit`, `Run`, `Flush` |
| `sandbox` | `Host`: one worker process per context (re-exec of the binary), QuickJS-WASM without host capabilities; `scriptcheck` validates scripts (profiles `handwritten`, `sdk-v1`) |
| `replay` | contract of what a running game offers the recorder |
| `internal/business/{boundaryplan, checkpoint, gamemanifest, jsonpatch, livelimits, viewpatch}` | pure logic shared by controller/simulation |
`play/internal/business/{commands, inputs, inputrequirements, scenariodoc}`: rules shared by runtime/session.
Live contract (`play/runtime/runtime.go`): `AdminConnection` and `PlayerConnection` are structs of functions (`StartSession`, `CancelSession`, `SelectPerspective`, `Sample`, `Command`, `Leave`, `Resync`, `ReportGameFault`, `NextView`, `NextLobbyUpdate`, `Started`, `Ended`, `Disconnect`...). Participant presence: `active/reconnecting/disconnected/left` (not persisted).

### 3.4 Exported surface (summary)
- Durable writes: `CreateSession`, `CommitStart`, `EndSession`, `SaveCheckpoint`, `RecordOwnerHeartbeat`, `RecordGameFault`, `RecordLimitHits`, `StoreReplayChunk`, `KeepSimulationResult`, all write operations of `versiondrafting`, `OpenPreview`, `EndPreview`.
- Reads: `CheckStartEligibility`, `LoadRunningSession`, `EligibleToJoin*`, `CheckLiveSession`, `ResolveJoinCode`, `FrontendAccess`, `LoadRuntimeManifest`, `LoadSessionLimits`, `ReadDraft`, `ListRevisions`, `RevisionChanges`, `DiffRevisions`, `ReadBuild`, `LoadBuiltRevision`, `CheckPublication`, `FindPreview`, `FindSimulationResult`, `ReadPage`.
- Live: `AttachAdmin`, `AttachPlayer`, `StartPreview`, `AttachPreview`, `LocateOrClaimOwner`, `Simulate`.

### 3.5 Own data (23 tables, all `play_`) [V]

| Table | Purpose / key columns | Notable indexes / enums |
|---|---|---|
| `play_games` | game as seen by Play: `game_uuid`, `current_version_id` | UNIQUE game_uuid |
| `play_game_versions` | `uuid`, `status` (`DRAFT`/`EXECUTABLE`), `manifest` JSONB, script/frontend locators (key,sha256,size), `script_profile`, `aspect_ratio`, `languages`, `current_revision`, `executable_at` | partial UNIQUE 1 DRAFT per game; idx script/frontend sha256 |
| `play_sessions` | `uuid`, `game_version_id`, `created_by_user_uuid`, `status`, `end_cause`, `lobby_expires_at`, `expires_at`, `owner_lease_expires_at` | 3 partial indexes by deadline (lobby / running expiry / owner lease) |
| `play_session_join_codes` | `code`, `expires_at`, `released_at` | partial UNIQUE `code` WHERE released_at IS NULL; idx (code,id) |
| `play_session_status_changes` | status history (`from/to_status`, `end_cause`, `changed_by_user_uuid` NULL=platform) | append-only |
| `play_session_participants` | roster at start: `user_uuid`, `participant_id` (P1..), `display_name` | UNIQUE(session,participant_id), UNIQUE(session,user_uuid) |
| `play_session_checkpoints` | latest checkpoint (`content` BYTEA, `context_revision`) | UNIQUE session_id (overwritten) |
| `play_replays` | replay manifest per Session (`final_session_time_ms`, `finalized_at`) | UNIQUE session_id |
| `play_replay_chunks` | stored chunk (`recording_uuid`, `chunk_index`, times, `final`, `object_key`, `sha256`) | UNIQUE(recording_uuid, chunk_index) |
| `play_create_session_requests` | idempotency: UNIQUE(user_uuid, key), `game_uuid`, `outcome`, `session_id` | |
| `play_game_fault_reports` | audit: `source` CLIENT/SERVER, `kind`, `detail` JSONB, `occurrences`; insert only | kinds: ARTIFACT_UNREACHABLE, ARTIFACT_HASH_MISMATCH, READY_TIMEOUT, UNSUPPORTED_BRIDGE_VERSION, CONTAINER_VIOLATION, BRIDGE_ABUSE, INVALID_SAMPLE, INVALID_COMMAND, SERVER_LIMIT |
| `play_game_version_assets` | assets by logical key (`type` image/audio/video, `mime_type`, `object_key` NULL = no longer exists) | UNIQUE(version,key) |
| `play_game_version_signed_urls` | current batch of signed URLs per version | UNIQUE game_version_id |
| `play_game_version_input_requirements` | `uses_keyboard`, `uses_pointer_hover`, `uses_pointer_press`, `devices` (`desktop`/`mobile` reserved/`both`) | UNIQUE version; idx (devices, version) |
| `play_game_version_revisions` | source revisions: `number`, `files` JSONB, `assets` JSONB, `kind`, `origin`, `actor`, `parent_revision`, `restored_from`, `from_*`, `sdk` | UNIQUE(version, number); write-once = history |
| `play_source_files` | file content by hash (shared) | UNIQUE sha256 |
| `play_game_version_change_attempts` | attempts with idempotency: `idempotency_key`, `request_sha256`, `base_revision`, `origin`, `outcome`, `diagnostics` | UNIQUE(version, key); idx recent |
| `play_asset_objects` | asset objects registered before upload: `sha256`, `mime_type`, `width`, `height`, `duration_ms` (NULL if unknown), `deleted_at` | UNIQUE sha256; cleanup idx |
| `play_game_version_builds` | build per (version, revision): `status`, `inputs_sha256`, `toolchain_version`, `diagnostics`, artifacts, `manifest`, `aspect_ratio`, `languages`, `uses_*`, `reused_build_id` | UNIQUE(version,revision); partial idx `QUEUED` (queue); idx (version, inputs) |
| `play_game_version_build_status_changes` | build status history | append-only |
| `play_build_artifact_objects` | artifacts registered before upload; `deleted_at` | UNIQUE sha256 |
| `play_previews` | `uuid`, `revision`, `owner_user_uuid`, `participants`, `expires_at`, `ended_at`, `end_reason` | partial UNIQUE 1 live preview per version |
| `play_simulation_results` | JSONB result per simulation, lifetime 30 min (record kept 7 days for counting) | idx by expiration |

- Change history/"data trailing": `play_session_status_changes`, `play_game_version_build_status_changes`, write-once revisions, `play_game_fault_reports`. Documented exception: `owner_lease_expires_at` is overwritten without history; high-frequency live data = checkpoints + replay, not rows.
- **Queue**: `play_game_version_builds` acts as a job queue (poll + `SKIP LOCKED`); there is no generic txqueue/outbox/dead-letter table. Replay chunks use an **in-memory** queue per instance (the oldest are dropped if it fills up).
- Soft-delete: there is none; `deleted_at` in object tables marks deletion of bytes (cleanup), not of entities; asset deletion = row with `object_key` NULL.
- Seeds (`seed_*`): 4 test games with EXECUTABLE versions (Seed game `1111...`, Space Drift `3333...`, Parques `4444...`, Tap Race `5555...`), one "unavailable" game `2222...`.

### 3.6 Cross dependencies
Imports: only `play`+`logging`+`monitoring`+`utils` [V]. **It does not import `game` or `identity`**: it receives `userUUID`/`gameUUID` as strings; the display name is built by the API (`runtime.Player`). Called by `orchestrator` (`playlifecycle.CreateSession`, `gameauthoring`: drafts, previews, publish/freeze), `composer/gameauthoring` (draft/build reads, `simulategame`), and **directly by `api`** (liveconnection, ownership, `resolvejoincode`; without going through orchestrator/composer because they are single-domain operations). `main.go` wires everything.

### 3.7 Integration ports
| Port | Impls |
|---|---|
| `objectstore.Store` (`Get`,`Put`,`PresignGet`,`Delete`) (`play/session/internal/objectstore`, opened by `play/session/storage.Open`) | real GCS (supports emulator via `STORAGE_EMULATOR_HOST`), `Unconfigured` (fails every call if there is no `GCS_*`), in-memory fake; `storetest/contract.go` |
| `gamebuild.Builder` (`Version`, `Build`) | real Node (process `packages/game-tools/src/cli.ts build`, timeout 60 s, 512 MiB heap, from `GAME_TOOLCHAIN_DIR`), `Unconfigured` (builds fail as `infrastructure`), fake in tests |
| Sandbox | a single engine: QuickJS-WASM (wazero) in workers; no alternate port [V that there is no visible replacement interface; I] |
| AI / email / payments | **none**: there are no calls to LLM providers from the backend; AI is an external client that enters via MCP/OAuth/AI link |

### 3.8 Business limits [V unless noted]
| Limit | Value | Origin |
|---|---|---|
| Active Sessions per creator | **1** by default | `PLAY_MAX_ACTIVE_SESSIONS_PER_CREATOR` (env; the doc says it will later depend on subscription) |
| Lobby TTL / join code | 30 min / 6 characters | const `defaultLobbyTTL` |
| Maximum Session lifetime | 4 h | `sessionlifetime.Max` |
| Inactivity (RUNNING without a distinct SAMPLE or COMMAND) | 10 min | runtime |
| Owner lease | 10 min, heartbeat every 30 s | `defaultOwnerLease` |
| Live Sessions per instance | 500 (`server_busy`) | `RUNTIME_MAX_LIVE_SESSIONS` |
| Admins per Session | 8 | `liveLimits` |
| SAMPLEs per participant | 120/s and 3600/min | `livelimits` |
| COMMANDs participant / Session | 10/s,120/min / 60/s,600/min; 4 pending per participant | `livelimits` |
| Timeline queue | 128 per participant, 2048 per Session; 256 ops per boundary | `livelimits` |
| Boundaries | 25/s and 1200/min; tick 100 ms | `livelimits` |
| COMMAND tokens remembered | 1000 per participant | runtime |
| Sandbox | 64 MiB memory, 1 MiB stack, 5 s per call; `SANDBOX_MAX_CONTEXTS` (32), `SANDBOX_MAX_CONCURRENT_EXECUTIONS` (CPUs) | sandbox |
| Previews | 50 per instance, 1 per game, 10 min idle | `DefaultMaxLivePreviews` |
| Simulations | 10 min of game time, 2000 steps, 50 observations, 10 s real time, 8 MiB, 2 at a time per instance | simulategame |
| Draft sources | 100 files, 256 KiB per file, 2 MiB total | `draftsources` |
| Assets | image 5 MiB, audio 10 MiB, video 50 MiB; 100 MiB per version; 4 in-memory uploads per instance | `gameversion` |
| Aspect ratios offered | 16:9, 9:16, 4:3, 3:4, 1:1 (1080 on the short side) | `aspect_ratio.go` |
| Builds | 1 worker per instance | `DefaultWorkers` |
| Replay | chunk 60 s; 64 pending | env `REPLAY_*` |
There are no per-user quotas on games, builds, previews or daily simulations (except the count of simulations per version, `CountSimulations`, with no cap [V that no cap is applied in `play`]).

### 3.9 Work in progress / placeholders [V per `play/CURRENT_STATE.md` and code]
- `ownership` (owner registry, shared lease) placeholder; `ReleaseOwner` does nothing; **only a single instance is supported**.
- `ControllerResolver.TerminateSession` is ready but nobody calls it (human's decision).
- Replay: producer side only; **there is no playback or retention policy**.
- Persistence of participant presence in checkpoints: no.
- `game_fault` only audits; nothing reads it or flags games.
- `sandbox/scriptcheck` is already used in the build (`sdk-v1`); its `handwritten` profile has no caller in publishing.
- Devices: `mobile` reserved; there is no game directory filterable by `devices`.
- Empty directories (local leftovers, git does not track them): `play/session/workflows/sessionlifecycle/internal/{activity,completion,expiration,platform,timers,visibility}` [V].
- Uncommitted WIP in Play (same asset change for agents): new `play/session/asset_limits.go`, `internal/business/gameversion/asset_media.go` (+test); modified `drafting.go`, migration `20261102000000_play_draft_assets.go` (columns `width/height/duration_ms` edited in place), `versiondrafting` (repo/assets, `step_read_draft`, `step_upload_asset`, tests), `play/CURRENT_STATE.md`. Media measurements (PNG/JPEG/WebP/SVG/WAV/MP4/Ogg/MP3/WebM) read from headers on upload.
- Storage in production: no bucket or CORS configured "in any environment" [D].

## 4. `discovery`
**Purpose** [V]: README declares reviews, a public game catalog replicated from `game`, and statistics. **Real today**: only template catalog types (`discovery/templates.go`: `TemplateEntry`, `TemplateCategory`, `TemplateQuery`, `TemplatePage`, `MaxTemplatesPage=20`) and `usecases/templatecatalog.Service` (`Featured`, `Categories`, `Search`), which **return empty lists** ("step 2": replicate templates, featuring, categories and search, not yet).
- Tables: none. Imports: only `discovery`+`logging`. Called by `composer/gameauthoring` (`BrowseTemplates`, `SearchTemplates`) and by `api/games` + `api/mcp`.
- Reviews, public catalog replication, statistics: absent.

## 5. `composer` (cross-domain reads)
Real, stateless and without tables. One `gameauthoring` group (`Manager`): each read first asks Game Management whether the user can edit (`FindEditableVersion`) and only then reads Play; a version Play does not have yet = `Missing` (the API asks the orchestrator for `EnsureDraft` and rereads).
Methods (all reads, except that `SimulateDraft`/`SimulateSavedScenarios` execute code but do not persist, except via `keepsimulationresults`): `AILinkStatus`, `ReadDraft`, `ListDraftRevisions`, `ReadDraftChanges`, `ReadDraftDiff`, `ReadDraftBuild`, `SimulateDraft`, `SimulateSavedScenarios` (up to 10), `ReadSimulationState`, `BrowseTemplates`, `SearchTemplates`, `InspectTemplate` (card + manifest + brief + declared config, never the code), `ReadTemplateFiles`.
Imports: `game`, `play` (session and runtime), `identity`, `discovery`. It is the only place (along with orchestrator) where domains coexist; **there is no domain->domain import outside composer/orchestrator/api/main** [V].

## 6. `orchestrator` (cross-domain writes)
Real, **with no state of its own and no tables**; idempotency and retries are handled by the domains (key passed through). No queue, no persisted saga: "on demand" repair (decision 2026-11-02: no background job). Metrics `orchestrator_game_authoring_draft_repairs_total{outcome}`, `..._releases_resumed_total`, `..._cleanup_failures_total`.

| Group / operation | Steps |
|---|---|
| `playlifecycle.CreateSession` | 1) Game: `IsPlayable(game,user)` (no -> `game_unavailable`) 2) Play: `CreateSession` (propagates `ErrIdempotencyConflict`) |
| `gameauthoring.CreateGame` | (optional `FindTemplate`) -> Game `CreateGame` -> Play `CreateDraftVersion(game, version, start)`; retry with the same key completes what was missing |
| `ApplyDraftChanges`, `RestoreDraftRevision`, `UploadDraftAsset`, `RemoveDraftAsset`, `UseTemplate` | Game `FindEditableVersion` (authorizes) -> Play write; if Play does not have the version (`ErrDraftNotFound`) it creates it and repeats once |
| `EnsureDraft` | authorization only + creation if missing (for composer reads) |
| `StartPreview` | authorize+repair -> Play `StartPreview` |
| `CreateAILink` / `RevokeAILink` | Game decides whether the caller is the owner -> Identity creates/revokes link (kind `game`) |
| `Publish` | 0) resumes pending release 1) (optional) renames card 2) `FindEditableVersion` 3) Play `CheckPublication` 4) Game `BeginPublication` 5) Play `FreezeVersion` 6) Game `CompletePublication` (or `AbandonPublication` if Play rejects) 7) `CleanUnusedObjects` best effort |
| `OpenEdition` | resumes pending release -> Game `OpenEdition` -> Play `CreateDraftVersion(from=base)` |

Imports: `game`, `identity` (3), `play` [V]. The orchestrator README says (outdated) that the Game side of `CreateSession` is a placeholder; the code uses the real `checkplayability`.

## 7. Technical and empty packages
- **`utils`**: `RunInDBTransaction[T]`, `DBServicer`, `DisposableTestDB` (disposable test DB), `ratelimit` (`Limit{Count,Per}`, limiter with several windows; used by `api` and `play/runtime`). No state or transport.
- **`logging`**: structured request log by steps/fields/loops, trace/span id; used in all domains.
- **`monitoring`**: `Alert(ctx,msg)` = `alert_msg` field in the log + `fmt.Println` (TODO: real system); `monitoring/metrics` = `Counter/Gauge/Histogram/Label`, each measurement is written to the request log (TODO: metrics backend). `alerts.go` and `instrument.go` are the two production `TODO`s in these packages.
- **`third_party/qjs`**: patched fork (`PLAYHOOT_PATCH.md`): no host directory mounting, fake (deterministic) wazero clock/randomness, fixes for use-after-free and C string leak; upstream `qjs.wasm` unchanged.
- **`community`**, **`profile`**, **`sessionhistory`**: folders with only `README.md`, zero Go. `ARCHITECTURE.md` lists them as "unresolved boundary questions" together with `discovery`.
- **`local`**: GCS emulator data files (buckets `playhoot-dev`, `playhoot-test`); not code.
- **`plans`**: `.docx` plan documents; not code.

## 8. Migrations (all, by timestamp)

Actual execution order: `game` (4) -> `play/session` (10) -> `identity` (8); then `game` and `play` seeds outside production. Each one is a single gormigrate migration in `internal/migrations` or `internal/storage/migrations`.

| # | Domain | ID | Tables it creates |
|---|---|---|---|
| 1 | game | `20260822000000_games` | `games` (includes `template_allowed/featured` edited in place) |
| 2 | game | `20260822000003_game_histories` | `game_histories` |
| 3 | play | `20261015000000_play_sessions` | `play_games`, `play_game_versions`, `play_sessions`, `play_session_join_codes`, `play_session_status_changes`, `play_session_participants`, `play_session_checkpoints`, `play_replays`, `play_replay_chunks`, `play_create_session_requests` |
| 4 | play | `20261023000000_play_game_fault_reports` | `play_game_fault_reports` |
| 5 | play | `20261026000000_play_game_version_assets` | `play_game_version_assets` |
| 6 | play | `20261026100000_play_game_version_signed_urls` | `play_game_version_signed_urls` |
| 7 | play | `20261028000000_play_game_version_input_requirements` | `play_game_version_input_requirements` |
| 8 | identity | `20261029000000_identity_core` | `identity_users`, `identity_accounts`, `identity_sessions`, `identity_guest_requests` |
| 9 | identity | `20261029010000_identity_logins` | `identity_external_identities`, `identity_login_attempts` |
| 10 | identity | `20261029020000_identity_trails` | `identity_login_attempt_events`, `identity_display_name_changes` (+ alters users/external_identities) |
| 11 | identity | `20261029030000_identity_guest_link` | column `identity_login_attempts.guest_user_id` |
| 12 | identity | `20261031000000_identity_provider_pkce` | column `provider_code_verifier` |
| 13 | game | `20261101000000_game_editions` | `game_editions`, `game_edition_status_changes`, `game_create_requests` |
| 14 | play | `20261101100000_play_draft_versions` | `play_game_version_revisions`, `play_source_files`, `play_game_version_change_attempts` |
| 15 | identity | `20261102000000_identity_resource_links` | `identity_resource_links` |
| 16 | play | `20261102000000_play_draft_assets` | `play_asset_objects` (modified uncommitted: width/height/duration_ms) |
| 17 | play | `20261102200000_play_draft_builds` | `play_game_version_builds`, `play_game_version_build_status_changes`, `play_build_artifact_objects` |
| 18 | play | `20261102300000_play_previews` | `play_previews` |
| 19 | game | `20261103000000_game_publishing` | `game_card_images`, `game_card_objects`, `game_card_image_requests`, `game_releases`, `game_edition_requests` |
| 20 | identity | `20261103100000_identity_ai_authorization` | `identity_ai_clients`, `identity_ai_authorization_requests`, `identity_ai_sessions`, `identity_ai_refresh_tokens` |
| 21 | play | `20261106000000_play_simulation_results` | `play_simulation_results` |
| 22 | identity | `20261107000000_identity_resource_grants` | `identity_resource_grants` (**uncommitted**) |

Seeds: `seed_20261103000000_game_play_seed_games` (game); `play` seeds: `20261015000000_play_games`, `20261018000000_space_drift`, `20261020000000_space_drift_frontend`, `20261020100000_parques`, `20261026000000_space_drift_assets`, `20261028000000_input_requirements`, `20261101000000_tap_race` (+ `SeedObjects` uploads scripts/packages to the bucket if there is a bucket).
Total: 47 domain tables (identity 14, game 10, play 23) + gormigrate's `migrations`.

## 9. Dependency map (who calls whom) [V]

```
api ──► identity (authorize, guests, refresh, logins, oauth, grants, links)
api ──► game/workflows/gamecard (card), play/runtime (live, ownership), play/session/usecases/resolvejoincode
api ──► orchestrator/{playlifecycle, gameauthoring}  (writes)
api ──► composer/gameauthoring                       (reads)
orchestrator ──► game, play/session, identity (narrow interfaces declared in each operation)
composer     ──► game, play/session, play/runtime/simulategame, identity, discovery
identity | game | play | discovery ──► only logging, monitoring, utils
```
Orchestration of `play/session` and `game` never call each other. Exceptions to "everything goes through orchestrator/composer": single-domain calls from `api` (by design in `ARCHITECTURE.md`), and the shared GCS bucket injected by `main.go` into `gamecard` and into the Play workflows.

## 10. Global concepts: exists / partial / absent

| Concept | Status | Where / what |
|---|---|---|
| Notifications (email/push/in-app) | **absent** | grep with no results; email is only observed from the Google login |
| Reports / cases (user complaints) | **absent** | `play_game_fault_reports` exist (technical game faults, audit) and client telemetry in `api/clienttelemetry` (another agent); there is no content reporting or cases |
| Plans / subscriptions / payments / credits | **absent** | zero code; only a comment "limit may depend on subscription" on `PLAY_MAX_ACTIVE_SESSIONS_PER_CREATOR` |
| Classroom (classes/students/grades) | **absent** | only mentions in API comments about classroom shared IPs |
| Platform admin / backoffice | **absent** | "admin" = the creator who controls a Session (`JOIN_SESSION_AS_ADMIN`), not a platform role; Identity has no roles |
| txqueue / dead-letter / outbox | **absent** | partial queues: builds table as a work queue (`play_game_version_builds`), in-memory queue of replay chunks; no DLQ |
| Moderation / publication review | **absent** | publishing is automatic if there is a name + OK build + required assets; no "in review" state, no reviewer |
| Categories / tags | **partial** | types (`TemplateCategory`, `Categories` field of `TemplateEntry`) and search UI/MCP; **no table or data**, `templatecatalog` returns empty |
| Templates | **partial** | functional end-to-end except the source: `games.template_allowed/featured`, `findtemplate`, `CreateGame(template)`, `UseTemplate`/`ApplyTemplate`, `composer.InspectTemplate`; **nothing marks a game as a template** and the catalog is empty |
| Asset libraries | **partial** | assets live per version (`play_game_version_assets`, `play_asset_objects` shared by hash across games); no reusable library shareable per user nor catalog |
| Replay / session history | **partial** | producer recording complete (`play_replays`, `play_replay_chunks`, objects in bucket); **no playback, no retention**; `sessionhistory` empty; Session status history in `play_session_status_changes` |
| Analytics / event outbox | **absent** | metrics only to the log (no backend); `sessionhistory` (metrics/analytics) empty |
| Rate limiting | **exists** | `utils/ratelimit` (multi-window) used in `play/runtime` (`livelimits`) and `api` (throttle by IP/user, WS lanes, guests 200/h, URL uploads); per-user business caps: 1 active Session, 20 live grants |
| User profile / community / public game discovery | **absent** | `profile`, `community` only README; `discovery` only a template stub; no public game catalog or reviews |
| Data change history ("data trailing") | **exists** | standard `data-history.md`; `*_changes`/`*_events`/write-once tables described above |
| Command idempotency | **exists** | `*_requests`/`*_attempts` tables in all three domains + `ErrIdempotencyConflict` |
| Logical deletion | **partial** | `games.deleted_at` read but never written; no deletion of users/games |

## 11. Doc/code discrepancies (code wins)
1. `game/CURRENT_STATE.md`: says "no cross-domain caller", "`checkvisibility` unwired", and in the Game lifecycle row "Publishing/new edition not implemented, not wired to API/orchestrator". Code: publishing and `OpenEdition` are implemented, `gamelifecycle`/`findeditableversion`/`findtemplate`/`checkplayability` are wired in `main.go`, and orchestrator and composer use them. Only `checkvisibility` remains unwired.
2. `game/CURRENT_STATE.md` (Templates): "`template_allowed/featured` set only by seeds and tests". No write was found in seeds or tests.
3. `orchestrator/README.md`: "Game Management's side is a placeholder that always answers playable". Code: real `checkplayability.IsPlayable` (published + visibility/owner).
4. `play/README.md`: "`objectstore` ... not wired, storetest does not build". `main.go` opens `storage.Open` and injects it into Sessions, versiondrafting, versionbuilding, gamecard, replay. (`storetest` was not compiled.)
5. `play/CURRENT_STATE.md` and repo (AGENTS.md, KNOWLEDGE_MAP, ADR index): talk about `session/`; the code lives in `play/` (drift already declared).
6. `play/CURRENT_STATE.md` (Sandbox): "scriptcheck ... nothing calls it yet" appears in the Sandbox row; the build uses it with profile `sdk-v1` (other rows say so).
7. `ARCHITECTURE.md` lists as accepted domains only Game Management, Session Runtime and Identity and says "No Infrastructure Service currently exists"; `discovery`, `community`, `profile`, `sessionhistory` are "unresolved questions". Consistent with the code (discovery stub, the others empty).
8. `identity/CURRENT_STATE.md`: describes the 8 migrations and grants; the code matches, but grants and their migration are uncommitted.
