# Gaps: current code vs. the specification

Snapshot as of 15-nov-2026 (code detail in `inventory/`). Rule: where there is a difference, the specification governs. This list guides the plan; each milestone refines it when it starts.

Legend: ✅ exists and works · 🔧 exists and must be changed · ➕ does not exist.

## Summary

What is built is the **technical core of playing and of creating with external AI**, and it is well done: isolated domains with no direct calls, data trail, idempotency, sandbox, real-time runtime, SDK v1, in-browser game isolation. It is roughly a quarter of the phase 1 scope.
None of the following existed at the snapshot: plans and payments, credits, budget, teacher/student, notifications, reports and support, moderation, admin, public Discovery, history and replay playback, integrated AI, asset library, markets and age, analytics, transactional queue. H1 (closed 15-nov-2026) built the queue, budget core, free limits, notifications, compliance core, analytics ingestion and the admin second factor; see "H1 close".

## Cross-cutting (backend)

| Topic | State | What is missing or changes |
|---|---|---|
| Isolation between domains | ✅ | Only orchestrator/composer/api combine domains. `api` calls operations of a single domain directly: kept. |
| Data trail (change history) | ✅ | Existing standard; apply it to everything new. |
| Transactional queue + DLQ | 🔧 | Built and verified in H1 (`utils/txqueue`, per-domain tables, backoff, dead tasks, admin retry/cancel). Still outside it: the builds table used as a queue and the in-memory replay queue; they move when their milestones touch them (H4/H5). |
| Orchestration with persistence | 🔧 | Orchestrator has no state; repairs on demand. Valid for what exists; payments and grades will need recoverable pending steps (P15§6). |
| Limits per plan passed by the caller | 🔧 | `plan.get-user-limits` exists (H1) but no flow reads it yet; the only applied limit is still 1 active session per creator. Owning milestones wire it (H4 games/creations, H5 sessions/players, H8 rooms, H7 storage). |
| Cost control and admission | 🔧 | Budget core verified in H1 (caps, admission, ladder, automatic shutdown, step-up gradual reopening). Only email asks admission and reports spend; AI, images, simulations, builds, storage, traffic and compute do not yet (each milestone that adds cost-bearing work wires it; H6 completes). See "H1 close" below. |
| Metrics and alerts | 🔧 | They only write to the log (planned for delivery 2). Logical-outcome metrics per operation exist as a pattern. |
| Analytics in DB | 🔧 | Ingestion verified in H1; only `game-created` and `session-started` are emitted. Other events arrive with their milestones; the panel is H10. |
| Multiple instances | 🔧 | `ownership` is a marker; single instance. Acceptable for phase 1. |
| Deletion of users and games | ➕ | `games.deleted_at` is never written; there is no account deletion. |

## Identity and access

| Topic | State | What is missing or changes |
|---|---|---|
| Guest, account, Google, local provider | ✅ | Google never tested against the real one (delivery 2). |
| Guest upgrade without merging with existing accounts | ✅ | Matches P03§10. |
| Email code | ➕ | P03§8. |
| Guest expiry at 90 days | 🔧 | Today they do not expire. |
| Declared age, country, market matrix | 🔧 | Core built (T-103): matrix seeded from P35, declarations, minority signals, acceptances, admin matrix. `check-market-access` is not yet called by create-game, join, subscribe or class flows (each milestone wires it, passing the approximate country from `api/geolocation`, whose local locator always answers unknown). No admin endpoint publishes acceptance texts yet; real texts are loaded before delivery 2 (P-23). |
| Normal/teacher/student modes | ➕ | Only levels anonymous < guest < account. |
| Per-class student identity with credential | ➕ | P03§2-7. |
| Link methods, recovery, profile | ➕ | |
| Administrator with second factor | ➕ | There is no platform role. |
| Name change limit | ➕ | There is history, no limit. |
| OAuth for AI (MCP) | 🔧 | Scope per **account** (`games`: all games). P10§1 requires authorization **per draft**. |
| AI link (7 days, revocable) | 🔧 | Today it gives read and write. P10§2: the link only queries; writing requires separate authorization. |

