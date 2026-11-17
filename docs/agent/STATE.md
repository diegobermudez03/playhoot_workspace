# State

_Updated: 2026-11-16, closing of T-307 (H3 closed)._

## Next task

**T-400** · model **Fable** · effort **high** · H4 design: games, versions, publication and
Discovery. Design only, as `planned` site data, plus the T-401… briefs and the H4 board.
Read `tasks/T-400.md` first.

## Current milestone

**H3 — Identity and access: closed 16-nov-2026** in 8 sessions (T-300…T-307), against 7–9.
Verified as behaviour by `playhoot/walkthrough_h3_test.go` and the three frontend verify scripts
(26 screens audited). Decisions D-033…D-044, defaults V-09…V-12. Site data: 456 entities,
validator at 0. Next: **H4**, designed by T-400.

## Open questions for the creator

None to decide. What the creator still has to *do* is in `CREATOR_TODO.md`:

- **P-13** — try the PWA on a real Android phone and a real iPhone (steps in `tasks/T-202.md`).
- **P-14 / P-15** — real app icons and the final mascot; drop-in replacements, nothing blocks.
- **P-16** — recreate the local `playhoot` database once. **T-307 changed no migration**;
  `playhoot_t307` (created by T-307) and `playhoot_t303` match the code; `playhoot_t205` and
  `playhoot_t301` are stale. The command is under "Running a live backend".
- **P-23** — the real acceptance texts, published from `/admin/texts`. Until then every screen
  shows the seeded drafts.

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
- **The market gates**: create-game (an adult function) asks for a declaration locally, because
  the local locator answers an unknown country. **Joining asks nothing** (C-01, D-044): the
  admission uses `marketgate.Gate.Admit` and refuses only a restricted market or known minority. A
  future adult-function gate uses `Require`; a future entry gate uses `Admit`. The seeded matrix enables Colombia and
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
  (`verify:seo`, `verify:a11y`, `verify:pwa` — see that repo's `AGENTS.md`). `verify:a11y` signs a
  fresh account in its own browser and audits the H3 screens plus a keyboard pass; add
  `--totp-secret` and `--account` for the admin panels. `verify:seo` needs the build made with
  `PLAYHOOT_SITE_URL` set to the `--origin` it is given (the sitemap and robots are written at
  build time). A new screen goes into the a11y lists in the task that builds it.
- **A `Dialog` opens on its close button** unless an element inside carries `data-autofocus`:
  React's `autoFocus` never reaches the page, so the browser cannot see it (D-044).
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
