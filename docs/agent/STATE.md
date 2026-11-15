# State

_Updated: 2026-11-15, closing of T-101._

## Next task

**T-102** · model **Opus** · effort **medium** · Admin second factor: grant, TOTP, admin-mode token, single-use step-up proofs.

## Current milestone

H1 — Backend foundations. T-100 designed the whole milestone; T-101 done; T-102…T-108 implement the rest in order (see `PLAN.md` H1 board).

## In progress

Nothing.

## Open questions for the creator

None. C-03 (visual direction) is planned for H2.

## Notes for the next session

- T-101 built `utils/txqueue` (D-014, V-05). A domain gets its queue with `registry.Queue(domain)` in `main`, creates its table with `txqueue.Migration` in its own migrations, and registers handlers there. The admin level `admin` and operation `MANAGE_QUEUES` exist in Identity's catalog but no token reaches `admin` yet: T-102 must make admin-mode tokens carry `LevelAdmin` so the queue endpoints open.
- The creator must recreate the local database after T-101 (grants migration edited in place).
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
