# State

_Updated: 2026-11-16, closing of T-305 (the profile area, the notifications pages and the
teacher presentation)._

## Next task

**T-306** · model **Sonnet** · effort **medium** · Admin panels: the market matrix and the
acceptance texts. Size **S**. Backend endpoints exist since T-302
(`GET/PUT /admin/v1/markets`, `GET/PUT /admin/v1/texts`); this task builds the two panels in
front of them. Read `tasks/T-306.md` first; the admin area is the one exception to the two
presentations (D-023, desktop-first) and follows the T-206 checklist in
`packages/features/admin` + `apps/web/src/features/admin/`.

## Current milestone

**H3 — Identity and access**, designed by T-300 (16-nov-2026). Board in `PLAN.md`: T-301, T-302,
T-303, T-304, T-305 (done) → T-306 (admin panels, C-tier) → T-307 (close).
Decisions D-033…D-043, defaults V-09…V-12. Site data: 456 entities, validator at 0.

## Open questions for the creator

None to decide. What the creator still has to *do* is in `CREATOR_TODO.md`:

- **P-13** — try the PWA on a real Android phone and a real iPhone (steps in `tasks/T-202.md`).
- **P-14 / P-15** — real app icons and the final mascot; drop-in replacements, nothing blocks.
- **P-16** — recreate the local `playhoot` database once. **T-305 changed no migration**, so
  `playhoot_t303` still matches the code and can be reused; the older `playhoot_t205` and
  `playhoot_t301` are stale. The command is under "Running a live backend".
- **P-23** — the real acceptance texts. Still the seeded draft placeholders, which a new account
  now accepts at the gate and the profile's legal screen lists with their version and download.
  T-306 builds the panel that publishes the real ones.

## Notes for the next session

- **`npm install` fails in this workspace, and did before T-305.** npm 10.5.1 crashes with
  `Cannot set properties of null (setting 'peer')` while reifying, on a clean checkout too. The
  installed tree works, so nothing is blocked; a new workspace package has to be linked by hand
  (`New-Item -ItemType Junction` under `node_modules/@playhoot/`), which is how
  `@playhoot/feature-account` is linked. Worth a newer npm when the creator has a moment.
- **What T-305 left in place** (details in D-043 and `tasks/T-305.md`):
  - `@playhoot/feature-account` holds `createMyData` (my-data, rename, language, mode),
    `createSignInMethods` and `createDeletion`; `@playhoot/feature-notifications` gained
    `createHistory` and `createPreferences`. `services.me` is the client for `GET /v1/me` and the
    two settings; the methods calls are on `services.identity`.
  - **The mode is on the credential**: every credentials answer carries `user.mode`, the auth
    snapshot exposes it, and `app.accessReissued(...)` adopts the token a mode switch answers.
    A screen that wants the current mode reads `useAuth().mode`, not the backend.
  - **A screen that ends or changes the identity must not be gated by `RequireOperation`**: the
    gate reads the change as someone who was never allowed there. `/profile/delete` shows the
    pattern (offer the way in; leave before the credential goes).
  - `Switch` is a core component now (`role="switch"`), in the `/design` gallery.
  - The account screens live in `apps/web/src/features/account/` with one CSS module; the
    notification pages in `apps/web/src/features/notifications/`, which also holds the shared
    `notificationTypes.ts` the bell uses.
- **Driving the email code by hand.** The code exists only in the email, and the local provider
  stores no body: recover it from `identity_email_codes.code_sha256`, which is a plain SHA-256 of
  the six digits, by trying 000000–999999 (a second in Node). The backend's limits are real
  locally — 30 code requests an hour and 10 tries a minute per client address — and restarting the
  backend clears them, because the limiter is in memory.
- **The market gates are live and closed in development**: the local locator answers an unknown
  country, which `Decide` reads as "needs a declaration". The seeded matrix enables Colombia and
  Mexico (and the US/Canada per state), so declaring one of those is what makes create-game and
  joining go ahead locally.
- **Identity surfaces that exist.** `identity/usecases/readprofile`, `setmode`, `setlanguage`,
  `deleteuser`, `expireguests`, `signinmethods`; `composer/mydata` behind `GET /v1/me`;
  `compliance/usecases/readdeclaration` and `admintexts`. A new operation goes in
  `identity/internal/business/operationlevel` **and** in its test's expected catalog.
- **Backend DB tests**: export `TEST_DATABASE_*` from `playhoot/.env` (Postgres container up),
  with `TEST_DATABASE_NAME` pointing at any existing database — the suite creates and drops its
  own. `TestH1Walkthrough` must stay green through H3, and so must `TestH3Deletion`
  (`walkthrough_h3_deletion_test.go`).
- **Migrations are edited in place before launch** (METHOD §6): say in the Result whether the
  creator must recreate local databases.
- **Frontend `npm run check` must run from PowerShell** (under Git Bash every vitest file fails to
  load; it is the shell, not the code). There is no DOM test environment: rendering is checked in
  the browser; the re-runnable verify scripts are in `playhoot_frontend/scripts/verify/`
  (`verify:seo`, `verify:a11y`, `verify:pwa` — see that repo's `AGENTS.md`); the a11y script takes
  the screen list inside it, and T-307 extends it with the H3 screens — `/profile`,
  `/profile/methods`, `/profile/legal`, `/profile/delete`, `/teacher`, `/notifications`,
  `/notifications/preferences`.
- **Frontend conventions that bind H3's screens** (details in `playhoot_frontend/AGENTS.md` and
  the D-028/D-030/D-032/D-042/D-043 notes): screens never wrap themselves in `AppShell`; new app
  routes are client-rendered under `ClientLayout` and carry no language in the path; compose
  sign-in addresses with `useLocalePaths().auth({...})`; every new screen names itself with
  `appMeta` and one message per language; after changing `routes.ts`, build clean (remove
  `apps/web/.react-router` and `apps/web/build`). A new core component goes into the `/design`
  gallery in the same task. Admin panels follow the T-206 checklist.
- A browser is available (Chrome over the DevTools protocol, `scripts/verify/chrome.mjs`:
  `launchChrome`, then `newPage`, `goto`, `evaluate`, `waitFor`, `click`, `resize`). Clearing
  `localStorage` is **not** a sign-out — the running app writes its credential back as the page
  unloads — and a second person needs a browser of its own (`launchChrome` on its own port).
  Chrome here starts in Spanish: a walkthrough that reads English text writes
  `localStorage['playhoot.locale.v1'] = 'en'` first, as the picker would. A React field is filled
  with the native value setter plus an `input` event; a `<TextField>` renders `<input>` with no
  `type`, so `input[type=text]` matches nothing.
- **Admin mode is a second credential**: token in a closure, a reload ends it. To be the
  administrator locally: set `IDENTITY_ADMIN_USER_UUID`, restart the backend, enroll at
  `/admin/second-factor`.
- The system documentation site: `docs/system/index.html`; validate with
  `node tools/validate-docs.mjs` from the workspace root (456 entities at 0 after T-305). The
  data files are plain JavaScript: an unescaped apostrophe inside a single-quoted string makes the
  whole file fail to parse, and the validator then reports dozens of missing entities rather than
  a syntax error. `node --check <file>` tells you which file it really is. They are also checked
  by the frontend's `prettier --check`, which is part of `npm run check`.
- `.claude/usage.json` does not exist: ask the creator to check `/usage` at pause points.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
