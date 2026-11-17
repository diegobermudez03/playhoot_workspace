# Gaps: current code vs. the specification

Snapshot as of 15-nov-2026 (code detail in `inventory/`). Rule: where there is a difference, the specification governs. This list guides the plan; each milestone refines it when it starts.

Legend: ✅ exists and works · 🔧 exists and must be changed · ➕ does not exist.

## Summary

What is built is the **technical core of playing and of creating with external AI**, and it is well done: isolated domains with no direct calls, data trail, idempotency, sandbox, real-time runtime, SDK v1, in-browser game isolation. It is roughly a quarter of the phase 1 scope.
None of the following existed at the snapshot: plans and payments, credits, budget, teacher/student, notifications, reports and support, moderation, admin, public Discovery, history and replay playback, integrated AI, asset library, markets and age, analytics, transactional queue. H1 (closed 15-nov-2026) built the queue, budget core, free limits, notifications, compliance core, analytics ingestion and the admin second factor; see "H1 close". H2 (closed 16-nov-2026) built the frontend base — server rendering and SEO, the PWA, the "Ink & Sticker" design system, the shell and home, one contextual authentication screen and the admin web base — and verified it as behaviour; see "Frontend".

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
| Deletion of users and games | 🔧 | Designed by T-300 (D-036): account and guest deletion with cross-domain cleanup is T-303; `games.deleted_at` gets its first writer there. Single-game withdrawal stays H4. |

## Identity and access

Rewritten by T-307 at the H3 close (16 Nov 2026), against what exists and what was demonstrated
(`playhoot/walkthrough_h3_test.go`, `walkthrough_h3_deletion_test.go`, and the three verify scripts
of the frontend). Every row is done or assigned to a later milestone.

| Topic | State | What is missing or changes | Owner |
|---|---|---|---|
| Guest, account, Google, local provider | ✅ | Google never tested against the real one; linking a provider identity is covered by tests and the local provider only. | Delivery 2 (`CREATOR_TODO.md` D-01) |
| Guest upgrade without merging with existing accounts | ✅ | P03§10; demonstrated by code in the H3 walkthrough (identity and name kept). | — |
| Email code | ✅ | P03§8, V-09. Demonstrated: registering, signing in again into the same account, a wrong code leaving the attempt live, a spent code, the fourth send in 15 minutes acknowledged but not sent. Its two screen states audited at WCAG 2.2 AA, the wrong-code announcement checked by keyboard. | — |
| Guest expiry at 90 days | ✅ | P02§9, V-11. Demonstrated on a backdated guest: expired through the same deletion with origin `expiry`; an upgraded guest is never swept. | — |
| Declared age, country, market matrix | 🔧 | Create-game asks for the declaration and goes ahead once declared; a declaration below the age binds (P21§6) and cannot be changed by answering again; joining asks nothing and refuses only where restricted (C-01, corrected in D-044); the declaration screen and the admin matrix panel are verified. Missing: the gates of the flows later milestones build, and a public read of what a place asks for (D-042). | H4/H6/H8 (their own gates, and the public read) |
| Normal/teacher/student modes | 🔧 | P03§9. Normal and teacher done: the mode rides the token and survives renewals (demonstrated), the switch and the honest teacher presentation exist (T-305, audited). Missing: student identity and what teaching unlocks. | H8 (student, classes), H6 (plans) |
| Recorded acceptances (P22§3) | ✅ | Terms and own-data at the gate, marketing at its switch, the class agreement readable and downloadable; texts published from admin (T-306). The real texts are still the creator's (`CREATOR_TODO.md` P-23). | — |
| Per-class student identity with credential | ➕ | P03§2-7. Identity's contract for it is written down (D-034). | H8 |
| Link methods, recovery | ✅ | P03§11-12. Demonstrated: an address linked by proving it signs into the same account; a method on another account refused with `method_in_use`, never merged; removal with the last-method guard. Email-code sign-in is the recovery. | — |
| Profile and my-data | ✅ | `GET /v1/me` and the four profile screens, audited. The screen states the name-change allowance rather than counting it down (row in "Frontend"). | — |
| Account deletion | ✅ | P02§11, D-036. Demonstrated: access ends in the call, the queued cleanup deletes the person's games, clears their roster names and notification entries, no way in is left, the declaration (compliance evidence) stays, a shared game still reads with the deleted person's place in it. The screen is audited and its dialog keyboard-checked. | H5 (replay content), H6/H8 (their cleanup steps), H11 (privacy requests, backups) |
| Identifying data in the sign-in trails | ➕ | P02§11. `identity_login_attempt_events.observed_email/observed_name` and `identity_email_codes.email` are keyed to the attempt or the address, not the person, so deletion leaves them. | H11 (privacy requests, retention) |
| Replay content substitution | ➕ | P02§10: the deleted person's name gone from *inside* the reproduced game, not only the roster. | H5 (recording and replay design) |
| Administrator with second factor | ✅ | Built and verified in H1 (T-102, D-015); admin web in H2 (T-206); the two H3 panels audited in real admin mode. | — |
| Name change limit | ✅ | V-10. Demonstrated: three changes, the name in force not counted, the fourth refused with the date of the next. | — |
| Interface language on the account | ✅ | Stored by identity, followed by emails, chosen from the interface (T-305). Not part of the H3 walkthrough; its site data stays `implemented`. | — |
| OAuth for AI (MCP) | 🔧 | Scope per **account** (`games`: all games). P10§1 requires authorization **per draft**. | H7 |
| AI link (7 days, revocable) | 🔧 | Today it gives read and write. P10§2: the link only queries; writing requires separate authorization. | H7 |

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
| Admin: everything except the web base, the queues, budget and email panels that H2 built | B, P16 |
| Analytics panel (ingestion exists since H1) | P34 |
| Scheduled retention and deletion | P02§9-11 |

