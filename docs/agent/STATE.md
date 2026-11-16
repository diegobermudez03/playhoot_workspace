# State

_Updated: 2026-11-16, closing of T-204 (app shell and public home)._

## Next task

**T-205** · model **Opus** · effort **medium** · Contextual authentication: one screen that receives
the reason, the minimum account type that works and the destination to return to. Size **M**.

T-204 built the shell above the router and the public home. T-205 replaces `sign-in` and
`sign-in-guest` with `auth-contextual`. Read `tasks/T-205.md`, and before writing a component open
`/design`: the gallery now shows the core components, the shell and the home screen.

## Current milestone

H2 — Frontend base and visual identity. Designed by T-200 (board in `PLAN.md`): T-201 (done) →
T-202 (done) → T-203 (done) → T-204 (done) → **T-205** → T-206 → T-207.

## Open questions for the creator

None. What the creator still has to *do*, as opposed to decide, is in `CREATOR_TODO.md`: P-13
(install the app on a real Android phone and a real iPhone), P-14 (the four real app icons) and
P-15 (the final mascot: approve the placeholder cat or supply the Lottie file). None of them
blocks any task before T-207.

## Notes for the next session

- **The shell is rendered once above the router, and so are the services (D-028, T-204).**
  `root.tsx` renders one `AppShell` around the `Outlet` inside a `ServicesBoundary`. **A screen
  never wraps itself in `AppShell` again**; it calls `useShellMode` when it wants something other
  than the whole bar: `bare` (the page shows its own big logo), `immersive` (a game on a landscape
  display), `plain` (no frame of ours). The admin area is recognised from the address, so **T-206's
  admin screens get no public bar** without doing anything — but they do get the whole document
  (language, PWA notices, services), which is what D-023 wants.
  - The bar lives in `apps/web/src/app/shell/`: `ShellBar`, `NotificationsBell`, `ModeChoice`,
    `ShellMenu`. What it shows at a given width is **CSS, not JavaScript** (it is server-rendered
    before the display is known): below 360 px the mode switch moves into the menu, below 760 px
    join, create, the language and the sound do.
  - Services are null while the server renders and until the page is interactive. A piece of the
    bar that needs the browser uses `useOptionalServices()` and renders nothing until then. Do not
    read `window`, storage or the services while rendering.
  - **Anything drawn on a server-rendered page must draw the same thing twice**: no `Math.random()`
    and no clock during render. `Mascot` broke hydration this way and now derives its blink rhythm
    from its React id; the same trap waits for the next component that wants a random touch.
- **Notifications are wired end to end (T-204)**: `protocol/http/notifications.ts` →
  `communication/notificationsClient.ts` → `@playhoot/feature-notifications` → the bell. The feature
  state is app-global (`services.notifications`) because the bar outlives every route, and
  `startServices` reads the list for whoever signs in and forgets it when they leave. Opening the
  panel marks nothing read (P14§4). A notification type this build does not know is still shown.
- A page the **server** renders picks its skeleton with `useMediaLayout` (`features/layout.ts`),
  not `useLayout`: the server has no device to ask and no services. It answers `compact` on the
  server and the real answer after hydration.
- **The backend does not start on this machine.** `game/internal/storage/migrations/seed.go`
  inserts its seed Games without `logo_image_url`, which a later migration made NOT NULL, so
  `go run .` stops at startup (recorded in `GAPS.md`). A one-line fix in that seed row belongs to
  the next backend task; a frontend task that needs a live backend should expect to fix it first or
  stub the endpoints as T-204 did.
