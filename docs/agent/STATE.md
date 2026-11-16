# State

_Updated: 2026-11-16, closing of T-304 (the ways in and the declaration)._

## Next task

**T-305** · model **Opus** · effort **medium** · Frontend: the profile area and its subscreens
(methods, legal, deletion), the notifications page and preferences, the teacher presentation, and
the shell changes that door them. Size **L**. Frontend only. Read `tasks/T-305.md` first; the
design it builds is the `planned` frontend site data plus `DECISIONS.md` D-034…D-037 and V-10.
It links to what T-304 built, which is listed under "What T-304 left in place".

## Current milestone

**H3 — Identity and access**, designed by T-300 (16-nov-2026). Board in `PLAN.md`: T-301, T-302,
T-303, T-304 (done) → T-305 (frontend) → T-306 (admin panels, C-tier) → T-307 (close).
Decisions D-033…D-042, defaults V-09…V-12. Site data: 456 entities, validator at 0.

## Open questions for the creator

None to decide. What the creator still has to *do* is in `CREATOR_TODO.md`:

- **P-13** — try the PWA on a real Android phone and a real iPhone (steps in `tasks/T-202.md`).
- **P-14 / P-15** — real app icons and the final mascot; drop-in replacements, nothing blocks.
- **P-16** — recreate the local `playhoot` database once. **T-304 changed no migration**, so
  `playhoot_t303` still matches the code and can be reused; the older `playhoot_t205` and
  `playhoot_t301` are stale. The command is under "Running a live backend".
- **P-23** — the real acceptance texts. More visible now: T-304 made the acceptance step live, so
  a new account is shown the **seeded draft placeholders** ("DRAFT PLACEHOLDER … Not the real
  text") and accepts version 1 of each. The endpoints that publish them exist since T-302
  (`GET/PUT /admin/v1/texts`, admin level); T-306 builds the panel in front of them.

## Notes for the next session

- **Design conventions this milestone uses.** New entities are `planned`; changed built entities
  keep their status and mark the planned pieces with "(H3, planned)" notes — the implementing task
  removes the notes when it moves things to `implemented` and corrects whatever building teaches.
- **What T-304 left in place** (details in D-042 and `tasks/T-304.md`):
  - `@playhoot/feature-compliance` holds `createAcceptanceStep` and `createDeclarationForm`;
    `services.compliance` is the HTTP client (texts, acceptances, declaration, download URL).
    T-305's `profile-legal` reuses `TextLinks`/`textName` from
    `apps/web/src/features/compliance/`, and the preferences screen's marketing toggle uses
    `recordAcceptance(..., 'marketing', ..., acceptanceContexts.preferences)`.
  - **The acceptance step is a gate in `ClientLayout`**, beside the display-name gate, not a step
    inside the sign-in screen: a sign-in finishes on that screen or on the provider callback.
    Anything that gates a page for an identity belongs there too.
  - `PendingLogin` carries an `intent`; `accountSignIn.startLink(provider, next)` and
    `complete()` answering `{kind:'linked', outcome}` are what `/profile/methods` needs for the
    provider round trip. `sign-in-complete` already lands on `/profile/methods?linked=linked|in-use`
    — **that route does not exist yet; T-305 adds it** and reads the parameter.
  - `profilePaths` (`/profile`, `/profile/methods`, `/profile/legal`, `/profile/delete`) are in
    `apps/web/src/features/paths.ts` already, with nothing behind them.
  - The email-code machinery for linking an address is *not* built: `createEmailSignIn` signs in;
    `POST /v1/identity/me/methods/email/start|complete` still need a client and feature state.
- **Driving the email code by hand.** The code exists only in the email, and the local provider
  stores no body: recover it from `identity_email_codes.code_sha256`, which is a plain SHA-256 of
  the six digits, by trying 000000–999999 (a second in Node). The backend's limits are real
  locally — 30 code requests an hour and 10 tries a minute per client address — and restarting the
  backend clears them, because the limiter is in memory.
- **The market gates are live and closed in development**, contrary to what D-040 said: the local
  locator answers an unknown country, which `Decide` reads as "needs a declaration". The seeded
  matrix enables Colombia and Mexico (and the US/Canada per state), so declaring one of those is
  what makes create-game and joining go ahead locally.
- **Identity surfaces that now exist.** `identity/usecases/readprofile` (lists methods through
  `signinmethods`), `setmode`, `setlanguage`, `deleteuser`, `expireguests`; `composer/mydata`
  behind `GET /v1/me`; `compliance/usecases/readdeclaration` and `admintexts`. A new operation goes
  in `identity/internal/business/operationlevel` **and** in its test's expected catalog — the
  catalog now holds `SET_OWN_MODE`, `SET_INTERFACE_LANGUAGE`, `MANAGE_TEXTS` and
  `DELETE_OWN_IDENTITY`.
- **Backend DB tests**: export `TEST_DATABASE_*` from `playhoot/.env` (Postgres container up), with
  `TEST_DATABASE_NAME` pointing at any existing database — the suite creates and drops its own.
  `TestH1Walkthrough` must stay green through H3, and so must `TestH3Deletion`
  (`walkthrough_h3_deletion_test.go`).
- **Migrations are edited in place before launch** (METHOD §6): say in the Result whether the
  creator must recreate local databases.
- **Frontend `npm run check` must run from PowerShell** (under Git Bash every vitest file fails to
  load; it is the shell, not the code). There is no DOM test environment: rendering is checked in
  the browser; the re-runnable verify scripts are in `playhoot_frontend/scripts/verify/`
  (`verify:seo`, `verify:a11y`, `verify:pwa` — see that repo's `AGENTS.md`); the a11y script takes
  the screen list inside it, and T-307 extends it with the H3 screens.
- **Frontend conventions that bind H3's screens** (details in `playhoot_frontend/AGENTS.md` and the
  D-028/D-030/D-032/D-042 notes): screens never wrap themselves in `AppShell`; new app routes are
  client-rendered under `ClientLayout` and carry no language in the path; compose sign-in addresses
  with `useLocalePaths().auth({...})`; every new screen names itself with `appMeta` and one message
  per language; after changing `routes.ts`, build clean (remove `apps/web/.react-router` and
  `apps/web/build`). A new core component goes into the `/design` gallery in the same task
  (T-304 added `Checkbox` and gave `CodeInput` an error and a hint). Admin panels follow the T-206
  checklist in `packages/features/admin` + `apps/web/src/features/admin/`.
- A browser is available (Chrome over the DevTools protocol, `scripts/verify/chrome.mjs`:
  `launchChrome`, then `newPage`, `goto`, `evaluate`, `waitFor`, `click`, `resize`). Clearing
  `localStorage` is **not** a sign-out — the running app writes its credential back as the page
  unloads; give each signed-in person its own browser (`launchChrome` on its own port). Start
  long-lived servers detached and check the port is really yours.
- **Admin mode is a second credential**: token in a closure, a reload ends it. To be the
  administrator locally: set `IDENTITY_ADMIN_USER_UUID`, restart the backend, enroll at
  `/admin/second-factor`.
- The system documentation site: `docs/system/index.html`; validate with
  `node tools/validate-docs.mjs` from the workspace root (456 entities at 0 after T-304). The
  data files are plain JavaScript: an unescaped apostrophe inside a single-quoted string makes the
  whole file fail to parse, and the validator then reports dozens of missing entities rather than
  a syntax error. `node --check <file>` tells you which file it really is. They are also checked by
  the frontend's `prettier --check`, which is part of `npm run check`.
- `.claude/usage.json` does not exist: ask the creator to check `/usage` at pause points.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