## Frontend

Rewritten at the close of H2 (T-207, 16 Nov 2026). H2 built the base every later screen stands on
and verified it as behaviour: `scripts/verify/seo.mjs`, `scripts/verify/a11y.mjs` and
`scripts/verify/pwa.mjs` in the frontend repo re-run those checks against a running host.

### What H2 delivered

| Topic | State | What it means |
|---|---|---|
| Rendering and SEO | ✅ | React Router framework mode; the public pages of all three languages are rendered by the server with their content, title, description, canonical, hreflang, Open Graph and JSON-LD, and the home pages are written out at build time. robots.txt, the sitemap and a real 404 answer. Checked with no JavaScript by `verify:seo`. The authentication screen is the one deliberate exception (D-032). |
| PWA | ✅ | Manifest, worker, precache, offline page, update notice, install offer; no push code anywhere and none ever (P29). 36 checks by `verify:pwa` against a production build, including the offline page with the worker really cut off the network. **Real Android and iOS devices are still unverified** (`CREATOR_TODO.md` P-13). |
| Visual identity | ✅ | "Ink & Sticker" (C-03 direction A): three token tiers, core components, the `/design` gallery, `npm run styles` enforcing it. Nothing of the retired identity is reachable. |
| Design system coverage | 🔧 | The core components exist; the screens of later milestones will need tabs, tables beyond the admin's, and a media/upload surface. Each milestone adds its own and puts it in `/design`. |
| Shell, home, contextual authentication, admin base | ✅ | Thirteen screens are `verified` in the site data. |
| WCAG 2.2 AA | ✅ | Zero A/AA violations from axe-core on the twelve H2 screens, plus a keyboard pass (order, visible ring, dialogs, no trap) and contrast measured from the running app. The screens of later milestones are audited as they arrive — the script takes a list. |
| Two implementations per screen | ✅ | Home, join entry and contextual authentication each have a compact and a wide skeleton, chosen by the display and checked at five sizes with no horizontal scroll. The admin area is the single-implementation exception (D-023). |
| The URL is the screen | ✅ | Every address H2 added reproduces its screen and its input on a cold load, in the language it names. |
| i18n | ✅ | es / en / pt-BR in parity; the language is remembered on an address that carries none, and the page's `lang` follows the address after a client navigation. |
| Document titles | 🔧 | Every page has one; the six admin screens name themselves, and the screens whose presentation a later milestone redoes carry the fallback until it does. |

### What remains, and who owns it

