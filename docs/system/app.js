/* Playhoot system documentation site. Plain script, no dependencies, works from file://. */
(function () {
  'use strict';

  // ---------- Registry ----------
  var TYPES = ['domain', 'table', 'operation', 'flow', 'endpoint', 'screen'];
  var LABEL = { domain: 'domain', table: 'table', operation: 'operation', flow: 'flow', endpoint: 'endpoint', screen: 'screen' };
  var db = {}; TYPES.forEach(function (t) { db[t] = {}; });
  var order = {}; TYPES.forEach(function (t) { order[t] = []; });
  var problems = [];
  var pending = 0, readyCalled = false, started = false;

  function add(type) {
    return function (e) {
      if (!e || !e.id) { problems.push('A ' + type + ' without id was ignored.'); return; }
      if (db[type][e.id]) problems.push('Duplicate ' + type + ' id: ' + e.id);
      else order[type].push(e.id);
      db[type][e.id] = e;
    };
  }

  var PH = window.PH = {
    domain: add('domain'), table: add('table'), operation: add('operation'),
    flow: add('flow'), endpoint: add('endpoint'), screen: add('screen'),
    load: function (files) {
      var me = document.currentScript;
      var base = me && me.src ? me.src.replace(/[^/]*$/, '') : '';
      files.forEach(function (f) {
        var s = document.createElement('script');
        s.async = false;
        s.src = base + f;
        pending++;
        s.onload = done;
        s.onerror = function () { problems.push('Data file not found: ' + f); done(); };
        document.body.appendChild(s);
      });
    },
    missing: function (which, path) {
      problems.push('The ' + which + ' repository data was not found (' + path + '). The site shows what is available.');
    },
    ready: function () { readyCalled = true; maybeStart(); }
  };
  function done() { pending--; maybeStart(); }
  function maybeStart() {
    if (started || !readyCalled || pending > 0) return;
    started = true;
    buildIndex();
    window.addEventListener('hashchange', route);
    setupTools();
    route();
  }

  // ---------- Helpers ----------
  function get(type, id) { return db[type][id]; }
  function all(type) { return order[type].map(function (id) { return db[type][id]; }).filter(visible); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'cls') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function href(type, id) { return '#/' + type + '/' + encodeURI(id); }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function topOf(domainId) { return String(domainId || '').split('.')[0]; }
  function statusTag(s) { return s ? el('span', { cls: 'status ' + s, text: s }) : null; }
  function display(type, e) { return type === 'endpoint' ? e.id : (e.name || e.id); }

  var onlyImpl = false;
  try { onlyImpl = localStorage.getItem('ph.onlyImplemented') === '1'; } catch (err) { /* storage unavailable */ }
  function visible(e) { return !onlyImpl || e.status !== 'planned'; }

  // ---------- Reverse index ("Reached from") ----------
  var back = {};
  function key(type, id) { return type + '|' + id; }
  function link(fromType, fromId, toType, toId, via) {
    if (!toId) return;
    var k = key(toType, toId);
    (back[k] = back[k] || []).push({ type: fromType, id: fromId, via: via });
  }
  function buildIndex() {
    order.domain.forEach(function (id) { var d = db.domain[id]; if (d.parent) link('domain', id, 'domain', d.parent, 'subdomain'); });
    order.table.forEach(function (id) {
      var t = db.table[id];
      link('table', id, 'domain', t.domain, 'table');
      arr(t.references).forEach(function (r) { if (db.table[r.to]) link('table', id, 'table', r.to, 'references (' + r.column + ')'); });
    });
    order.operation.forEach(function (id) {
      var o = db.operation[id];
      link('operation', id, 'domain', o.domain, 'exposes');
      arr(o.reads).forEach(function (t) { link('operation', id, 'table', t, 'reads'); });
      arr(o.writes).forEach(function (t) { link('operation', id, 'table', t, 'writes'); });
      arr(o.callsSubdomains).forEach(function (c) { link('operation', id, 'operation', c, 'calls'); });
    });
    order.flow.forEach(function (id) {
      var f = db.flow[id];
      arr(f.steps).forEach(function (s) {
        link('flow', id, 'operation', s.operation, 'step ' + s.n);
        link('flow', id, 'domain', s.domain, 'touches');
      });
    });
    order.endpoint.forEach(function (id) {
      var e = db.endpoint[id];
      link('endpoint', id, db.flow[e.invokes] ? 'flow' : 'operation', e.invokes, 'invokes');
    });
    order.screen.forEach(function (id) {
      arr(db.screen[id].actions).forEach(function (a) {
        if (a.calls) link('screen', id, 'endpoint', a.calls, 'calls (' + a.name + ')');
        if (a.navigatesTo) link('screen', id, 'screen', a.navigatesTo, 'navigates (' + a.name + ')');
      });
    });
  }
  function reachedFrom(type, id) { return (back[key(type, id)] || []).filter(function (r) { var e = get(r.type, r.id); return e && visible(e); }); }

  // ---------- Reference row: arrow expands in place, name navigates ----------
  function refRow(type, id, note) {
    var e = get(type, id);
    var wrap = el('div', { cls: 'ref' });
    if (!e) {
      wrap.appendChild(el('div', { cls: 'ref-head' }, [el('span', { cls: 'muted', text: 'Missing ' + type + ': ' + id })]));
      return wrap;
    }
    var btn = el('button', { cls: 'arrow', type: 'button', 'aria-expanded': 'false', 'aria-label': 'Expand ' + display(type, e), text: '▸' });
    var noteText = note || e.summary;
    var head = el('div', { cls: 'ref-head' }, [
      btn,
      el('span', { cls: 'ref-text' }, [
        el('a', { href: href(type, id), text: display(type, e) }), ' ',
        el('span', { cls: 'ref-type', text: LABEL[type] }),
        statusTag(e.status),
        noteText ? el('span', { cls: 'ref-note', text: ' — ' + noteText }) : null
      ])
    ]);
    wrap.appendChild(head);
    var body = null;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      if (open) { body.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.textContent = '▸'; return; }
      if (!body) { body = el('div', { cls: 'ref-body' }); inline(type, e, body); wrap.appendChild(body); }
      body.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.textContent = '▾';
    });
    return wrap;
  }

  // Sections of each entity: [{title, count, render(container)}]. Used by pages (collapsed) and inline expansion.
  function sections(type, e) {
    var s = [];
    function list(title, items, fn) { if (items.length) s.push({ title: title, count: items.length, render: function (c) { items.forEach(function (i) { c.appendChild(fn(i)); }); } }); }
    function texts(title, items) { if (items.length) s.push({ title: title, count: items.length, render: function (c) { c.appendChild(el('ul', { cls: 'plain' }, items.map(function (t) { return el('li', { text: t }); }))); } }); }
    function block(title, fn) { s.push({ title: title, render: fn }); }

    if (type === 'domain') {
      texts('Responsibilities', arr(e.responsibilities));
      texts('Deliberately does not know', arr(e.doesNotKnow));
      list('Subdomains', all('domain').filter(function (d) { return d.parent === e.id; }), function (d) { return refRow('domain', d.id); });
      list('Operations it exposes', all('operation').filter(function (o) { return o.domain === e.id; }), function (o) { return refRow('operation', o.id); });
      if (e.kind === 'orchestrator' || e.kind === 'composer') list('Flows it coordinates', all('flow').filter(function (f) { return f.coordinator === e.kind; }), function (f) { return refRow('flow', f.id); });
      list('Tables', all('table').filter(function (t) { return t.domain === e.id; }), function (t) { return refRow('table', t.id); });
      var dep = dependsOn(e.id), users = usedBy(e.id);
      list('Depends on', dep, function (d) { return refRow('domain', d); });
      list('Used by', users, function (u) { return refRow(u.type, u.id); });
    }
    if (type === 'operation') {
      if (e.domain) list('Domain', [e.domain], function (d) { return refRow('domain', d); });
      list('Reads', arr(e.reads), function (t) { return refRow('table', t); });
      list('Writes', arr(e.writes), function (t) { return refRow('table', t); });
      texts('Main rules', arr(e.rules));
      if (arr(e.limits).length) block('Limits (' + e.limits.length + ')', function (c) {
        c.appendChild(gridTable(['What', 'Value', 'Source'], e.limits.map(function (l) { return [l.what, l.value, l.source || '']; })));
      });
      texts('Steps', arr(e.steps));
      list('Calls subdomain operations', arr(e.callsSubdomains), function (o) { return refRow('operation', o); });
      texts('Enqueues', arr(e.enqueues));
      if (e.lifecycle) block('Lifecycle', function (c) { renderLifecycle(c, e.lifecycle); });
    }
    if (type === 'flow') {
      if (arr(e.steps).length) block('Steps (' + e.steps.length + ')', function (c) {
        e.steps.forEach(function (st) {
          var bits = [];
          if (st.when) bits.push('when: ' + st.when);
          if (st.onFailure) bits.push('on failure: ' + st.onFailure);
          var row = refRow('operation', st.operation, (st.domain ? st.domain + ' · ' : '') + bits.join(' · '));
          row.querySelector('.ref-head').insertBefore(el('span', { cls: 'step-n', text: st.n + '.' }), row.querySelector('.ref-head').firstChild);
          c.appendChild(row);
        });
      });
      block('Persistence, idempotency, compensation', function (c) {
        c.appendChild(gridTable(['Aspect', 'Value'], [
          ['Coordinator', e.coordinator || ''], ['Effect', e.effect || ''], ['Persistence', e.persistence || ''],
          ['Idempotency', e.idempotency || ''], ['Compensation', e.compensation || '']
        ]));
      });
      var touched = [];
      arr(e.steps).forEach(function (st) { if (st.domain && touched.indexOf(st.domain) < 0) touched.push(st.domain); });
      if (touched.length) block('Domains it touches (' + touched.length + ')', function (c) { renderDomainTree(c, touched); });
      if (e.lifecycle) block('Lifecycle', function (c) { renderLifecycle(c, e.lifecycle); });
    }
    if (type === 'table') {
      if (e.domain) list('Domain', [e.domain], function (d) { return refRow('domain', d); });
      if (e.purpose) block('Purpose', function (c) { c.appendChild(el('p', { text: e.purpose })); });
      if (arr(e.columns).length) block('Columns (' + e.columns.length + ')', function (c) {
        c.appendChild(gridTable(['Column', 'Type', 'Note'], e.columns.map(function (col) { return [mono(col.name), col.type || '', col.note || '']; })));
      });
      texts('Indexes', arr(e.indexes));
      if (e.history) block('Change history', function (c) { c.appendChild(el('p', { text: e.history })); });
      if (arr(e.references).length) block('References (' + e.references.length + ')', function (c) {
        e.references.forEach(function (r) {
          if (db.table[r.to]) c.appendChild(refRow('table', r.to, 'via ' + r.column));
          else c.appendChild(el('div', { cls: 'ref-head' }, [mono(r.column), el('span', { cls: 'ref-note', text: '→ ' + r.to + ' (external identifier)' })]));
        });
      });
      if (e.lifecycle) block('Lifecycle', function (c) { renderLifecycle(c, e.lifecycle); });
    }
    if (type === 'endpoint') {
      block('Access and limits', function (c) {
        c.appendChild(gridTable(['Aspect', 'Value'], [['Transport', e.transport || ''], ['Access', e.access || ''], ['Network limit', e.networkLimit || '']]));
      });
      if (e.invokes) list('Invokes', [e.invokes], function (i) { return refRow(db.flow[i] ? 'flow' : 'operation', i); });
    }
    if (type === 'screen') {
      block('What it is', function (c) {
        c.appendChild(gridTable(['Aspect', 'Value'], [['Path', mono(e.path || '')], ['Mode', e.mode || ''], ['Access', e.access || ''], ['Variants', e.variants || ''], ['Shows', e.shows || '']]));
      });
      if (arr(e.actions).length) block('Actions (' + e.actions.length + ')', function (c) {
        e.actions.forEach(function (a) {
          c.appendChild(el('div', { cls: 'group-title', text: a.name }));
          if (a.calls) c.appendChild(refRow('endpoint', a.calls, 'calls'));
          if (a.navigatesTo) c.appendChild(refRow('screen', a.navigatesTo, 'navigates to'));
        });
      });
    }
    texts('Sources', arr(e.sources));
    return s;
  }

  function inline(type, e, c) {
    if (e.summary) c.appendChild(el('div', { cls: 'muted', text: e.summary }));
    sections(type, e).forEach(function (sec) {
      if (sec.title === 'Sources') return;
      c.appendChild(el('h3', { text: sec.title + (sec.count ? ' (' + sec.count + ')' : '') }));
      sec.render(c);
    });
  }

  function mono(t) { return el('code', { text: t }); }
  function gridTable(heads, rows) {
    var t = el('table', { cls: 'grid' }, [el('thead', null, [el('tr', null, heads.map(function (h) { return el('th', { text: h }); }))])]);
    var tb = el('tbody');
    rows.forEach(function (r) { tb.appendChild(el('tr', null, r.map(function (v) { return el('td', null, [typeof v === 'string' ? v : v]); }))); });
    t.appendChild(tb);
    return el('div', { cls: 'scroll' }, [t]);
  }
  function renderLifecycle(c, lc) {
    c.appendChild(el('div', null, [el('strong', { text: 'States: ' }), arr(lc.states).join(' · ')]));
    if (arr(lc.transitions).length) c.appendChild(gridTable(['From', 'To', 'On'], lc.transitions.map(function (t) { return [t.from, t.to, t.on || '']; })));
  }
  function renderDomainTree(c, ids) {
    // Show each touched domain under its ancestors.
    var keep = {};
    ids.forEach(function (id) { var d = get('domain', id); while (d) { keep[d.id] = true; d = d.parent ? get('domain', d.parent) : null; } });
    function level(parent, box) {
      all('domain').filter(function (d) { return (d.parent || null) === parent && keep[d.id]; }).forEach(function (d) {
        box.appendChild(refRow('domain', d.id, ids.indexOf(d.id) >= 0 ? 'touched' : 'parent'));
        var sub = el('div', { style: 'margin-left:1.6em' });
        level(d.id, sub);
        if (sub.childNodes.length) box.appendChild(sub);
      });
    }
    level(null, c);
  }
  function dependsOn(domainId) {
    var out = [];
    function push(d) { if (d && d !== domainId && out.indexOf(d) < 0 && get('domain', d)) out.push(d); }
    all('operation').filter(function (o) { return o.domain === domainId; }).forEach(function (o) {
      arr(o.callsSubdomains).forEach(function (c) { var t = get('operation', c); if (t) push(t.domain); });
    });
    var d = get('domain', domainId);
    if (d && (d.kind === 'orchestrator' || d.kind === 'composer')) {
      all('flow').filter(function (f) { return f.coordinator === d.kind; }).forEach(function (f) { arr(f.steps).forEach(function (s) { push(s.domain); }); });
    }
    return out;
  }
  function usedBy(domainId) {
    var out = [], seen = {};
    all('operation').filter(function (o) { return o.domain === domainId; }).forEach(function (o) {
      reachedFrom('operation', o.id).forEach(function (r) {
        var k = key(r.type, r.id);
        if (!seen[k] && !(r.type === 'operation' && get('operation', r.id).domain === domainId)) { seen[k] = 1; out.push(r); }
      });
    });
    return out;
  }

  // ---------- Pages ----------
  var main;
  function page(type, id) {
    var e = get(type, id);
    if (!e) { main.appendChild(el('h1', { text: 'Not found' })); main.appendChild(el('p', { text: 'There is no ' + type + ' with id "' + id + '".' })); return; }
    var kindBits = [LABEL[type]];
    if (e.kind) kindBits.push(e.kind);
    if (e.effect) kindBits.push(e.effect);
    if (type === 'endpoint' && e.transport) kindBits.push(e.transport);
    main.appendChild(el('div', { cls: 'kind' }, [kindBits.join(' · '), type !== 'endpoint' ? el('span', { cls: 'mono muted', text: '  ' + id }) : null]));
    main.appendChild(el('h1', null, [display(type, e), statusTag(e.status)]));
    if (e.summary) main.appendChild(el('p', { cls: 'summary', text: e.summary }));
    var secs = sections(type, e);
    var rf = reachedFrom(type, id);
    secs.push({ title: 'Reached from', count: rf.length, render: function (c) {
      if (!rf.length) c.appendChild(el('p', { cls: 'muted', text: 'Nothing references it yet.' }));
      rf.forEach(function (r) { c.appendChild(refRow(r.type, r.id, r.via)); });
    } });
    secs.forEach(function (sec) { main.appendChild(section(sec)); });
  }
  function section(sec) {
    var d = el('details', { cls: 'sec' });
    var sum = el('summary', null, [sec.title, sec.count != null ? el('span', { cls: 'count', text: ' (' + sec.count + ')' }) : null]);
    d.appendChild(sum);
    var body = null;
    d.addEventListener('toggle', function () {
      if (d.open && !body) { body = el('div', { cls: 'body' }); sec.render(body); d.appendChild(body); }
    });
    return d;
  }

  function heading(title, intro) {
    main.appendChild(el('h1', { text: title }));
    if (intro) main.appendChild(el('p', { cls: 'summary muted', text: intro }));
  }
  function emptyNote(items) { if (!items.length) main.appendChild(el('p', { cls: 'muted', text: 'Nothing documented yet.' })); }

  var SECTIONS = [
    ['domains', 'Domains', 'The domain tree: what each part of the system owns and ignores.', 'domain'],
    ['operations', 'Operations', 'Everything a domain exposes, with what it reads and writes.', 'operation'],
    ['flows', 'Flows', 'Operations that cross domains, step by step.', 'flow'],
    ['data', 'Data', 'Tables per domain, with columns and indexes.', 'table'],
    ['endpoints', 'Endpoints', 'Entry points from outside: HTTP, WebSocket and MCP.', 'endpoint'],
    ['screens', 'Screens', 'The screens, where they lead and what they call.', 'screen'],
    ['lifecycles', 'Lifecycles', 'Every state machine in one index.', null]
  ];

  function viewHome() {
    heading('Playhoot system', 'Open a section, then expand only what interests you. Arrows expand in place; names open their own page.');
    if (problems.length) main.appendChild(el('div', { cls: 'notice' }, problems.map(function (p) { return el('div', { text: p }); })));
    var cards = el('div', { cls: 'cards' });
    SECTIONS.forEach(function (s) {
      var counts = '';
      if (s[3]) {
        var c = { planned: 0, implemented: 0, verified: 0 };
        order[s[3]].forEach(function (id) { var st = db[s[3]][id].status; if (c[st] != null) c[st]++; });
        counts = c.planned + ' planned · ' + c.implemented + ' implemented · ' + c.verified + ' verified';
      } else counts = lifecycles().length + ' state machines';
      cards.appendChild(el('div', { cls: 'card' }, [el('h2', null, [el('a', { href: '#/' + s[0], text: s[1] })]), el('p', { text: s[2] }), el('p', { text: counts })]));
    });
    main.appendChild(cards);
  }

  function viewDomains() {
    heading('Domains', SECTIONS[0][2]);
    function level(parent, box) {
      all('domain').filter(function (d) { return (d.parent || null) === parent; }).forEach(function (d) {
        box.appendChild(refRow('domain', d.id, d.kind + ' — ' + (d.summary || '')));
        var sub = el('div', { style: 'margin-left:1.6em' });
        level(d.id, sub);
        if (sub.childNodes.length) box.appendChild(sub);
      });
    }
    level(null, main);
    emptyNote(all('domain'));
  }

  var opFilter = { domain: '', effect: '', status: '' };
  function viewOperations() {
    heading('Operations', SECTIONS[1][2]);
    var ops = all('operation');
    function select(label, field, values) {
      var s = el('select', { 'aria-label': label }, [el('option', { value: '', text: 'All' })].concat(values.map(function (v) { return el('option', { value: v, text: v }); })));
      s.value = opFilter[field];
      s.addEventListener('change', function () { opFilter[field] = s.value; render(); });
      return el('label', null, [label + ' ', s]);
    }
    function uniq(f) { var o = []; ops.forEach(function (x) { if (x[f] && o.indexOf(x[f]) < 0) o.push(x[f]); }); return o.sort(); }
    main.appendChild(el('div', { cls: 'filters' }, [select('Domain', 'domain', uniq('domain')), select('Effect', 'effect', ['read', 'write']), select('Status', 'status', ['planned', 'implemented', 'verified'])]));
    var box = el('div');
    main.appendChild(box);
    emptyNote(ops);
    function render() {
      box.textContent = '';
      ops.filter(function (o) {
        return (!opFilter.domain || o.domain === opFilter.domain) && (!opFilter.effect || o.effect === opFilter.effect) && (!opFilter.status || o.status === opFilter.status);
      }).forEach(function (o) { box.appendChild(refRow('operation', o.id, o.domain + ' · ' + o.effect + ' — ' + (o.summary || ''))); });
    }
    render();
  }

  function viewFlows() {
    heading('Flows', SECTIONS[2][2]);
    all('flow').forEach(function (f) { main.appendChild(refRow('flow', f.id, f.coordinator + ' · ' + f.effect + ' — ' + (f.summary || ''))); });
    emptyNote(all('flow'));
  }

  function viewData() {
    heading('Data', SECTIONS[3][2]);
    var tables = all('table'), groups = {};
    tables.forEach(function (t) { (groups[t.domain] = groups[t.domain] || []).push(t); });
    Object.keys(groups).sort().forEach(function (d) {
      main.appendChild(el('div', { cls: 'group-title' }, [el('a', { href: href('domain', d), text: (get('domain', d) || {}).name || d })]));
      groups[d].forEach(function (t) { main.appendChild(refRow('table', t.id)); });
    });
    emptyNote(tables);
  }

  function area(e) { var m = /\/v\d+\/([^/]+)/.exec(e.id); return m ? m[1] : (e.transport || 'other'); }
  function viewEndpoints() {
    heading('Endpoints', SECTIONS[4][2]);
    var eps = all('endpoint'), groups = {};
    eps.forEach(function (e) { var k = area(e) + ' · ' + e.transport; (groups[k] = groups[k] || []).push(e); });
    Object.keys(groups).sort().forEach(function (k) {
      main.appendChild(el('div', { cls: 'group-title', text: k }));
      groups[k].forEach(function (e) { main.appendChild(refRow('endpoint', e.id, e.access + ' — ' + (e.summary || ''))); });
    });
    emptyNote(eps);
  }

  function viewScreens() {
    heading('Screens', SECTIONS[5][2]);
    all('screen').forEach(function (s) { main.appendChild(refRow('screen', s.id, s.path + ' — ' + (s.summary || ''))); });
    emptyNote(all('screen'));
  }

  function lifecycles() {
    var out = [];
    ['table', 'operation', 'flow'].forEach(function (t) { all(t).forEach(function (e) { if (e.lifecycle) out.push({ type: t, e: e }); }); });
    return out;
  }
  function viewLifecycles() {
    heading('Lifecycles', SECTIONS[6][2]);
    var lcs = lifecycles();
    lcs.forEach(function (l) {
      main.appendChild(section({ title: display(l.type, l.e) + ' — ' + arr(l.e.lifecycle.states).length + ' states', render: function (c) {
        c.appendChild(refRow(l.type, l.e.id, 'owner of this state machine'));
        renderLifecycle(c, l.e.lifecycle);
      } }));
    });
    emptyNote(lcs);
  }

  function viewSearch(q) {
    heading('Search', null);
    var needle = q.toLowerCase(), n = 0;
    main.querySelector('h1').textContent = 'Search: ' + q;
    TYPES.forEach(function (t) {
      var hits = all(t).filter(function (e) { return [e.id, e.name, e.summary, e.path].join(' ').toLowerCase().indexOf(needle) >= 0; });
      if (!hits.length) return;
      n += hits.length;
      main.appendChild(el('div', { cls: 'group-title', text: t + 's (' + hits.length + ')' }));
      hits.forEach(function (e) { main.appendChild(refRow(t, e.id)); });
    });
    if (!n) main.appendChild(el('p', { cls: 'muted', text: 'No matches.' }));
  }

  // ---------- Router ----------
  var VIEWS = { '': viewHome, domains: viewDomains, operations: viewOperations, flows: viewFlows, data: viewData, endpoints: viewEndpoints, screens: viewScreens, lifecycles: viewLifecycles };
  var TAB_OF = { domain: 'domains', operation: 'operations', flow: 'flows', table: 'data', endpoint: 'endpoints', screen: 'screens', search: '' };
  function route() {
    main = document.getElementById('main');
    main.textContent = '';
    var h = location.hash.replace(/^#\/?/, '');
    var slash = h.indexOf('/');
    var head = slash < 0 ? h : h.slice(0, slash);
    var rest = slash < 0 ? '' : decodeURIComponent(h.slice(slash + 1));
    var tab = head;
    if (VIEWS[head] && !rest) VIEWS[head]();
    else if (head === 'search') { viewSearch(rest); document.getElementById('q').value = rest; }
    else if (TYPES.indexOf(head) >= 0) { page(head, rest); tab = TAB_OF[head]; }
    else { main.appendChild(el('h1', { text: 'Not found' })); main.appendChild(el('p', null, [el('a', { href: '#/', text: 'Go to Home' })])); }
    Array.prototype.forEach.call(document.querySelectorAll('.tabs a'), function (a) {
      a.className = a.getAttribute('href') === '#/' + tab ? 'on' : '';
    });
    var t = document.querySelector('main h1');
    document.title = (t ? t.textContent + ' · ' : '') + 'Playhoot System';
    window.scrollTo(0, 0);
  }

  function setupTools() {
    var cb = document.getElementById('only-impl');
    cb.checked = onlyImpl;
    cb.addEventListener('change', function () {
      onlyImpl = cb.checked;
      try { localStorage.setItem('ph.onlyImplemented', onlyImpl ? '1' : '0'); } catch (err) { /* storage unavailable */ }
      route();
    });
    document.getElementById('search').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var q = document.getElementById('q').value.trim();
      if (q) location.hash = '#/search/' + encodeURIComponent(q);
    });
  }
})();