## Games, versions and publication

| Topic | State | What is missing or changes |
|---|---|---|
| Game, card, logo and photos, editions | ✅ | |
| Draft version → immutable executable | ✅ | The four conditions of P15§2 (in editing, chosen, approved, pinned) still need to be distinguished. |
| Versions inside `play/session` | 🔧 | Split into `play/versions` (P15§2). |
| Publication | 🔧 | Today automatic. Missing: request, admin review of version + card + assets, and keeping the previous approved one while under review. |
| Version history, return to a previous one, unpublish, delete | ➕ | |
| Private content declaration | ➕ | |
| Templates | 🔧 | The copy mechanism exists; nobody can mark a game as a template; missing explicit permission, provenance, administrable recommended ones. |
| Categories and tags | ➕ | Only types without tables. |
| Public Discovery, search, public card | ➕ | `discovery` is an empty stub. |
| Academic mark, languages, devices on card | 🔧 | Languages and devices are computed in the build; exposing them and the academic mark is missing. |
| Game and creation quotas | ➕ | |

## Sessions and replays

| Topic | State | What is missing or changes |
|---|---|---|
| Create, lobby, code and link, start, cancel | ✅ | |
| Runtime (commands, samples, ticks, views, checkpoints) | ✅ | Kept. |
| Closing reasons | ✅ | Cover P06§10. |
| Duration limits (30 min, 10 min, 4 h) | ✅ | The prior warning and "We're still here" are missing. |
| Host who plays or directs | 🔧 | "Join to play" exists; missing the choice with default and perspective permissions by mode. |
| Reconnection | 🔧 | Transport grace of 3 s; P06§3 requires 60 s keeping the seat. |
| Kick | ➕ | |
| Close/reopen admissions | ➕ | |
| Single active control, "Continue here" | 🔧 | The `replaced` closing exists; the walkthrough is missing. |
| Recovery after platform failure | 🔧 | Lazy recovery from checkpoint; missing not counting the 60 s during the outage and communicating uncertainty. |
| Repeat closed session | ➕ | |
| Reservation and consumption of uses, players per plan | ➕ | |
| Class session (validation by Classroom) | ➕ | |
| Results per participant (grades) | ➕ | No results contract. |
| Session history | ➕ | |
| Replay: recording | ✅ | |
| Replay: playback, permissions, 12-month retention, identity substitution | ➕ | |

## Creation

| Topic | State | What is missing or changes |
|---|---|---|
| Draft with revisions, diff, restore, optimistic conflict, idempotency | ✅ | Meets P10§5. |
| Builds, diagnostics, preview, simulations with scenarios | ✅ | |
| MCP + API for external AI, explorable SDK guide | ✅ | Reconcile permissions with P10 (above). |
| Manual copy-paste flow | 🔧 | Exists in a 9-section workspace; the specification asks for operation-specific links and simple screens. |
| Brief | ✅ | `brief.json`. |
| Captures/renders from simulation | ➕ | |
| Automatic presentation images | ➕ | |
| Integrated AI (chat, jobs, models, cap, credits, web research) | ➕ | |
| Administrable asset library, pending items, variants | ➕ | |
| SDK: continuous 2D play (movement, collisions, projectiles, cameras…) | 🔧 | SDK v1 oriented to phases, commands and components; there are two test canvas games. Extend (P36§5). |
| Creation error report | ➕ | |
| Dedicated creation domain | 🔧 | Spread across orchestrator, composer, api and identity. |

## What does not exist (entire domains)

| Area | Patches |
|---|---|
| Plan, charges, purchases, refunds, trial, price protection | P11, P23, P26–P28 |
| AI credits | P12, P28 |
| Budget money picture: reserves, cash, surplus split (core exists since H1) | P12, P30 |
| Classroom: classes, students, materials, activities, grades, export | P02, P03, P07, P08 |
| Minors' authorizations, agreements, acceptances, privacy requests | P20–P22 |
| Reports, support, incoming email | P13, P33 |
| Moderation and graduated measures | P13 |
| Admin (everything) | B, P16 |
| Analytics panel (ingestion exists since H1) | P34 |
| Scheduled retention and deletion | P02§9-11 |