| Topic | What is missing | Milestone |
|---|---|---|
| Presentation of the existing screens | Join, lobby, play, host, my games and the creation workspace work (walked end to end against a live backend in T-207) but still wear the old layouts under the new tokens. Each is redesigned with its own milestone. | H4 (games, workspace), H5 (sessions, play) |
| Per-screen titles and metadata for app routes | They fall back to "Playhoot". | the milestone that redoes each screen |
| Home, Discovery and the public card | The home page says plainly that the catalog arrives with Discovery (D-029). Search, categories, the public game card and the sitemap entries that D-019 wants to target are not built. | H4 |
| Profile, account, history and replay | T-304 added the residence-and-age declaration (`/declaration`); the profile area itself, the sign-in methods screen and deletion are still nothing. | H3 (T-305: profile, account), H5 (history, replay) |
| Teacher and student modes | The mode switch explains that they are coming and leaves the person where they are; nothing behind them exists. | H8 |
| Notifications beyond the bell | Where a notification leads, the notifications page and preferences. | each milestone for its own types; H3 (T-305) for preferences |
| How many display-name changes are left | The profile states V-10's allowance (three every thirty days) and names the date of the next possible change when the backend refuses one: nothing answers how many are left, so the screen cannot count down (D-043). A field on `GET /v1/me`, or on the display-name answer, would close it. | H10 or whichever task next touches the profile; nothing depends on it |
| The age a place asks for, before it is declared | Nothing public tells a client the threshold of a place: the market matrix is admin-only, and `POST /v1/compliance/declaration` answers `threshold_age` only once a declaration is recorded. The declaration screen therefore words its checkbox without a number and names the age only afterwards (D-042), and it guesses from a closed list which countries need a state or province, correcting itself from the backend's refusal. A public read of one place's rules for one function would close both. | H4, which wires the publish and subscribe gates and meets the same need |
| Plans, purchases, credits | No screen. | H6 |
| AI chat, asset library, captures | No screen. | H7 |
| Support and reports | No screen. | H9 |
| Admin panels beyond queues, budget and email | Users, games, moderation, analytics. | H10, and each milestone for its own panel |
| Mobile app | Deferred by P01§5; `apps/mobile` is removed. | — |

### Known limits of the H2 verification

- **No DOM test environment** in the frontend: tests cover logic, and anything about rendering is
  checked in a real browser. That is why the three `verify:*` scripts exist and why they are not
  part of `npm run check`.
- **Automated accessibility is not accessibility.** axe checks what a machine can decide. Two
  things it could not decide were looked at by hand and are fine: a `<select>` whose arrow is drawn
  with a gradient (its text is ink on paper, 15:1), and the join-code input, which is transparent
  because the tiles beside it carry the characters.
- **The QR of the admin enrollment has never been read by a real camera** (T-206); the secret is
  always shown as text beside it.

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
| Existing flows ignore the new gates | T-302 wired `check-market-access` into create-game and the session-join admission. create-session, previews, simulations and builds still do not call `get-user-limits` or `admit-work`, and report no spend. | H4 (games, creations), H5 (sessions, players), H6 (budget everywhere) |
| Reach of the shutdown (P32§6) | Enforced at admission: every cost-bearing call is refused and its task retries until dead without reaching a provider. Queue workers keep running cheap, non-cost tasks (entries, analytics); live sessions are not interrupted by a shutdown. | H5/H6 (interrupting sessions and jobs), deployment controls (delivery 2) |
| Ladder alert during a shutdown | The admin's `budget-level-changed` entry is created, but its email is refused like any other spend while shut down (the shutdown does not wait for an alert, P32§5). | H10 (admin panel shows the ladder); accepted |
| P32§10 demonstrations not done locally | Growth with revenue and liquidity, lost or late metrics, late billing, deployment cutoff and residual charges, reaction times. Month change not lifting a shutdown is shown by the budget DB tests, not the walkthrough. | H6 (revenue, metrics), H13 and launch (`CREATOR_TODO.md`) |
| Admin surface | Admin endpoints are covered by handler tests only; there is no admin web yet. | H2 (admin web base), H10 |
| Alerts (P16§5) | Budget and dead-task alerts are log lines and in-app entries only. | Delivery 2 |
| Real providers | Resend, SES and geolocation are simulated or local. | Delivery 2 (`CREATOR_TODO.md`) |
| Local backend cannot be seeded | **Not a code defect (diagnosed in T-205).** `logo_image_url` exists in no migration and nowhere in the backend source: the column survives only in the creator's local `playhoot` database, from a migration edited in place before launch (METHOD §6). On a database created now the backend starts, migrates and seeds without a change: T-205 verified its walkthrough against one. | The creator recreates the local database (`CREATOR_TODO.md` P-16) |
