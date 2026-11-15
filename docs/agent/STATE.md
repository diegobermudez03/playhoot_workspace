# State

_Updated: 2026-11-15, closing of T-002._

## Next task

**T-004** · model **Sonnet** · effort **medium** · brief in `tasks/T-004.md`.

Then: T-005 (Sonnet · medium) → T-100 (Fable · high).

## Current milestone

H0 — Method and documentation base. See `PLAN.md`. T-004 and T-005 close it.

## In progress

Nothing.

## Open questions for the creator

None. C-03 (visual direction) is planned for H2.

## Notes for the next session

- T-002 closed the target tree (D-001) and loaded it into the site with the flow catalog in `planned`. T-004 loads the **existing backend** detail (tables, operations, endpoints) as `implemented` under the domains already registered; follow D-008 and D-009 conventions, and `inventory/backend-domains.md` is the map of what exists.
- Some catalog flows in `playhoot/docs/system/flows.js` already partially exist in code (e.g. `create-game`, `start-creation`, `external-ai-edit`). When T-004 documents the implemented version of one, it **replaces** the planned entry under the same id: real steps as the code has them, status `implemented`, and the future touches that the code lacks stay in `GAPS.md`, not in the flow.
- The system documentation site works: `docs/system/index.html`; validate data with `node tools/validate-docs.mjs` from the workspace root. Conventions in `DECISIONS.md` D-008 and D-009.
- `.claude/usage.json` does not exist, so usage is not measured automatically: ask the creator to check `/usage` at pause points.
- Run the frontend `npm run check` from PowerShell; in Git Bash vitest fails to start every test file (path casing), which is not a real failure.
- Backend tests that need a database require `docker compose up -d postgres` and the `TEST_DATABASE_*` variables; without them those tests are skipped. They have not been run on this machine yet.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
