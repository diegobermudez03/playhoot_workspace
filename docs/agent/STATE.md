# State

_Updated: 2026-11-15, closing of T-003._

## Next task

**T-002** · model **Fable** · effort **high** · brief in `tasks/T-002.md`.

Then, in this order: T-004 (Sonnet · medium) → T-005 (Sonnet · medium) → T-100 (Fable · high).

## Current milestone

H0 — Method and documentation base. See `PLAN.md`.

## In progress

Nothing.

## Open questions for the creator

None. C-03 (visual direction) is planned for H2.

## Notes for the next session

- The system documentation site works: `docs/system/index.html`; validate data with `node tools/validate-docs.mjs` from the workspace root. Conventions in `DECISIONS.md` D-008.
- `.claude/usage.json` does not exist, so usage is not measured automatically: ask the creator to check `/usage` at pause points.
- Run the frontend `npm run check` from PowerShell; in Git Bash vitest fails to start every test file (path casing), which is not a real failure.
- Backend tests that need a database require `docker compose up -d postgres` and the `TEST_DATABASE_*` variables; without them those tests are skipped. They have not been run on this machine yet.
- T-003 done: the repos hold only current docs plus `docs/technical-decisions/` (history). The old deployment checklist is now D-01…D-16 in `CREATOR_TODO.md`. Backend `ARCHITECTURE.md` stays as the invariants file.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
