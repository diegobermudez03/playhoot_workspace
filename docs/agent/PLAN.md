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
| H4 | Games, versions, publication and Discovery | Split `play/versions`; four version conditions; publication review (creates `moderation`'s review core; H9 completes the domain); unpublish/delete; templates with permission and provenance; categories and tags; Discovery, search and card; my games; quotas | P04, P05, P14§2, P15 | H1–H3 | 10–12 |
| H5 | Sessions, history and replays | Host, admissions, 60 s, kick, single control, warnings, recovery, repeat; reservation and consumption of uses; results-per-participant contract in `play`; history; `play.replay` (player, permissions, retention, identity substitution) | P06, P02§9-10, P08§2, P13§5 | H4 | 10–12 |
| H6 | Plans, charges, credits and cost control | Administrable catalog; subscriptions and purchases with simulated provider; prorations, cancellation, recovery, refunds, disputes, discount, protected price; Teacher trial; credits; reservations and funds; caps, restriction, pause and emergency shutdown | P11, P12, P23, P26–P28, P30, P32 | H1, H3 | 14–18 |
| H7 | AI creation, SDK and library | `creation` domain; external AI per P10 (query vs. modification by draft, reconciled MCP, manual flow by links); captures and presentation; asset library and its administration; continuous 2D SDK; integrated AI with simulated providers (jobs, cap, credits, web research); chat | P09, P10, P24, P25, P36, P37 | H4, H6 | 18–24 |
| H8 | Teacher: classes, activities and grades | Classes, students and credentials; existing and new authorizations; processing agreement; materials; context; teacher library; activities; class sessions; grades, final grade and export; teacher and student modes; family groups | P02, P03, P07, P08, P20–P22 · C-02 (answered) | H5, H6, H7 | 16–20 |
| H9 | Support, reports and moderation | Report types, cases, public form, simulated incoming email, appeals; graduated measures; simulated automatic classification; system actions | P13, P33 | H4, H5 | 6–8 |
| H10 | Admin and analytics (closing) | Complete what each milestone has not delivered: users, games, queues, budget panels and creator analytics | B: admin, P16§3, P34 | all | 6–8 |
| H11 | Operational privacy, retention and backup | Scheduled deletions and purges; privacy requests; provider registry; backup and restore locally | P02§9-11, P16§4, P22 | H8 | 4–6 |
| H12 | Launch content | Featured games (mostly continuous play), academic templates, asset inventory with pending items for the operator | P09§7-10, P25§2, P36§3 | H7 | 6–10 |
| H13 | Delivery 1 validation | Full walkthroughs with failures and retries; evidence per rule; delivery inventory; guide to run everything locally or on a VM | P16, index 00§7 | all | 4–6 |

After: creator's test → iteration → **delivery 2** (real integrations, with the creator) → production conditions (`CREATOR_TODO.md`).

T-002 reviewed this order against the closed domain tree (D-001): it stands. Two notes landed in the table above: H4 gives birth to `moderation` (review core only) and H5 owns the results contract and `play.replay`. Domain ↔ milestone map: H1 `budget`+`plan` (minimal), `notifications`, `compliance` (core), `analytics` (ingestion); H4 `play.versions`, `moderation` (review); H5 `play.replay`; H6 `billing`, `plan` and `budget` complete; H7 `creation`, `library`; H8 `classroom`, `compliance` (authorizations, guardian page); H9 `support`, `moderation` complete; H11 `compliance` (privacy requests).

## Board

States: `pending` · `in progress` · `done` · `blocked`. Size: S, M, L. Tier: see `METHOD.md` §4.

### H0 — Method and base documentation

| Task | What | Tier | Size | State |
|---|---|---|---|---|
| T-000 | Full reading, specification map, inventory, gaps, method, plan, repos ready | A | L | done |
| T-001 | System documentation site: structure, views, validator and seed data | B | M | done |
| T-002 | Target architecture: close D-001 and load domains, responsibilities, dependencies and flow catalog in `planned` | A | L | done 2026-11-15 |
| T-003 | Cleanup of both repos: remove old documentation process, versioned binary, empty folders | C | M | done 2026-11-15 |
| T-004 | Load the existing backend into the documentation as `implemented` | C | L | done 2026-11-15 |
| T-005 | Load the existing frontend into the documentation as `implemented` | C | M | done 2026-11-15 |

Order: T-001 → T-003 → T-002 → T-004 → T-005. H0 is closed.

### H1 — Backend foundations

| Task | What | Tier | Size | State |
|---|---|---|---|---|
| T-100 | H1 design: decides shared packages and minimal new domains, documents them in `planned` and writes T-101… | A | L | done 2026-11-15 |
| T-101 | Transactional queue package: per-domain tables, worker, DLQ, admin list/retry/cancel | B | M | done 2026-11-15 |
| T-102 | Admin second factor: grant, TOTP, admin token, single-use step-up proofs | B | M | done |
| T-103 | Compliance core: market matrix (P35 seed), declarations, minority signals, acceptances | B | M | done 2026-11-15 |
| T-104 | Plan minimal: configurable free limits and get-user-limits | C | S | done 2026-11-15 |
| T-105 | Budget core: rates, caps, spend ingestion, admission, restriction ladder, cutoff/reopen | B | L | done 2026-11-15 |
| T-106 | Notifications: entries, preferences, email via Resend/SES ports (simulated), suppressions | B | L | done 2026-11-15 |
| T-107 | Analytics ingestion: event store, queue path, first emitters | C | S | done 2026-11-15 |
| T-108 | H1 walkthrough per P16§2; move to `verified`; close the milestone | B | M | done 2026-11-15 |

**H1 closed 2026-11-15** in 9 tasks (estimate 10–12): the walkthrough `playhoot/walkthrough_h1_test.go` runs with the repo tests; what remains on purpose is listed in `GAPS.md` "H1 close". The overall estimate (120–160 sessions) stands.

### H2 — Frontend base and visual identity

| Task | What | Tier | Size | State |
|---|---|---|---|---|
| T-200 | H2 design: C-03 renders and recommendation, D-019…D-023, planned screens, this board | A | L | done 2026-11-15 |
| T-201 | Rendering and SEO base: React Router framework mode, SSR/prerender, metadata, locale paths, robots/sitemap | B | M | done 2026-11-15 |
| T-202 | PWA base: manifest, service worker, offline page, update notice, install offer | B | S | done 2026-11-15 |
| T-203 | Design system from the chosen direction (A — Ink & Sticker): tokens, fonts, core components, gallery | B | L | done 2026-11-15 |
| T-204 | App shell and public home: fixed bar, mode switch, language, notifications badge/panel, home | B | M | done 2026-11-16 |
| T-205 | Contextual authentication: one screen with reason, minimum account type and return | B | M | done 2026-11-16 |
| T-206 | Admin web base: admin sign-in + TOTP enrollment, shell, queues/DLQ, budget, email panels | B | L | done 2026-11-16 |
| T-207 | H2 close: AA, SEO and PWA verification; `verified`; GAPS rewrite; close the milestone | B | M | done 2026-11-16 |

Order as run: T-201 → T-202 → T-203 → T-204 → T-205 → T-206 → T-207. C-03 was answered at the close of T-202 (direction A), so T-203 moved ahead of the rest and everything after it was built on the real tokens rather than on the neutral placeholders D-021 allowed. **H2 closed 16-nov-2026** in 8 sessions, against the 8–10 estimate. T-207 verified the milestone as behaviour — rendering and SEO, the PWA, WCAG 2.2 AA, structure and the shell — with three re-runnable scripts in the frontend repo, fixed the three accessibility defects and the one SEO defect it found, and ran the join → lobby → play and creation-workspace regression that T-201 and T-203 had carried.

### H3 — Identity and access

| Task | What | Tier | Size | State |
|---|---|---|---|---|
| T-300 | H3 design: email code, declared age and country, guest expiry, linking and recovery, profile, modes, account deletion; writes T-301… | A | L | done 2026-11-16 |
| T-301 | Identity ways in: email-code sign-in, method linking and removal, recovery; the access-code email path | B | L | done 2026-11-16 |
| T-302 | Modes, language, profile data and entry gates: set-mode, interface language, my-data, name-change limit, market/age gates on create-game and join, admin texts endpoints | B | L | done 2026-11-16 |
| T-303 | Deletion and guest expiry: delete-account cleanup across domains, 90-day sweep, activity tracking | B | M | done 2026-11-16 |
| T-304 | Frontend: email code and acceptances on the sign-in screen, the contextual declaration screen | B | M | done 2026-11-16 |
| T-305 | Frontend: profile area, notifications page and preferences, teacher presentation, shell mode switch | B | L | done 2026-11-16 |
| T-306 | Admin panels: market matrix and acceptance texts | C | S | pending |
| T-307 | H3 close: walkthrough, a11y/SEO/PWA re-verification, `verified`, GAPS rewrite; close the milestone | B | M | pending |

Order: T-301 → T-302 → T-303 → T-304 → T-305 → T-306 → T-307. T-304 needs T-301 and T-302;
T-306 needs T-302; T-303 can run any time after T-301. Design decisions in D-033…D-038 and
V-09…V-12; the design is the `planned` site data (455 entities, validator at 0).

### H4 onwards

Each milestone starts with `T-N00` (design, tier A) which writes its tasks here.
