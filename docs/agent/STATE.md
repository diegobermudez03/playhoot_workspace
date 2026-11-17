# State

_Updated: 2026-11-16, closing of T-400 (H4 designed)._

## Next task

**T-401** · model **Opus** · effort **medium** · versions split and lifecycle: the `play/versions`
package, finalize apart from publishing, choose/return/unavailable, version resolution at
create-session, builds on txqueue. Read `tasks/T-401.md` first.

## Current milestone

**H4 — Games, versions, publication and Discovery: designed 16-nov-2026** by T-400 in one session.
Decisions D-045…D-051, defaults V-13/V-14; the design is the `planned` site data (532 entities,
validator at 0). Board: T-401…T-404 backend → T-405/T-406 frontend → T-407 admin (C) → T-408 close.
Estimate 10–12 sessions; 9 planned.

## Open questions for the creator

None to decide. What the creator still has to *do* is in `CREATOR_TODO.md`:

- **P-13** — try the PWA on a real Android phone and a real iPhone (steps in `tasks/T-202.md`).
- **P-14 / P-15** — real app icons and the final mascot; drop-in replacements, nothing blocks.
- **P-16** — recreate the local `playhoot` database once. **Worth waiting now**: T-401 and T-402
  edit migrations in place again (dropped columns, new tables), so recreating after T-402 lands
  covers everything at once. The command is under "Running a live backend".
- **P-23** — the real acceptance texts, published from `/admin/texts`. H4 adds the
  template-permission text to this list (T-404 seeds its draft).

## Notes for the next session

- **What the H4 design fixed that implementers must hold onto** (full reasoning in D-045…D-051):
  - The four P15§2 conditions: in editing / ready = `play_game_versions.status` (play.versions);
    chosen = `games.chosen_version_uuid`; approved = `game_publications` + `offered_publication_id`
    (both game); pinned = `play_sessions.game_version_id`.
  - **Non-owners always play the offered approved version**; the owner plays the chosen one.
    `game.resolve-playable-version` answers it and create-session passes the version to play.
  - Discovery shows **approved snapshots only**, never the working card; card edits reach Discovery
    only through a new publication request; unpublish keeps the approval (re-offering unchanged
    content needs no review); unpublish ≠ delete ≠ block.
  - Migration edits in place (METHOD §6): T-401 drops `games.visibility`,
    `play_games.current_version_id`, `game_releases.visibility`; T-404 drops the two template
    booleans. Say in each Result that the creator must recreate the local DB.
  - Convention used in the site data: new entities are `planned`; changed existing entities keep
    their status with the change marked "H4 (planned, T-40x)" in the affected rules/notes — the
    implementing task rewrites them cleanly and flips status.
- **`npm install` fails in this workspace** (npm 10.5.1 crashes reifying, clean checkout too). The
  installed tree works; a new workspace package must be linked by hand (`New-Item -ItemType
  Junction` under `node_modules/@playhoot/`), like `@playhoot/feature-account`. Avoid new packages
  where an existing one serves.
- **Backend DB tests**: export `TEST_DATABASE_*` from `playhoot/.env` (Postgres container up),
  `TEST_DATABASE_NAME` pointing at any existing database — the suite creates and drops its own.
  `TestH1Walkthrough`, `TestH3Deletion` and `walkthrough_h3_test.go` must stay green through H4.
- **The market gates**: create-game asks for a declaration locally (unknown country); joining asks
  nothing (C-01, D-044) — admission uses `marketgate.Gate.Admit`, adult functions use `Require`.
  H4's publish/template gates use `Require` with the new function `publish-games` (T-402 seeds the
  matrix rows). The seeded matrix enables Colombia and Mexico (and US/Canada per state).
- **A new backend operation** goes in `identity/internal/business/operationlevel` **and** in its
  test's expected catalog. The per-route request-metric guard is at 4000 series (D-039).
- **Frontend `npm run check` must run from PowerShell**; no DOM test environment — rendering is
  checked in the browser and by the re-runnable `scripts/verify/` scripts (`verify:seo` needs the
  build made with `PLAYHOOT_SITE_URL` set to its `--origin`; `verify:a11y` takes the screen lists —
  new screens join them in the task that builds them; add `--totp-secret`/`--account` for admin).
  After changing `routes.ts`, build clean (remove `apps/web/.react-router` and `apps/web/build`).
- **Frontend conventions that bind H4's screens**: screens never wrap themselves in `AppShell`;
  public SEO routes carry the language in the path and are server-rendered (D-019/D-024); app
  routes are client-rendered under `ClientLayout`; every new screen names itself with `appMeta`;
  new core components go into the `/design` gallery in the same task; styles pass `npm run styles`
  (tokens only). Admin panels follow the T-206 checklist, one responsive implementation (D-023).
  A `Dialog` focuses the element marked `data-autofocus` (D-044).
- **A browser is available** (Chrome over DevTools, `scripts/verify/chrome.mjs`). Chrome starts in
  Spanish: set `localStorage['playhoot.locale.v1'] = 'en'` first. Clearing localStorage is not a
  sign-out; a second person needs its own `launchChrome` port. A `<TextField>` renders `<input>`
  with no `type`.
- **Admin mode is a second credential**: set `IDENTITY_ADMIN_USER_UUID`, restart, enroll at
  `/admin/second-factor`; the token lives in a closure, a reload ends it.
- **Driving the email code by hand**: recover it from `identity_email_codes.code_sha256` by trying
  000000–999999; the limiter is in memory, restarting the backend clears it.
- The documentation site: `docs/system/index.html`; validate with `node tools/validate-docs.mjs`
  from the workspace root (532 entities at 0 after T-400). The data files are plain JavaScript —
  an unescaped apostrophe breaks the whole file (`node --check <file>` finds it) — and the frontend
  ones must pass `prettier` (part of `npm run check`).
- `.claude/usage.json` does not exist: ask the creator to check `/usage` at pause points.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
