# State

_Updated: 2026-11-16, closing of T-207 and of milestone H2._

## Next task

**T-300** · model **Fable** · effort **high** · H3 design: identity and access. Size **L**.

A design task, like T-200 was for H2: it writes `planned` site data and the implementation briefs
T-301…, and no application code. Read `tasks/T-300.md` first — it names what to read, and the
"Read first" there is the whole reading list. It is tier A because contracts between Identity and
`compliance` and the shape of the three modes are decided here, and a wrong shape means redoing
screens in H8.

## Current milestone

**H2 is closed (16-nov-2026, 8 sessions).** T-200 → T-201 → T-202 → T-203 → T-204 → T-205 →
T-206 → T-207, all done. H3 begins with T-300.

## Open questions for the creator

None to decide. What the creator still has to *do* is in `CREATOR_TODO.md`:

- **P-13 — still open, and it is the only piece of H2 nobody but the creator can close.** Install
  the app on a real Android phone and a real iPhone and say whether it opens in its own window
  with the right name and icon, and whether the offline page shows with the network off. The steps
  are in the Result of `tasks/T-202.md`. Everything an emulated browser can check is checked
  (T-207: 36 PWA checks green against the final build, offline page included).
- **P-14** — the four real app icons. **P-15** — the final mascot (approve the placeholder cat or
  supply the Lottie file). Neither blocks anything; both are drop-in replacements.
- **P-16** — recreate the local `playhoot` database once, at any time. Nothing in the code needs
  changing; see the note below.

## Notes for the next session

- **H2 was verified as behaviour, and the checks are re-runnable** (T-207). Three scripts in
  `playhoot_frontend/scripts/verify/`, documented in that repo's `AGENTS.md`, each taking the
  address of a host that is already running. They are **not** part of `npm run check`:

  | Script | What it proves | Needs |
  |---|---|---|
  | `npm run verify:seo -- --base http://localhost:3000 --origin https://playhoot.com` | Every public page in every language carries its content and metadata with no JavaScript; robots, sitemap, redirects, 404 | a production build served by `apps/web/server.js` |
  | `npm run verify:a11y -- --base http://localhost:5173` | axe-core at WCAG 2.2 A/AA over the H2 screens; `--totp-secret <base32>` adds the four admin panels (it signs the account in through the local provider itself) | the dev server and a live backend |
  | `npm run verify:pwa -- --base http://localhost:3000` | Worker, precache, manifest, no push, and the offline page with the worker really cut off the network | a production build |

  **A new screen is added to the list inside the script**, not audited separately. The a11y script
  waits for every entrance animation to finish before measuring colour — without that it reports
  contrast failures that are only mid-fade frames, which cost T-207 an hour of chasing ghosts.
- **Every page now has a `<title>` (D-032).** `root.tsx` declares the fallback; a screen names
  itself by exporting `meta` and calling `appMeta(args, '<message id>')` from `src/seo/meta.ts`,
  which resolves the message in the language the root resolved. The six admin screens do this; the
  screens whose presentation a later milestone redoes carry the fallback until it does. **A new
  screen should name itself**: it is one line and a message per language.
- **`/{language}/join` is rendered by the server; `/{language}/sign-in` is not, on purpose
  (D-032).** A public page offered to crawlers must carry its content without JavaScript, and
  `verify:seo` enforces exactly that distinction. A new public, indexable page therefore goes
  *outside* `app/ClientLayout.tsx`, picks its skeleton with `useMediaLayout`, and must not read
  `window`, storage or the services while rendering.
- **After changing `apps/web/src/routes.ts`, build clean.** Remove `apps/web/.react-router` and
  `apps/web/build` before `npm run build`; an incremental build can emit a server bundle carrying
  the previous route tree, and the symptom is a route that renders an empty page in production
  while the dev server renders it correctly.
- **`Dialog` gives its heading a `useId()`.** It used to build the id from the title text, so two
  dialogs sharing a title pointed at each other's heading. Do not go back to deriving ids from
  content.
- **The existing flows work against a live backend (T-207).** Host a Session → a second tab joins
  by code → lobby → the host starts → the game runs in its sandboxed iframe; and `/games/new`
  creates a draft whose workspace opens with its nine sections. No console error anywhere. Their
  **presentation** is still the old layout in the new skin: H4 redoes the games and the workspace,
  H5 the sessions and play. Those screens stay `implemented`, not `verified`, for that reason.
