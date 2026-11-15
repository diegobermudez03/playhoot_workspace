# Specification map (resolved by layers)

> What it is: the agent's working index over `docs/definitivos/`. For each topic it states **which source governs** and **what was decided**, with the substitutions between layers already applied.
> What it is not: it does not replace the originals. Before implementing a feature, read the patch that governs it **in full** (text in `docs/definitivos/md/`).
> Documentation cutoff: 15-Nov-2026 (base + post_01…post_37 + index 00).

## 0. How a rule is resolved

1. **Patch `post_NN`** that regulates the matter → governs.
2. If no patch touches it → **`playhoot.docx`** (base).
3. If the base does not touch it either → current code and old documents (`docs/legacy/`, each repo's docs), only if compatible with the above.

- Between patches only **explicit substitutions** count (table §25). A number or date does not resolve an undeclared contradiction → ask the creator.
- Code shows what is implemented, never that a difference is accepted. Reconciling = doing what the higher layer says.
- Notation: `B:` base section · `P07§3` patch 07 section 3.
- Answers the creator gives after the cutoff are recorded in `DECISIONS.md` (list C) and govern their matter like a patch. So far: C-01 (guest join) and C-02 (private family group).

## 1. Phase 1 scope and deliveries — P01, P16, P17, P36, index 00

- Scope = everything in the base and patches: general games, AI creation/editing (3 routes), multiplayer sessions, Discovery and reuse, Teacher/student, classes and grades, plans and payments, reports/support, notifications, admin. Nothing leaves scope because it is not implemented (P01§3). **Personal and Teacher complete**, without prioritizing one (P17§2).
- Platform: **full web desktop + mobile and installable PWA** (optional for the user). Store apps deferred (P01§5). **No push of any kind** (P29). **No ads** (P37§1). **No external analytics** (P34). **No generative AI during sessions** (P36§2).
- Interface languages: Spanish, English, Portuguese. French postponed (P01§7, P18§3).
- **Delivery 1 (local):** all flows and rules executable with local infrastructure and simulated providers (permissions, limits, simulated purchases, failures). Ports ready to connect real providers. AI with canned responses (does not demonstrate real quality). (B: purpose, P01§4, P16§1)
- **Delivery 2 (integrated):** real providers are connected (auth, AI, billing, email) after the creator's iteration on delivery 1.
- **Production:** additionally requires closing the conditions in §24. The creator's final test does not replace the team's validation nor require approving each stage (P16§6).
- The name "Playhoot" is a working name: name, logo and domain must be changeable without losing functionality or data; the agent neither chooses nor buys a domain (P36§7).

## 2. Agent autonomy and open questions — B: purpose/work mode, P01§2, index 00§7

- The agent drafts its plan, chooses the order and decides code, concrete contracts, internal organization, tests, algorithms, storage, libraries.
- **Ask the creator** only if a choice changes: strategic provider, price, contracted benefit, market, data collected, reuse permission, financial exposure or functional scope; when facing an unresolved contradiction; or a proven limitation that prevents delivery. At the base's level of abstraction (domains and their coordination), never more granular.
- No routine approval per unit of work. No waiting for user tests per stage: the creator tests at the end of delivery 1.
- Business rules that are undefined but necessary: propose and ask (B: undefined rules). Minor operational values: set by default, configurable, and recorded in `DECISIONS.md`.
- Bounded sessions with a handoff document; consumption control (`/usage`: +20% of the 5 h window or +2% weekly → stop and notify). See `METHOD.md`.
- The agent also acts as compliance/legal/accounting: detect what complicates launch; what can be deferred is recorded as pending with an owner (B: launch).

## 3. Non-negotiable technical principles — B: principles

**Backend**
- **Data trail (change history)** for every relational row (previous value, when, why). Does not apply to live streaming/session data (best-effort replay) nor to infrastructure tables (cache/queues).
- Normalize without sacrificing optimization. **Every query scoped** with declared indexes; never a full scan.
- **Top-level domains = independent services** (a single deployable unit today): own tables; no open transaction during calls outside the domain; **no direct calls between top-level domains** (only via orchestrator/composer); cross references only via external identifiers. A tree, not a graph: a subdomain is known only to its parent. Each domain decides its internal rules.
- A domain's exported signatures only use its own types (exception: orchestrator and composer).
- No unnecessary infrastructure complexity: one container; cache/queues behind interfaces (in-memory map, tables). Sandbox is indeed a separate process.
- **All async work uses txqueue (transactional queue) + dead letter queue** (shared generic package; table and worker per domain; idempotent at-least-once tasks; service / queue / processor code kept separate to migrate to a real outbox+queue). Admin sees all DLQs and can retry or cancel.
- Observability: logs that allow reconstructing the path across domains; per-endpoint metrics (HTTP only) **and** a logical-outcome metric of its own for each domain operation; dependency between services visible. Long-term analytics in a DB decoupled from the logic (outbox or similar).
- Code design: each traditional domain has `workflows/` (multi-step lifecycles) and `usecases/` (independent operation). Tests: table of cases `map[string]func`, mocks with parameter asserts, repos against an ephemeral DB.
- **Limits at 3 levels** (B: business rules, plan): network (API, rate limiting), domain-logical (almost every write), capacity per plan (Plan defines them; the caller passes them; the owning domain verifies actual usage and applies the most restrictive; it is monitored whether what is received exceeds its own).

**Frontend**
- Layers: UI (render only + UI state) / state-service (the only logic layer) / external calls. Logic in backend; composer may expose endpoints coupled to screens.
- **Adaptive:** each screen with 2 implementations (landscape and portrait) sharing components; each one also responsive.
- Path-based navigation: the URL defines screen and input (copy/paste reproduces the screen if permissions allow).
- SEO as a goal (searches by category, not by brand). WCAG 2.2 AA (P14§3).
- **No AI slop.** Own visual identity, professional, lively (feedback animations). Pending assets are recorded in a `pending_assets` list with a placeholder (B: UI).

## 4. Markets, age and minors — P02, P18, P19, P20, P21, P22, P35

- **Matrix (P35§1):** Colombia and Mexico: Personal and Teacher complete; minors only as authorized participants in classes or private family groups. Argentina and Chile: same, after operator conditions. USA (50 states + DC) and Canada except Quebec: adults only (including teaching adults); minors postponed. **Peru: prepared but disabled.** Rest (Brazil, Quebec, EU/EEA, UK, others): postponed; from there only public information, no interactive or commercial use.
- The matrix is configurable per market and function; activating a market requires real conditions (notices, agreements, transfers). Language ≠ country.
- **Adult functions (P02§1):** create/edit games, use creation AI, publish/templates, create/manage sessions and classes, subscribe/purchase. Minors: play and participate; also request help, report, exercise rights and see their results.
- **Declared age (P19, P35§3):** to create, subscribe or manage, the user declares country (and state/province) and having reached the required age. Thresholds: 18 in CO/MX/AR/CL; USA 18 except Alabama and Nebraska 19, Mississippi 21; Canada 18 in AB/MB/ON/PE/SK and 19 in the rest of the enabled provinces. The declaration and date are stored as *declared age* (never "verified"). No date of birth, document or photo by default. Google/email/card do not prove age. It cannot be circumvented by repeatedly changing the answer; correction via support.
- Knowledge of minority (declaration, class context or other information) activates restrictions even if someone says they are an adult (P21§6).
- **Territorial control (P35§5):** considers the participant, not only the teacher; applies at entry and at prior data upload. Signals: declared residence + approximate location; no GPS; VPN/travel are not a sanction.
- **Teacher (P19§4, P20):** open to teachers, tutors, trainers; no degree or institutional email. Before bringing in real students: states whether acting on their own behalf or for an institution, name and confirmed contact, institution and role; declares authority; accepts a versioned, downloadable **data processing agreement** (P22§2). May register, try and prepare with fictitious data without that.
- **Existing authorizations (P20):** coverage record per student (who keeps the evidence, origin/reference, date, scope, validity, who registered it); allows batch registration; separate from the academic profile; no per-student document uploads. Pending/withdrawn/insufficient authorization blocks that student, not the class. Never show "verified by Playhoot".
- **New authorizations (P21):** page for the legal guardian: email confirmed by code, no account or plan; sees organizer, data, purposes, access, retention and how to withdraw; express acceptance with evidence; receipt; authenticated lookup and withdrawal (the teacher cannot override the withdrawal). Adult's data: name, confirmed email, status as legal guardian.
- **Private family groups (P21§4, P35§4):** the legal guardian authorizes their minor for an identified group; it does not extend to other hosts, classes or public sessions; no one authorizes other people's minors. Product shape (named private group created by an adult, per-group minor identities, class-like machinery without grades): creator decision C-02.
- **Distinguishable, recorded acceptances (P22§3):** terms of use/purchase; processing of own data; class data agreement; optional (marketing).
- **Roles over data (P22§1):** the institution or independent teacher decides the purposes of the class and Playhoot processes on their behalf; Playhoot is responsible for accounts, subscriptions and general play.
- **Single entry point for privacy requests (P22§5):** access, correction, deletion, withdrawal; even without an account; with tracking; identity/authority verified proportionally.
- **Queryable provider registry** (function, data, countries) (P22§6).
- School data: never advertising, training or own commercial analytics (P22§4, P34§4).

## 5. Identity and access — B: identity and authentication flows, P03, P15§3,§5

- Identity: accounts, profile (display name), upgrade, stable logical identifier, token resolution, account types/roles/modes and **general operation permission**. Scoping over the concrete resource is done by the owning domain.
- Types: no account (browses as much as possible) · **guest** (display name only, tied to the device; expires after 90 days of inactivity, disclosed from the start — P02§9) · **registered account** · **per-class student** identity.
- **Joining (creator decision C-01):** with an account nothing is asked; without one the person signs in, registers, or continues as a guest, and a guest is asked only for a display name — no age or country confirmation at join.
- **Methods (P03§8):** Google (featured) + **one-time code by email**. No own password. Other providers when needed.
- Contextual authentication screen: receives from the caller the reason and whether it requires a real account; prioritizes the simplest account type that works; when done, returns to the operation keeping destination and data (B, P14§1).
- **Guest upgrade (P03§10):** registering a new account keeps identity and history. Signing in to an existing account does not merge (the user is warned).
- Linking methods (P03§11): by proving control of the account and method; an email match does not merge. Recovery via linked methods (P03§12).
- **Modes (P03§9):** normal and teacher = same general account; student = separate identity. Visible 3-mode switch; a teacher without a plan sees a presentation + invitation. `GET my data` tells the frontend identity and role.
- Validity of entitlements (P15§5): holding a teacher token does not keep paid functions after the subscription expires; operations that require them verify current entitlements (the base specifies this). Values sent by the browser or AI do not grant permissions or allowances.
- **Student (P02§5, P03§2-7):** a class's own identity; fields: name (the teacher may require it), alias (mandatory if there is no name; effective alias = alias or name), teacher's internal identifier (optional, never visible as a player name). **Individual, private and revocable credential** (personal link, QR or secret code) that allows returning from another device; name/alias/class code are not secrets (replaces the base's optional password). Request via class link/code + teacher approval; an individual invitation may include the approval. Before admission: no access to materials or list. Recovery: the teacher reissues the credential (invalidates the previous one and its sessions). Optional "Remember on this device"; several independent accesses per device without a central account; signing out does not delete data.
- **Adult protection (P03§7):** leaving student mode does not open the adult's account; recovering it requires unlocking.
- Display name changes have a logical limit per window (B).
- Leaving guest: loss warning + upgrade offer; removes the corresponding access and data, **without** breaking shared replays (P02§10, §15).

## 6. Games, versions and publication — B: game/play, P04, P15§1-2, P13§3

- **Game:** logical game, owner, card (name, description, cover image), visibility, reuse permission, academic mark, category (one) and tags (several), holding and creation limits, search. Does not know scripts nor execute.
- **Play / Versions:** content of each version (frontend/backend/shared scripts, assets), executable condition. **Play / Sessions+Runtime:** lobby, participants, session, reconnection, closing, original results, recording. Sandbox: separate process.
- **Four version conditions that are not confused (P15§2):** in editing · ready and chosen for new sessions · approved for Discovery · pinned in an existing session.
- Draft → ready: passes checks (compiles, runs, P09§2 minimums) **and** the creator explicitly declares it finished (P04§1).
- **Ready version = frozen, including assets** (images, audio, animations). Changing any of them prepares a new version (replaces the base, which allowed changing assets freely). Name, description and cover image are edited separately; if public they go through review (P04§2,§4).
- The current version can be kept playable while the next one is worked on, or the game can be made unavailable. It is possible to return to a previous available and authorized version (P04§5).
- **Publication (P04§4):** review approves a specific combination of version + public card + assets. Approving one does not approve the next. During review of an update, Discovery continues with the previously approved one. Private games do not generate a review task, but do comply with content and security rules.
- Mandatory private-content declaration: with private data/images it cannot be public (B). With a class's personal data: access restricted to that class also at execution (P02§14).
- Unpublish ≠ delete ≠ administrative block. Ordinary withdrawal/deletion does not interrupt existing sessions nor delete other people's replays (P04§6).
- Card in Discovery (P14§2): languages, players, devices/controls, academic, grade support, template; screenshots of the offered version; real statistics or omitted.
- Images (B, P09§4): the user's cover image, or a screenshot chosen by the AI, or initial render. Description images only via simulation screenshots; integrated AI: minimum 3.

## 7. Templates and reuse — P05, B: create game

- Publishing ≠ allowing reuse. Template **disabled by default**; explicit acceptance that explains the lasting effect.
- Standard permission: copy, modify, combine within Playhoot (personal, educational and commercial use, royalty-free), with integrated or external AI. Does not grant distribution outside nor extend third-party licenses.
- Copy = independent game from a specific version; **provenance and credits** are kept (also when combining). Chats, students, grades or private context are not carried over. Each derivation needs its own approval to be published.
- Disabling a template prevents new copies, does not affect existing derivations.
- Assets: only those authorized for reuse are copied; incompatible ones are excluded or replaced before enabling.
- **Featured templates:** bounded administrative selection, by category, which the AI always sees first; distinct from "available as a template". Discovery has a template filter; the AI may search for more (with a research cap).
- Copying a template creates a game and consumes one creation (P12§14).

## 8. Multiplayer sessions — B: session/experience flows, P06, P12§15, P27§1

- Create a session from the game screen; requires an adult registered account. Shareable link + code. Lobby with real-time list.
- **Host (P06§1):** plays or directs without playing. Default: "I'm also going to play" in a normal session, "Direct without playing" in a class activity. Changeable in the lobby; fixed once started. If they play they see only their own perspective; if they direct they see any player's. **Keeps controls (including kick) even if they play** (replaces the base). Whoever directs does not take a seat (P27§1).
- Admission (P06§2): newcomers only before starting; the host can close/reopen admissions in the lobby. Start enabled once the game's restrictions are met (minimum players).
- **Reconnection (P06§3):** 60 s keeping the seat; reloading or closing the window ≠ leaving. The session does not pause. After the margin, re-entry depends on the game.
- Leaving = immediate, return depends on the game. **Kick:** that identity does not return (nor is the game consulted). The platform distinguishes disconnection, leaving and kick.
- **Only one active control per player** (P06§5): another tab does not create a participant; "Continue here" transfers control.
- Host disconnection does not cancel; no automatic transfer of privileges (P06§6).
- **Duration (P06§7):** lobby 30 min; inactivity 10 min with notification ("We're still here"); room 4 h. Shown at creation. If everyone leaves or runs out of margin, it closes.
- Platform failure (P06§9): try to recover the same session from the last reliable state; the 60 s do not run during the outage; otherwise close as interrupted. The interface does not claim unconfirmed closings.
- **Closing reasons (P06§10):** normal completion, host cancellation (with confirmation), expiration, abandonment by all, technical interruption. A closed one is not reopened.
- Repeat (P06§12): new lobby with the same game, version and configuration (and class); does not overwrite.
- Each session pins its version from the lobby (P04§3).
- The final screen is defined by the game; it stays visible without WebSocket. Normal games have no results contract; gradable ones do (§13).
- Existing game architecture is kept: commands (request/reply), samples (continuous), update/ticks (minimum 50 ms, adjusted per game), authoritative server, per-player projections, deltas (B).
- Consumption (P11§10, P12§15): the lobby **reserves** a use; starting **consumes** it; canceling/expiring before releases it; reconnecting or recovering does not consume; a confirmed Playhoot failure restores it.
- Class session: only linked students; validation is by Classroom via orchestration (B: classroom); link/code does not bypass it.

## 9. Replays and history — B, P02§9-10, P04§3, P06§11, P13§5

- History of played and hosted sessions (filters by date and game; views per session and per game). Detail: game (or "no longer available"), host, participants (display name only), duration, video-like player (play, seek), report button.
- Low-precision, best-effort replay; if segments are missing it says so. **Perspective permissions = those of the session** (player: their own; host who directed: all; host who played: only their own — P06§1 replaces the base).
- Retention: 12 months from the session. Keeps what is needed from the original version.
- **Deleting accounts does not break replays:** identity replaced by a neutral, distinguishable reference within the session ("Deleted account"), also within the replayed content. The recording and game design must allow this (P02§10).
- Security/legal exception (P13§5): first hide the affected content; if that is not enough, restrict the whole replay explaining the reason.
- Grades are never reconstructed from the replay (P06§11, P15§3).

## 10. AI creation — B: create game, P09, P10, P24, P36, P37, P15§1

- **Creation** = explicit responsibility (at minimum a separate workflow): brief, conversations, AI jobs, progress, fixes, validation results, external AI authorizations (P15§1).
- Flow (B): create game → check capacity (holding / window) → ask for name → create draft (takes up allowance) → choose route: **own AI (link)** or **integrated chat** (depending on subscription/credits). Entry points: main bar, "my games", template game.
- Minimal direct management on screen: name, description, cover image, visibility, options. Everything else via AI/links.
- **Brief (P09§1):** short description maintained by the AI (goal, mechanic, players, rules, ending, devices, language, grading criteria), viewable and correctable.
- **Ready (P09§2-3):** it runs, allows completing the experience and meets essential rules; tests with expected results (full session, player counts, leaves/reconnections, timers, private information, expected grades). Applies to all 3 routes. Finalizing remains an explicit action of the creator.
- Visual review on the real game on declared devices; preview without students or grades (P09§4). By default desktop + mobile; language of the request; declared languages (P09§5).
- Recoverable progress; the AI explains what it completed, checked and what is missing (P09§6).
- **External AI (P10):** authorization per **draft of a version of a game**. The **link is read-only** (instructions, state, assets, results): by itself it neither writes nor executes. To edit directly, the creator enables from Playhoot a **modification authorization** (changes, asset uploads, simulations, previews) without per-operation approval; the AI needs no account. Finalize and request publication: creator only. **Expires after 7 days**; revocable and renewable (renewing invalidates the previous one). Manual copy-paste-notify flow with specific links; the user never copies results back. Concurrent changes do not overwrite each other; **recoverable history** with origin; resubmissions idempotent. Does not consume AI credits; platform limits do apply. External content does not widen permissions.
- Surfaces for external AI (B): MCP server + HTTP endpoints; explorable and indexable documentation (no reading everything); dynamic state reading; writes: scripts (full or patch), assets, simulations, screenshots, error reports.
- **Integrated AI — models (P24):** Anthropic + OpenAI via direct API. Haiku 5.5: extraction/classification/synthesis of materials and activities over a template without changing mechanics. Sonnet 5.5: original games, mechanics, code, repairs, graphics by code and their review. GPT-Image-2.6 Flare: raster. `omni-moderation-latest`: initial classification. Context continuity (explicit Haiku→Sonnet handoff; Flare receives a compact assignment). After 2 automatic fixes to the same asset the approach is reassessed. Gemini and DeepSeek are not integrated.
- **Web research (P37):** Anthropic search/read tools, preparation only; sources identified; failures and partial coverage communicated; cost within the job maximum; no student data or private materials in queries.
- **No generative models in sessions** (P36§2): no opponents, no grading, no live generation. Programmed and procedural logic is allowed.
- **Open 2D scope (P36):** genres are not a closed list; initial featured games mostly continuous-play (movement, action). The mandatory coverage of 6 families from P09§7,§10 is removed. Validation of continuous-play games with simultaneous participants and network delays (P36§6).
- **SDK / reusable tools (P09§8, P36§5):** turns, rounds, timers, scores, teams, cards, boards, private information, 2D movement and collisions, projectiles, interactive objects, scenes, cameras, programmed enemies, objectives, evolving systems, controls, animations, sound. Reusable visual and movement components (P24§3). Design guidelines to maintain quality.
- Sound, volume and reduced-motion controls; important notifications also visual (P09§12).
- Before opening integrated creation to real users: demonstration with real AI (P09§11).
- Report a creation error: user or AI (directly or via link with text to paste), linked to the game (B).

## 11. Asset library — P25, P09§9-10, P36§5, P04§2

- Own library managed from admin: SVG, Lottie, images, sounds; characters, objects, scenes, interface, effects. States: **available / pending / retired**. Search by function and style; preview/listen.
- **Initial records via migration**, including pending ones whose file the operator supplies. Each pending item: name, purpose, format, style, poses/animations, requirements, relation to initial experiences, whether it is needed to open phase 1. The operator also creates pending items and uploads files from admin.
- The AI knows the real availability; it never uses a pending item as if it existed.
- External sources: Kenney (graphics and sound), Lucide (icons), Google Fonts OFL hosted by Playhoot. No LottieFiles.
- **Variants:** the AI modifies editable assets → derived asset with reference to origin and version; does not alter the original; adding it to the common catalog is an admin decision.
- Updating an asset = new version for future uses; it never changes existing games, sessions or replays. Retire ≠ delete.
- Provenance, license and attributions kept. Creators contribute files confirming rights (no documents per upload).
- Photos: mascots, objects and authorized adults yes; **no avatars of identifiable minor students**. No music, voice or video generation.
- Audio: library described in text so the AI can choose; the user may upload their own.

## 12. Classroom: classes, students, materials, activities — B: teacher/classroom flows, P02, P03, P07, P15§3

- **Concepts (P07§1):** Class (group with context and history) · Game (reusable content) · **Class activity** (prepared use of a game in a class, with configuration and history) · Session (a specific room). The activity can be created on its own when starting the first session. Each activity pins version and configuration; content/grading changes after using it = another activity.
- Classroom owns: classes, enrollment, student data in the class, materials, context, activities, teacher library, grades. It references games and sessions by external identifier. Game/Play do not know classes.
- Teacher dashboard as the main screen of teacher mode: classes, create, enter.
- Class: name, description; students; invitation code; pending requests; remove students; activity history; context.
- **Teacher library (P07§3):** favorite = reference (no ownership or editing; warns if the original is not there); editable copy only if it is a template. Free organization by folders/tags.
- **Materials (P07§4-5):** private by default; folders/tags with no mandatory subjects; reusable across classes. Using with AI ≠ sharing with students. Formats: PDF (including legible scanned), DOCX, PPTX, TXT; anything not interpreted is reported; the AI says what it used. Replacing affects future generations. Limits: 50 MB per file; per AI job 100 pages/slides and 100,000 characters (P27§5).
- **Context and AI (P02§12-13):** pedagogical context (level, objectives, reinforcements); no diagnoses, family situations or disciplinary history of identifiable students. Participant names are incorporated **when playing**, they are not sent to the generating AI nor embedded. The AI does not access grades just because the class exists.
- Session from Discovery/library: choose standalone or class; from the class: choose a game from the library. The student enters from their class panel, or via session code/URL (taken to student mode; not asked for the class code).
- Teacher Discovery: academic games only (from approved teachers and the platform).
- **Closing (P07§6, P02§11):** stops enrollments and sessions; viewing and export during retention. An empty class is deleted; a used class may also be deleted on request with a warning and prior export. Removing a student revokes access without deleting results that must be kept.
- **Duplicating:** structure, authorized materials and pedagogical context; never students, grades or personal context.
- **Retention (P02§9):** open class unused for 12 months → notification and archive; closed class 24 months from closing (notification, extendable if valid). Canceling the subscription or ending the trial does not delete grades: viewing, export and deletion remain.
- Deletion (P02§11): access withdrawn immediately; 30 days in active systems; 90 days in backups; restoring does not reactivate what was deleted.
- Archiving a class frees active allowance; reactivating requires capacity (P27§1). Students are counted per class (P12§16).

## 13. Grades — P08, P06§11, P15§3

- Academic ≠ supports grades ≠ graded activity. **Grading is optional and per activity**; it requires that the version support delivering results per participant. Winners/points are never converted into grades (replaces the base).
- Contract: the game delivers a **grade per participant**; the logic (including teams) is internal to the game. Play keeps the original result; Classroom associates it with the student.
- Scale and criteria declared before playing, in plain language. Numeric and ordered categories (letters).
- A result that is out of scale, incomplete or from the wrong participant → pending review, with no silent adjustment.
- **Attempts:** kept; reconnecting does not create an attempt. By default the best valid final grade counts; configurable: first, last, best, average (if numeric).
- **States:** pending, no participation recorded, partial result, invalid result, exempt; zero only if assigned. A platform failure does not generate a zero or a failed attempt.
- **Publishing:** by default pending review; publish in batch; option of automatic publishing per activity. Separate from the score the game shows.
- **Corrections:** original, calculated and corrections are kept (who, what, when); reversible; a later attempt does not overwrite a manual correction.
- **Optional final grade:** the teacher chooses activities and output scale; **explicit equivalences** between scales (replaces the same-scale requirement); equal weights by default or percentages that sum to 100; provisional with weight coverage; exempt items redistribute; internal precision and final rounding (2 decimals by default, configurable); a published grade keeps its inputs; changes are previewed as a draft.
- **Export to XLSX:** name, alias, internal identifier; originals, scales, equivalences, weights, states, final grade; distinguishes provisional from published; exporting does not publish.
- The student sees only published grades.

## 14. Plans, subscriptions and payments — P11, P23, P26, P27, P28, B: plan

- **Personal** (= Normal) and **Teacher** (includes Personal) families. One subscription per account. Monthly with disclosed automatic renewal. Session limits belong to the host; participants are free.
- **Catalog (P26§1, P27§1, P28§3):**

| | Personal Essential | Personal Plus | Teacher Essential | Teacher Plus |
|---|---|---|---|---|
| Price USD/month (taxes incl.) | 6 | 10 | 7 | 15 |
| Saved games | 20 | 80 | 50 | 200 |
| Creations/period | 10 | 30 | 20 | 60 |
| Sessions started/period | 30 | 100 | 80 | 200 |
| Players/session | 20 | 50 | 50 | 100 |
| Simultaneous rooms (including lobbies) | 1 | 2 | 1 | 2 |
| Storage | 500 MB | 2 GB | 1 GB | 5 GB |
| Active classes | — | — | 5 | 20 |
| Students/class | — | — | 50 | 100 |
| AI credits/period | 1,000 | 3,000 | 1,000 | 5,000 |

- **Free (adult registered account, P27§2):** 3 games (including drafts), 2 creations/rolling 30 days, 5 sessions/rolling 30 days, 10 players, 1 room, 100 MB, dynamic AI according to budget, no new classes. Free limits configurable in admin with effective date, simulation and history; lowering them creates no debt and deletes nothing (P27§3).
- **One-off purchases (P27§4, P28§3):** AI top-ups USD 5/10/20 → 1,000/3,000/7,000 credits (do not expire); pack of 5 sessions up to 50 players (USD 5); 5 creations (USD 5); upgrade to 100 players in 3 sessions (USD 5). Non-AI: 90 days of validity. Also without a subscription. Before selling, check that the benefit is usable.
- **Teacher trial (P11§7, P28§1-2):** 7 days, once per account, no card and no automatic subscription. 2 classes, 50 students, 5 games, 3 creations, 10 sessions, 50 players, 1 room, 500 MB, 500 credits. Independent promotional pools that expire at the end. Requires reserved budget. With a current Personal plan: the larger capacity applies, not summed. Notifications: activation, 24 h before, end (P31§4).
- Before paying: features, capacities, price, currency, total, period, next renewal. Exhausting capacity never charges on its own (P11§2).
- Changes (P11§4): upgrade immediate after paying the proration, keeps date; downgrades and mixed changes at renewal. Does not reset consumption.
- Cancel: simple; benefits until end of period; can be undone (P11§5). Failed renewal: 7 days of recovery without new pools (P11§8).
- **Payment:** pending / confirmed / rejected; activates only with reliable provider confirmation (not on return from checkout); idempotent; a confirmed payment with failed activation recovers on its own (P11§6, P15§6).
- **First-subscription discount (P11§11):** once; adds the **consumed** part of paid purchases that are not refunded or disputed, excluding taxes; maximum 2 monthly fees; months at zero keep benefits.
- **Refunds (P11§13-15):** 14 days for the first monthly fee with no use of paid benefits or the unconsumed part of purchases; duplicates are returned; "My purchases" with request and tracking; uses under dispute stay reserved. A dispute suspends the payment's benefits, does not ban or delete (P11§16).
- **Provider (P23):** Lemon Squeezy as sole Merchant of Record; USD; **prices with taxes included**; cards, PayPal, Apple Pay, Google Pay. Reference fees: 5% + 0.50; +0.5% subscription; +1.5% international; +1.5% PayPal; 1% payout. Changing provider is the creator's decision.
- **Prices (P26§4-7):** plans manageable from admin (family, tier, price, allowances, features, validity; drafts not public) with history. **Increases only for new subscriptions**; current subscriptions keep their base price (replaces P11§3). Reductions apply to the next charge without ever exceeding the protected rate. The protection does not turn promotions into a permanent rate.
- Three responsibilities (P15§4): **Billing** (purchases, charges, renewals, refunds, reconciliation) · **Plan** (entitlements, capacities, balances, credits) · **Costs and budget** (actual spend, reserves, coverage). Confirmed payment, enabled capacity and incurred spend are distinct, reconcilable facts. Each domain records its own actual usage (Game creations, Play sessions, Creation AI job) without two contradictory balances.
- Plan returns limits per user (free by default if there is no record); the orchestrator passes them (B: plan).
- Do not push a subscription when a limit is hit: first the one-off purchase, then plans (B). "My purchases" in profile.

## 15. AI credits — P12§7-12, P28§3-5

- **1 credit = USD 0.001 of internal cost**, stable. Consumption = billable usage × registered rates; fractions allowed; no minimum per call.
- **Authorized maximum per job (P12§8):** estimate + adjustable cap; work within it without confirming each call; pause before exhausting it; extending requires a user decision; never an automatic purchase. Deviations caused by Playhoot controls are borne by Playhoot.
- Normal iterations count; loops without progress are stopped; canceling keeps progress and counts what was incurred. **A failure with no usable result or work lost by Playhoot is not charged** (replenished with original validity, minimum 30 days if it was about to expire).
- Validity: monthly ones expire at the end of the period, do not accumulate; promotional per announcement; top-ups do not expire. **Consumption order:** first what expires soonest; at equal expiration free/promotional before paid; top-ups last.
- Plan change: proportional increase only. A job in progress is settled against its original reserve.
- The user sees: available, reserved, consumed, expirations, movements per request. Internally, actual cost, credits deducted and compensations are kept separate. Deduction idempotency.
- Simulations and screenshots without AI do not spend credits (own limits).
- Free AI: dynamic by budget; individual ceiling = 30% of the allowance of the cheapest paid plan (B); distribution by month tranches with demand forecast (P12§3). Shared initial pool for free + trials: **USD 10/month** (P30§5).

## 16. Budget, reserves and cost control — B: monetization, P12, P30, P32

- Startup contribution: up to USD 120/month when needed; it is not a ceiling nor an unlimited deficit (P30§3).
- **Current formula (P30, replaces the base's and P12§1's "the greater of"):** operation and commitments first, then free surplus. Only **available cash** funds spend (sales ≠ settlements ≠ cash).
- **Priority reserves (P30§2):** committed benefits (credits, purchases, trials, promotions, retention); operation = 30 days of OPEX; incidents = max(USD 30, 5% of confirmed sales over 90 days). Built up progressively.
- **Free surplus:** 70% growth / up to 30% voluntary withdrawal, only once per surplus (P30§4). Parameters configurable in admin with simulation, validity and history.
- Coverage before taking on (plan, trial, promotion) and before running costly operations; concurrent work already occupies budget (P12§4).
- **Cost control (P32):** every cost-bearing consumption is measurable, limitable and suspendable (AI, images, email, files, simulations, exports, queues, retries, traffic, storage, CPU…). Monetary caps hourly/daily/monthly, global and per category, + speed, concurrency and volume. Admission counts known + estimated + reserved spend + margin. **Missing limit, zero budget or invalid cost = block**, never unlimited. Missing critical metrics → restrict.
- **Ladder:** normal → restriction (free/discretionary first) → selective pause per category → **automatic emergency shutdown** (may interrupt paid sessions and priority email; prevails over the continuity of P12/P27 and the priority of P31). Reaches queues, jobs, retries and external calls. Blocks undeliverable sales. It is not a ban; restores consumption; does not invent grades. The reason is communicated as a service restriction, not as a lack of balance.
- The shutdown persists until an explicit manual reopening (neither restart, nor deploy, nor month change lifts it); gradual reopening. Admin: immediate cutoff, reason, limit adjustment with 2FA and history.
- Automatic expansion from revenue only if the admin authorizes it (proportion and ceiling).
- Deployment needs its own controls independent of the app (P32§8). Production blocked without numeric caps and residual exposure accepted by the creator (P32§9) and without the demonstrations in P32§10.
- Admin panel (P12§6, P30§6, P32§4): budget, confirmed spend, estimates, reserves, availability, projection, by category and account type; measured vs estimated; sales, settlements, cash, contributions, invoices, growth fund, withdrawable.
- Editable cost inputs (cost per session minute, per player…); calculated limits with the possibility of override (B).

## 17. Notifications and email — B: notifications concept, P14§4-6, P29, P31

- Isolated Notifications domain: the other domains consume it (non-transactional, via each domain's own txqueue). Input: external token, idempotency token, domain, type, `send_at`, delivery methods, user. The logical content belongs to the owning domain; Notifications receives an assemblable skeleton (title, paragraphs…) and decides the render per channel.
- **Phase 1 channels: in-app and email.** No push (P29).
- One logical entry per event; retries do not duplicate. **Sending ≠ reading**: marked read on opening the content, on viewing the corresponding update, or explicitly; opening the list does not mark everything (P14§4 replaces the base).
- Composer joins unread notifications with entities (e.g. highlight cases with news) and builds the destination URL (the frontend URL builder lives in composer, not in domains).
- Notification history with filters by domain, type, date (translated values).
- **Notification matrix: P31§4** (codes, welcome, purchases, cancellations, failed payment, trial, security, authorizations, AI finished, credits, Discovery review, class (no email to students), promotions with consent). Optional and marketing with independent preferences; necessary ones always on.
- Destinations (P14§6): the notification leads to its entity; authentication keeps the destination; opening a link executes nothing; expired content is explained.
- Privacy: emails with minimal information; no grades, student names, materials or secrets; no tracking of opens or clicks; user's language.
- **Outbound email (P31):** Resend free (100/day, 3,000/month, no overage) + Amazon SES `us-east-1`. Admin modes: Automatic / Resend only / SES only, without deploying. Clear rejection due to quota → SES; accepted by one is not resent via the other; an uncertain response does not resend immediately. Unsubscribes and bounces honored on both. Delivery records 30 days without bodies or codes. Priority: access, security, billing. Moving to SES requires coverage (P32§2).
- **Inbound support email:** SES `us-east-1` (P33§2).

## 18. Reports, support and moderation — B: report flows, P13, P33

- Report = operation-aware entity: types with their own data, relations and priority (game, version, session, conduct, creation, host, general). Not a generic table with a loose id.
- Entry points: selected game, session in progress, history, profile, creation (user or AI), host. Requires at least a guest account, **plus a public form without an account** for illegal content, privacy, copyright and access problems, with secure tracking (P13§4, P33§3).
- **Help and support (P33§1):** frequently asked questions + cases (payments, technical, privacy, content, appeals) with reference, conversation and state. Internal notes separate. No external help desk nor chatbot.
- User lifecycle (open, awaiting reply, requiring input, closed/submitted) and admin lifecycle (new, pending information, under review, resolved, appealed; ack ≠ resolved) (B, P13§6, P33§5).
- "My reports/cases": list, highlighting of news via notifications, detail with history and interaction.
- **Content (P13§1-2):** social, educational, general entertainment; what is listed is prohibited; treatment and audience are evaluated. Fictional chips yes; betting, prizes or buying chips no.
- Game checks: no access to other people's information, credentials, charges nor sending data to third parties. No general chat or private messaging; free-text mechanics stay in the session and are reportable (P13§3).
- **Graduated measures (P13§5):** remove from Discovery, prevent new sessions, stop session, restrict version, suspend account. Isolated or mass reports do not sanction on their own; they may prioritize or trigger a preventive restriction.
- Decisions: reason, scope, duration, appeal; recorded; **a final account sanction requires human review**; not disclosed to the reporter.
- Automatic limits and suspicious activity: flagging, admin alert, preventive ban with acknowledge (B: business rules).
- Service targets (P33§4): serious safety daily review; charge without service / blocked access / loss of results 1 business day; ordinary 2; appeals 3 (Colombian business days).
- Saturated Discovery queue → pause or communicate the wait; never approve automatically.
- Ordinary cases are deleted 6 months after being closed (P33§6). Suspended users keep support and appeals.
- A suspension that prevents using the subscription stops renewals (P13§6).
- Initial automatic classification with `omni-moderation-latest` (P24§1); support conversations and student data are not automatically sent to AI.

## 19. Discovery, navigation, languages, accessibility — B: search, P14, P02§14

- **Public entry (P14§1):** Discovery + brief explanation + visible access to join, create and Teacher. Invitation links go straight to their activity.
- Discovery: popular, categories, recent (with account), text search, one category, several tags with "any/all", filter by language and by template. Approved content only.
- Fixed top bar: profile/sign-up, notifications, plan, join, create; mode switch.
- Profile accessible without an account (with calls to action): details, plans, purchases, reports, history, games.
- Interface in es/en/pt; the browser suggests, the user decides and it is remembered. Dates, numbers and currencies unambiguous; time zone visible (P14§3).
- WCAG 2.2 AA in navigation and management.
- PWA: installable, standalone window, validated on Android and iOS; non-intrusive offer (P01§5).

## 20. Admin — B: admin flows, P16§3, P26§4, P27§3, P30§6, P31§2, P32§7, P33, P34

- A single administrator user in phase 1 (roles/permissions planned), **with second factor**; sensitive actions recorded with actor, reason and result.
- Nothing routine requires editing code or touching the DB.
- Capabilities: users of all types (search, detail, history, activity, relationships); games (search, state, block/suspend/delete); platform games; **publication review queue** (approve, deny with note, ban); reports and cases; automatic system actions with acknowledge; **DLQs** (retry/cancel); categories, tags, featured templates; asset library and pending items; plans and prices; free limits; budget, reserves and cost control; email modes and deliveries; reconciliation of purchases and compensations; provider registry; analytics.
- Analytics (B, P34): activation, retention, frequency, creator churn, by Personal/Teacher and free/trial/subscription; usage, revenue, costs, conversions when hitting limits. Own data only; no individual tracking of students.

## 21. Domains and responsibilities — B: technical/domains, P15

Base proposal (adjustable by the team while preserving responsibilities — P15§6):
`api` (entry, request auth, WebSocket, rate limiting; no tables) · `orchestrator` (workflows across domains, may persist sagas) · `composer` (read-only, backend-for-consumer, URL builder) · `identity` · `game` · `play` (`versions`, `session`, `runtime`, sandbox) · `notifications` · `report` · `classroom` · `plan` — plus the responsibilities that P15 separates: **creation**, **billing**, **costs and budget**, and those that appear in patches: **asset library**, **moderation/support**, **authorizations and consents**, **analytics**, **email**.
The final tree is a technical decision of the agent: see `DECISIONS.md` and the system documentation.

## 22. Operation, validation and delivery — P16, P32§10, index 00§6-7

- Acceptance by observable behaviors, including interruptions and retries; each check linked to its rule (P16§2).
- Protected backups + restore test; restoring does not reactivate revoked access nor deleted data (P16§4).
- Actionable alerts (P16§5): charge without capacity, stuck generations, abnormal consumption, failures at session entry/start/end, unrecorded academic results, privacy, serious cases, budget. Logs without credentials, private materials or unnecessary student data.
- Delivery includes an inventory: features, evidence, operating instructions, configurable integrations, pending items with owner and closing condition; distinguishes simulated / validated with real provider / pending (P16§1,§6).

## 23. Visual design — B: UI/personality, P24§3-5, P36§4

- The identity is defined with the agent as UX/UI designer; the base's references (Kahoot, Quizizz, Roblox, Friv, Genially, Canva) are research, not a mold. Suggested styles (glass/clay/skeuo/neumorphism) are loose ideas.
- Requirements: not look AI-generated; professional and trustworthy enough to pay; lively.
- Visual reference provided: `gatita_lottie.json` and `lottie.json` at the workspace root (preference for animated vector characters; P24§4).
- Admin: functional, no experience requirement.

## 24. Creator pending items and pre-production conditions — index 00§6, P17, P23§6, P32§9, P35§2,§6, P36§7

Operator (natural person, Colombia; formalization at the first real charge — P17): Lemon Squeezy sign-up; notices, data processing agreement and authorizations per market; AAIP (Argentina), transfer safeguards (Chile), representation (Peru); Google, Anthropic, OpenAI, Resend, SES accounts; budget amounts and residual exposure; deployment; pending asset files; name, domain and social networks.
Team: demonstrate purchases/refunds/prorations, measured costs, cutoff controls, restore, real AI.
Live tracking in `CREATOR_TODO.md`.

## 25. Explicit substitutions (what does NOT hold from lower layers)

| Previous rule | Replaced by |
|---|---|
| Base: mobile app mandatory in phase 1 | P01§5: web + PWA; stores deferred |
| Base and P14§4-5: push as a channel | P29: no push of any kind |
| Base: notification sent = seen | P14§4: sending ≠ reading |
| Base: optional student password | P03§2: individual, private and revocable credential |
| Base: only empty classes are deleted | P02§11: also used classes, on request |
| Base: change assets freely in a used version | P04§2: ready version freezes assets |
| Base: kick only if the host directs without playing | P06§1: the host keeps controls even if playing |
| Base: host who played sees all perspectives in the replay | P06§1: the replay keeps the session's permissions |
| Base: "create activity = create game"; favorite/fork ambiguous | P07§1,§3: activity ≠ game; favorite ≠ editable copy |
| Base: every academic game produces grades; same scale for final grade | P08§1,§8: grading optional; equivalences between scales |
| Base: the AI link gives access to the draft (read and write) | P10§2: link is read-only; writing requires creator authorization |
| Base: trial with registered payment method | P11§7: no card, no automatic subscription |
| Base: Session = all of Play's persistence | P15§2: Session = lifecycle of a session; versions separate |
| Base: plan verified when issuing teacher token is enough | P15§5: current entitlements on each operation that requires them |
| P11§12: Paddle candidate | P23: Lemon Squeezy |
| P09§6: the team chooses models | P24: models and distribution selected |
| P11§3 (increases to renewals with notice) | P26§6: increases only for new subscriptions |
| Base and P12§1: budget = greater of contribution and reinvestment | P30: obligations and reserves first, then 70/30 surplus |
| P14§5 and P03§8: the team chooses email provider | P31: Resend + SES |
| P12§5, P27§3 (session continuity) and P31§3 (email priority) in an emergency | P32: the shutdown prevails |
| P16§6: operator's formalities in Colombia before real use | P17§3: at the first confirmed real charge |
| P01§7: French optional | P18§3: French postponed |
| P18§1: Peru is incorporated | P35§1-2: Peru disabled until representation is resolved |
| P09§7 and §10: cover six template families | P36: open genres; featured mostly continuous |
| Base: ads to free accounts and their admin control | P37§1: deferred |
| Base: internet research undefined | P37§2: Anthropic web tools |
