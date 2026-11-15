# Agent decisions and questions for the creator

Three lists: **C** product questions (the creator decides), **D** technical decisions (the agent decides), **V** chosen defaults (adjustable; the creator can veto them).

## C — Questions for the creator

| ID | Status | Affects | Question | Outcome |
|---|---|---|---|---|
| C-01 | **answered 2026-11-15** | H3 (joining as a guest) | What is a guest asked when joining a general session? The specification requires an age declaration only to create, purchase or administer (P19§1), yet restricts minors to authorized classes and family groups and admits only adults in the US and Canada (P35§1). | **Creator's decision:** joining works like every other flow. With an account, nothing is asked. Without one, the person can sign in, register, or continue as a guest; a guest is asked **only for a display name**, which becomes the name of that guest account from then on. No age or country confirmation at join. *Agent's reading of the consequences (not the creator's words):* a guest who only plays is treated as an adult unless minority becomes known (declared in an adult-only flow, class context, family group — P21§6); territorial gating for guests relies on approximate location only (P35§5). |
| C-02 | **answered 2026-11-15** | H8 (family groups) | What shape does the "private family group" of P21§4 and P35§4 take? The patches set its rules but not its journey. | **Creator accepted the recommendation:** an adult with an account (free or Personal) creates a named private group and invites by link. Each minor enters with an identity that belongs to the group (alias), authorized by their guardian: the host for their own children, or the email authorization page for other guardians. Group sessions admit only its members and invited adults. Same machinery as classes (individual credential, authorization, withdrawal), without grades or materials. |
| C-03 | planned | H2 (design system) | **Visual direction.** The base document asks to define it with the agent acting as designer. A wrong pick means redoing the whole frontend. | The agent prepares 2–3 directions rendered on real screens (home, lobby, teacher dashboard) and recommends one; the creator picks or says "you decide". The only planned design question. |

## D — Technical decisions

**D-001 · Target domain tree (initial proposal; closed in T-002).**
Kept from the base document: `api`, `orchestrator`, `composer`, `identity`, `game`, `play`, `notifications`, `classroom`, `plan`. Changes, allowed by P15§6:
- `play` splits into `versions` (drafts, sources, builds, version assets, previews), `session` (session lifecycle, participants, results, history), `runtime` (live execution) and `replay` (recording, playback, retention, identity substitution). Today `versions` lives inside `play/session`.
- `creation` becomes a top-level domain: brief, conversations, AI jobs and their metering, external-AI access per draft, validation results. Reason: it has its own data and rules (P15§1) and is currently spread across orchestrator, composer, api and identity.
- `library` (new): the platform's asset library (records, versions, states, licenses, variants).
- `billing` and `budget` (new) next to `plan`: the three responsibilities of P15§4 as three domains (charging through the provider · entitlements and balances · spend, reserves, admission and shutdown). `budget` is cross-cutting: every operation with a cost asks it for admission.
- `compliance` (new): market-and-function matrix, age and residence declarations, versioned acceptances, coverage of minors' authorizations and the guardian page, privacy requests, provider registry. Reason: these are legal rules and evidence with their own retention; `identity` stays focused on authentication and access.
- `support` (the base document's `report`): reports, cases, conversations, public form, inbound email. `moderation`: publication review, graduated measures, automatic classification, system actions, appeals.
- `analytics`: receives events through queues from the domains; owns its analysis tables.
- The existing `discovery` stub is removed: catalog and search belong to `game`.
- Shared packages that are not domains: transactional queue with dead-letter handling, windowed limits, object storage, logging, metrics.

**D-002 · Three git repositories.** The workspace (`repos/`) is its own repository for the specification, the plan and the documentation site, with `playhoot/` and `playhoot_frontend/` ignored. Reason: the plan and handoffs are the memory between sessions and had no history.

**D-003 · Design as documentation.** Each milestone's design is written as data of the `docs/system` site in the `planned` state; implementing it moves it to `implemented`. There are no parallel design documents.

**D-004 · The previous documentation process is retired** in both repositories (`docs/ai`, WORK, Projects, HUMAN_REVIEW, AI_CONTEXT, Logic Mirror, CURRENT_STATE). Engineering standards and technical ADRs are kept as reference. Executed by T-003.

**D-005 · Inherited work in progress.** The uncommitted changes of 7 Nov (one-time grants for asset uploads; image and audio measures) were committed as they were, as the starting point: they build and their tests pass. They are reconciled with P10 when H7 arrives.

**D-006 · Frontend: keep the architecture, redo the presentation.** Packages, lint-enforced boundaries, protocol, GameHost, bridge and SDK stay. Visual identity, design system and screens are redone; server rendering or prerendering is added for SEO (concrete decision in H2).

**D-007 · Language (set by the creator, 2026-11-15).** Everything the agent produces is in English: code, comments, commits, agent documents, the system documentation site, and messages to the creator. The product specification stays in Spanish as written.

## V — Defaults

Operational values the specification does not fix (anti-abuse windows, page sizes, retries) are chosen at implementation time, stay configurable, and are listed here and in the documentation of the operation. Already derived from the specification:

| ID | Value | Origin |
|---|---|---|
| V-01 | Free AI ceiling per account: 300 credits per 30 days (30 % of the cheapest plan's 1,000), inside the global pool of USD 10 per month split by week | B: business rules, P28§3, P30§5 |
