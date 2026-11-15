# Agent working method

In force since 15-nov-2026. Replaces all previous processes of both repos (WORK, mandatory ADRs, HUMAN_REVIEW, Logic Mirror, approval gates).

## 1. Roles

| Who | What they decide or do |
|---|---|
| **Creator** | Product decisions not made in `docs/definitivos/`. Continue or stop based on usage. Does what the agent cannot: open sessions with the indicated model and effort, install tools, create accounts, provide files. |
| **Lead agent** (any session) | Everything else: plan, order, architecture, code, tests, documentation, commits and push. Does not ask for approval per task. |

The creator does not review code or carry information between sessions. Everything a session needs is in the repository.

**Language (creator's rule, 15 Nov 2026):** everything the agent produces is in English — code, comments, commit messages, these documents, the system documentation site, and every message to the creator. Only the product specification (`docs/definitivos/`) and the legacy plans are in Spanish.

## 2. Where everything lives

| Path (from the workspace root) | Content |
|---|---|
| `docs/definitivos/` | Product specification (39 DOCX). `md/` = extracted text for reading and searching (`tools/docx2md.py` regenerates it). |
| `docs/agent/SPEC_MAP.md` | Resolved map: which source governs each topic and what it says. |
| `docs/agent/STATE.md` | **Entry point of every session**: next task, model, what is half-done. |
| `docs/agent/PLAN.md` | Milestones and task board. |
| `docs/agent/tasks/T-NNN.md` | Self-contained brief of each task and its result. |
| `docs/agent/handoffs/` | Handoff when a task is left half-done. |
| `docs/agent/DECISIONS.md` | The agent's technical decisions, chosen defaults and open questions for the creator. |
| `docs/agent/CREATOR_TODO.md` | What only the creator can do and by when. |
| `docs/agent/GAPS.md` | Differences between the current code and the specification. |
| `docs/agent/inventory/` | Snapshot of the code as of 15-nov-2026. |
| `docs/system/` | HTML system documentation for the creator (site). Its data lives in each repo: `playhoot/docs/system/`, `playhoot_frontend/docs/system/`. |
| `docs/legacy/` | Old plans 02–08: lower layer, only valid where nothing above contradicts them. |
| `playhoot/`, `playhoot_frontend/` | Code repos, each with its own git and its technical `AGENTS.md`. |

## 3. Session cycle

**Start**
1. Read `STATE.md` and the indicated task (`tasks/T-NNN.md`). Read only what the task lists; do not explore more than that.
2. Record the initial usage (§5).
3. If the session runs with a model or effort different from what the task asks for, say so in one line and continue unless the task marks it as mandatory.

**Work**
4. Implement according to the upper layer of the specification. When there is a difference with the code or with old documents: do what the specification says and note it in `GAPS.md` if it was not there.
5. Product hole (something that is neither decided nor inferable): record in `DECISIONS.md` as open question `C-NN` with the recommended option. If it does not block, continue with the rest; if it blocks, stop that part.
6. Relevant technical decision (domain structure, contracts between domains, technical providers, patterns): a short `D-NN` entry in `DECISIONS.md`. No ADRs or templates.

**Closing** — a task is done when:
- [ ] The behavior meets the specification sections cited in the task.
- [ ] The repo checks pass (backend: `go build ./... && go vet ./... && go test ./...`; frontend: `npm run check`).
- [ ] The system documentation (`docs/system` of each touched repo) reflects the change and its validator passes.
- [ ] `PLAN.md`, `STATE.md` and the result in `tasks/T-NNN.md` are updated.
- [ ] Commit and push in each touched repo (§6).

**Final message to the creator**, always in this form and nothing more:
1. What was done (2–4 lines, no code detail).
2. Usage: initial → final of the 5 h window and weekly, or "not measured".
3. Open questions that need an answer (if any).
4. Next order: `Open a new session in the repos folder · model X · effort Y · type: Task T-NNN`.

After closing, the session does not accept new tasks: it replies that another one should be opened. A session does **one task**; it may chain another only if both are size S and the second uses the same model.

**Handoff:** if a task does not finish in its session (long context, pause for usage), write `handoffs/T-NNN-handoff-K.md` with: what is done, exact pending work, half-touched files, missing verification. `STATE.md` points to the handoff.

## 4. Model and effort by task type

The agent cannot change its own model: each task declares the one it needs and the creator opens the session that way.

| Tier | Model · effort | For what |
|---|---|---|
| **A** | Fable · high | Design of domains and contracts, risk logic (credits, charges, budget and cutoff, session concurrency, permissions, privacy and deletion), visual direction, replanning. |
| **B** | Opus · medium | Implementing something already designed that requires judgment: use cases, workflows, endpoints, screens with state, tests. This is the usual tier. |
| **C** | Sonnet · medium | Well-specified, repetitive work: admin screens of list/detail type, texts and languages, loading documentation data, renames, additional tests. |

- Move up a tier only if the task justifies it in writing. `xhigh`/`max` only in A tasks marked that way.
- Within a session, delegate to cheaper-model subagents whatever is broad search or bulk reading (`Explore`/`sonnet`/`haiku`), and keep design, integration and verification in the main session. Do not delegate what fits in a few calls.
- A tasks that design a milestone **write the design as system documentation data in state `planned`** and leave the B/C tasks that implement it written up. This way the design is not passed on through conversation.

## 5. Usage

Creator's rule: if during a stretch of work the 5 h window rises more than 20 points or the weekly one more than 2, stop and warn; the creator decides whether to continue.

- Automatic source: `.claude/usage.json` in the workspace root (written by the statusline script `.claude/usage-statusline.mjs`). If it exists and its `ts` is from the last few minutes, it is read at start and at closing.
- If it does not exist or is stale: the agent cannot run `/usage`. The size of the work done is estimated and the creator is asked to check `/usage` at each pause point.
- Mandatory pause points: the closing of each task, and within L tasks the points the task marks.
- Do not overthink: no open-ended explorations, no rereading what is already summarized in `SPEC_MAP.md` except the patch that governs the task, no intermediate documents that nobody will read.

## 6. Git

- Three independent repos: `playhoot/` (backend), `playhoot_frontend/` (frontend) and the workspace (this folder: specification, plan and documentation site). Each commit is made **inside the directory of the corresponding repo**.
- Only `git add`, `git commit -m "..."` and `git push` from the creator's terminal, with their identity already configured. **No co-authorship lines, no attribution to the agent, no agent tokens or credentials, no `gh`.**
- Branch `main`, linear history. One commit per coherent step with checks green; push immediately.
- Message: `T-NNN: imperative summary`.
- Never `--no-verify`, `--force`, or rewriting published history.
- Before the first deployment, migrations are edited in their original file; the creator is told when they must recreate the local DB.

## 7. System documentation (creator requirement)

Navigable, expandable HTML site at `docs/system/index.html`. Specification in `docs/agent/designs/system-docs.md`. Permanent rules:

- Level of detail: domains and subdomains, data schema per domain, exposed operations, orchestrated flows (steps, conditions, saga/persistence, states), endpoints, screens and their calls. For a leaf operation: what it reads, what it writes and the main business rules.
- Code design is **not** documented: helpers, DTOs, patterns, signatures.
- Everything collapsed by default; each entity has its own URL and is reached from several entry points (domain, operation, flow, endpoint, screen, table).
- No sequence diagrams. No decoration: readable and plain.
- Each element carries a state: `planned` · `implemented` · `verified`.
- It is part of the definition of done of every task. A validator in each repo checks that documentation and code do not diverge.

## 8. Engineering rules that are kept

The existing technical standards of each repo remain in force as a lower layer (compatible with the specification): testing conventions, repositories and SQL (no literals: constants bound as parameters; inserts with `Create()`), object storage (signed URL only when the bytes do not go through the backend), logs and metrics, frontend package boundaries, user texts and i18n. Each repo's `AGENTS.md` lists them.

## 9. Deliveries

- **Delivery 1 (local, simulated providers):** objective of this plan. No "provisional code to be replaced later": the definitive interface is built and a real or simulated local provider behind the port.
- **Delivery 2 (real integrations):** with the creator, after their test of delivery 1.
- What can only be closed with real providers, money or paperwork goes to `CREATOR_TODO.md` with owner and closing condition.