- **The admin area is built and verified** (T-206, D-031; T-207 audited its four panels in real
  admin mode). Admin mode is a second credential whose token lives in a closure, so **a reload ends
  it** — anything driving the admin area must navigate within the app, not reload.
  - To be the administrator locally: sign in with an account, read its UUID (it is in the
    credential this browser stored, or from `GET /v1/identity/me`), set `IDENTITY_ADMIN_USER_UUID`,
    restart the backend (it logs `administrator grant ... created`), then enroll at
    `/admin/second-factor` and enter admin mode at `/admin/sign-in`. T-207 left an enrolled
    administrator on `playhoot_t205` under the local-provider name `T207Operator`; its TOTP secret
    is deliberately not written down, so **enroll again** (the screen offers replacing the factor).
  - A new admin panel adds its state to `packages/features/admin`, its screen under
    `apps/web/src/features/admin/`, a route inside the `AdminArea` layout in `routes.ts`, its screen
    entry in `playhoot_frontend/docs/system/screens-admin.js`, and its title message. Use
    `useAdminPanel`, `StepUpForm` for anything sensitive and the native `Dialog` for anything
    destructive.
- **There is one authentication screen and its address is its whole input (D-030, T-205).**
  `/{language}/sign-in` takes `reason` (a kind from the closed list in `features/paths.ts`),
  `level`, `use=account` and `next`. Compose it with `useLocalePaths().auth({...})`, never by hand;
  read it with `authRequest`. A screen that gates on an operation passes its reason to
  `RequireOperation` or `useNavigateToOperation`, and adds its kind to `authReasons` plus one
  `auth.reason.<kind>` message per language. The email-code way in is drawn but disabled: its
  endpoint arrives with H3 and T-300 designs it.
- **The shell is rendered once above the router, and so are the services (D-028, T-204).**
  `root.tsx` renders one `AppShell` around the `Outlet` inside a `ServicesBoundary`. A screen never
  wraps itself in `AppShell`; it calls `useShellMode` for `bare`, `immersive` or `plain`. Two
  frames are read from the address instead (`isAdminPath`, `isBarePublicPath`), so a
  server-rendered page is framed right on its first render. What the bar shows at a given width is
  **CSS, not JavaScript**. A piece of the bar that needs the browser uses `useOptionalServices()`
  and renders nothing until then. **Nothing drawn on a server-rendered page may differ between the
  two renders**: no `Math.random()`, no clock, no storage during render.
- **Notifications are wired end to end (T-204)**: `protocol/http/notifications.ts` →
  `communication/notificationsClient.ts` → `@playhoot/feature-notifications` → the bell. Opening
  the panel marks nothing read (P14§4). A notification type this build does not know is still
  shown. Where a notification leads is each milestone's own work.
- **The design system is "Ink & Sticker" (C-03 direction A, D-027, T-203).** Read
  `playhoot_frontend/docs/design/DESIGN_SYSTEM.md` before writing any screen and open `/design`
  before writing a component: building a second button or a second status area is the mistake to
  avoid. Tokens in three tiers; screens use semantic tokens only, and `npm run styles` (part of
  `npm run check`) fails on a raw colour, a raw duration or a blurred shadow. A new core component
  goes into `/design` in the same task.
- **T-202 added the PWA (D-020, D-026).** Everything is in `apps/web/src/pwa/`; the build writes
  `build/client/sw.js` and `build/client/offline.html`. There is no worker in development. A new
  address that must work offline goes in the precache list in `vite-pwa.ts`, never in a new caching
  rule. **No push code and no permission prompt, ever (P29).** PWA notices sit at z-index 50,
  toasts at 60, the top bar at 40.
- **The backend starts; the creator's local database does not (diagnosed in T-205).** The column
  `logo_image_url` that stops the seed exists in no migration and nowhere in the backend source: it
  is left over in the creator's `playhoot` database from a migration edited in place before launch.
  **There is nothing to fix in the code.** A task that needs a live backend either waits for P-16
  or runs against a second database on the same container —
  `docker compose exec -T postgres psql -U playhoot -d postgres -c "CREATE DATABASE <name>;"`, then
  `DATABASE_NAME=<name> GAME_TOOLCHAIN_DIR=../playhoot_frontend go run .`, which migrates and seeds
  from scratch in about 40 seconds. `playhoot_t205` is still there and T-207 left it tidy: no
  active Session, no dead tasks, the ladder normal, email mode Automatic. It holds one account
  (`T207Operator`, the administrator) and one draft game.
