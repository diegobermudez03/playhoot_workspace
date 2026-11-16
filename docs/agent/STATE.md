# State

_Updated: 2026-11-16, closing of T-300 (H3 design)._

## Next task

**T-301** · model **Opus** · effort **medium** · Identity ways in: email-code sign-in, method
linking and removal, recovery. Size **L**. Backend only. Read `tasks/T-301.md` first; the design it
builds is the `planned` site data plus `DECISIONS.md` D-033/D-035/V-09.

## Current milestone

**H3 — Identity and access**, designed by T-300 (16-nov-2026). Board in `PLAN.md`: T-301 → T-302 →
T-303 (backend) → T-304 → T-305 (frontend) → T-306 (admin panels, C-tier) → T-307 (close).
Decisions D-033…D-038, defaults V-09…V-12. The design is site data: 455 entities, validator at 0.

## Open questions for the creator

None to decide. What the creator still has to *do* is in `CREATOR_TODO.md`:

- **P-13** — try the PWA on a real Android phone and a real iPhone (steps in `tasks/T-202.md`).
- **P-14 / P-15** — real app icons and the final mascot; drop-in replacements, nothing blocks.
- **P-16** — recreate the local `playhoot` database once (stale column from a pre-launch migration
  edit; nothing in the code changes). A task that needs a live backend meanwhile uses
  `playhoot_t205` or creates a sibling database (note below).
- **P-23** — the real acceptance texts; H3's T-306 builds the admin panel where they are published.

## Notes for the next session

- **Design conventions this milestone uses.** New entities are `planned`; changed built entities
  keep their status and mark the planned pieces with "(H3, planned)" notes — the implementing task
  removes the notes when it moves things to `implemented` and corrects whatever building teaches.
  A gated flow's refusal `declaration_required` and the `/declaration` screen pattern are D-038.
- **The backend starts; the creator's local `playhoot` database does not (P-16).** Not a code
  defect (T-205). Use `playhoot_t205` (tidy; one account `T207Operator` with the admin grant, one
  draft game) or create a fresh database:
  `docker compose exec -T postgres psql -U playhoot -d postgres -c "CREATE DATABASE <name>;"`, then
  `DATABASE_NAME=<name> GAME_TOOLCHAIN_DIR=../playhoot_frontend go run .` (migrates and seeds in
  ~40 s). The dev server proxies `/v1` to port **8081**; 8080 is Adminer and answers 200 to
  anything.
- **Backend DB tests**: export `TEST_DATABASE_*` from `playhoot/.env` (Postgres container up).
  `TestH1Walkthrough` must stay green through H3 (it exercises queues, budget, notifications,
  compliance). Two sandbox timing tests can fail under full-suite load and pass alone; not ours.
- **The email-code notify path builds on D-018 exactly as shipped**: type `access-code` exists,
  entries can be non-in-app and have their skeleton cleared once the email is decided; T-301 adds
  the attempt-as-recipient resolution in `identity.read-contact` and an empty recipient on those
  entries — nothing else in notifications changes.
- **Migrations are edited in place before launch** (METHOD §6): T-301's columns on existing
  identity tables go into the original migrations — say in the Result whether the creator must
  recreate local databases (new nullable columns on `identity_*` likely mean yes for whichever
  database they keep).
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
  long-lived servers detached (PowerShell `Start-Process`) and check the port is really yours.
- **Admin mode is a second credential**: token in a closure, a reload ends it. To be the
  administrator locally: set `IDENTITY_ADMIN_USER_UUID`, restart the backend, enroll at
  `/admin/second-factor` (T-207's TOTP secret was deliberately not written down — enroll again).
- The system documentation site: `docs/system/index.html`; validate with
  `node tools/validate-docs.mjs` from the workspace root (455 entities at 0 after T-300).
- `.claude/usage.json` does not exist: ask the creator to check `/usage` at pause points.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
