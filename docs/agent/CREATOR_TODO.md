# Creator to-do

What only you can do, ordered by when it is needed. The agent keeps it current.

## Now

| ID | What | Why |
|---|---|---|
| P-01 | ~~Create a private GitHub repository for the workspace and add it as `origin`.~~ **Done 2026-11-15.** | History and remote copy for the plan, the specification and the documentation site. |
| P-02 | In the next session, say whether the Claude Code status bar in VS Code shows something like `5h 12% · 7d 3%`. | To know whether the agent can measure usage on its own. If it does not appear, the agent will ask you to check `/usage` at each pause. |

## During delivery 1

| ID | What | When |
|---|---|---|
| P-10 | Pick the visual direction among the ones the agent prepares (C-03). | H2 |
| P-11 | Have Docker Desktop running when a task asks for it (local database and storage for tests). | From H1 |
| P-12 | Provide the asset files that end up registered as pending in admin (characters, animations, sounds). | H12; does not block development |

## For delivery 2 (real integrations)

| ID | What | Source |
|---|---|---|
| P-20 | Accounts and keys: Google OAuth, Anthropic, OpenAI, Resend, Amazon SES (us-east-1, production access and receiving), cloud object storage. | P03, P24, P31, P33 |
| P-21 | Sign up and get verified with Lemon Squeezy describing the real product (AI, classes with minors, credits, card games without betting); Colombian bank account for payouts. | P23 |
| P-22 | Choose cloud, machine and deployment shape; set budget amounts, caps and the acceptable residual exposure. | P32§8-9 |

## Before production

| ID | What | Source |
|---|---|---|
| P-30 | Privacy notices, the data processing agreement for classes, authorization texts and rights handling per market. | P20–P22, P35§6 |
| P-31 | Argentina: registration with the AAIP and transfer safeguards. Chile: safeguards for the regime of 1 Dec 2026. Peru: resolve representation (disabled until then). | P35§2 |
| P-32 | Final name, domain and social accounts. | P36§7 |
| P-33 | Tax and commercial formalization in Colombia at the first confirmed real charge. | P17§3 |
| P-34 | Accept the evidence the agent delivers on cost control, backup restoration and measured costs. | P16, P32§10 |

## Deployment checklist carried over from the backend (T-003)

Moved from the backend's retired `docs/engineering/LAUNCH_READINESS.md`. Rule from the creator (2026-11-01): everything that needs an external integration or infrastructure is done in the last steps before the first deployment; until then the code runs against the existing ports and a single instance. The agent does the code side; the creator does what needs accounts, hosts or real clients. Each item closes when its condition is met.

### Integrations (delivery 2)

| ID | What | Closing condition |
|---|---|---|
| D-01 | Real Google sign-in: OAuth client from Google Cloud Console (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URL`). | Manual check against Google passes: new login, recurring login, cancellation, wrong verifier refused. |
| D-02 | Metrics provider behind `monitoring/metrics` (today measurements only go to the request log). | Server and client metrics reach the provider; dashboards and alerts exist for: draft asset uploads interrupted (`play_draft_asset_uploads_interrupted_total`, slot wait and read seconds, to size the 4 upload slots and the 5-minute read deadline), draft builds (`play_draft_builds_total` alert on `infrastructure`, duration, queue wait), `identity_ai_authorization_total` alert on `reuse_detected`, and the Session Runtime set (dual ownership, checkpoint staleness, replay drops, boundary lag, sandbox health, queue saturation, lifecycle funnel, live load). |
| D-03 | MCP server with real AI clients (Claude and ChatGPT connectors) on a throwaway cloud VM with an ephemeral database. | Discovery from the 401, registration, consent, tools, refresh and revocation work; nothing in front of the service cuts `/mcp` bodies under 72 MiB or 5 minutes. |

### Infrastructure (delivery 2)

| ID | What | Closing condition |
|---|---|---|
| D-10 | Object storage for deployed environments and bucket CORS (`deploy/gcs-cors.json`, `deploy/README.md` in the backend). | CORS applied to the production bucket for the web origin. |
| D-11 | `PUBLIC_API_BASE_URL` (required in production; written into the links an AI receives; issuer is this URL, resource is `<url>/mcp`). | Set to the public HTTPS address; nothing in front of the service (balancer, CDN) logs `/ai/v1/{token}` paths because the token is in them. |
| D-12 | `PUBLIC_WEB_BASE_URL` (required in production; consent page `<url>/connect-ai`; SDK guide at `<url>/docs/sdk/v1/index.md`). | Web host serves `apps/web/public/docs/sdk/v1/*.md` as-is with a text content type and without the SPA fallback. |
| D-13 | Game toolchain in the deployed image: package the frontend's `packages/game-tools` and the SDK packages it bundles (with Node and the SDK guide, same version) and set `GAME_TOOLCHAIN_DIR`; isolate the build worker (own process or service, no application credentials, CPU and memory limits, concurrency that never degrades running games) behind `play/session/internal/gamebuild.Builder`. | Builds run in the isolated worker; today a build is a Node child process of the backend (60 s timeout, 512 MiB heap). |
| D-14 | Simulation caps: every simulation is recorded for 7 days (`play_simulation_results`, result cleared after 30 minutes) and `CountSimulations(version, since)` counts them. | Caps per version and window (and per user across games if needed) decided with real use, and the check wired before simulating. |
| D-15 | Multi-instance Session ownership (only needed if more than one instance will own Sessions): shared registry, owner-renewed lease and heartbeat, self-fencing, epoch on owner-only durable writes, trusted gateway-to-runtime identity, forwarding to the remote owner (`api/play/owner_routing.go` answers 503 today), global request limits (kept in memory per instance today). Design in `playhoot/docs/technical-decisions/play/SESSION-ADR-0029-*`. | Two instances can never mutate the same Session; a lost lobby pod lets players rejoin; dual-ownership alert exists. |
| D-16 | Platform-forced session termination (`ControllerResolver.TerminateSession`, ready and tested, nobody calls it). | Wired to the consumption policy triggers once those are defined (no rate limit or resource control triggers it). |