- A browser is available (Chrome, driven over the DevTools protocol from a throwaway Node script
  using Node 22's global `WebSocket`). T-204 verified server rendering per locale, the shell
  surviving navigation, the language change, the tab order and ring, 320/360/390/768/1280 px, and
  the bell against stubbed endpoints. The dev server proxies `/v1` to `PLAYHOOT_BACKEND_URL`, which
  **defaults to port 8081** — port 8080 is Adminer and answers 200 to anything, which is a good way
  to waste twenty minutes. **Still not exercised against a live backend: joining a session and
  opening a game workspace** (carried over from T-201 and T-203).
- **The design system is "Ink & Sticker" (C-03 direction A, D-027, T-203).** Warm paper, near-black
  ink, flat accent fills, 2 px outlines, hard offset shadows with no blur. Read
  `playhoot_frontend/docs/design/DESIGN_SYSTEM.md` before writing any screen, and open `/design`
  before writing a component: building a second button or a second status area is the mistake to
  avoid. Tokens in three tiers (`ui/tokens/primitives.css` → `semantic.css` → a component's own
  module); screens use semantic tokens only, and `npm run styles` (part of `npm run check`) fails
  on a raw colour, a raw duration or a blurred shadow. Focus is one ink ring declared once in
  `tokens.css`. `Dialog` is the native `<dialog>`; do not re-implement its focus trap. The mascot
  is the `Mascot` slot, replaced through the pending asset `mascot.primary` (P-15).
- **T-202 added the PWA (D-020, D-026).** Everything is in `apps/web/src/pwa/`, and the build writes
  `build/client/sw.js` and `build/client/offline.html`, which are in no source folder. There is no
  worker in development. The worker never answers `/v1`, `/admin/v1`, a WebSocket upgrade, a
  non-GET or another origin, and nothing is ever written to a cache but the precache list and files
  whose name carries their content hash: a new address that must work offline goes in the precache
  list in `vite-pwa.ts`, never in a new caching rule. **No push code and no permission prompt,
  ever (P29).** A fixed element in a corner should know the PWA notices live at the bottom
  (z-index 50), toasts at 60, and the top bar at 40.
- The four app icons in `playhoot_frontend/apps/web/public/assets/icons/` are generated
  placeholders (`npm run icons`); the creator supplies the real art (P-14).
- **T-201 moved `apps/web` to React Router framework mode.** The route table is
  `apps/web/src/routes.ts`; the document is `src/root.tsx`. A new screen that needs the browser
  goes under the pathless `app/ClientLayout.tsx`, and a public, server-rendered one in the language
  branches beside `routes/home.tsx`. Public paths carry the language (`/es`, `/en`, `/pt`): link to
  them with `useLocalePaths()`, never with a bare `/sign-in`. A public route describes itself with
  `publicMeta` (`src/seo/meta.ts`) and its texts live in the catalogs as `seo.*`. Build and run with
  `PLAYHOOT_SITE_URL` set; `npm run start -w @playhoot/web` runs `apps/web/server.js` (D-025).
- Implementation tasks must build exactly what the site data says; if something cannot be built as
  designed, that is a design defect — fix the data in the same task and say so in the Result, or
  stop if it changes contracts between domains.
- The system documentation site: `docs/system/index.html`; validate with
  `node tools/validate-docs.mjs` from the workspace root (417 entities at 0 after T-204, one fewer
  than T-203: `root-redirect` was retired, and no entity was added because the shell's pieces are
  code design, which METHOD §7 keeps off the site).
- Backend DB tests: export `TEST_DATABASE_*` from `playhoot/.env` (Postgres container up).
  **Frontend `npm run check` must be run from PowerShell** — under Git Bash every vitest file fails
  to load with `Cannot read properties of undefined (reading 'config')`, on a clean tree as well;
  it is the shell, not the code. There is **no DOM test environment** in the frontend: tests cover
  logic, and anything about rendering is checked in the browser.
- `.claude/usage.json` does not exist, so usage is not measured automatically: ask the creator to
  check `/usage` at pause points.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
- T-200 decisions for H2 implementation: D-019 (rendering/SEO), D-020 (PWA), D-021 (tokens — now filled with direction A by T-203), D-022 (i18n paths), D-023 (admin area), V-08 (install hint). The planned screens are the contract: `playhoot_frontend/docs/system/screens-shell.js` and `screens-admin.js`.
- T-101 built `utils/txqueue` (D-014, V-05). A domain gets its queue with `registry.Queue(domain)` in `main`, creates its table with `txqueue.Migration` in its own migrations, and registers handlers there.
- T-102 built the admin second factor (D-015). To become admin locally: sign in, read the UUID from `GET /v1/identity/me`, set `IDENTITY_ADMIN_USER_UUID`, restart, enroll at `POST /v1/identity/totp/enroll` + `/confirm`, then `POST /v1/identity/totp/verify` with purpose `admin_token` (admin endpoints) or `step_up` (proof for a sensitive action). Each new admin endpoint needs its own operation at level `admin` in Identity's catalog (as `MANAGE_QUEUES`); sensitive flows spend the proof with `orchestrator/stepup`.
- T-103 built `compliance` (D-016). Flows that gate on markets call `marketaccess.CheckMarketAccess` through the orchestrator, passing the approximate country from `api/geolocation.ApproximateCountry`; flows that need a current acceptance use `acceptances.HasCurrentAcceptance`. Local acceptance texts are draft placeholders (P-23).
- T-104 built `plan` (free limits only). Flows that need capacities call `getuserlimits.GetUserLimits` through the orchestrator and pass the values to the owning domain; admin changes use `MANAGE_PLANS`. Catalog, subscriptions, credits and trial are H6.
- T-105 built `budget` (D-017, V-06). Cost-bearing work calls `admitwork.AdmitWork` through the orchestrator and later `settlework.SettleWork`; a refusal is a pause with `budget.RestrictionMessage`. Domains report other spend by enqueueing `spend-event` in their own queue; add the domain's queue to the `spendingestion.Register` list in `main`.
- T-106 built `notifications` (D-018, V-07). A domain tells a user something by enqueueing `notify` in its own queue (payload `orchestrator/notificationdelivery.Payload`) and adding its queue to the `notificationdelivery` Register list in `main`. Email goes through simulated providers locally; switch modes at `PUT /admin/v1/email/mode`. Only the values a type lists in `EmailValues` ever enter an email.
- T-107 built `analytics` ingestion: enqueue `analytics-event` inside the writing transaction and register the queue in `main`.
- T-108 added `TestH1Walkthrough` (backend root package). A milestone that changes queues, budget, notifications, compliance or analytics keeps it green.
- Admin step-up endpoints take `step_up_proof` in the JSON body; a refused proof answers `step_up_required` (403).
- Two sandbox timing tests (`play/runtime/sandbox`, `simulategame`) can fail under full-suite load and pass alone; not caused by H1 work.
