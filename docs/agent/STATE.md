# State

_Updated: 2026-11-15, closing of T-005._

## Next task

**T-100** · model **Fable** · effort **high** · H1 design (decides shared packages and minimal new domains, documents them in `planned`, writes T-101…).

## Current milestone

H0 is closed. Next: H1 — Backend foundations (design task T-100 starts it). See `PLAN.md`.

## In progress

Nothing.

## Open questions for the creator

None. C-03 (visual direction) is planned for H2.

## Notes for the next session

- T-004 loaded the existing backend (47 tables, ~46 operations, 73 flows including the cross-domain ones, 106 endpoints: 80 REST + 4 WS + 22 MCP) into `playhoot/docs/system/` as `implemented`. The validator passes at 0 errors.
- T-005 loaded the existing frontend (23 screens: entry/sign-in, sessions, the game workspace and its 9 sections, AI-connection screens) into `playhoot_frontend/docs/system/` as `implemented`, linked to T-004's endpoints. Validator at 0 errors (322 entities total). `docs/architecture/BACKEND_CONTRACT.md` was kept (not deleted): it covers wire-level protocol detail (JSON shapes, error/close codes, limits, seed data) the system docs site deliberately leaves out; see `tasks/T-005.md` Result for the reasoning.
- T-100 starts H1: read `SPEC_MAP.md` and the governing patches for the queue/limits/budget/plan/notifications/compliance-core/analytics scope before designing.
- `create-game`, `start-creation` and `external-ai-edit` now have real `steps` (no more `touches`); new flows were added for the rest of the orchestrator/composer groups (`edit-draft`, `ensure-draft`, `start-draft-preview`, `game-ai-link`, `publish-game`, `open-edition`, `ai-link-status`, `read-draft-workspace`, `simulate-draft`, `browse-game-templates`). Nothing in `GAPS.md` needed to change: the gaps these flows leave out (compliance/plan checks, moderation review, budget admission, Discovery catalog) were already recorded there.
- `play.versions` as a domain stayed `status: planned` (the split from `play.session` and the four version conditions are future design), but its tables and operations that already exist in code (drafts, builds, previews, simulation results) are loaded individually as `implemented`. Same for `play.replay` (recording only; playback/retention still planned).
- `backend-entrypoints-infra.md`'s note about the resource-grants/asset-upload-URL work being uncommitted is now stale: it is committed (`11f1eee`). Worth refreshing that inventory file if it is read again for something else; not corrected here since it is a snapshot document, not source of truth.
- The system documentation site works: `docs/system/index.html`; validate data with `node tools/validate-docs.mjs` from the workspace root. Conventions in `DECISIONS.md` D-008 and D-009.
- `.claude/usage.json` does not exist, so usage is not measured automatically: ask the creator to check `/usage` at pause points.
- Run the frontend `npm run check` from PowerShell; in Git Bash vitest fails to start every test file (path casing), which is not a real failure.
- Backend tests that need a database require `docker compose up -d postgres` and the `TEST_DATABASE_*` variables; without them those tests are skipped. They have not been run on this machine yet.
- The workspace repository has a remote (`origin`); commit and push it like the other two.