## Frontend

| Topic | State | What is missing or changes |
|---|---|---|
| Package architecture, lint boundaries, layers | ✅ | Three routes call the client without going through state: fix. |
| GameHost, bridge, game isolation, client SDK | ✅ | |
| i18n es/en/pt-BR with parity | ✅ | |
| Path navigation | ✅ | |
| Join, lobby, play, host, creation with external AI, my games, authentication | ✅ | Their presentation is redone. |
| Visual identity | 🔧 | The current one ("game night", owl) is the one the creator rejects. C-03 chose direction A (Ink & Sticker); T-203 replaces it. |
| Two implementations per screen (horizontal/vertical) | 🔧 | Hybrid: some screens with variants, others with classes. |
| SEO | ➕ | Pure SPA with no server rendering or per-route metadata. |
| PWA | ✅ | T-202: manifest with placeholder icons, service worker, offline page, update notice and install offer; verified in a browser. Real icon art and the validation on real Android and iOS devices are still open (T-207, `CREATOR_TODO.md`). |
| WCAG 2.2 AA | 🔧 | No verification. |
| Everything else | ➕ | Home/Discovery, card, profile, history and replay, notifications, plans and purchases, teacher, student, support, admin, AI chat. |
| Mobile app | — | Deferred by P01§5; `apps/mobile` is removed. |

## Process and documentation

| Topic | State | What is missing or changes |
|---|---|---|
| WORK/ADR/human review process | 🔧 | Contradicts P01§2. Removed by `METHOD.md`; cleanup in T-003. |
| Logic Mirror (Go pseudocode) | 🔧 | Replaced by the `docs/system` site. |
| `CURRENT_STATE.md` and README | 🔧 | Out of date with respect to the code. The site replaces them. |
| Old exclusions (payments after launch, teacher layer out of scope, own AI out of scope) | 🔧 | Overridden by P01§3. |

## H1 close (T-108, 15-nov-2026)

The walkthrough `playhoot/walkthrough_h1_test.go` demonstrates H1 on the local database with each step named by its rule. What intentionally remains, and who reconciles it:

| Topic | What remains | Reconciled in |
|---|---|---|
| Existing flows ignore the new gates | create-game, create-session, join, previews, simulations and builds do not call `check-market-access`, `get-user-limits` or `admit-work`, and report no spend. | H3 (market and age at entry), H4 (games, creations), H5 (sessions, players), H6 (budget everywhere) |
| Reach of the shutdown (P32§6) | Enforced at admission: every cost-bearing call is refused and its task retries until dead without reaching a provider. Queue workers keep running cheap, non-cost tasks (entries, analytics); live sessions are not interrupted by a shutdown. | H5/H6 (interrupting sessions and jobs), deployment controls (delivery 2) |
| Ladder alert during a shutdown | The admin's `budget-level-changed` entry is created, but its email is refused like any other spend while shut down (the shutdown does not wait for an alert, P32§5). | H10 (admin panel shows the ladder); accepted |
| P32§10 demonstrations not done locally | Growth with revenue and liquidity, lost or late metrics, late billing, deployment cutoff and residual charges, reaction times. Month change not lifting a shutdown is shown by the budget DB tests, not the walkthrough. | H6 (revenue, metrics), H13 and launch (`CREATOR_TODO.md`) |
| Admin surface | Admin endpoints are covered by handler tests only; there is no admin web yet. | H2 (admin web base), H10 |
| Alerts (P16§5) | Budget and dead-task alerts are log lines and in-app entries only. | Delivery 2 |
| Real providers | Resend, SES and geolocation are simulated or local. | Delivery 2 (`CREATOR_TODO.md`) |

