# State

_Updated: 2026-11-15, closing of T-106._

## Next task

**T-107** · model **Sonnet** · effort **medium** · Analytics ingestion: event store, queue path, first emitters.

## Current milestone

H1 — Backend foundations. T-100 designed the whole milestone; T-101…T-106 done; T-107 and T-108 finish it in order (see `PLAN.md` H1 board).

## In progress

Nothing.

## Open questions for the creator

None. C-03 (visual direction) is planned for H2.

## Notes for the next session

- T-101 built `utils/txqueue` (D-014, V-05). A domain gets its queue with `registry.Queue(domain)` in `main`, creates its table with `txqueue.Migration` in its own migrations, and registers handlers there.
- T-102 built the admin second factor (D-015). To become admin locally: sign in, read the UUID from `GET /v1/identity/me`, set `IDENTITY_ADMIN_USER_UUID`, restart, enroll at `POST /v1/identity/totp/enroll` + `/confirm`, then `POST /v1/identity/totp/verify` with purpose `admin_token` (admin endpoints) or `step_up` (proof for a sensitive action). Each new admin endpoint needs its own operation at level `admin` in Identity's catalog (as `MANAGE_QUEUES`); sensitive flows spend the proof with `orchestrator/stepup`.
- T-103 built `compliance` (D-016). Flows that gate on markets call `marketaccess.CheckMarketAccess` through the orchestrator, passing the approximate country from `api/geolocation.ApproximateCountry`; flows that need a current acceptance use `acceptances.HasCurrentAcceptance`. Local acceptance texts are draft placeholders (P-23).
- T-104 built `plan` (free limits only). Flows that need capacities call `getuserlimits.GetUserLimits` through the orchestrator and pass the values to the owning domain; admin changes use `MANAGE_PLANS`. Catalog, subscriptions, credits and trial are H6.
- T-105 built `budget` (D-017, V-06). Cost-bearing work calls `admitwork.AdmitWork` through the orchestrator (category, service, estimated quantity, reference, discretionary, max duration) and later `settlework.SettleWork` with the measured quantity; a refusal is a pause with `budget.RestrictionMessage`. Domains report other spend by enqueueing `spend-event` (payload in `orchestrator/spendingestion.Payload`) in their own queue; add the domain's queue to the `spendingestion.Register` list in `main`. Budget ladder moves leave `notify` tasks (recipient `admin`, type `budget-level-changed`, skeleton with level/reason/actor) now delivered by T-106; the email category has rates for `ses-outbound` and `resend-outbound` and an email day cap of USD 1.
- T-106 built `notifications` (D-018, V-07). A domain tells a user something by enqueueing `notify` in its own queue (payload `orchestrator/notificationdelivery.Payload`: recipient user UUID or `admin`, a type constant from `notifications.Matrix`, idempotency key, external token, skeleton, optional `send_at` and `student`) and adding its queue to the `notificationdelivery` Register list in `main` (identity, budget and notifications today). Email goes through simulated providers locally (nothing leaves the machine); switch modes at `PUT /admin/v1/email/mode`. Only the values a type lists in `EmailValues` ever enter an email.
- Admin step-up endpoints take `step_up_proof` in the JSON body; a refused proof answers `step_up_required` (403).
- The creator must recreate the local database after T-101 (grants migration edited in place) if not done yet; T-102 only added a new migration.
- Two sandbox timing tests (`play/runtime/sandbox`, `simulategame`) can fail under full-suite load and pass alone; not caused by H1 work.
- Backend DB tests run here: export `TEST_DATABASE_*` from the values in `playhoot/.env` (Postgres container is up).
- T-100 loaded the H1 design as `planned` site data (+79 entities, validator at 0 over 401): txqueue package detail, identity admin 2FA, compliance core, plan free limits, budget core with the restriction-ladder lifecycle, notifications with email providers behind ports, analytics ingestion, 9 detailed flows and 23 planned endpoints. Decisions D-010…D-013, defaults V-02…V-04.
- Implementation tasks must build exactly what the site data says; if something cannot be built as designed, that is a design defect — fix the data in the same task and say so in the Result, or stop if it changes contracts between domains.
- Cross-domain async pattern (D-010): a domain writes `notify` / `analytics-event` / `spend-event` tasks into its own queue; orchestrator-registered processors deliver them. Domains never call each other.
- D-013 added package steps to the documentation model (txqueue admin registry); the validator already supports them.
- The system documentation site works: `docs/system/index.html`; validate with `node tools/validate-docs.mjs` from the workspace root.
- `.claude/usage.json` does not exist, so usage is not measured automatically: ask the creator to check `/usage` at pause points.
- Run the frontend `npm run check` from PowerShell; backend tests that need a database require `docker compose up -d postgres` and the `TEST_DATABASE_*` variables.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
