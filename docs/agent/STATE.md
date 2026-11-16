# State

_Updated: 2026-11-15, closing of T-202 (PWA base)._

## Next task

**T-203** · model **Opus** · effort **medium** · Design system from the chosen direction: tokens, fonts, core components, gallery. Size **L** — if it does not fit in one session, leave a handoff.

The creator answered **C-03 at the close of T-202: direction A, Ink & Sticker**, with no adjustments. The render `docs/agent/designs/c03/direction-a.html` is the identity contract. Nothing is blocked any more; T-203 runs before T-204 so everything after it is built on the real tokens instead of the neutral placeholders D-021 allowed.

## Current milestone

H2 — Frontend base and visual identity. Designed by T-200 (board in `PLAN.md`): T-201 (done) → T-202 (done) → **T-203** → T-204 → T-205 → T-206 → T-207.

## Open questions for the creator

None. C-03 was answered at the close of T-202 (direction A). What the creator still has to *do*, as opposed to decide, is in `CREATOR_TODO.md`: P-13 (install the app on a real Android phone and a real iPhone — the emulated check is done, only real devices can confirm it) and P-14 (the four real app icons that replace the generated placeholders). Neither blocks any task before T-207.

## Notes for the next session

- **T-202 added the PWA (D-020, D-026).** Everything of it is in `apps/web/src/pwa/`, and the build writes two files that are in no source folder: `build/client/sw.js` (from `src/pwa/sw.ts`, bundled by `apps/web/vite-pwa.ts`) and `build/client/offline.html` (written from the message catalogs). There is no worker in development. Rules that must survive every later task: the worker never answers `/v1`, `/admin/v1`, a WebSocket upgrade, a non-GET or another origin, and nothing is ever written to a cache but the precache list and files whose name carries their content hash — if a new address has to be served offline, add it to the precache list in `vite-pwa.ts`, never a new caching rule. **No push code and no permission prompt, ever (P29).** A screen that adds a fixed element in a corner should know the notices live at the bottom (`PwaNotices.module.css`, z-index 50).
- T-202 left the "Install Playhoot" entry in the top bar (`ui/AppShell.tsx`); **T-204 moves it into the shell's menu** and can drop the temporary placement. The one-time hint (V-08) is separate from the entry and stays where it is.
- The four app icons in `playhoot_frontend/apps/web/public/assets/icons/` are generated placeholders (`npm run icons`). Do not treat them as the identity; T-203's direction A does not change them, and the creator supplies the real art (P-14).
- A browser is available in this environment (Chrome, driven over the DevTools protocol from a throwaway Node script using Node 22's global `WebSocket`). T-202 used it to verify the worker, the update flow and the offline page end to end. A task that needs to see the real app can do the same instead of declaring it unverified. **Still not exercised that way: joining a session and opening a game workspace** (carried over from T-201; hydration of `/en` itself is now confirmed).
- T-201 moved `apps/web` to React Router framework mode. The route table is `apps/web/src/routes.ts`; the document is `src/root.tsx`; a new screen that needs the browser goes under the pathless `app/ClientLayout.tsx` (nothing renders on the server there) and a public, server-rendered one goes in the language branches beside `routes/home.tsx`. Public paths carry the language (`/es`, `/en`, `/pt`): link to them with `useLocalePaths()`, never with a bare `/sign-in`. A public route describes itself with `publicMeta` (`src/seo/meta.ts`) and its texts live in the catalogs as `seo.*`. Build and run with `PLAYHOOT_SITE_URL` set; `npm run start -w @playhoot/web` runs `apps/web/server.js` (D-025).
- Not verified by T-201: hydration and the existing flows in a real browser (no browser in that session). The first session that runs the app should open `/en`, join a session and open a game workspace before building on top.
- T-200 decisions for H2 implementation: D-019 (rendering/SEO), D-020 (PWA), D-021 (tokens — neutral values until C-03, only values/skins change after), D-022 (i18n paths), D-023 (admin area), V-08 (install hint). The planned screens are the contract: `playhoot_frontend/docs/system/screens-shell.js` and `screens-admin.js`.
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
- Backend DB tests: export `TEST_DATABASE_*` from `playhoot/.env` (Postgres container up). Frontend `npm run check` runs from PowerShell.
- Implementation tasks must build exactly what the site data says; if something cannot be built as designed, that is a design defect — fix the data in the same task and say so in the Result, or stop if it changes contracts between domains.
- The system documentation site: `docs/system/index.html`; validate with `node tools/validate-docs.mjs` from the workspace root (418 entities at 0 after T-202).
- `.claude/usage.json` does not exist, so usage is not measured automatically: ask the creator to check `/usage` at pause points.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
