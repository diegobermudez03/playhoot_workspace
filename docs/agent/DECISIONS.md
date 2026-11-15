# Agent decisions and questions for the creator

Three lists: **C** product questions (the creator decides), **D** technical decisions (the agent decides), **V** chosen defaults (adjustable; the creator can veto them).

## C — Questions for the creator

| ID | Status | Affects | Question | Outcome |
|---|---|---|---|---|
| C-01 | **answered 2026-11-15** | H3 (joining as a guest) | What is a guest asked when joining a general session? The specification requires an age declaration only to create, purchase or administer (P19§1), yet restricts minors to authorized classes and family groups and admits only adults in the US and Canada (P35§1). | **Creator's decision:** joining works like every other flow. With an account, nothing is asked. Without one, the person can sign in, register, or continue as a guest; a guest is asked **only for a display name**, which becomes the name of that guest account from then on. No age or country confirmation at join. *Agent's reading of the consequences (not the creator's words):* a guest who only plays is treated as an adult unless minority becomes known (declared in an adult-only flow, class context, family group — P21§6); territorial gating for guests relies on approximate location only (P35§5). |
| C-02 | **answered 2026-11-15** | H8 (family groups) | What shape does the "private family group" of P21§4 and P35§4 take? The patches set its rules but not its journey. | **Creator accepted the recommendation:** an adult with an account (free or Personal) creates a named private group and invites by link. Each minor enters with an identity that belongs to the group (alias), authorized by their guardian: the host for their own children, or the email authorization page for other guardians. Group sessions admit only its members and invited adults. Same machinery as classes (individual credential, authorization, withdrawal), without grades or materials. |
| C-03 | planned | H2 (design system) | **Visual direction.** The base document asks to define it with the agent acting as designer. A wrong pick means redoing the whole frontend. | The agent prepares 2–3 directions rendered on real screens (home, lobby, teacher dashboard) and recommends one; the creator picks or says "you decide". The only planned design question. |

## D — Technical decisions

**D-001 · Target domain tree (closed by T-002, 2026-11-15).**
The definitive phase 1 tree, loaded into the documentation site (every domain page lists responsibilities, what it ignores, references and sources; the flow catalog maps every cross-domain operation). 17 top-level domains: `api`, `orchestrator`, `composer` (coordination) and 14 traditional ones.

Kept from the base document: `api`, `orchestrator`, `composer`, `identity`, `game`, `play`, `notifications`, `classroom`, `plan`. Changes, allowed by P15§6:
- `play` splits into `versions` (drafts, builds, version assets, previews, frozen versions), `session` (session lifecycle, participants, original results, history), `runtime` (live execution; the sandbox stays a separate process under it) and `replay` (recording, playback, retention, identity substitution). Today `versions` lives inside `play/session` and recording inside `runtime`.
- `creation` becomes a top-level domain: brief, conversations, AI jobs and their metering, external-AI access per draft, validation results. Reason: it has its own data and rules (P15§1 requires at least a separate workflow) and is currently spread across orchestrator, composer, api and identity.
- `library` (new): the platform's asset library (records, versions, states, licenses, variants). Reason: P25 gives it its own lifecycle, admin and provenance rules, used by creation and admin alike.
- `billing` and `budget` (new) next to `plan`: the three responsibilities of P15§4 as three domains (charging through the provider · entitlements and balances · spend, reserves, admission and shutdown). Reason: different data, different providers, different failure modes; P15§4 demands they stay reconcilable but never merged into one balance. `budget` is consulted for admission through orchestration and fed spend events through the queue; domains never call it directly.
- `compliance` (new): market-and-function matrix, age and residence declarations, versioned acceptances, teacher declarations and the data agreement, coverage of minors' authorizations and the guardian page, privacy requests, provider registry. Reason: legal rules and evidence with their own retention; `identity` stays focused on authentication and access.
- `support` (the base document's `report`): reports, cases, conversations, public form, inbound email, FAQ. `moderation` (new, split from it): publication review, automatic classification, graduated measures, system actions, appeal decisions. Reason: one serves users, the other judges content; they meet only through case references.
- `analytics`: receives events through queues from the domains; owns its analysis tables (P34).
- The existing `discovery` stub is removed: catalog and search belong to `game`; composer presents them (P15§6 keeps "Discovery presents the authorized catalog" as a responsibility, not a domain).
- `classroom` also owns the private family groups of C-02: the same membership machinery as classes, without grades or materials.
- Shared packages that are not domains (documented in the site's Packages section): transactional queue with dead-letter handling, windowed limits, object storage, logging, metrics.

Discarded while closing:
- An `admin` domain: admin is a mode, not an owner. Identity holds the administrator account and second factor; each domain exposes its own admin operations; composed admin views live in composer. The sensitive-action record is each domain's data trail with actor and reason.
- An `email` domain: email is a channel of `notifications` (outbound Resend/SES) and an intake of `support` (inbound SES), both behind ports.
- Making `creation` a subdomain of `game`: it coordinates game and play and owns neither; as a subdomain it would force cross-tree calls.
- Promoting `session`/`versions` to top level (the base's own criterion): coordination reaches them as `play`'s exported surface, so the parent still contains them.

Tree rule as applied: a parent's exported surface may be implemented in its subdomains, and orchestrator/composer name the subdomain operation precisely (`play.session.create-session`); what the tree forbids is any traditional domain knowing another's subdomains, and sibling subdomains coupling beyond what their parent's internal rules allow. No responsibility of SPEC_MAP §4–§20 has more than one owner; none required a creator decision (P15§6 delegates grouping to the team).

**D-002 · Three git repositories.** The workspace (`repos/`) is its own repository for the specification, the plan and the documentation site, with `playhoot/` and `playhoot_frontend/` ignored. Reason: the plan and handoffs are the memory between sessions and had no history.

**D-003 · Design as documentation.** Each milestone's design is written as data of the `docs/system` site in the `planned` state; implementing it moves it to `implemented`. There are no parallel design documents.

**D-004 · The previous documentation process is retired** in both repositories (`docs/ai`, WORK, Projects, HUMAN_REVIEW, AI_CONTEXT, Logic Mirror, CURRENT_STATE). Engineering standards and technical ADRs are kept as reference. Executed by T-003.

**D-005 · Inherited work in progress.** The uncommitted changes of 7 Nov (one-time grants for asset uploads; image and audio measures) were committed as they were, as the starting point: they build and their tests pass. They are reconciled with P10 when H7 arrives.

**D-006 · Frontend: keep the architecture, redo the presentation.** Packages, lint-enforced boundaries, protocol, GameHost, bridge and SDK stay. Visual identity, design system and screens are redone; server rendering or prerendering is added for SEO (concrete decision in H2).

**D-007 · Language (set by the creator, 2026-11-15).** Everything the agent produces is in English: code, comments, commits, agent documents, the system documentation site, and messages to the creator. The product specification stays in Spanish as written.

**D-008 · System documentation conventions (T-001).** Entity ids follow the spec: operations `<domain>.<kebab-verb>` (e.g. `play.session.create-session`) with the code name as `name`; flows by kebab name. A `table` may carry the optional `lifecycle` when the state lives in that table (the Session state machine sits on `play_sessions`). A flow's step must name the domain that owns its operation (validated). Frontend data files declare `/* global PH */` so the repo lint passes. In Git Bash the frontend tests fail to start (path casing); run `npm run check` from PowerShell.

**D-009 · Documentation model additions (T-002).** Two additions to the site's data model (spec updated in `designs/system-docs.md`): a `planned` flow may carry `touches` (domain ids) instead of steps and persistence until its milestone design details it — the validator enforces one or the other; and a `package` entity documents the shared technical packages (queue, limits, storage, logging, metrics) in their own site section, so H1 has a home for the queue's documentation. Domains may also list `references`: which other domains' external identifiers they store.

**D-010 · Transactional queue design (T-100).**
One infrastructure table per domain (`<domain>_queue_tasks`): task uuid, type, payload, `run_at`, attempts, lock, status `pending | running | dead | cancelled`; completed tasks are deleted. A worker per domain claims due tasks with `FOR UPDATE SKIP LOCKED`, retries with exponential backoff and jitter, and after max attempts marks the task `dead` — that status **is** the dead letter queue (no second table). Handlers are idempotent and registered per task type by the owning domain; the **cross-domain delivery types (`notify`, `analytics-event`, `spend-event`) are registered by the orchestrator**, so a domain tells another something by writing a task into its own queue inside its own transaction, and the orchestrator's processor carries it over (flows `deliver-notification`, `ingest-spend-events`, `ingest-analytics-events`). Periodic work re-enqueues itself on completion. A package-level registry over every domain queue serves admin: list dead tasks, retry, cancel. Service, queue and processor code stay separate to migrate to a real outbox+queue later.

**D-011 · Admin second factor and sensitive actions (T-100).**
Second factor = TOTP. An admin-mode token is issued only to the account with the active admin grant after a valid code; the normal login never elevates. Sensitive operations (budget caps and rates, cutoff, reopening) take a fresh code inline: `identity.verify-totp` issues a **single-use step-up proof valid 10 minutes**, consumed by exactly one action and recording what it was spent on. There is **no central action log** (confirms D-001): every admin-configurable table is append-only with `created_by` and `reason` (market rules, free limits, caps, rates, email mode, ladder changes), and identity keeps the second-factor check trail.

**D-012 · Budget admission model (T-100).**
Admission is reservation-based: `budget.admit-work` checks the restriction ladder, then sums measured spend + estimated un-billed spend + active reservations + a margin (V-04) against every applicable window (hour/day/month, category and global) and writes a reservation the caller later settles against measured cost. A missing cap, missing rate or zero budget **blocks the category** — never unlimited. The ladder (`normal → restricted → paused → shutdown`) is the latest row of an append-only change table; escalation and de-escalation below shutdown are automatic (`budget.evaluate-ladder`, run after ingestion and periodically); **shutdown only leaves through the manual, step-up-verified, gradual `reopen-spending` flow**. Refusals are worded as service restrictions, never as the user's balance. The money picture (cash, reserves, surplus split — P30) needs billing and is designed in H6.

**D-013 · Documentation model: package steps (T-100).**
A flow step may name a `package` instead of `domain` + `operation` when the work is done by a shared package over infrastructure tables (the txqueue admin registry in `admin-dlqs` and `manage-dead-task`). Validator and `designs/system-docs.md` updated.

## V — Defaults

Operational values the specification does not fix (anti-abuse windows, page sizes, retries) are chosen at implementation time, stay configurable, and are listed here and in the documentation of the operation. Already derived from the specification:

| ID | Value | Origin |
|---|---|---|
| V-01 | Free AI ceiling per account: 300 credits per 30 days (30 % of the cheapest plan's 1,000), inside the global pool of USD 10 per month split by week | B: business rules, P28§3, P30§5 |
| V-02 | Queue retry policy: 10 attempts, exponential backoff from 10 s capped at 1 h, with jitter; completed tasks deleted; dead tasks kept until retried or cancelled | B: principles |
| V-03 | TOTP: 5 failed codes per 15 min then a 15 min lock; step-up proof valid 10 min, single use | B: admin, P32§7 |
| V-04 | Initial local cost caps until the creator sets real ones: global USD 120/month, 8/day, 1/hour; email USD 1/day; admission margin 10 % of the window remainder | P32§2, P32§9, P12§1 |
