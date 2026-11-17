# Agent decisions and questions for the creator

Three lists: **C** product questions (the creator decides), **D** technical decisions (the agent decides), **V** chosen defaults (adjustable; the creator can veto them).

## C — Questions for the creator

| ID | Status | Affects | Question | Outcome |
|---|---|---|---|---|
| C-01 | **answered 2026-11-15** | H3 (joining as a guest) | What is a guest asked when joining a general session? The specification requires an age declaration only to create, purchase or administer (P19§1), yet restricts minors to authorized classes and family groups and admits only adults in the US and Canada (P35§1). | **Creator's decision:** joining works like every other flow. With an account, nothing is asked. Without one, the person can sign in, register, or continue as a guest; a guest is asked **only for a display name**, which becomes the name of that guest account from then on. No age or country confirmation at join. *Agent's reading of the consequences (not the creator's words):* a guest who only plays is treated as an adult unless minority becomes known (declared in an adult-only flow, class context, family group — P21§6); territorial gating for guests relies on approximate location only (P35§5). |
| C-02 | **answered 2026-11-15** | H8 (family groups) | What shape does the "private family group" of P21§4 and P35§4 take? The patches set its rules but not its journey. | **Creator accepted the recommendation:** an adult with an account (free or Personal) creates a named private group and invites by link. Each minor enters with an identity that belongs to the group (alias), authorized by their guardian: the host for their own children, or the email authorization page for other guardians. Group sessions admit only its members and invited adults. Same machinery as classes (individual credential, authorization, withdrawal), without grades or materials. |
| C-03 | **answered 2026-11-15** | H2 (design system, T-203) | **Visual direction.** The base document asks to define it with the agent acting as designer. A wrong pick means redoing the whole frontend. | **Creator accepted the recommendation: A — Ink & Sticker** (paper, ink outlines, hard offset shadows), with no adjustments. Its render, `docs/agent/designs/c03/direction-a.html`, is the identity contract T-203 turns into tokens and components: palette, type, surfaces, shadows, radii, motion feel and mascot treatment. B (Warm Paper) and C (Soft Clay) are discarded. T-203 is unblocked; the neutral placeholder values D-021 allowed are replaced by A's. |

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

**D-014 · Transactional queue as built (T-101).**
`utils/txqueue`. A `Registry` holds every domain queue of the process (built in `main`, workers run on every instance, admin reads through it). Enqueue's fourth argument is an optional **idempotency key**: one live (pending, running or dead) task per type and key; a cancelled task frees it. Periodic tasks use their type as key, so only one is ever scheduled across instances. A claim sets the task `running` with `run_at` at the end of a 5-minute lease and counts the attempt; a crashed worker's task is claimed again when the lease ends, and a late completion of a lost lease is a no-op. Handlers run outside any transaction (they may call other domains through the orchestrator); a handler error retries, `txqueue.Permanent(err)` or a panic at the last attempt turns the task dead. A task whose type has no handler yet stays pending (the delivery types wait for T-105…T-107). `Handle` refuses the delivery types; `HandleDelivery` is the orchestrator's entry and takes only them. Admin retry/cancel of a task that is no longer dead answers `not_dead` with 200 (idempotent); an unknown task is 404. Identity's expired-grant sweep moved from grant creation to an hourly periodic task. Access: new level `admin` above `account` and operation `MANAGE_QUEUES`; no token reaches `admin` until T-102 issues admin-mode tokens, so the endpoints refuse everyone until then.

**D-015 · Admin second factor as built (T-102).**
Identity use cases `secondfactor` (EnrollTotp, ConfirmTotp, VerifyTotp, ConsumeStepUpProof) and `grantadmin`; TOTP is RFC 6238 (SHA-1, 6 digits, 30 s, one step of skew) implemented in Identity, no new dependency. Three corrections to the T-100 design, all inside Identity: (1) the admin grant is **seeded at every startup** from `IDENTITY_ADMIN_USER_UUID`, not by a migration, because the account must exist first (the creator signs in, reads their UUID from `GET /v1/identity/me`, sets the variable, restarts); naming another account revokes the previous grant, unset changes nothing. (2) Endpoints live under `/v1/identity/totp/` like every identity endpoint, and confirmation has its own endpoint (`enroll`, `confirm`, `verify`). (3) A user may hold one confirmed and one pending credential, so re-enrollment never leaves the admin without a working factor; a pending enrollment lapses after 10 minutes. Secrets are sealed with AES-GCM under `IDENTITY_TOTP_KEY` (64 hex chars; required in production, a fixed development key elsewhere). Replay: after a code is accepted, codes of that step or older are refused. The admin-mode token is a 15-minute access token at level `admin`, no refresh token; new operation `USE_SECOND_FACTOR` (account level) gates the three endpoints. Flows spend proofs through `orchestrator/stepup` (`Gate.Require(ctx, adminUUID, proof, action)` → `ErrRefused` unless spent now).

**D-016 · Compliance core as built (T-103).**
Packages `compliance/usecases/marketaccess` (CheckMarketAccess, RecordDeclaration), `acceptances` (GetAcceptanceText, RecordAcceptance, HasCurrentAcceptance) and `marketrules` (ReadMarketRules, AdminSetMarketRule); pure rules in `internal/business/marketaccess`. Corrections to the T-100 design, all inside Compliance: (1) people are referenced by `user_uuid` (and `created_by_user_uuid`, `noted_by_user_uuid`), not Identity's internal ids, as every cross-domain reference; (2) texts are stored in a `content` column, not object storage — small, immutable, served through the backend; (3) acceptances carry `kind` to find a person's standing action per kind. The matrix seed is in the migration (real P35 data); draft texts are seeded only outside production. Place = declared residence, else approximate country; adult functions (`min_age` > 0) need a declaration meeting the age; minor functions have `min_age` 0; known minority blocks adult functions only; an approximate location different from the declaration is reported (`LocationDiscrepancy`) and never blocks. A declaration's threshold is the highest age the place asks for (18 where uncovered); if the matrix raises it, the person may answer again for the same place. New Identity operations: `DECLARE_RESIDENCE_AND_AGE` (account), `ACCEPT_TEXTS` (guest), `MANAGE_MARKETS` (admin). The approximate location port is `api/geolocation` (`Unknown` locally).

**D-017 · Budget core as built (T-105).**
Packages `budget/usecases/recordspend`, `admitwork`, `settlework` (with the expired-reservation sweep), `setcontrols`, `manualladder` (AdminCutoff, Reopen), `status` and `budget/workflows/evaluateladder`; pure rules in `internal/business/controls`. Flows in `orchestrator/spendingestion` (spend-event delivery, registered on every domain queue listed in `main`; the source is the queue's domain) and `orchestrator/costcontrol` (step-up actions `budget.set-controls`, `budget.cutoff`, `budget.reopen`). New Identity operation `MANAGE_BUDGET` (admin); the proof travels as `step_up_proof` in the body and a refused one answers `step_up_required` (403). One Postgres advisory transaction lock serializes admissions and ladder moves (a DB test shows 30 concurrent admissions never over-reserve). Corrections to the T-100 design, all inside Budget: (1) `created_by` became `created_by_user_uuid` (as D-016); (2) the cap column is `cap_window` (`window` is reserved in SQL); (3) a new `reopen_closed` column separates categories held by a gradual reopening from those paused by the evaluation, so de-escalation never opens them; (4) indexes `(category, reference)` on spend events and `(category, created_at)` on reservations back the estimate replacement and volume caps; (5) the margin is kept free by the check (work must fit in 90 % of each remainder), not added to the reservation. Windows are UTC calendar hour/day/month. Reopen: from shutdown with no categories → restricted with all closed; each later call opens the categories it names. Ladder notify tasks address the recipient `admin` with type `budget-level-changed`, keyed by the change row; they wait pending until T-106 registers notify delivery. Admission is not adopted by any caller yet (out of scope). The API now measures `/admin/` routes as their own request-metric family (`api_admin_http_requests_total`): the extra routes pushed the general family over its 1000-series bound.

**D-018 · Notifications as built (T-106).**
Domain `notifications`: contract with the type constants carrying the P31§4 matrix (in-app flag, email rule necessary | standard | optional with its group, no-email-to-students flag, the only skeleton values an email may carry), plus `budget-level-changed` (necessary) for the T-105 ladder tasks and two Discovery types (`discovery-review` optional, `discovery-restriction` necessary) for the "necessary if it communicates a relevant restriction" row. Use cases `acceptentry`, `sendemail`, `listentries`, `markread`, `preferences` (read and set), `recordsuppression` (unsubscribe link and provider webhooks), `emailadmin` (status, mode) and `expiredeliveries` (hourly); providers in `notifications/emailproviders` behind one port `notifications.EmailProvider` (send, verify webhook, reference price) with simulated Resend (100/day, 3,000/month joint quota, clear quota refusals) and SES (always accepts, USD 0.0001) plus injected failures and uncertain answers; the real HTTP clients are delivery 2. Orchestrator `notificationdelivery`: notify delivery on the identity, budget and notifications queues (recipient `admin` resolves through Identity; marketing reads the compliance acceptance) and the `send-email` task (read contact → admit → send → release). New Identity use case `readcontact` (address from the latest provider link, administrator from the active grant) and operations `READ_NOTIFICATIONS` (guest), `SET_NOTIFICATION_PREFERENCES` (account), `MANAGE_EMAIL` (admin). New env `NOTIFICATIONS_UNSUBSCRIBE_KEY` (AES-GCM seal of the address in the link) and `NOTIFICATIONS_WEBHOOK_SECRET`, required in production. Corrections to the T-100 design: (1) people referenced by `user_uuid` / `changed_by_user_uuid` (as D-016); (2) entries gained `in_app` (access codes are a screen state, not an entry in the list) and `content_cleared_at` (an access code entry keeps no content once its email is decided, P31§5); (3) deliveries gained `closes_email` and provider `none` (rejection before any provider), so a clear failure may retry while accepted, uncertain or interrupted attempts are never resent; (4) the measured email spend travels as a `spend-event` written in the same transaction as the sent record and the reservation is settled at zero (release only), so a crash between send and settle never loses or doubles the cost; (5) the address and language are read from Identity at send time and never stored by notifications; (6) an unsubscribe stops optional email only, bounces and complaints stop all email; (7) new endpoint `GET /v1/notifications/preferences` and operation `read-preferences`; (8) email body is fixed localized plain text with a link to the notifications page — the skeleton never enters an email except the values a type allows (access code, budget level). Priority of necessary email = never discretionary for the budget.

**D-019 · Rendering and SEO (T-200).**
The web app moves from a pure SPA to **React Router framework mode** (react-router v7 is already the router; Vite stays the build). Public routes — home, product explanations, contextual sign-in, and later Discovery, categories and game cards — are server-rendered with per-route metadata (title, description, canonical, Open Graph, hreflang es/en/pt) and JSON-LD; public routes whose content is fixed at build time are prerendered. After hydration the app behaves exactly like today's SPA; authenticated routes stay client-rendered. The deployable unit becomes the small Node server react-router builds — a separate `process` like the sandbox; the Go backend remains the only business authority and rendering reads only public endpoints. robots.txt and a per-locale sitemap target category and activity searches, not the brand (B: frontend). The H2 close task verifies that each public route's prerendered HTML carries its content and metadata without executing JS.

**D-020 · PWA approach (T-200).**
Installable PWA per P01§5: a web manifest (working name, swappable per P36§7; icons are a pending asset with placeholders; standalone display; theme colors from tokens) plus a service worker that precaches the built app shell and uses network-first navigation. The worker **never caches API responses and never touches WebSockets**; offline shows a plain "you're offline" page — no offline-play claims. A new version activates on the next navigation with a discreet "refresh for the new version" notice. **No push of any kind and no push permission prompt, ever** (P29). The install offer is non-intrusive: an entry in the shell menu plus a one-time dismissible hint for returning visitors (V-08). Android and iOS validation steps are written into the H2 close task.

**D-021 · Design tokens (T-200).**
Three tiers of CSS custom properties: **primitives** (palette, type scale, 4-px spacing scale, radii, shadows, motion durations and easings) → **semantic** (surface, ink, accents, success/danger, focus ring, elevation) → component tokens only where a component needs its own. Components and screens consume semantic tokens only (the CSS Modules rule already in force). The C-03 direction fills primitive values and component skins, so structure tasks build on neutral placeholder values while C-03 is pending and only values and skins change with the answer. No dark mode in phase 1. Motion tokens honor `prefers-reduced-motion`; focus is always visible (WCAG 2.2 AA, P14§3). Fonts are OFL and self-hosted via @fontsource (P25).

**D-022 · i18n structure (T-200).**
react-intl with es / en / pt-BR catalogs and the parity test stay. Public, SEO-relevant routes carry the locale in the path (`/es/…`, `/en/…`, `/pt/…`) with hreflang alternates so each language is crawlable; the bare public path redirects using the stored preference, else the browser's suggestion (P14§3). Authenticated routes do not carry the locale: the preference is kept locally and, from H3, on the account. The selector lives in the shell; language never determines the regulatory country. Spanish wording stays neutral Latin American.

**D-023 · Admin web base (T-200).**
Admin is an area of the same web app under `/admin` with its own minimal shell and navigation — no separate deployment. It reuses the design system in its plainest form: functional, no experience requirement (SPEC_MAP §23). Admin screens are desktop-first with a **single responsive implementation** (`variants: single`), a deliberate exception to the two-implementations rule justified by §23; user-facing screens keep horizontal+vertical. The 15-minute admin-mode token lives in memory only; when it expires the person is sent to `/admin/sign-in` and returned where they were. Sensitive actions ask for the fresh TOTP code inline in their own confirm step (purpose `step_up`), send it as `step_up_proof`, and treat `step_up_required` as "ask again", per D-011/D-017. H2 ships sign-in, second-factor enrollment, overview, queues/DLQ, budget status and email mode; later milestones add their panels to this shell.

**D-024 · The language the server renders in (T-201).**
A public URL names its language, so the server knows it from the path. For every other address — an app route, or a public path without a language — the server must decide before anything renders, and it cannot read `localStorage`. The choice the person makes is therefore mirrored in a `playhoot_locale` cookie beside the existing stored preference; the server reads the path, then that cookie, then `Accept-Language`, and hands the result to the first render, so no page is ever shown in one language and then swapped. A browser that remembers a choice made before the cookie existed adopts it on its first hydrated render and writes the cookie for the next visit. The page's language lives in the web app (`i18n/LocaleContext.tsx`), not in platform state.

**D-025 · The web host's Node process (T-201).**
The deployable unit D-019 names is `apps/web/server.js` — a small Express server written in this repository — and not `react-router-serve`. Two reasons, both of them requirements rather than taste: `react-router-serve` logs every request URL, and a sign-in's one-time code travels in one (backend IDENTITY-ADR-0003 point 8); and its static handler answers `/es` with a redirect to `/es/`, which is not the address the page's own canonical link names. Our server logs no requests, serves a page written out at build time at the address that names it, and caches content-hashed files for a year and everything else for an hour. `PLAYHOOT_SITE_URL` gives it (and the build) the public origin that every canonical, alternate, Open Graph URL and sitemap entry is built on.

**D-026 · The service worker and the offline page are written by the build (T-202).**
Both are produced by a Vite plugin of ours (`apps/web/vite-pwa.ts`) instead of being written by hand in `public/`, and no PWA framework (Workbox, vite-plugin-pwa) is added. The reason is that both have to know what this build produced: the worker precaches the exact shell files, whose names carry their content, and the offline page is one of the files it precaches. The worker is a module worker bundled from `src/pwa/sw.ts` with esbuild (already present under Vite), registered only in a production build, with the build's identity and precache list injected; its routing policy lives in `swPolicy.ts`, which is plain TypeScript and is unit-tested on its own. The offline page is written from the message catalogs in all three languages and picks one in the browser the way the server would (the `playhoot_locale` cookie, then `Accept-Language`), because it has to render with no application and no network. Nothing is ever written to a cache but the precached shell and files whose name carries their content hash, so a backend answer or a URL carrying a sign-in code cannot be stored by any path. The host serves `sw.js` with `no-cache`.

**D-027 · The design system that carries the chosen identity (T-203).**
D-021 fixed the structure of the tokens; T-203 filled it with direction A and had to settle four things it did not cover.
- **The ink outline is the contrast mechanism, not the fill.** Every control, card, tag and avatar is bound by the same 2 px near-black outline, which is ≥ 4.85:1 against any accent fill and ≥ 12.58:1 against any surface. That satisfies WCAG 1.4.11 for component boundaries once, for the whole system, instead of per component, and it is why accent fills could stay as saturated as the direction render wanted. The same ink is the single focus ring (3 px, 2 px gap): it reads on white paper and on a coral button alike, so no component needs its own focus colour.
- **The owl, the starfield and the dark palette are deleted, not deprecated.** `Owl` became `Mascot`, `Starfield` is gone, and every `--night-*`/`--owl-*` token with them; the old identity is not importable, which is what the task asked for. The screens were only re-tokenised (D-006): their redesign belongs to their own milestones.
- **The mascot is a slot.** `Mascot` draws its character from code in separable parts (head, eyes, tail, bounce) rather than loading one picture, which is what P24§3 prefers and what lets the creator replace the character later without touching a screen. What it draws today is the direction render's placeholder cat, registered as the pending asset `mascot.primary` (C → `CREATOR_TODO.md` P-15). The four app icons were redrawn from the same mark for the same reason — nothing of the retired identity ships — and remain placeholders (P-14).
- **The token rule is now enforced by a check, because ESLint does not read CSS.** The task brief and `AGENTS.md` both said lint enforced "no raw colours, durations or shadows in components"; it never did. `scripts/check-styles.mjs` (`npm run styles`, part of `npm run check`) scans every stylesheet outside the token files for a raw colour, a raw duration or a shadow with a blur radius. It found seven real violations in existing code on its first run, all now tokenised. One documented exception: the Google sign-in button, whose colours Google's branding guidelines fix.


**D-028 · The shell is rendered above the router, and the services with it (T-204).**
Until now every screen rendered its own `AppShell`, so each navigation rebuilt the top bar, and
the app's services lived inside `ClientLayout`, so a server-rendered public page had no identity,
no bell and no sound. T-204 moved both above the router (`root.tsx`): one `AppShell` around the
`Outlet`, and a `ServicesBoundary` that hands the one set of services to everything once the page
is interactive (null while the server renders, which the pieces that need the browser already
handle). Three consequences worth writing down.
- **A screen no longer wraps itself; it says how it wants to be framed** with `useShellMode`:
  `normal`, `bare` (the page shows its own big logo), `immersive` (a game takes a landscape
  display) or `plain` (no frame of ours). The admin area is recognised from the address instead,
  so an admin page never shows the public bar even for the render before it could ask (D-023).
- **The bar rearranges itself in CSS, not in JavaScript.** It is server-rendered before anything
  is known about the display, and a bar that rearranged itself after hydration would move under
  the reader's pointer. Below 360 px the mode switch moves into the bar's menu, and below 760 px
  join, create, the language and the sound do.
- **`/v1/identity/me` is not called per page.** The site data had the shell resolving identity
  with it. Who the person is is already the credential the backend issued and the app renews
  against it (`app-core`), so a call on every page would add nothing and cost one request per
  navigation. The shell reads identity from that state; the site data now says so. The endpoint
  stays for a screen that genuinely needs the backend's own answer.

**D-029 · What the home page may claim before Discovery exists (T-204).**
P14§2 forbids inventing activity to look like a bigger community, and H2 has no catalog, no
approved content and no statistics. The home page therefore shows **kinds of game** Playhoot is
made for — quizzes, word games, board games, party games — labelled plainly as our own selection,
with one sentence saying the catalog with its search, categories and tags arrives with Discovery
and that no activity figures are shown because there are none. No invented game, no invented
author, no invented number. H4 replaces that section with the real thing.

**D-030 · The authentication screen's input is its address (T-205).**
B and P14§1 want one screen that receives the reason, the minimum account type that works and the
destination to return to; the plan's path-navigation rule wants a copied address to reproduce the
screen. Both are satisfied by putting the whole input in the URL of `/{language}/sign-in`:
`reason` (a **kind** from a closed list the screen translates — never text written by the caller
or the backend), `level` (`guest` when a guest suffices, an account otherwise), `use=account`
(the person asked for the account options although a guest would do) and `next` (where to
continue, which still carries everything already typed, so returning asks for nothing twice —
WCAG 2.2 3.3.7).

- **No second continuation mechanism.** `next` and the pending-login store that already carried it
  across the trip to the provider are what the screen extends; nothing else is stored anywhere.
- **The caller names the reason, the gate carries it.** `RequireOperation` and
  `useNavigateToOperation` now take the reason beside the operation, and the backend's operation
  catalog still decides the level. A reason this build does not know, or a level it does not know,
  reads as the strictest answer: no reason and an account required.
- **Both halves are one screen, not two routes.** Moving between the display-name field and the
  account options only changes the address of the same route, so what was typed survives the move.
- **The guest warning is a confirmation, not a paragraph.** P03§10 has consequences only when the
  person actually leaves for a provider, so a guest is told there — before the app is left — that a
  new account keeps their name and games while entering an existing account does not merge them.

**D-031 · Admin mode is a second credential, not a stronger one (T-206).**
The admin area is built as D-023 designed it — an area of the same web app under `/admin`, its own
minimal shell, one responsive implementation per screen — and the 15-minute token a TOTP code buys
is kept as a **separate credential with its own HTTP client**: `adminSession` holds the token in a
closure (never in storage, never in the store, gone with the tab or a reload), and a second
`HttpClient` built on it is the only thing that ever calls `/admin/v1`. The account credential and
its refresh are untouched, so an admin token that lapses or is refused ends admin mode alone.

- **Where admin mode ends, the address says where to come back to.** Every `/admin/v1` failure is
  read by one function (`adminFailure`); a 401 or a refused token answers `signed-out`, which
  releases the session and navigates to `/admin/sign-in?next=<this panel>`. Signing in again
  returns to that address, so a panel's state — which its URL carries — survives the trip.
- **The account sign-in is not duplicated.** `/admin/sign-in` has no provider buttons: without an
  account it sends the person to the one contextual screen of D-030 with the new reason `admin`
  and itself as `next`, and with one it asks only for the code.
- **A sensitive action spends its own code.** `withStepUp` turns the code into a proof and spends
  it on exactly one call; `step_up_required` comes back as "ask again" without losing what was
  typed about the change. The cutoff and a task cancellation are confirmed in the native `<dialog>`,
  and the confirm form is built only while that dialog is open, so an abandoned code and reason are
  not left sitting in the page.
- **The QR is drawn here.** The otpauth URI is encoded into a QR in the browser
  (`feature-admin/qr.ts`, byte mode, level M, versions 1–10), because sending a secret shown once to
  an outside service to be turned into a picture would be the one place the secret leaves. The
  secret is also shown as selectable text, so enrollment never depends on the picture.
- **Backend values stay open.** Queue names, task types, budget categories, cap scopes, windows,
  ladder levels, email modes and delivery states are rendered as the backend wrote them; only the
  values this build knows get a translated name, and the categories offered to a reopening or a new
  cap come from the answer itself.

**D-032 · What the server renders, and what every page is called (T-207).**
The H2 close checked D-019 as a behaviour and found two things the code did not do.

- **The join entry is rendered by the server; the authentication screen is not.** Both sat under
  `ClientLayout`, which renders nothing on the server, so a crawler reading `/es/join` — a page the
  sitemap offers — got a document with metadata and an empty `main`. `/{language}/join` now renders
  outside `ClientLayout`: it picks its skeleton with `useMediaLayout`, its three shortcuts go
  straight to their destination while the app is not yet interactive (each destination gates
  itself with `RequireOperation`), and `AppShell` reads from the address that this page shows its
  own big logo, as it already did for the admin area. **`/{language}/sign-in` stays
  client-rendered on purpose**: it is `noindex`, it is only ever reached from another page, and
  what it shows depends on who is already signed in and which providers the backend offers — a
  server skeleton would be replaced a moment later and crawled by nobody. D-019 named it among the
  server-rendered routes; this is the deliberate exception, and `scripts/verify/seo.mjs` encodes
  it: a page offered to crawlers must carry its content, a public page that is not must still be a
  complete document with its frame and its metadata.
- **Every page now has a title.** Only public routes exported `meta`, so every app route — the
  admin area, my games, the workspace, a session — served a document with no `<title>` at all,
  which a screen reader announces as the raw address (WCAG 2.2 2.4.2, a level A failure found by
  the audit). `root.tsx` now declares the fallback title and `seo/meta.ts` gained `appMeta`, which
  resolves a message in the language the root resolved (an app address names none, D-024). The six
  admin screens name themselves; the screens whose presentation later milestones redo get the
  fallback and their own title with that work.

**D-033 · Email-code sign-in (T-300).**
P03§8 wants the visible alternative to Google: type the email, receive a one-time code, type it to
enter or finish registering. The design, all planned:
- **Identity owns the attempt** (`identity_email_codes` + its events table): normalized address,
  intent (sign-in or link), the SHA-256 of the 6-digit code — the code itself exists only in the
  email — an optional guest to upgrade, and a 10-minute, 5-wrong-codes, one-live-attempt-per-address
  life (V-09).
- **The email rides the existing notification path.** Starting an attempt enqueues a `notify` task
  on the identity queue, type `access-code` (the type D-018 already carved out: in_app false,
  necessary email, skeleton cleared once the email is decided), with the **attempt itself as the
  recipient** — a second special recipient besides `admin`. `identity.read-contact` resolves it to
  the attempt's address and requested language, so notifications never stores an address and a code
  can reach a person who has no user row yet.
- **A user is created only at completion.** Completing resolves (issuer `email`, subject address)
  exactly like a provider callback: existing user signs in, a guest passed at start upgrades keeping
  identity and history (P03§10), otherwise a new account is born. An unverified address never
  creates a user.
- **Nothing reveals whether an address has an account**: start always answers the same neutral
  acknowledgement, rate refusals included; a lost email is recovered by asking for a new code
  (P31§3), never by a resend of the same one.

**D-034 · Modes are identity state; nothing rides the token but the mode (T-300).**
P03§9 makes normal and teacher the same account with a visible switch.
- `identity_accounts` gains `mode` (normal | teacher), remembered across sign-ins;
  `identity.set-mode` answers a fresh access token carrying it. The planned `switch-mode` flow is
  **retired**: P15§5 already forbids entitlements riding a token, so there is nothing to confirm
  with `plan` at switch time — operations verify entitlements when called, and `my-data` is where
  the frontend learns what a mode has behind it.
- A teacher without a plan sees the honest presentation (`/teacher`, D-029 style: what teaching
  will be, H8; plans arrive with H6, said plainly). Guests are always normal. The access-level
  ladder (anonymous < guest < account < admin) is untouched; mode gates nothing in H3.
- **What identity owes the student identity (H8), decided now** so this design is not reopened: the
  per-class student credential is a minting-and-resolution concern like resource links — identity
  will mint, resolve and revoke it and issue class-scoped student tokens that carry no account;
  classroom owns membership and approval; and leaving student mode never reopens the adult's
  session, because the adult credential is a separate session student mode never holds — recovering
  it means signing in again (P03§7). Nothing in H3's tables blocks that shape.

**D-035 · Linking methods and recovery (T-300).**
P03§11-12: add a method by proving control of both sides; an email match never merges; recovery is
signing in through any linked method.
- Linking an email reuses the email-code attempt with intent `link` bound to the calling account;
  linking a provider reuses the login-attempt machinery with intent `link` — completion links
  instead of opening a session. A method already on another user answers `method_in_use`, never a
  merge; re-linking one the account already has is idempotent.
- Methods are listed and removed from the profile; the last method cannot be removed (the account
  must stay reachable), and removal is write-once (`removed_at` on
  `identity_external_identities`, which thereby stops being history-exempt; its UNIQUE on
  (issuer, subject) becomes partial while not removed).
- There is **no separate recovery machinery**: email-code sign-in *is* the recovery P03§12
  describes, and the profile is where a person adds it beforehand — the methods screen says so.

**D-036 · Deletion and expiry share one pipeline (T-300).**
P02§9-11: deleting an identity — guest or account — withdraws access immediately, erases within
30/90 days, and never breaks shared history.
- `identity.delete-user` is synchronous: sessions deactivated, methods removed, resource links and
  grants revoked, display name cleared, `deleted_at` set — then one `account-cleanup` task on the
  identity queue (keyed by the user uuid) carries the rest. The uuid keeps resolving, to a neutral
  deleted reference, so shared history stays playable and distinguishable (P02§10).
- The orchestrated cleanup covers what exists today: `game.delete-user-games` (finally writes
  `games.deleted_at`; existing Sessions and other people's history untouched, P04§6),
  `play.session.anonymize-user` (clears roster display-name snapshots; participant ids keep deleted
  participants distinguishable), `notifications.delete-user-entries` (entries and preferences;
  address-keyed suppressions stay because they protect the address). H5 (replay content), H6
  (billing) and H8 (classroom) append their steps.
- **Compliance evidence is the P02§11 exception**: declarations, acceptances and minority signals
  stay, restricted, with their retention resolved by H11's privacy-request design. **Analytics
  events stay but become unlinkable** — identity deletion removes the only resolution of the uuid;
  H11 revisits whether residual purging is needed.
- **Guest expiry is the same pipeline on a timer**: `identity.expire-guests` runs daily, measures
  inactivity from `identity_sessions.last_used_at` (written by refresh at most once a day) and
  feeds 90-day-inactive guests into `delete-user`. No warning email — a guest has no address — so
  the term is disclosed where the guest is created (auth screen, P02§9) and again in the profile.

**D-037 · What a person accepts, and when (T-300).**
P22§3 wants distinguishable, recorded acceptances; C-01 forbids asking a guest anything but a name.
- **Terms and own-data processing are recorded at registration**: when a sign-in completes and the
  signed-in account has no standing acceptance of the current version of either text (the texts
  endpoint already answers that), the contextual sign-in screen inserts one acceptance step naming
  both texts with links and records each kind at its exact version. A returning account meets the
  same step only when a text version changed. Guests are never asked; the screen's footer links the
  texts for everyone. "Distinguishable" is satisfied by the records — one per kind and version —
  not by ceremony.
- **Marketing lives where its effect is**: the notification-preferences screen's marketing toggle
  records the acceptance or withdrawal of the marketing text, which is exactly what the delivery
  flow already checks (D-018).
- **The texts become publishable from admin** (`compliance.admin-list-texts` /
  `admin-publish-text`, panel `admin-texts`), so the creator loads the real ones (P-23) without a
  deploy. Versions stay immutable and append-only; recorded acceptances keep pointing at the exact
  version accepted.

**D-038 · Entry gates ask for the declaration the way D-030 asks for an account (T-300).**
P19/P35: adult functions need the declared residence and age; interactive entry is territorially
controlled.
- A gated flow answers **`declaration_required`** (with the function kind) instead of performing;
  the frontend sends the person to `/declaration?function={kind}&next={path}` — the same
  address-is-the-input pattern as the sign-in screen — which records the declaration and returns to
  `next` with everything typed still there. A blocked market answers a service-restriction notice,
  never legal wording (D-016). Answering below the threshold records the binding minority signal
  and the function stays restricted; corrections go through support (P19§3).
- **H3 wires the two entries that exist**: `create-game` gains a first step
  `compliance.check-market-access` (function `create-games`), and the session-join admission gains
  the `interactive-use` check — for a guest with the approximate country only (C-01; the local
  locator answers unknown, so the gate is live but open in development). H4–H6/H8 wire publish,
  subscribe and teach as those flows arrive.
- The place resolution is T-103's unchanged: declared residence, else approximate country;
  discrepancies recorded, never blocking (P35§5).

**D-039 · Where the ways in live, and what building them corrected (T-301).**
Implementing D-033/D-035 settled four things the design left to the code.
- **Two workflows, one subject.** The email-code machinery is
  `identity/workflows/emaillogin` (start, complete, and both link steps); provider linking lives in
  `identity/workflows/accountlogin`, because it *is* the login-attempt machinery and a sibling
  package cannot reach that package's `internal/repo`. Listing and removing are
  `identity/usecases/signinmethods`. The site data keeps describing them as the operations
  `identity.email-login` and `identity.link-method`: it documents operations, not packages.
- **`identity_login_attempts` gained `intent` and `link_user_id`** (the design had marked only the
  email table and `removed_at`). A link attempt's callback does the linking and issues the code
  with what it decided (`linked` or `method_in_use`); the completion answers that and never opens a
  session, and a sign-in completion refuses a link attempt. Exhaustion needs no column: an attempt
  with five `wrong_code` events is simply no longer live.
- **A method is named by its row identifier**, scoped to its owner on every call; it is not a
  secret and the table has no uuid. The operation catalog gained `MANAGE_SIGN_IN_METHODS` at
  account level, which the five `/v1/identity/me/methods*` endpoints require.
- **Notifications learned that a recipient need not be a user.** `TypeSpec.ExternalRecipient`
  (access code only) makes the entry keep no user — `notifications_entries.user_uuid` is now
  nullable — while the email task still names the attempt Identity resolves. No other type changes.
  The metric guard rose from 1000 to 4000 series: the per-route request counter grows with the API
  and crossed the old ceiling with these eight endpoints.

**D-040 · What modes, language, my-data and the entry gates taught (T-302).**
Building D-034/D-037/D-038 settled five things the design left open.
- **A settings history, not a data trail on the row.** Mode and interface language are both
  overwritten in place, so the data-history standard asks for a history table, not "previous value"
  columns: one append-only `identity_setting_changes` (user, setting, from, to, when) carries both.
  The site data for `identity_accounts` was corrected accordingly.
- **The mode rides the token everywhere a token is issued.** `set-mode` answers a fresh access
  token and **no refresh token** (the client keeps its session); refreshing and both sign-in
  completions read the account's mode in the query they already ran, so a teacher who signs in is
  a teacher from the first request. The `mode` claim is informational in H3: nothing gates on it.
- **Three operations, not one.** `SET_OWN_MODE`, `SET_INTERFACE_LANGUAGE` (account) and
  `MANAGE_TEXTS` (admin) joined the catalog; `GET /v1/me` reuses `VIEW_OWN_IDENTITY` (guest), so
  a guest reads their own data and is refused only on the two settings. The three endpoints live
  in a new API group `api/me`, because `/v1/me` is a composed read and not Identity's own route.
- **The gate is one package, used from both sides.** `orchestrator/marketgate` turns Compliance's
  decision into `DeclarationRequiredError` (carrying the function) or `RestrictedError` (carrying
  the service-restriction reason). `create-game` calls it as its first step; the session-join
  admission calls it as an API middleware **before** join-code and owner routing, so a refusal
  never reveals whether the Session exists. HTTP answers 403 `declaration_required` with the
  function, or `market_restricted`; a live connection is refused on the upgraded socket with the
  same two reasons.
- **The approximate country needed wiring.** `api/geolocation` existed unused: the edge now notes
  the client address on every request (cheap, no lookup) and only the handlers that need a country
  ask the locator, through `geolocation.Resolver`. Locally it always answers unknown, so the gates
  are live and open. Also corrected: `read-profile` lists methods through the `signinmethods` use
  case rather than repeating its query, and text versions are counted **per kind and language**, so
  publishing one language never moves another.

**D-041 · What deletion and guest expiry taught (T-303).**
Building D-036 settled six things the design left to the code.
- **Access ends wider than the design listed.** The deletion transaction also revokes the person's
  AI connections (`identity_ai_sessions`, reason `user_deleted`) and *deletes* their single-use
  resource grants rather than marking them: a grant is a live token hash with no history of its
  own, as the sweep that deletes the expired ones already shows. A link keeps `revoked_at`, which
  is its record.
- **A removed method must also stop naming the person.** Setting `removed_at` left the address
  (and, for the email provider, the `subject`, which *is* the address) on the row forever. Deletion
  now clears `subject`, `email` and `name` on the person's method rows, and the name kept with a
  guest's creation request (`identity_guest_requests.display_name`): what stays is that a method
  existed and when it went. The partial unique index is scoped to live rows, so cleared rows never
  collide. **Not covered, and now a gap**: the login-attempt and email-code trails hold observed
  addresses that are not keyed to a User; they go with H11's privacy-request design.
- **The account row stays, the mode is reset.** Deleting the `identity_accounts` row would turn a
  deleted account into something the guest sweep treats as a guest. The row stays and its mode goes
  back to normal, recorded in the settings history like any other switch; `interface_language` is
  cleared and recorded the same way (D-040's history table carries both).
- **Two write-once columns, no history rows.** `identity_users.deleted_at` carries a cause column
  `deleted_origin` written with it (requested or expiry), which is rule 3 of the data-history
  standard, not a new table. `games.deleted_at` is likewise its own record: the design said the
  deletion would write `game_histories`, but that table has no column for it and rule 1 does not
  ask for one. The site data was corrected on both.
- **`last_used_at` is an exception to the history rule, and it is written in the standard.** It is
  overwritten in place, which rule 2 would send to a history table; it is the same kind of value as
  the Session owner lease the standard already exempts — a periodic activity mark nobody reads the
  past of. The exception list in `playhoot/docs/engineering/standards/data-history.md` now names
  it. A rotation carries the mark onto the successor row, so rotating costs no extra statement.
- **The cleanup is a delivery type, and deleting entries takes their delivery records.**
  `account-cleanup` joins notify, analytics-event and spend-event as a `txqueue` delivery type the
  orchestrator registers (`orchestrator/accountcleanup`), on Identity's queue alone. Inside
  Notifications, `notifications_email_deliveries` point at entries by row, so they are deleted with
  them in the same transaction rather than left to their own 30-day clock. V-12's "admin alert"
  needed no code: a dead task already logs `task_outcome=dead` and sits in the dead letter queue
  the admin panel reads.

**D-042 · What the ways in and the declaration taught the frontend (T-304).**
Building D-033/D-037/D-038 in the browser settled five things the design had left to the code.
- **The acceptance step is a gate, not a step of the sign-in screen.** D-037 put it inside the
  contextual screen, but a sign-in finishes in two places — on that screen (a code by email) and
  on the provider callback — and in both the screen that started it is gone by the time there is
  an account. It sits in `ClientLayout` beside the display-name gate the app already had, so it is
  met once however the sign-in finished, and again when a text version changes, which is what
  D-037 asked for. A guest never meets it (C-01): only `authenticated` is gated. The texts are
  read in the language the person arrived in and the acceptance points at that exact version, so
  changing language afterwards does not ask again.
- **A text that cannot be read is not asked for.** Nothing is published until the creator loads
  the real texts (P-23), and a backend that cannot be reached must not become a locked door: a
  kind that answers `text_not_found`, or does not answer, is simply not asked for, and the next
  sign-in asks again. The backend remains the authority on anything that depends on an acceptance.
- **The declaration cannot name the age before it is answered.** P19 wants the threshold of the
  place in the declaration, but nothing public tells a client what a place asks for: the matrix is
  admin-only and `POST /v1/compliance/declaration` answers `threshold_age` only once a declaration
  is recorded. The checkbox therefore says "the minimum age Playhoot asks for where I live", and
  the age is named afterwards, in the refusal a below-threshold answer leads to. A public read of
  a place's threshold would close this; H4 should add one when it wires publish and subscribe
  (`GAPS.md`). For the same reason the screen does not know which countries are kept per state or
  province: it offers that field for the United States and Canada, and for any country the backend
  refuses the place of, which is correct whatever the matrix says.
- **Saying "no" is a separate, confirmed action.** A below-threshold answer is recorded, binding
  and only correctable through support (P19§3), so it is not something a person can do by leaving
  a box unticked: continuing needs the box, and "I haven't reached that age" is its own action
  behind a confirmation that says what it costs.
- **A gate refusing is not an error.** `declaration_required` and `market_restricted` join the
  join-rejection reasons and the create-game refusals, and the join screen offers the declaration
  the way it offers another code. They are left out of the telemetry error catalog: that catalog
  is the backend's closed list, and a market decision counted as a backend rejection would read as
  a failure in the join metrics. Compliance already counts its own decisions.

**D-043 · What the person's own corner taught the frontend (T-305).**
Building D-034/D-035/D-036/D-037 in the browser settled five things the design had left open.
- **The display-name allowance is the client's to state.** The backend answers only the refusal
  (`429 change_limit_reached` with `next_change_at`), never how many changes are left, so the
  screen states V-10's allowance from the protocol constants — three changes every thirty days —
  and the refusal names the date of the next possible one. A read of the remaining changes would
  let the screen count down instead; it is in `GAPS.md` and costs nothing to add later.
- **The mode travels with the credential, so nothing has to ask for it.** Every answer that opens
  or renews a session already carries `user.mode` (D-040), so the client keeps it on the stored
  credential and the auth snapshot: the shell's switch, the profile and the teacher screen are
  right on a cold load without a request of their own. Switching answers a fresh access token and
  no refresh token, which the app adopts in place (`accessReissued`); the session is untouched.
  The teacher screen asks for the mode itself, so arriving there by any route — the switch, the
  home band, a bookmark — means the same thing.
- **A screen that ends the identity cannot be gated by the operation catalog.** Every page is
  rebuilt for whoever is signed in the moment that changes (D-028's identity key), so the gate
  would read a successful deletion as someone who was never allowed there and send them to the
  sign-in screen instead of home. `/profile/delete` therefore offers the way in rather than
  redirecting, and the deletion takes the person home *before* the credential is forgotten:
  `submit(leave)` waits for that navigation and only then signs out.
- **An acceptance is recorded before the preference it governs is stored.** Turning marketing on
  records the acceptance of the exact version read and stores the preference only once that is
  written down, so a choice that was not recorded never looks taken; turning it off records the
  withdrawal the same way. A text that is not published yet (P-23) is not accepted at all: the
  switch says so and records nothing, which is D-042's rule for the acceptance gate.
- **The design system gained a switch.** A preference that takes effect at once is neither a
  checkbox nor a button: `Switch` is a real `role="switch"` with its state announced and drawn by
  the knob's position as well as its colour, and it is in the `/design` gallery like every other
  core component.

**D-044 · What closing H3 corrected (T-307).**
Verifying the milestone against the specification found three things the tasks had left wrong.
- **Joining asks nothing, as C-01 says.** T-302 put the full market gate in front of the
  session-join admission, so a person with no declaration was answered `declaration_required`
  wherever the place had an age (all of the open markets), and locally always, because the local
  locator knows no country. D-038 had meant "approximate country only" for that entry and C-01
  forbids asking a guest anything but a name. The admission now uses `marketgate.Gate.Admit`: a
  declaration that would be owed is not asked for and the person counts as meeting the age, so only
  a restriction refuses — a market not offered where they are (declared residence, else approximate
  country) or known minority (P21§6). The wire reason `declaration_required` is gone from joining;
  the frontend dropped the "tell us where you live" outcome that answered it. Gated *adult* flows
  (create-game today) still ask, unchanged.
- **The join screen never showed `market_restricted`.** Its reason switch had no case for it, so
  a real restriction read as an unexpected error. It has its own calm outcome now.
- **A dialog opened on its close button, never where its screen asked.** `Dialog` opens with
  `showModal()`, which focuses the first focusable element, and React never writes `autofocus` to
  the page, so the deletion dialog's "opens on Cancel" did not happen. `Dialog` focuses an element
  marked `data-autofocus` after opening; the deletion dialog marks Cancel, and the gallery shows it.
- Also: `robots.txt` now disallows the person's own pages H3 added (`/profile`, `/notifications`,
  `/teacher`, `/declaration`), and two H1 walkthrough steps wait for their condition instead of a
  fixed two seconds, which a slow local database had turned into intermittent failures.

**D-045 · The four version conditions, and who answers "which version do I play" (T-400).**
P15§2's four conditions get four distinct homes. *In editing* and *ready* are `play_game_versions.status`
(DRAFT / EXECUTABLE), owned by `play.versions`, which the T-401 split finally makes a real package;
*pinned in a session* stays `play_sessions.game_version_id`. The other two live in **game**, both as
references to versions it never opens (P15§2 allows exactly that): *chosen for new sessions* is
`games.chosen_version_uuid` (empty = unavailable, history in `game_version_choices`) and *approved
for Discovery* is the approved `game_publications` row, with `games.offered_publication_id` naming
the one Discovery currently shows. `play_games.current_version_id` is dropped: keeping the choice in
play would force a cross-domain read on every offering recompute, and the choice is a policy about
the logical game, not about content. Consequences:
- **Who plays what is game's answer.** `game.resolve-playable-version` replaces check-playability:
  the owner plays the chosen version; everyone else plays the *offered publication's* version,
  exactly as reviewed — never an unreviewed update (P04§4). create-session passes the resolved
  version to `play.session`, which only verifies EXECUTABLE and pins it.
- **The offering follows the choice when it can**: a chosen version with a retained approval is
  offered; a chosen version under review keeps the previously approved combination in Discovery
  (P04§4); switching back to an approved older version re-offers it without a new review (P04§5).
- **Finalize ≠ publish.** Finishing a version (explicit act + ready checks + freeze with assets,
  P04§1-2) is the `finalize-version` flow and by default also chooses the version; going public is
  a separate publication request. The old `publish-game` flow and `POST /v1/games/{g}/publish` are
  retired; `games.visibility` is dropped (public = has an offered publication).

**D-046 · Publication pipeline and the moderation review core (T-400).**
A publication is a frozen **combination snapshot** in `game_publications`: version uuid, card text,
image object keys, category, tags, academic claim, the mandatory private-content declaration (must
be "no" to submit, B), and the version facts (languages, players, devices, grade support) copied
from `play.versions` at submission — so Discovery search and the card read game's own tables only.
Moderation is born with its review core: `moderation_review_tasks` (one PENDING per game; a new
request supersedes the old one), `decide-review` (approve / deny with the creator-visible note,
never automatic even saturated), and `moderation_measures` for the administrative block. Shapes:
- **Card edits never touch the approved snapshot** (P04§2,§4): PATCH edits the working card;
  reaching Discovery again is a new request. The planned `edit-public-card` flow is retired.
- **Unpublish keeps the approval**: it is an offering flag with history (`game_offering_changes`),
  so re-offering the same approved, unchanged combination needs no new review — the same principle
  that lets P04§5 return to an approved version. Deny, withdrawal, block and deletion all leave the
  decision trail intact.
- **Unpublish ≠ delete ≠ block** (P04§6): deletion is `games.deleted_at` (the column D-036 already
  writes), leaves sessions and replays alone and keeps copies independent; the block is a recorded
  moderation measure game executes (`game_blocks`) that refuses everyone including the owner, is
  worded as a service restriction, and cancels pending reviews. Appeals and the other graduated
  measures are H9's; review decisions on a game that meanwhile died land CANCELLED (moot guard).
- The creator is notified through the existing types: `discovery-review` (outcome, optional email)
  and `discovery-restriction` (block, necessary) — D-018 already carved them out.

**D-047 · Templates: grant, provenance, featured (T-400).**
Enabling a template is an append-only **grant row** on the game recording the exact version of the
standard-permission text accepted and the creator's confirmation that every included asset may be
reused (P05§1,§5); the text itself is a compliance acceptance text (kind `template-permission`),
publishable from the existing admin texts panel — the creator writes the real one (P-23). Enabling
requires an offered publication and the publish-games market gate (templates and publishing are one
adult function, P02§1). Copies start from the offered approved version (P05§3) and are ordinary
creations: the separate `copy-template` flow is folded into `create-game`, which now also writes
`game_provenances` rows (source game, version, name snapshot, permission version) — the credits
chain on the public card; applying a template to an existing draft appends provenance the same way.
Disabling stops new copies and nothing else (P05§4). `games.template_allowed/template_featured` are
dropped: the grant rows and the admin-managed `game_featured_templates` selection replace them.

**D-048 · Catalog, search and popularity (T-400).**
Categories (one per game) and allowed tags are admin-managed vocabularies in game
(`game_categories`, `game_tags`, names in the three languages, retire-not-delete, every change in
`game_taxonomy_changes` with actor and reason — D-011 pattern). Discovery search runs entirely over
approved snapshots inside game: category and language columns, `game_publication_tags`, a trigram
index on the snapshot name, partial indexes scoped to offered games. **Popularity is game's own
aggregate fed by play through the queue**: commit-start writes a `game-usage` task (a new
orchestrator-registered delivery type beside notify/analytics/spend/account-cleanup) into
`game_usage_days`; an hourly periodic task recomputes `games.popularity_score` over the V-13
window. Card statistics (sessions started in 30 days) show only at or above the V-13 threshold —
real figures or none (P14§2). "Recently played" comes from `play.session.list-recent-games`,
joined by composer.

**D-049 · Quota wiring: games and creations (T-400).**
`create-game` gains `plan.get-user-limits` as a step; game applies the stricter of received and its
own counts — live games held (drafts included) for the saved-games capacity, `game_create_requests`
rows in the rolling window for creations (that table is already the creation record P15§4 wants) —
refusing `game_limit_reached` / `creation_limit_reached`. A template copy consumes a creation like
any other (P12§14). `GET /v1/games` becomes the composed `my-games` read (game list + capacities)
so the screen can say "X of Y games" without a second request. Session, player and room quotas stay
H5's; no upsell on refusal until H6 exists (B: do not push a subscription).

**D-050 · The split as code (T-400, built by T-401).**
The versions code leaves `play/session` for `play/versions` (drafting, building, assets, previews,
freeze, the new facts/list reads); `play_games` and `play_game_versions` are re-homed in the site
data accordingly. The **build queue moves onto txqueue**: applying a change enqueues a `run-build`
task on the play queue keyed by the version (the handler builds that version's newest QUEUED
revision; supersession keeps working through build rows), which retires the last ad-hoc queue the
backend had besides H5's replay buffer. Migrations are edited in place (METHOD §6): dropped columns
(`games.visibility`, `template_allowed`, `template_featured`, `play_games.current_version_id`,
`game_releases.visibility`) and the new tables ship in the original files, so **the creator
recreates the local database after T-401/T-402** (P-16 already pending).

**D-051 · The public surface Discovery needs (T-400).**
Discovery, category pages and public cards are server-rendered public routes reading anonymous
endpoints (`/v1/discovery*`, D-019); the card page lives at `/{language}/g/{gameUUID}`. The
build-time sitemap gains a **dynamic section**: a sitemap index points at a host-served sitemap fed
by `GET /v1/discovery/sitemap`, so approved cards and categories are crawlable without rebuilding
(D-025 stays: the host logs nothing). `compliance.read-place-requirements` becomes the public,
rules-only read of what a place asks for one function — it closes the D-042 gap, so the declaration
screen names the exact age and learns which places need a state or province from the backend
instead of a guessed list.

## V — Defaults

Operational values the specification does not fix (anti-abuse windows, page sizes, retries) are chosen at implementation time, stay configurable, and are listed here and in the documentation of the operation. Already derived from the specification:

| ID | Value | Origin |
|---|---|---|
| V-01 | Free AI ceiling per account: 300 credits per 30 days (30 % of the cheapest plan's 1,000), inside the global pool of USD 10 per month split by week | B: business rules, P28§3, P30§5 |
| V-02 | Queue retry policy: 10 attempts, exponential backoff from 10 s capped at 1 h, with jitter; completed tasks deleted; dead tasks kept until retried or cancelled | B: principles |
| V-03 | TOTP: 5 failed codes per 15 min then a 15 min lock; step-up proof valid 10 min, single use | B: admin, P32§7 |
| V-04 | Initial local cost caps until the creator sets real ones: global USD 120/month, 8/day, 1/hour; email USD 1/day; admission margin 10 % of the window remainder | P32§2, P32§9, P12§1 |
| V-06 | Restriction ladder thresholds: restricted when spend plus reservations reach 80 % of any cap, when the last 60 minutes' global spend projects the month cap exhausted, or when a rate is missing; a category at 95 % of a cap is paused; spend alone at a global cap shuts down. Evaluation and expired-reservation sweep every minute; a reservation lives 15 min by default, 24 h at most | P32§4-5 |
| V-05 | Queue worker: poll every 2 s, claim 10 tasks per batch, 5 min lease (also the handler timeout); admin sees the newest 100 dead tasks per domain queue. Identity grant sweep: hourly, deletes grants expired more than 1 day ago, 500 per statement | B: principles |
| V-07 | Notifications defaults: optional email groups start with AI and capacity off, Discovery review on, marketing off; an email whose recipient's language is unknown is written in English (as compliance texts); delivery records expire hourly in batches of 500 | P31§4-5 |
| V-08 | PWA install hint: shown once after the second visit on a distinct day, dismissible forever; installing stays available from the shell menu | P01§5 |
| V-09 | Email codes: 6 digits, 10 min, one live attempt per address (a new one supersedes it), 5 wrong codes exhaust it; sends 3/15 min and 10/day per address and 30/h per client IP; completion tries 10/min per IP | P03§8, P31§3 |
| V-10 | Display-name changes: 3 per rolling 30 days, guests and accounts alike; the existing change history is the counter | B: identity |
| V-11 | Guest expiry: daily sweep on the identity queue, batches of 500; activity = session use, written at most once per day per session | P02§9 |
| V-12 | Account cleanup: standard queue retries (V-02); a dead cleanup task is an admin alert; targets stay 30 days in active systems, 90 in backups | P02§11 |
| V-13 | Discovery defaults: popularity = sessions started in the last 7 days, recomputed hourly; card statistics = sessions started in the last 30 days, shown from 10; pages of 24, category samples 8, popular section 12, recently played 12; search text 2–80 chars, up to 10 tags per filter; review queue pages of 50; dynamic sitemap pages of 5,000 | P14§2, B: search |
| V-14 | Starter taxonomy, seeded in the migration and editable in admin: 10 categories (trivia-quizzes, word-games, board-cards, party, action-arcade, puzzle-logic, memory, math, language-learning, science-nature) and ~24 descriptive tags chosen by T-403; names in es/en/pt | B: admin manages categories and tags |
