#!/usr/bin/env node
// Validates the system documentation data (stage 1: data integrity).
// Run from the workspace root: node tools/validate-docs.mjs [workspace-root]
// Loads each repository's docs/system/manifest.js and the files it lists, then checks
// ids, required fields, allowed values, references and the cross-domain table rule.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// Optional argument: another workspace root (used to test the validator on a copy).
const ROOT = path.resolve(process.argv[2] ?? process.cwd());
const MANIFESTS = [
  ['backend', 'playhoot/docs/system/manifest.js'],
  ['frontend', 'playhoot_frontend/docs/system/manifest.js'],
];

const TYPES = ['domain', 'package', 'table', 'operation', 'flow', 'endpoint', 'screen'];
const STATUS = ['planned', 'implemented', 'verified'];
const REQUIRED = {
  domain: ['id', 'name', 'summary', 'status', 'kind'],
  package: ['id', 'name', 'summary', 'status', 'provides'],
  table: ['id', 'name', 'summary', 'status', 'domain', 'columns', 'history'],
  operation: ['id', 'name', 'summary', 'status', 'domain', 'kind', 'effect'],
  flow: ['id', 'name', 'summary', 'status', 'coordinator', 'effect', 'steps', 'persistence'],
  endpoint: ['id', 'name', 'summary', 'status', 'transport', 'access', 'invokes'],
  screen: ['id', 'name', 'summary', 'status', 'path', 'mode', 'access', 'variants'],
};
// A planned flow from the catalog may declare the domains it touches instead of steps;
// its milestone design replaces "touches" with real steps and persistence.
const PLANNED_FLOW_REQUIRED = ['id', 'name', 'summary', 'status', 'coordinator', 'effect', 'touches'];
const ENUMS = {
  domain: { kind: ['traditional', 'entry', 'orchestrator', 'composer', 'process'] },
  operation: { kind: ['usecase', 'workflow'], effect: ['read', 'write'] },
  flow: { coordinator: ['orchestrator', 'composer'], effect: ['read', 'write'], persistence: ['none', 'recorded-steps', 'queue'] },
  endpoint: {
    transport: ['http', 'ws', 'mcp'],
    access: ['anonymous', 'guest', 'account', 'teacher', 'student', 'admin', 'external-ai', 'provider'],
  },
  screen: { mode: ['normal', 'teacher', 'student', 'admin'], variants: ['horizontal+vertical', 'single'] },
};

const entities = Object.fromEntries(TYPES.map((t) => [t, new Map()]));
const errors = [];
const warnings = [];

function err(file, type, id, msg) {
  errors.push(`${file}: ${type} "${id ?? '?'}": ${msg}`);
}

function runFile(abs, rel, sandbox) {
  sandbox.__file = rel;
  sandbox.__dir = path.dirname(abs);
  try {
    vm.runInContext(fs.readFileSync(abs, 'utf8'), sandbox, { filename: rel });
  } catch (e) {
    errors.push(`${rel}: cannot be evaluated: ${e.message}`);
  }
}

function makeSandbox() {
  const sb = { __file: '', __dir: '', queue: [] };
  const PH = {
    load(files) {
      if (!Array.isArray(files)) return errors.push(`${sb.__file}: PH.load expects a list of files`);
      for (const f of files) sb.queue.push(path.join(sb.__dir, f));
    },
  };
  for (const t of TYPES) {
    PH[t] = (e) => {
      const file = sb.__file;
      if (!e || typeof e !== 'object' || !e.id) return err(file, t, undefined, 'missing id');
      if (entities[t].has(e.id)) return err(file, t, e.id, `duplicate id (first in ${entities[t].get(e.id).file})`);
      entities[t].set(e.id, { e, file });
    };
  }
  sb.PH = PH;
  return vm.createContext(sb);
}

// Load every manifest and its data files.
for (const [name, rel] of MANIFESTS) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    warnings.push(`${name} manifest not found (${rel}); skipped.`);
    continue;
  }
  const sb = makeSandbox();
  runFile(abs, rel, sb);
  const files = sb.queue.splice(0);
  for (const f of files) {
    const frel = path.relative(ROOT, f).split(path.sep).join('/');
    if (!fs.existsSync(f)) {
      errors.push(`${rel}: lists a file that does not exist: ${frel}`);
      continue;
    }
    runFile(f, frel, sb);
  }
}

const has = (t, id) => entities[t].has(id);
const arr = (x) => (Array.isArray(x) ? x : []);
const top = (d) => String(d ?? '').split('.')[0];

const isCatalogFlow = (e) => e.status === 'planned' && arr(e.touches).length > 0;

