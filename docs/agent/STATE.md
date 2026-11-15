# State

_Updated: 2026-11-15, closing of T-100._

## Next task

**T-101** · model **Opus** · effort **medium** · Transactional queue package with DLQ and its admin surface (first H1 implementation task).

## Current milestone

H1 — Backend foundations. T-100 designed the whole milestone; T-101…T-108 implement it in order (see `PLAN.md` H1 board).

## In progress

Nothing.

## Open questions for the creator

None. C-03 (visual direction) is planned for H2.

## Notes for the next session

- T-100 loaded the H1 design as `planned` site data (+79 entities, validator at 0 over 401): txqueue package detail, identity admin 2FA, compliance core, plan free limits, budget core with the restriction-ladder lifecycle, notifications with email providers behind ports, analytics ingestion, 9 detailed flows and 23 planned endpoints. Decisions D-010…D-013, defaults V-02…V-04.
- Implementation tasks must build exactly what the site data says; if something cannot be built as designed, that is a design defect — fix the data in the same task and say so in the Result, or stop if it changes contracts between domains.
- Cross-domain async pattern (D-010): a domain writes `notify` / `analytics-event` / `spend-event` tasks into its own queue; orchestrator-registered processors deliver them. Domains never call each other.
- D-013 added package steps to the documentation model (txqueue admin registry); the validator already supports them.
- The system documentation site works: `docs/system/index.html`; validate with `node tools/validate-docs.mjs` from the workspace root.
- `.claude/usage.json` does not exist, so usage is not measured automatically: ask the creator to check `/usage` at pause points.
- Run the frontend `npm run check` from PowerShell; backend tests that need a database require `docker compose up -d postgres` and the `TEST_DATABASE_*` variables (not yet run on this machine).
- The workspace repository has a remote (`origin`); commit and push it like the other two.
