# Implementation plan — phase 1, delivery 1 (local)

**Rolling-wave** plan: the milestones and their order are fixed; the tasks of each milestone are written by its design task (tier A) when it is reached. This way nothing is planned in detail that will change when building the previous work.

Objective: all flows and rules of `docs/definitivos/` executable locally with simulated providers (see `SPEC_MAP.md` §1). Rough estimate: **120–160 sessions**. Refined when H1 closes.

## How it is ordered

1. First what everything else needs (documentation, queue, limits, costs, notifications, markets).
2. Then by vertical slices: each milestone delivers backend + screens + its admin part + its documentation.
3. What already exists is reconciled when its milestone arrives, not before.
4. Each milestone closes with a demonstrable walkthrough of its behaviors (P16§2).

## Milestones

| # | Milestone | Content | Sources | Depends on | Sessions |
|---|---|---|---|---|---|
| H0 | Method and base documentation | Documentation site, target architecture, repo cleanup, loading of what exists | METHOD, B | — | 5–6 |
| H1 | Backend foundations | Transactional queue + DLQ; limits convention; minimal `budget` (cost measurement and admission, restriction states); minimal `plan` (configurable free limits); `notifications` (in-app + simulated email with Resend/SES modes); `compliance` core (market matrix, declarations, acceptances); `analytics` (queue ingestion); administrator with second factor and action log | B: principles, P12, P29–P32, P34, P35 | H0 | 10–12 |
| H2 | Frontend base and visual identity | Rendering for SEO and PWA; **visual direction (C-03)**; design system; structure with fixed bar, mode switch and language; contextual authentication; admin web base; AA accessibility as a criterion | B: frontend/UI, P01§5, P14 | H0 (can alternate with H1) | 8–10 |
| H3 | Identity and access | Email code; age and country; guests at 90 days; link methods; profile; modes; account deletion; public entry | P03, P19, P35, P14§1 · C-01 (answered) | H1, H2 | 7–9 |
| H4 | Games, versions, publication and Discovery | Split `play/versions`; four version conditions; publication review; unpublish/delete; templates with permission and provenance; categories and tags; Discovery, search and card; my games; quotas | P04, P05, P14§2, P15 | H1–H3 | 10–12 |
| H5 | Sessions, history and replays | Host, admissions, 60 s, kick, single control, warnings, recovery, repeat; reservation and consumption of uses; history; player; permissions; retention; identity substitution | P06, P02§9-10, P13§5 | H4 | 10–12 |
| H6 | Plans, charges, credits and cost control | Administrable catalog; subscriptions and purchases with simulated provider; prorations, cancellation, recovery, refunds, disputes, discount, protected price; Teacher trial; credits; reservations and funds; caps, restriction, pause and emergency shutdown | P11, P12, P23, P26–P28, P30, P32 | H1, H3 | 14–18 |
| H7 | AI creation, SDK and library | `creation` domain; external AI per P10 (query vs. modification by draft, reconciled MCP, manual flow by links); captures and presentation; asset library and its administration; continuous 2D SDK; integrated AI with simulated providers (jobs, cap, credits, web research); chat | P09, P10, P24, P25, P36, P37 | H4, H6 | 18–24 |
| H8 | Teacher: classes, activities and grades | Classes, students and credentials; existing and new authorizations; processing agreement; materials; context; teacher library; activities; class sessions; grades, final grade and export; teacher and student modes; family groups | P02, P03, P07, P08, P20–P22 · C-02 (answered) | H5, H6, H7 | 16–20 |
| H9 | Support, reports and moderation | Report types, cases, public form, simulated incoming email, appeals; graduated measures; simulated automatic classification; system actions | P13, P33 | H4, H5 | 6–8 |
| H10 | Admin and analytics (closing) | Complete what each milestone has not delivered: users, games, queues, budget panels and creator analytics | B: admin, P16§3, P34 | all | 6–8 |
| H11 | Operational privacy, retention and backup | Scheduled deletions and purges; privacy requests; provider registry; backup and restore locally | P02§9-11, P16§4, P22 | H8 | 4–6 |
| H12 | Launch content | Featured games (mostly continuous play), academic templates, asset inventory with pending items for the operator | P09§7-10, P25§2, P36§3 | H7 | 6–10 |
| H13 | Delivery 1 validation | Full walkthroughs with failures and retries; evidence per rule; delivery inventory; guide to run everything locally or on a VM | P16, index 00§7 | all | 4–6 |

After: creator's test → iteration → **delivery 2** (real integrations, with the creator) → production conditions (`CREATOR_TODO.md`).

## Board

States: `pending` · `in progress` · `done` · `blocked`. Size: S, M, L. Tier: see `METHOD.md` §4.

### H0 — Method and base documentation

| Task | What | Tier | Size | State |
|---|---|---|---|---|
| T-000 | Full reading, specification map, inventory, gaps, method, plan, repos ready | A | L | done |
| T-001 | System documentation site: structure, views, validator and seed data | B | M | pending |
| T-002 | Target architecture: close D-001 and load domains, responsibilities, dependencies and flow catalog in `planned` | A | L | pending |
| T-003 | Cleanup of both repos: remove old documentation process, versioned binary, empty folders | C | M | pending |
| T-004 | Load the existing backend into the documentation as `implemented` | C | L | pending |
| T-005 | Load the existing frontend into the documentation as `implemented` | C | M | pending |

Order: T-001 → T-003 → T-002 → T-004 → T-005.

### H1 — Backend foundations

| Task | What | Tier | Size | State |
|---|---|---|---|---|
| T-100 | H1 design: decides shared packages and minimal new domains, documents them in `planned` and writes T-101… | A | L | pending |

### H2 onwards

Each milestone starts with `T-N00` (design, tier A) which writes its tasks here.