for (const t of TYPES) {
  for (const [id, { e, file }] of entities[t]) {
    const required = t === 'flow' && isCatalogFlow(e) ? PLANNED_FLOW_REQUIRED : REQUIRED[t];
    for (const f of required) {
      const v = e[f];
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0))
        err(file, t, id, `missing required field "${f}"`);
    }
    if (e.status && !STATUS.includes(e.status)) err(file, t, id, `invalid status "${e.status}"`);
    for (const [f, allowed] of Object.entries(ENUMS[t] ?? {})) {
      if (e[f] !== undefined && !allowed.includes(e[f])) err(file, t, id, `invalid ${f} "${e[f]}" (allowed: ${allowed.join(', ')})`);
    }
    if (e.lifecycle) {
      if (!Array.isArray(e.lifecycle.states) || !e.lifecycle.states.length) err(file, t, id, 'lifecycle without states');
    }

    if (t === 'domain') {
      if (e.parent !== null && e.parent !== undefined && !has('domain', e.parent)) err(file, t, id, `parent "${e.parent}" does not exist`);
      if (e.parent && !id.startsWith(e.parent + '.')) err(file, t, id, `id must start with its parent "${e.parent}."`);
    }

    if (t === 'table') {
      if (!has('domain', e.domain)) err(file, t, id, `domain "${e.domain}" does not exist`);
      else if (!id.startsWith(e.domain + '.')) err(file, t, id, `id must be "<domain>.<table name>"`);
      for (const r of arr(e.references)) {
        if (!r.column || !r.to) err(file, t, id, 'reference needs "column" and "to"');
        // "to" is a table id of the same domain, or a logical entity of another domain (free text).
        else if (r.to.startsWith(e.domain + '.') && !has('table', r.to)) err(file, t, id, `reference "${r.column}" points to missing table "${r.to}"`);
      }
    }

    if (t === 'operation') {
      if (!has('domain', e.domain)) err(file, t, id, `domain "${e.domain}" does not exist`);
      else if (!id.startsWith(e.domain + '.')) err(file, t, id, `id must be "<domain>.<verb>"`);
      for (const f of ['reads', 'writes']) {
        for (const tid of arr(e[f])) {
          if (!has('table', tid)) err(file, t, id, `${f} missing table "${tid}"`);
          else if (top(entities.table.get(tid).e.domain) !== top(e.domain))
            err(file, t, id, `${f} table "${tid}" of another top-level domain (architecture rule)`);
        }
      }
      for (const c of arr(e.callsSubdomains)) {
        if (!has('operation', c)) err(file, t, id, `callsSubdomains missing operation "${c}"`);
        else if (!entities.operation.get(c).e.domain.startsWith(e.domain + '.'))
          err(file, t, id, `callsSubdomains "${c}" is not in a subdomain of "${e.domain}"`);
      }
    }

    if (t === 'flow') {
      if (!arr(e.steps).length && !isCatalogFlow(e)) err(file, t, id, 'flow without steps');
      for (const d of arr(e.touches)) {
        if (!has('domain', d)) err(file, t, id, `touches domain "${d}" which does not exist`);
      }
      for (const s of arr(e.steps)) {
        // A step may name a shared package instead of a domain operation, for work done
        // by infrastructure the package owns (e.g. the txqueue admin registry) — D-013.
        if (s.package) {
          if (!has('package', s.package)) err(file, t, id, `step ${s.n}: package "${s.package}" does not exist`);
          if (s.domain || s.operation) err(file, t, id, `step ${s.n}: a package step must not also name a domain or operation`);
          continue;
        }
        if (!has('operation', s.operation)) err(file, t, id, `step ${s.n}: operation "${s.operation}" does not exist`);
        if (!has('domain', s.domain)) err(file, t, id, `step ${s.n}: domain "${s.domain}" does not exist`);
        else if (has('operation', s.operation) && entities.operation.get(s.operation).e.domain !== s.domain)
          err(file, t, id, `step ${s.n}: domain "${s.domain}" is not the domain of "${s.operation}"`);
      }
    }

    if (t === 'endpoint') {
      if (!has('flow', e.invokes) && !has('operation', e.invokes)) err(file, t, id, `invokes "${e.invokes}", which is neither a flow nor an operation`);
      if (!/^([A-Z]+:\/|WS:\/|MCP:)/.test(id)) err(file, t, id, 'id must be "METHOD:/path", "WS:/path" or "MCP:tool"');
    }

    if (t === 'screen') {
      for (const a of arr(e.actions)) {
        if (!a.name) err(file, t, id, 'action without name');
        if (a.calls && !has('endpoint', a.calls)) err(file, t, id, `action "${a.name}" calls missing endpoint "${a.calls}"`);
        if (a.navigatesTo && !has('screen', a.navigatesTo)) err(file, t, id, `action "${a.name}" navigates to missing screen "${a.navigatesTo}"`);
      }
    }
  }
}

for (const w of warnings) console.log(`warning: ${w}`);
const total = TYPES.reduce((n, t) => n + entities[t].size, 0);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\n${errors.length} error(s) in ${total} entities.`);
  process.exit(1);
}
console.log(`OK: ${total} entities (${TYPES.map((t) => `${entities[t].size} ${t}`).join(', ')}).`);
