# State

_Updated: 2026-11-16, closing of T-303 (deletion and guest expiry)._

## Next task

**T-304** · model **Opus** · effort **medium** · Frontend: the email code and the acceptance step
on the contextual sign-in screen, and the contextual declaration screen the gated flows route to.
Size **M**. Frontend only. Read `tasks/T-304.md` first; the design it builds is the `planned`
frontend site data plus `DECISIONS.md` D-030, D-033, D-037, D-038 and V-09.

## Current milestone

**H3 — Identity and access**, designed by T-300 (16-nov-2026). Board in `PLAN.md`: T-301, T-302,
T-303 (done) → T-304 → T-305 (frontend) → T-306 (admin panels, C-tier) → T-307 (close).
Decisions D-033…D-041, defaults V-09…V-12. Site data: 456 entities, validator at 0.

## Open questions for the creator

None to decide. What the creator still has to *do* is in `CREATOR_TODO.md`:

- **P-13** — try the PWA on a real Android phone and a real iPhone (steps in `tasks/T-202.md`).
- **P-14 / P-15** — real app icons and the final mascot; drop-in replacements, nothing blocks.
- **P-16** — recreate the local `playhoot` database once. **Required again by T-302**, which
  edited identity's migrations in place: `identity_users.interface_language`,
  `identity_accounts.mode` and the new `identity_setting_changes`, on top of T-301's columns.
  **Required again by T-303**, which edited identity's core migration in place once more
  (`identity_users.deleted_at` / `deleted_origin`, `identity_sessions.last_used_at` and three new
  indexes) and added an owner index to `games` and a user index to `play_session_participants`.
  `playhoot_t205`, `playhoot_t301` and `playhoot_t303` are all stale with respect to each other;
  create a fresh sibling database before running the backend (the command is under "Running a live
  backend"). `playhoot_t303` matches the migrations as of this task and can be reused until the
  next in-place edit.
- **P-23** — the real acceptance texts. The endpoints that publish them exist since T-302
  (`GET/PUT /admin/v1/texts`, admin level); T-306 builds the panel in front of them.

## Notes for the next session

- **Design conventions this milestone uses.** New entities are `planned`; changed built entities
  keep their status and mark the planned pieces with "(H3, planned)" notes — the implementing task
  removes the notes when it moves things to `implemented` and corrects whatever building teaches.
  A gated flow's refusal `declaration_required` and the `/declaration` screen pattern are D-038.
- **What T-303 left in place** (details in D-041): deletion is complete on the backend and the
  frontend has nothing for it yet — the screen that asks for it is T-305's, and `GET /v1/me` is
  what it reads. `POST /v1/identity/me/delete` needs only a guest credential and answers
  `{"deleted": true}` whatever it found. A deleted uuid still resolves: `read-profile` answers a
  profile with no name, and the interface shows the neutral deleted reference — that wording is a
  frontend text, not a backend value. `account-cleanup` is a `txqueue` delivery type: H5, H6 and
  H8 append their steps inside `orchestrator/accountcleanup`, they do not add queues.
- **Identity surfaces that now exist.** `identity/usecases/readprofile` (lists methods through
  `signinmethods`), `setmode`, `setlanguage`, `deleteuser`, `expireguests`; `composer/mydata`
  behind `GET /v1/me`; `compliance/usecases/readdeclaration` and `admintexts`. A new operation goes
  in `identity/internal/business/operationlevel` **and** in its test's expected catalog — the
  catalog now holds `SET_OWN_MODE`, `SET_INTERFACE_LANGUAGE`, `MANAGE_TEXTS` and
  `DELETE_OWN_IDENTITY`.
- **The market gate is `orchestrator/marketgate`.** A flow that needs a gated function calls
  `Require(ctx, userUUID, function, approximateCountry)` and maps `DeclarationRequiredError` /
  `RestrictedError`; H4/H6/H8 wire publish, subscribe and teach the same way. The approximate
  country comes from `geolocation.Resolver` over the client address the edge notes on every
  request; locally it is always unknown, so the gates are open in development.
- **Running a live backend.** Port **8081** may be held by a leftover `playhoot.exe` from an
  earlier session; `HTTP_PORT=8091 DATABASE_NAME=<fresh db> GAME_TOOLCHAIN_DIR=../playhoot_frontend
  go run .` works and migrates in ~40 s. `playhoot_t301` no longer matches the migrations (T-302
  edited them in place): create a new sibling database first. A fresh sibling database is
  `docker compose exec -T postgres psql -U playhoot -d postgres -c "CREATE DATABASE <name>;"`.
  The dev server proxies `/v1` to 8081; 8080 is Adminer and answers 200 to anything.
- **Backend DB tests**: export `TEST_DATABASE_*` from `playhoot/.env` (Postgres container up), with
  `TEST_DATABASE_NAME` pointing at any existing database — the suite creates and drops its own.
  `TestH1Walkthrough` must stay green through H3, and so must `TestH3Deletion`
  (`walkthrough_h3_deletion_test.go`), which runs the whole deletion over the full schema and is
  where a new cleanup step belongs.
- **Migrations are edited in place before launch** (METHOD §6): say in the Result whether the
  creator must recreate local databases.
- **Frontend `npm run check` must run from PowerShell** (under Git Bash every vitest file fails to
  load; it is the shell, not the code). There is no DOM test environment: rendering is checked in
  the browser; the re-runnable verify scripts are in `playhoot_frontend/scripts/verify/`
  (`verify:seo`, `verify:a11y`, `verify:pwa` — see that repo's `AGENTS.md`); the a11y script takes
  the screen list inside it, and T-307 extends it with the H3 screens.
- **Frontend conventions that bind H3's screens** (details in `playhoot_frontend/AGENTS.md` and the
  D-028/D-030/D-032 notes): screens never wrap themselves in `AppShell`; new app routes are
  client-rendered under `ClientLayout` and carry no language in the path; compose sign-in addresses
  with `useLocalePaths().auth({...})`; every new screen names itself with `appMeta` and one message
  per language; after changing `routes.ts`, build clean (remove `apps/web/.react-router` and
  `apps/web/build`). Admin panels follow the T-206 checklist in `packages/features/admin` +
  `apps/web/src/features/admin/`.
- A browser is available (Chrome over the DevTools protocol, `scripts/verify/chrome.mjs`). Start
  long-lived servers detached and check the port is really yours.
- **Admin mode is a second credential**: token in a closure, a reload ends it. To be the
  administrator locally: set `IDENTITY_ADMIN_USER_UUID`, restart the backend, enroll at
  `/admin/second-factor`.
- The system documentation site: `docs/system/index.html`; validate with
  `node tools/validate-docs.mjs` from the workspace root (456 entities at 0 after T-303). The
  data files are plain JavaScript: an unescaped apostrophe inside a single-quoted string makes the
  whole file fail to parse, and the validator then reports dozens of missing entities rather than
  a syntax error. `node --check <file>` tells you which file it really is.
- `.claude/usage.json` does not exist: ask the creator to check `/usage` at pause points.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