- A browser is available (Chrome, driven over the DevTools protocol). The reusable driver is
  `playhoot_frontend/scripts/verify/chrome.mjs` — use it rather than writing another one; it opens
  tabs, navigates, evaluates, sends real keys and clicks, resizes and cuts the network. The dev
  server proxies `/v1` and `/admin/v1` to `PLAYHOOT_BACKEND_URL`, which **defaults to port 8081** —
  port 8080 is Adminer and answers 200 to anything, which is a good way to waste twenty minutes.
  A dev server may already be running on 5173; `npm run dev -w @playhoot/web -- --port 5174` runs a
  second one beside it. **Start a long-lived server detached** (PowerShell `Start-Process`) and
  check the port is really yours: a stale listener from an earlier run will answer with an old
  build and make a fresh one look broken.
- A page the **server** renders picks its skeleton with `useMediaLayout` (`features/layout.ts`),
  not `useLayout`.
- Implementation tasks must build exactly what the site data says; if something cannot be built as
  designed, that is a design defect — fix the data in the same task and say so in the Result, or
  stop if it changes contracts between domains. T-206 did this twice and T-207 once.
- The system documentation site: `docs/system/index.html`; validate with
  `node tools/validate-docs.mjs` from the workspace root (415 entities at 0 after T-207; thirteen
  screens are now `verified`).
- Backend DB tests: export `TEST_DATABASE_*` from `playhoot/.env` (Postgres container up).
  **Frontend `npm run check` must be run from PowerShell** — under Git Bash every vitest file fails
  to load with `Cannot read properties of undefined (reading 'config')`, on a clean tree as well;
  it is the shell, not the code. There is **no DOM test environment** in the frontend: tests cover
  logic, and anything about rendering is checked in the browser.
- `.claude/usage.json` does not exist, so usage is not measured automatically: ask the creator to
  check `/usage` at pause points.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
- T-101 built `utils/txqueue` (D-014, V-05). A domain gets its queue with `registry.Queue(domain)`
  in `main`, creates its table with `txqueue.Migration` in its own migrations, and registers
  handlers there.
- T-102 built the admin second factor (D-015). Each new admin endpoint needs its own operation at
  level `admin` in Identity's catalog (as `MANAGE_QUEUES`); sensitive flows spend the proof with
  `orchestrator/stepup`. Admin step-up endpoints take `step_up_proof` in the JSON body; a refused
  proof answers `step_up_required` (403).
- T-103 built `compliance` (D-016). Flows that gate on markets call
  `marketaccess.CheckMarketAccess` through the orchestrator, passing the approximate country from
  `api/geolocation.ApproximateCountry`; flows that need a current acceptance use
  `acceptances.HasCurrentAcceptance`. Local acceptance texts are draft placeholders (P-23).
- T-104 built `plan` (free limits only). Flows that need capacities call
  `getuserlimits.GetUserLimits` through the orchestrator and pass the values to the owning domain;
  admin changes use `MANAGE_PLANS`. Catalog, subscriptions, credits and trial are H6.
- T-105 built `budget` (D-017, V-06). Cost-bearing work calls `admitwork.AdmitWork` through the
  orchestrator and later `settlework.SettleWork`; a refusal is a pause with
  `budget.RestrictionMessage`. Domains report other spend by enqueueing `spend-event` in their own
  queue; add the domain's queue to the `spendingestion.Register` list in `main`.
- T-106 built `notifications` (D-018). A domain tells a user something by enqueueing `notify` in its
  own queue (payload `orchestrator/notificationdelivery.Payload`) and adding its queue to the
  `notificationdelivery` Register list in `main`. Email goes through simulated providers locally;
  switch modes at `/admin/email`. Only the values a type lists in `EmailValues` ever enter an email.
- T-107 built `analytics` ingestion: enqueue `analytics-event` inside the writing transaction and
  register the queue in `main`.
- T-108 added `TestH1Walkthrough` (backend root package). A milestone that changes queues, budget,
  notifications, compliance or analytics keeps it green.
- Two sandbox timing tests (`play/runtime/sandbox`, `simulategame`) can fail under full-suite load
  and pass alone; not caused by H1 or H2 work.
