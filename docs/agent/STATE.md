# State

_Updated: 2026-11-15, closing of T-201 (rendering and SEO base)._

## Next task

**T-202** · model **Opus** · effort **medium** · PWA base (manifest, service worker, offline page, update notice, install offer).

If the creator has answered **C-03** (see `DECISIONS.md`), **T-203** (design system) may run before or right after T-202 — it is the only blocked task and the rest of H2 builds on it best.

## Current milestone

H2 — Frontend base and visual identity. Designed by T-200 (board in `PLAN.md`): T-201 (done) → T-202 → T-204 → T-205 → T-206 → T-207, with T-203 waiting on C-03.

## Open questions for the creator

**C-03 (visual direction)** — asked 2026-11-15. Open `docs/agent/designs/c03/index.html` in a browser (the three pages animate; press the buttons). Recommendation: **A — Ink & Sticker**. Answer in any session: `C-03: A` / `B` / `C` / `you decide`, adjustments welcome. Only T-203 waits for it.

## Notes for the next session

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
- The system documentation site: `docs/system/index.html`; validate with `node tools/validate-docs.mjs` from the workspace root (417 entities at 0 after T-200).
- `.claude/usage.json` does not exist, so usage is not measured automatically: ask the creator to check `/usage` at pause points.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
