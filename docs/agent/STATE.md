# State

_Updated: 2026-11-15, closing of T-000._

## Next task

**T-001 — System documentation site** · model **Opus** · effort **medium** · brief in `tasks/T-001.md`.

Then, in this order: T-003 (Sonnet · medium) → T-002 (Fable · high) → T-004 (Sonnet · medium) → T-005 (Sonnet · medium) → T-100 (Fable · high).

## Current milestone

H0 — Method and documentation base. See `PLAN.md`.

## In progress

Nothing.

## Open questions for the creator

None. C-01 and C-02 were answered on 2026-11-15 (`DECISIONS.md`). C-03 (visual direction) is planned for H2.

## Notes for the next session

- Everything is written in English from now on, including messages to the creator (`AGENTS.md`, Language).
- Check whether `.claude/usage.json` exists at the workspace root and whether its `ts` is recent: that tells whether automatic usage measurement works in the VS Code extension. If it does not exist, note it here and ask the creator to check `/usage` at pause points.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
- Backend tests that need a database require `docker compose up -d postgres` and the `TEST_DATABASE_*` variables; without them those tests are skipped. They have not been run on this machine yet.
