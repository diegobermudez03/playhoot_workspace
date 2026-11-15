# System documentation site — specification

The creator's personal requirement. Built by T-001; maintained by every task. The site, its data and its interface are in English.

## 1. Who it is for

The creator does not read code. They want to understand the **software architecture**: domains, data, operations, flows across domains, entry points and screens. They open the site, see little, and expand only what interests them.

- Yes: domain tree, data schema, what each operation reads and writes, main business rules, the steps of a flow and the domains it crosses, lifecycles, endpoints, screens and their calls.
- No: helpers, DTOs, signatures, design patterns, callbacks. No sequence diagrams.
- Look: plain and readable. No animations, no decoration. It must be usable without instructions.

## 2. Technical shape

- Static site that opens with a double click (`file://`): `docs/system/index.html` + `app.js` + `style.css`. No frameworks, no build, no dependencies, no network.
- The **data** lives next to the code it describes and is loaded with `<script>`:
  - `playhoot/docs/system/manifest.js` → list of the backend data files (one per domain).
  - `playhoot_frontend/docs/system/manifest.js` → screens and calls.
  - `index.html` loads both manifests by relative path (`../../playhoot/docs/system/manifest.js`); each manifest calls `PH.load([...files])` and the site appends them as `<script>` tags in order. If a repository is missing, the site works with what is there and says so.
- Each data file calls registration functions: `PH.domain({...})`, `PH.table({...})`, `PH.operation({...})`, `PH.flow({...})`, `PH.endpoint({...})`, `PH.screen({...})`.
- Hash navigation, one URL per entity: `index.html#/domain/play.session`, `#/operation/play.session.create-session`, `#/flow/create-session`, `#/endpoint/POST:/v1/sessions`, `#/table/play.session.play_sessions`, `#/screen/host-lobby`. Copying the URL reproduces the view.

## 3. Data model

Every entity has a unique `id`, a `name`, a `summary` (one sentence) and a `status`: `planned` | `implemented` | `verified`. Text in English; code identifiers as they are.

**domain** — `id` (`play`, `play.session`), `parent` (id or `null`), `kind` (`traditional` | `entry` | `orchestrator` | `composer` | `process`), `responsibilities[]`, `doesNotKnow[]` (what it deliberately ignores), `sources[]` (e.g. `P15§2`).

**table** — `id` (`<domain>.<real_table_name>`), `domain`, `purpose`, `columns[{name, type, note}]`, `indexes[]`, `history` (how change is traced: change table, write-once columns, or `infrastructure` when exempt), `references[{column, to}]` where `to` is a logical entity of another domain (by external identifier) or a table of the same domain, `lifecycle` (optional, when the state machine lives in this table).

**operation** — an operation a domain exposes. `id` (`<domain>.<verb>`), `domain`, `kind` (`usecase` | `workflow`), `effect` (`read` | `write`), `reads[]` and `writes[]` (table ids), `rules[]` (the main ones, in plain language), `limits[]` (`{what, value, source: plan|domain}`), `steps[]` (when it is an internal workflow), `lifecycle` (optional: `{states[], transitions[{from, to, on}]}`), `enqueues[]` (queue tasks it leaves), `callsSubdomains[]` (operation ids of child subdomains), `sources[]`.

**flow** — an operation that crosses domains. `id`, `coordinator` (`orchestrator` | `composer`), `effect`, `steps[{n, domain, operation, when, onFailure}]`, `persistence` (`none` | `recorded-steps` | `queue`), `idempotency`, `compensation`, `lifecycle` (optional), `sources[]`.

**endpoint** — `id` (`METHOD:/path`, `WS:/path` or `MCP:tool`), `transport` (`http` | `ws` | `mcp`), `access` (`anonymous` | `guest` | `account` | `teacher` | `student` | `admin` | `external-ai` | `provider`), `invokes` (flow or operation id), `networkLimit`.

**screen** — `id`, `path`, `mode` (`normal` | `teacher` | `student` | `admin`), `access`, `shows`, `actions[{name, calls: endpointId, navigatesTo: screenId}]`, `variants` (`horizontal+vertical` | `single`).

## 4. Views and entry points

Fixed top bar: Home · Domains · Operations · Flows · Data · Endpoints · Screens · Lifecycles · search.

| View | Shows (collapsed by default) |
|---|---|
| Home | What each section is, counts by status (planned / implemented / verified), shortcuts. |
| Domains | Domain tree. Domain page: responsibilities → subdomains → operations it exposes → tables → what it depends on and who uses it. |
| Operations | Every exposed operation, filterable by domain, effect and status. |
| Flows | Every orchestrated flow. Flow page: steps in order, each with its domain; conditions; persistence and idempotency; lifecycle; **domains it touches** (as a tree). |
| Data | By domain: list of entities; expanding one shows columns and indexes. |
| Endpoints | By area and transport; each links to what it invokes. |
| Screens | The screen graph as a navigable list: screen → where it navigates → what it calls. |
| Lifecycles | Every state machine (from tables, operations and flows) in one index. |

Interaction rules:
- Every reference to another entity is a row with two gestures: the **arrow** expands it in place (nesting without limit: flow → step → operation → table → columns); the **name** goes to its page.
- Page of a leaf operation (no calls to subdomains): only *what it reads*, *what it writes*, *main rules*, and who uses it (flows, endpoints).
- Every entity page has a "Reached from" section listing everything that references it (so the same content has several entry points).
- The full path must be walkable: screen → HTTP call → flow → operations → tables.
- Status is a discreet label; global filter "implemented only".
- No long text: short sentences; detail goes into expandable levels.

## 5. Validation

`tools/validate-docs.mjs` (Node, no dependencies), run from the workspace root (an optional argument points it at another workspace root, used to test it on a broken copy):
- unique ids; required fields; every reference resolves (`domain`, `reads`, `writes`, `invokes`, the `operation` of steps, `calls`, `navigatesTo`, `parent`).
- a flow step's `domain` must be the domain of its `operation`.
- a `flow` may only have `orchestrator` or `composer` as `coordinator`; an `operation` of a domain does not reference tables of another top-level domain (architecture rule).
- output: errors with file and id; non-zero exit code when there are errors.

Coverage against the code (second stage, one task per repository once the structure is stable): a backend test comparing registered routes and migration tables with the data in the `implemented` state; a frontend test comparing router paths with screens.

## 6. Maintenance

- Design task (tier A): adds or changes entities as `planned`.
- Implementation task: moves them to `implemented` and corrects whatever changed while building.
- Milestone validation: `verified` once there is behavioral evidence (an end-to-end check).
- Documentation data that contradicts the code is a defect: fix it in the task that finds it.
