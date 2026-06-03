import { html, render, useState, useEffect, useCallback, useRef } from './vendor/standalone.module.js';

// ---------------------------------------------------------------- API client
const TOKEN_KEY = 'rezerver_crm_token';
let TOKEN = sessionStorage.getItem(TOKEN_KEY) || '';

async function api(path) {
  const res = await fetch('/api' + path, { headers: { Authorization: 'Bearer ' + TOKEN } });
  if (res.status === 401) {
    sessionStorage.removeItem(TOKEN_KEY);
    TOKEN = '';
    location.reload();
    throw new Error('unauthorized');
  }
  if (!res.ok) throw new Error('api ' + res.status);
  return res.json();
}

async function apiWrite(method, path, body) {
  const res = await fetch('/api' + path, {
    method,
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 401) { sessionStorage.removeItem(TOKEN_KEY); TOKEN = ''; location.reload(); throw new Error('unauthorized'); }
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'api ' + res.status); }
  return res.json();
}

// ---------------------------------------------------------------- presentation
const HU = {
  NOT_CONTACTED: 'nem kontaktált', CONTACTED: 'kontaktált', INTERESTED: 'érdeklődik', ONBOARDED: 'beépült',
  SENT: 'elküldve', REPLIED: 'válaszolt',
  NOT_YET_REQUESTED: 'nincs kérve', PENDING: 'függőben', APPROVED: 'jóváhagyva', DENIED: 'elutasítva', JOINED: 'csatlakozott',
};
const huStatus = (s) => HU[s] || s || '–';
const STATUS_CLASS = {
  NOT_CONTACTED: 'b-slate', NOT_YET_REQUESTED: 'b-slate',
  CONTACTED: 'b-blue', SENT: 'b-blue', PENDING: 'b-amber', INTERESTED: 'b-amber',
  ONBOARDED: 'b-green', REPLIED: 'b-green', APPROVED: 'b-green', JOINED: 'b-green', DENIED: 'b-red',
};
const StatusBadge = ({ value }) => html`<span class="badge ${STATUS_CLASS[value] || 'b-slate'}">${huStatus(value)}</span>`;
const TierBadge = ({ tier }) => html`<span class="tier tier-${tier == null ? 0 : tier}">${tier == null ? '–' : 'T' + tier}</span>`;
const LegitDot = ({ value }) => html`<span class="legit"><span class="dot l-${value}"></span>${value || '–'}</span>`;
const Stars = ({ n }) => html`<span class="stars">${'★'.repeat(n || 0)}<span class="faint">${'★'.repeat(Math.max(0, 5 - (n || 0)))}</span></span>`;

function segHue(s) {
  let h = 0;
  for (let i = 0; i < (s || '').length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}
const SegChip = ({ value }) => {
  if (!value) return html`<span class="faint">–</span>`;
  const h = segHue(value);
  return html`<span class="seg" style="background:hsla(${h},55%,50%,.16);color:hsl(${h},60%,70%)">${value}</span>`;
};
const safeHref = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u) ? u : '#');
const fmtTime = (t) => (t ? String(t).slice(0, 16).replace('T', ' ') : '');
// render a labelled field only when it has a value
const Field = ({ label, value }) =>
  value == null || value === '' || value === '[]' ? null : html`<div class="kv"><div class="k">${label}</div><div>${value}</div></div>`;

const VSTATUS = ['NOT_CONTACTED', 'CONTACTED', 'INTERESTED', 'ONBOARDED'];
const LEGITS = ['pending', 'green', 'yellow', 'red'];

// Generic edit form: fields [{k,label,type:'text'|'number'|'textarea'|'select',opts,huOpts}].
// onSave receives only the changed keys.
function EditForm({ fields, record, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => { const d = {}; for (const f of fields) d[f.k] = record[f.k] == null ? '' : String(record[f.k]); return d; });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const save = async () => {
    const changed = {};
    for (const f of fields) { const orig = record[f.k] == null ? '' : String(record[f.k]); if (draft[f.k] !== orig) changed[f.k] = draft[f.k] === '' ? null : draft[f.k]; }
    if (!Object.keys(changed).length) return onCancel();
    setSaving(true); setErr('');
    try { await onSave(changed); } catch (e) { setErr(String((e && e.message) || e)); setSaving(false); }
  };
  return html`<div>
    ${fields.map((f) => html`<div class="kv"><div class="k">${f.label}</div><div>
      ${f.type === 'select'
        ? html`<select value=${draft[f.k]} onChange=${(e) => set(f.k, e.target.value)}><option value="">–</option>${f.opts.map((o) => html`<option value=${o}>${f.huOpts ? huStatus(o) : o}</option>`)}</select>`
        : f.type === 'textarea'
        ? html`<textarea rows="2" style="width:100%" value=${draft[f.k]} onInput=${(e) => set(f.k, e.target.value)}></textarea>`
        : html`<input style="width:100%" type=${f.type === 'number' ? 'number' : 'text'} value=${draft[f.k]} onInput=${(e) => set(f.k, e.target.value)} />`}
    </div></div>`)}
    ${err && html`<div style="color:var(--red);font-size:12px;margin-top:6px">${err}</div>`}
    <div style="display:flex;gap:8px;margin-top:14px">
      <button onClick=${save} disabled=${saving} style="background:var(--accent);color:#fff;border-color:var(--accent)">${saving ? 'Mentés…' : 'Mentés'}</button>
      <button onClick=${onCancel}>Mégse</button>
    </div>
  </div>`;
}

const VENUE_EDIT = [
  { k: 'status', label: 'Státusz', type: 'select', opts: VSTATUS, huOpts: true },
  { k: 'legitimacy_check', label: 'Legitimáció', type: 'select', opts: LEGITS },
  { k: 'stage', label: 'Fázis', type: 'text' },
  { k: 'fit_score', label: 'Fit (1-5)', type: 'number' },
  { k: 'next_action', label: 'Következő lépés', type: 'text' },
  { k: 'next_action_date', label: 'Mikor (dátum)', type: 'text' },
  { k: 'contact_name', label: 'Kapcsolattartó', type: 'text' },
  { k: 'contact_role', label: 'Szerep', type: 'text' },
  { k: 'contact_email', label: 'Email', type: 'text' },
  { k: 'contact_phone', label: 'Telefon', type: 'text' },
  { k: 'website_url', label: 'Web', type: 'text' },
  { k: 'instagram', label: 'Instagram', type: 'text' },
  { k: 'venue_type', label: 'Típus', type: 'text' },
  { k: 'capacity_seated', label: 'Kapacitás (ülő)', type: 'number' },
  { k: 'est_events_per_year', label: 'Rendezvény/év', type: 'number' },
  { k: 'current_booking_tool', label: 'Jelenlegi eszköz', type: 'text' },
  { k: 'pain_points', label: 'Pain points', type: 'textarea' },
  { k: 'price_tier', label: 'Árszint', type: 'text' },
  { k: 'fit_reason', label: 'Fit indok', type: 'textarea' },
  { k: 'notes', label: 'Jegyzet', type: 'textarea' },
];
const PARTNER_EDIT = [
  { k: 'status', label: 'Státusz', type: 'text' },
  { k: 'stage', label: 'Fázis', type: 'text' },
  { k: 'contact_name', label: 'Kapcsolattartó', type: 'text' },
  { k: 'email', label: 'Email', type: 'text' },
  { k: 'phone', label: 'Telefon', type: 'text' },
  { k: 'specialization', label: 'Specializáció', type: 'text' },
  { k: 'referral_potential', label: 'Referral-potenciál', type: 'text' },
  { k: 'warm_intro', label: 'Meleg-bevezetés', type: 'text' },
  { k: 'next_action', label: 'Következő lépés', type: 'text' },
  { k: 'note', label: 'Jegyzet', type: 'textarea' },
];
const MEDIA_EDIT = [
  { k: 'status', label: 'Státusz', type: 'select', opts: ['NOT_CONTACTED', 'SENT', 'REPLIED'], huOpts: true },
  { k: 'priority', label: 'Prioritás', type: 'select', opts: ['HIGH', 'MEDIUM', 'LOW'] },
  { k: 'editor_name', label: 'Szerkesztő', type: 'text' },
  { k: 'editor_email', label: 'Szerk. email', type: 'text' },
  { k: 'audience', label: 'Közönség', type: 'text' },
  { k: 'best_pitch_angle', label: 'Pitch-szög', type: 'text' },
  { k: 'next_action', label: 'Következő lépés', type: 'text' },
  { k: 'notes', label: 'Jegyzet', type: 'textarea' },
];
const FB_EDIT = [
  { k: 'join_status', label: 'Csatlakozás', type: 'select', opts: ['NOT_YET_REQUESTED', 'PENDING', 'APPROVED', 'DENIED', 'JOINED'], huOpts: true },
  { k: 'warmup_phase', label: 'Warmup fázis', type: 'text' },
  { k: 'our_persona', label: 'Personánk', type: 'text' },
  { k: 'posting_rules', label: 'Posztolási szabály', type: 'text' },
  { k: 'next_action', label: 'Következő lépés', type: 'text' },
  { k: 'notes', label: 'Jegyzet', type: 'textarea' },
];

// Compact per-venue quick actions: log outreach / record legitimacy / add follow-up.
function VenueActions({ id, onDone }) {
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async (fn) => { setBusy(true); try { await fn(); setOpen(null); onDone(); } finally { setBusy(false); } };
  const [o, setO] = useState({ channel: 'email', status: 'sent', subject: '' });
  const [lg, setLg] = useState({ source: 'NAV', result: 'green' });
  const [tk, setTk] = useState({ title: '', due_at: '' });
  return html`<div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 2px">
    <button onClick=${() => setOpen(open === 'o' ? null : 'o')}>+ Outreach</button>
    <button onClick=${() => setOpen(open === 'l' ? null : 'l')}>+ Legitimáció</button>
    <button onClick=${() => setOpen(open === 't' ? null : 't')}>+ Follow-up</button>
    ${open === 'o' && html`<div class="panel" style="width:100%;margin-top:6px">
      <select value=${o.channel} onChange=${(e) => setO({ ...o, channel: e.target.value })}>${['email', 'instagram_dm', 'facebook_dm', 'phone', 'form', 'other'].map((c) => html`<option>${c}</option>`)}</select>
      <select value=${o.status} onChange=${(e) => setO({ ...o, status: e.target.value })}>${['sent', 'replied', 'no_reply', 'bounced'].map((c) => html`<option>${c}</option>`)}</select>
      <input placeholder="tárgy / megjegyzés" value=${o.subject} onInput=${(e) => setO({ ...o, subject: e.target.value })} style="width:60%" />
      <button disabled=${busy} onClick=${() => run(() => apiWrite('POST', '/outreach', { target_type: 'venue', target_id: id, ...o }))}>Naplóz</button>
    </div>`}
    ${open === 'l' && html`<div class="panel" style="width:100%;margin-top:6px">
      <select value=${lg.source} onChange=${(e) => setLg({ ...lg, source: e.target.value })}>${['e-cegjegyzek', 'NAV', 'Opten', 'other'].map((c) => html`<option>${c}</option>`)}</select>
      <select value=${lg.result} onChange=${(e) => setLg({ ...lg, result: e.target.value })}>${LEGITS.map((c) => html`<option>${c}</option>`)}</select>
      <button disabled=${busy} onClick=${() => run(() => apiWrite('POST', '/legitimacy', { venue_id: id, ...lg }))}>Rögzít</button>
    </div>`}
    ${open === 't' && html`<div class="panel" style="width:100%;margin-top:6px">
      <input placeholder="teendő" value=${tk.title} onInput=${(e) => setTk({ ...tk, title: e.target.value })} style="width:50%" />
      <input placeholder="határidő (dátum)" value=${tk.due_at} onInput=${(e) => setTk({ ...tk, due_at: e.target.value })} />
      <button disabled=${busy || !tk.title} onClick=${() => run(() => apiWrite('POST', '/tasks', { target_type: 'venue', target_id: id, ...tk }))}>Hozzáad</button>
    </div>`}
  </div>`;
}

// shared fetch hook — refetches when `rev` bumps (live refresh on ingest)
function useFetch(path, rev) {
  const [state, setState] = useState({ data: null, err: null });
  useEffect(() => {
    let alive = true;
    api(path)
      .then((d) => alive && setState({ data: d, err: null }))
      .catch((e) => alive && setState((s) => ({ data: s.data, err: e })));
    return () => { alive = false; };
  }, [path, rev]);
  return state;
}
const ErrBlock = ({ err }) => html`<div class="empty">Hiba a betöltéskor: ${String((err && err.message) || err)}
  <div style="margin-top:10px"><button onClick=${() => location.reload()}>Újratöltés</button></div></div>`;
const Loading = () => html`<div class="loading">Betöltés…</div>`;

// ---------------------------------------------------------------- gate
function Gate({ onAuth }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/meta', { headers: { Authorization: 'Bearer ' + val } });
    if (res.ok) { sessionStorage.setItem(TOKEN_KEY, val); TOKEN = val; onAuth(); }
    else setErr('Hibás token.');
  };
  return html`<div class="gate">
    <div class="logo">🗂️</div><h1>Rezerver CRM</h1>
    <p class="muted">Privát belső dashboard — add meg a hozzáférési tokent.</p>
    <form onSubmit=${submit}>
      <input type="password" placeholder="token" value=${val} onInput=${(e) => setVal(e.target.value)} autofocus />
      <button type="submit">Belépés</button>
    </form>
    ${err && html`<div class="err">${err}</div>`}
  </div>`;
}

// ---------------------------------------------------------------- table
function SortableTable({ columns, rows, onRow, sort, setSort }) {
  const toggle = (k) => setSort(sort.key === k ? { key: k, dir: sort.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'asc' });
  return html`<div class="tablewrap"><table>
    <thead><tr>${columns.map((c) => html`<th onClick=${() => toggle(c.key)}>${c.label}${sort.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>`)}</tr></thead>
    <tbody>${rows.map((r) => html`<tr tabindex="0" onClick=${() => onRow && onRow(r)} onKeyDown=${(e) => e.key === 'Enter' && onRow && onRow(r)}>
      ${columns.map((c) => html`<td>${c.render ? c.render(r) : r[c.key] ?? ''}</td>`)}</tr>`)}</tbody>
  </table></div>`;
}
function clientSort(rows, sort) {
  const m = sort.dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[sort.key], bv = b[sort.key];
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * m;
    return String(av).localeCompare(String(bv), 'hu') * m;
  });
}

// ---------------------------------------------------------------- OVERVIEW
function Bars({ rows, fmt, color }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return html`${rows.map((r) => html`<div class="bar-row">
    <span class="label">${fmt ? fmt(r.stage) : huStatus(r.stage)}</span>
    <div class="bar-track"><div class="bar" style="width:${(r.n / max) * 100}%;background:${color ? color(r.stage) : 'var(--accent)'}"></div></div>
    <span class="n">${r.n}</span></div>`)}`;
}
const STATUS_COLOR = { NOT_CONTACTED: 'var(--slate)', NOT_YET_REQUESTED: 'var(--slate)', CONTACTED: 'var(--blue)', SENT: 'var(--blue)', PENDING: 'var(--amber)', INTERESTED: 'var(--amber)', ONBOARDED: 'var(--green)', REPLIED: 'var(--green)', APPROVED: 'var(--green)', JOINED: 'var(--green)', DENIED: 'var(--red)' };
const statusColor = (s) => STATUS_COLOR[s] || 'var(--accent)';

function OverviewView({ openDrawer, go, rev }) {
  const { data: d, err } = useFetch('/overview', rev);
  if (err) return html`<${ErrBlock} err=${err} />`;
  if (!d) return html`<${Loading} />`;
  const legit = d.legitimacy;
  const pct = (n) => (legit.total ? (n / legit.total) * 100 : 0);
  const legitBy = { green: 0, yellow: 0, red: 0, pending: 0 };
  (legit.by || []).forEach((x) => { legitBy[x.stage] = x.n; });
  const contacted = d.venues_by_status.filter((x) => x.stage !== 'NOT_CONTACTED').reduce((a, x) => a + x.n, 0);

  const wq = d.work_queue;
  const queuePanel = (title, items, render, onClick) => html`<div class="panel">
    <h3>${title}<span class="pill">${items.length}</span></h3>
    ${items.length === 0
      ? html`<div class="wq-empty">✓ nincs teendő</div>`
      : html`${items.slice(0, 6).map((it) => html`<div class="wq-item" onClick=${() => onClick(it)}>${render(it)}</div>`)}
         ${items.length > 6 ? html`<div class="wq-more">…és még ${items.length - 6}</div>` : ''}`}
  </div>`;

  return html`
    <div class="view-head"><h2>Áttekintés</h2><span class="total">a worker pipeline pillanatképe</span></div>

    <div class="kpi-grid">
      <div class="kpi accent"><div class="label">Helyszínek</div><div class="num">${d.counts.venues}</div><div class="sub">${contacted} kontaktálva</div></div>
      <div class="kpi"><div class="label">Legitimáció</div><div class="num">${legit.done}<span class="faint" style="font-size:16px">/${legit.total}</span></div><div class="sub">${legit.pending} függőben</div></div>
      <div class="kpi"><div class="label">Partnerek</div><div class="num">${d.counts.referrals}</div><div class="sub">fotós · koordinátor · ügynökség</div></div>
      <div class="kpi"><div class="label">Média</div><div class="num">${d.counts.media}</div><div class="sub">sajtó-célpontok</div></div>
      <div class="kpi"><div class="label">FB csoportok</div><div class="num">${d.counts.fb_groups}</div><div class="sub">community intel</div></div>
    </div>

    <div class="cols-2">
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="panel">
          <h3>Legitimáció — a compliance kapu outreach előtt</h3>
          <div class="progress">
            <span style="width:${pct(legitBy.green)}%;background:var(--green)"></span>
            <span style="width:${pct(legitBy.yellow)}%;background:var(--amber)"></span>
            <span style="width:${pct(legitBy.red)}%;background:var(--red)"></span>
            <span style="width:${pct(legitBy.pending)}%;background:var(--slate)"></span>
          </div>
          <div class="progress-legend">
            <span class="it"><span class="dot l-green" style="width:9px;height:9px;border-radius:50%"></span>zöld ${legitBy.green}</span>
            <span class="it"><span class="dot l-yellow" style="width:9px;height:9px;border-radius:50%"></span>sárga ${legitBy.yellow}</span>
            <span class="it"><span class="dot l-red" style="width:9px;height:9px;border-radius:50%"></span>piros ${legitBy.red}</span>
            <span class="it"><span class="dot l-pending" style="width:9px;height:9px;border-radius:50%"></span>függőben ${legitBy.pending}</span>
          </div>
        </div>
        ${queuePanel('Tier-1 venue legitimáció nélkül', wq.tier1_no_legit, (it) => html`<span class="tier tier-1">T1</span><strong>${it.name}</strong><span class="meta">${it.city || ''}</span>`, (it) => openDrawer({ type: 'venue', id: it.id }))}
        ${queuePanel('Magas relevanciájú FB-csoport, nincs kérve', wq.fb_high_unrequested, (it) => html`<${Stars} n=${it.relevance_score} /><span>${it.name}</span>`, () => go('fb'))}
      </div>

      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="panel"><h3>Helyszín-pipeline</h3><${Bars} rows=${d.venues_by_status} color=${statusColor} /></div>
        ${queuePanel('HIGH média, nincs kontaktálva', wq.media_high_uncontacted, (it) => html`<strong>${it.site}</strong><span class="meta">${it.editor_name || ''}</span>`, () => go('media'))}
        ${queuePanel('Ismert emailű partner, nincs kontaktálva', wq.partners_known_uncontacted, (it) => html`<strong>${it.name}</strong><span class="meta">${it.email || ''}</span>`, () => go('referrals'))}
        <div class="panel"><h3>Top városok</h3><${Bars} rows=${d.top_cities} fmt=${(c) => c} /></div>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------- VENUES
function VenuesView({ openDrawer, rev }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [filters, setFilters] = useState({});
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: 'tier', dir: 'asc' });

  const load = useCallback(() => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v) qs.set(k, v);
    if (q) qs.set('q', q);
    api('/venues?' + qs.toString()).then((d) => { setData(d); setErr(null); }).catch(setErr);
  }, [filters, q]);
  useEffect(() => { load(); }, [load, rev]);

  if (err) return html`<${ErrBlock} err=${err} />`;
  if (!data) return html`<${Loading} />`;
  const setFacet = (k, v) => setFilters((f) => ({ ...f, [k]: f[k] === v ? '' : v }));
  const facetBar = (label, key, items, render) => html`<div class="facets"><span class="ftitle">${label}</span>
    ${items.map((it) => html`<span class="chip ${filters[key] === String(it.value) ? 'on' : ''}" onClick=${() => setFacet(key, String(it.value))}>
      ${render ? render(it.value) : it.value}<span class="n">${it.n}</span></span>`)}</div>`;

  const columns = [
    { key: 'name', label: 'Név', render: (r) => html`<strong>${r.name}</strong>` },
    { key: 'city', label: 'Város' },
    { key: 'segment', label: 'Szegmens', render: (r) => html`<${SegChip} value=${r.segment} />` },
    { key: 'tier', label: 'Tier', render: (r) => html`<${TierBadge} tier=${r.tier} />` },
    { key: 'status', label: 'Státusz', render: (r) => html`<${StatusBadge} value=${r.status} />` },
    { key: 'legitimacy_check', label: 'Legit', render: (r) => html`<${LegitDot} value=${r.legitimacy_check} />` },
    { key: 'hook', label: 'Hook', render: (r) => html`<div class="truncate" title=${r.hook}>${r.hook}</div>` },
  ];
  const totalAll = data.facets.status.reduce((s, x) => s + x.n, 0);
  return html`
    <div class="view-head"><h2>Helyszínek</h2><span class="total">${data.total} / ${totalAll}</span>
      <div class="spacer"></div>
      <input style="width:240px" placeholder="keresés (név, hook)…" value=${q} onInput=${(e) => setQ(e.target.value)} />
      ${Object.values(filters).some(Boolean) && html`<button onClick=${() => setFilters({})}>✕ szűrők</button>`}
    </div>
    ${facetBar('Státusz', 'status', data.facets.status, (v) => huStatus(v))}
    ${facetBar('Tier', 'tier', data.facets.tier, (v) => 'T' + v)}
    ${facetBar('Legit', 'legitimacy', data.facets.legitimacy_check)}
    ${facetBar('Szegmens', 'segment', data.facets.segment)}
    <div style="height:6px"></div>
    <${SortableTable} columns=${columns} rows=${clientSort(data.items, sort)} sort=${sort} setSort=${setSort} onRow=${(r) => openDrawer({ type: 'venue', id: r.id })} />
  `;
}

// ---------------------------------------------------------------- generic list
function ListView({ title, endpoint, columns, drawerFields, editFields, patchBase, idKey, rev }) {
  const [lrev, setLrev] = useState(0);
  const { data, err } = useFetch(endpoint, rev + '|' + lrev);
  const [sort, setSort] = useState({ key: columns[0].key, dir: 'asc' });
  const [sel, setSel] = useState(null);
  if (err) return html`<${ErrBlock} err=${err} />`;
  if (!data) return html`<${Loading} />`;
  const onSave = async (changed) => { await apiWrite('PATCH', patchBase + '/' + encodeURIComponent(sel[idKey]), changed); setSel(null); setLrev((x) => x + 1); };
  return html`
    <div class="view-head"><h2>${title}</h2><span class="total">${data.items.length}</span></div>
    <${SortableTable} columns=${columns} rows=${clientSort(data.items, sort)} sort=${sort} setSort=${setSort} onRow=${setSel} />
    ${sel && html`<${RecordDrawer} title=${sel.name || sel.site || sel.id} sub=${sel.company || sel.category || sel.city || ''} fields=${drawerFields} editFields=${editFields} record=${sel} onSave=${onSave} onClose=${() => setSel(null)} />`}
  `;
}
function RecordDrawer({ title, sub, fields, editFields, record, onSave, onClose }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return html`<div class="drawer-bg" onClick=${() => setEditing(false)}></div>
      <div class="drawer">
        <div class="dh"><h2>${title} — szerkesztés</h2><button class="close" onClick=${() => setEditing(false)}>✕</button></div>
        <${EditForm} fields=${editFields} record=${record} onSave=${onSave} onCancel=${() => setEditing(false)} />
      </div>`;
  }
  return html`<div class="drawer-bg" onClick=${onClose}></div>
    <div class="drawer">
      <div class="dh"><h2>${title}</h2>${editFields ? html`<button onClick=${() => setEditing(true)}>✎ Szerkesztés</button>` : ''}<button class="close" onClick=${onClose}>✕</button></div>
      <div class="sub">${sub}</div>
      ${fields.map((f) => {
        const v = f.get ? f.get(record) : record[f.key];
        if (v == null || v === '' || (Array.isArray(v) && !v.length)) return null;
        return html`<div class="kv"><div class="k">${f.label}</div><div>${f.render ? f.render(v, record) : v}</div></div>`;
      })}
    </div>`;
}

// ---------------------------------------------------------------- venue drawer
function VenueDrawer({ id, onClose, rev }) {
  const [lrev, setLrev] = useState(0);
  const [editing, setEditing] = useState(false);
  const { data: v, err } = useFetch('/venues/' + id, rev + '|' + lrev);
  const refresh = () => setLrev((x) => x + 1);
  const saveEdit = async (changed) => { await apiWrite('PATCH', '/venues/' + id, changed); setEditing(false); refresh(); };
  return html`<div class="drawer-bg" onClick=${onClose}></div>
    <div class="drawer">
      ${err
        ? html`<div class="dh"><h2>Hiba</h2><button class="close" onClick=${onClose}>✕</button></div><${ErrBlock} err=${err} />`
        : !v
        ? html`<${Loading} />`
        : editing
        ? html`
          <div class="dh"><h2>${v.name} — szerkesztés</h2><button class="close" onClick=${() => setEditing(false)}>✕</button></div>
          <${EditForm} fields=${VENUE_EDIT} record=${v} onSave=${saveEdit} onCancel=${() => setEditing(false)} />`
        : html`
          <div class="dh"><h2>${v.name}</h2><button onClick=${() => setEditing(true)}>✎ Szerkesztés</button><button class="close" onClick=${onClose}>✕</button></div>
          <div class="sub">${v.city || '–'} · ${v.segment || '–'}</div>
          <div class="badgerow"><${TierBadge} tier=${v.tier} /><${StatusBadge} value=${v.status} /><${LegitDot} value=${v.legitimacy_check} />
            ${v.fit_score != null && html`<span class="badge b-blue">fit ${v.fit_score}/5</span>`}</div>
          <${VenueActions} id=${id} onDone=${refresh} />
          ${(() => {
            const ef = ['contact_name', 'contact_email', 'contact_phone', 'venue_type', 'capacity_seated', 'est_events_per_year', 'current_booking_tool', 'pain_points', 'fit_score', 'price_tier', 'website_url', 'next_action'];
            const filled = ef.filter((k) => v[k] != null && v[k] !== '').length;
            return html`<div class="progress" style="margin:4px 0 2px"><span style="width:${(filled / ef.length) * 100}%;background:var(--accent)"></span></div>
              <div class="faint" style="font-size:11.5px;margin-bottom:6px">profil kitöltöttség: ${filled}/${ef.length}</div>`;
          })()}
          <div class="section-t">Alapadatok</div>
          <${Field} label="Hook" value=${v.hook} />
          <${Field} label="Trigger" value=${v.trigger_event} />
          <div class="kv"><div class="k">Kapcsolattartó</div><div>${v.contact_name || '–'}${v.contact_role ? html` <span class="faint">· ${v.contact_role}</span>` : ''}</div></div>
          <div class="kv"><div class="k">Elérhetőség</div><div class="muted">
            ${v.contact_email || '–'} · ${v.contact_phone || '–'}<br/>
            ${v.website_url ? html`<a href=${safeHref(v.website_url)} target="_blank" rel="noopener noreferrer">${v.website_url}</a>` : '–'} · ${v.instagram || '–'} · ${v.booking_email || ''}</div></div>
          <${Field} label="Jegyzet" value=${v.notes} />
          <div class="section-t">Kapacitás & profil</div>
          <${Field} label="Típus" value=${v.venue_type} />
          <${Field} label="Kapacitás" value=${[v.capacity_seated && v.capacity_seated + ' ülő', v.capacity_standing && v.capacity_standing + ' álló'].filter(Boolean).join(' · ') || null} />
          <${Field} label="Event-típusok" value=${(() => { try { const a = JSON.parse(v.event_types || '[]'); return a.length ? a.join(', ') : null; } catch { return v.event_types; } })()} />
          <${Field} label="Rendezvény/év" value=${v.est_events_per_year} />
          <${Field} label="Prestige" value=${v.prestige} />
          <div class="section-t">Üzleti & fit</div>
          <${Field} label="Jelenlegi eszköz" value=${v.current_booking_tool} />
          <${Field} label="Pain points" value=${v.pain_points} />
          <${Field} label="Árszint" value=${v.price_tier || v.price_range} />
          <${Field} label="Fit indok" value=${v.fit_reason} />
          ${(v.next_action || v.next_action_date) && html`<div class="section-t">Következő lépés</div><${Field} label="Teendő" value=${v.next_action} /><${Field} label="Mikor" value=${v.next_action_date} />`}
          ${(() => { try { const ex = JSON.parse(v.extra || '{}'); const ks = Object.keys(ex); return ks.length ? html`<div class="section-t">Egyéb (extra)</div>${ks.map((k) => html`<${Field} label=${k} value=${typeof ex[k] === 'object' ? JSON.stringify(ex[k]) : ex[k]} />`)}` : ''; } catch { return ''; } })()}
          ${v.related_partners && v.related_partners.length
            ? html`<div class="section-t">Kapcsolódó partnerek</div><div>${v.related_partners.map((p) => html`<span class="tag">${p.name} <span class="faint">${p.type || ''}</span></span>`)}</div>`
            : ''}
          <div class="section-t">Outreach előzmény</div>
          ${v.outreach.length ? html`<div class="timeline">${v.outreach.map((o) => html`<div class="ev">${fmtTime(o.sent_at || o.created_at)} · ${o.channel} · ${o.status}</div>`)}</div>` : html`<div class="muted">nincs (Phase B)</div>`}
          <div class="section-t">Legitimáció audit</div>
          ${v.legitimacy_checks.length ? html`<div class="timeline">${v.legitimacy_checks.map((c) => html`<div class="ev">${fmtTime(c.checked_at)} · ${c.source} · ${c.result}</div>`)}</div>` : html`<div class="muted">nincs még lefuttatva</div>`}
          ${v.source_provenance && html`<div class="section-t">Eredet</div><div class="faint" style="font-size:12px">${v.source_provenance}</div>`}
        `}
    </div>`;
}

// ---------------------------------------------------------------- funnel
function FunnelView({ rev }) {
  const { data: d, err } = useFetch('/funnel', rev);
  if (err) return html`<${ErrBlock} err=${err} />`;
  if (!d) return html`<${Loading} />`;
  const card = (title, rows, fmt, color) => html`<div class="panel"><h3>${title}</h3><${Bars} rows=${rows} fmt=${fmt} color=${color} /></div>`;
  return html`<div class="view-head"><h2>Tölcsér</h2></div>
    <div class="cols-3">
      ${card('Helyszínek — státusz', d.venues_status, null, statusColor)}
      ${card('Helyszínek — legitimáció', d.venues_legitimacy, (s) => s, (s) => ({ green: 'var(--green)', yellow: 'var(--amber)', red: 'var(--red)', pending: 'var(--slate)' }[s] || 'var(--slate)'))}
      ${card('Helyszínek — tier', d.venues_tier, (s) => (s == null ? 'nincs' : 'T' + s))}
      ${card('Média — státusz', d.media_status, null, statusColor)}
      ${card('Partnerek — státusz', d.referrals_status, null, statusColor)}
      ${card('FB csoportok — csatlakozás', d.fb_join, null, statusColor)}
    </div>`;
}

// ---------------------------------------------------------------- ops
function OpsView({ rev }) {
  const { data: d, err } = useFetch('/ops', rev);
  if (err) return html`<${ErrBlock} err=${err} />`;
  if (!d) return html`<${Loading} />`;
  const fb = d.facebook || {}, r = d.reddit || {};
  return html`<div class="view-head"><h2>Fiók-egészség</h2><span class="total muted">${d.phase || ''}</span></div>
    <div class="cols-3">
      <div class="panel"><h3>Facebook</h3>
        <div class="kv"><div class="k">Warmup fázis</div><div>${fb.warmup_phase ?? '–'}</div></div>
        <div class="kv"><div class="k">Periódus</div><div class="faint">${fb.warmup_started_at || '?'} → ${fb.warmup_ends_at || '?'}</div></div>
        <div class="kv"><div class="k">Mai</div><div class="mono" style="font-size:12px">${JSON.stringify(fb.daily || {})}</div></div>
        <div class="kv"><div class="k">Heti</div><div class="mono" style="font-size:12px">${JSON.stringify(fb.weekly || {})}</div></div>
      </div>
      <div class="panel"><h3>Reddit</h3>
        <div class="kv"><div class="k">Fázis</div><div>${r.phase || '–'}</div></div>
        <div class="kv"><div class="k">User</div><div>${r.username_target || '–'}</div></div>
        <div class="kv"><div class="k">Karma</div><div>poszt ${r.karma_post ?? 0} · komment ${r.karma_comment ?? 0}</div></div>
        <div class="kv"><div class="k">Sessionök</div><div>${r.session_count ?? 0}</div></div>
      </div>
      <div class="panel"><h3>FB incidensek</h3>
        ${(fb.incidents || []).length ? html`<div class="timeline">${(fb.incidents || []).map((i) => html`<div class="ev">${i.date || i.ts || ''} · ${i.type || i.text || ''} ${i.resolved ? '✓' : '⚠'}</div>`)}</div>` : html`<div class="muted">nincs</div>`}
      </div>
    </div>`;
}

// ---------------------------------------------------------------- global search
function GlobalSearch({ openDrawer, go, inputRef }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  useEffect(() => {
    if (q.length < 2) { setRes(null); return; }
    let alive = true;
    const t = setTimeout(() => api('/search?q=' + encodeURIComponent(q)).then((d) => alive && setRes(d)).catch(() => {}), 220);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);
  const pick = (fn) => { fn(); setQ(''); setRes(null); inputRef.current && inputRef.current.blur(); };
  const has = res && (res.venues.length || res.referrals.length || res.media.length || res.fb_groups.length);
  return html`<div class="searchbox">
    <span class="icon">🔍</span>
    <input ref=${inputRef} placeholder="keresés mindenben…" value=${q} onInput=${(e) => setQ(e.target.value)} onKeyDown=${(e) => e.key === 'Escape' && (setQ(''), setRes(null), e.target.blur())} />
    <kbd>/</kbd>
    ${res && html`<div class="search-results">
      ${!has ? html`<div class="grp">nincs találat</div>` : ''}
      ${res.venues.length ? html`<div class="grp">Helyszínek</div>${res.venues.map((v) => html`<div class="item" onClick=${() => pick(() => { go('venues'); openDrawer({ type: 'venue', id: v.id }); })}><span><strong>${v.name}</strong> <span class="faint">${v.city || ''}</span></span><${StatusBadge} value=${v.status} /></div>`)}` : ''}
      ${res.referrals.length ? html`<div class="grp">Partnerek</div>${res.referrals.map((p) => html`<div class="item" onClick=${() => pick(() => go('referrals'))}><span><strong>${p.name}</strong> <span class="faint">${p.company || ''}</span></span><span class="faint">${p.type || ''}</span></div>`)}` : ''}
      ${res.media.length ? html`<div class="grp">Média</div>${res.media.map((m) => html`<div class="item" onClick=${() => pick(() => go('media'))}><span><strong>${m.site}</strong></span><span class="faint">${m.category || ''}</span></div>`)}` : ''}
      ${res.fb_groups.length ? html`<div class="grp">FB csoportok</div>${res.fb_groups.map((g) => html`<div class="item" onClick=${() => pick(() => go('fb'))}><span>${g.name}</span><${StatusBadge} value=${g.join_status} /></div>`)}` : ''}
    </div>`}
  </div>`;
}

// ---------------------------------------------------------------- outreach + tasks
const outreachClass = (s) => (s === 'replied' ? 'b-green' : s === 'bounced' ? 'b-red' : s === 'no_reply' ? 'b-amber' : 'b-blue');
function targetOpen(it, openDrawer, go) {
  if (it.target_type === 'venue') openDrawer({ type: 'venue', id: parseInt(it.target_id, 10) });
  else if (it.target_type === 'referral') go('referrals');
  else if (it.target_type === 'media') go('media');
}

function OutreachView({ openDrawer, go, rev }) {
  const [filter, setFilter] = useState({});
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) if (v) qs.set(k, v);
  const { data, err } = useFetch('/outreach?' + qs.toString(), rev);
  if (err) return html`<${ErrBlock} err=${err} />`;
  if (!data) return html`<${Loading} />`;
  const toggle = (k, v) => setFilter((f) => ({ ...f, [k]: f[k] === v ? '' : v }));
  return html`
    <div class="view-head"><h2>Outreach</h2><span class="total">${data.items.length}</span></div>
    <div class="facets"><span class="ftitle">Státusz</span>
      ${['sent', 'replied', 'no_reply', 'bounced', 'queued', 'closed'].map((s) => html`<span class="chip ${filter.status === s ? 'on' : ''}" onClick=${() => toggle('status', s)}>${s}</span>`)}</div>
    <div class="facets"><span class="ftitle">Típus</span>
      ${['venue', 'referral', 'media'].map((s) => html`<span class="chip ${filter.target_type === s ? 'on' : ''}" onClick=${() => toggle('target_type', s)}>${s}</span>`)}</div>
    ${data.items.length === 0
      ? html`<div class="empty">nincs outreach még — naplózz egyet egy helyszín drawerében (+ Outreach)</div>`
      : html`<div class="tablewrap"><table>
        <thead><tr><th>Dátum</th><th>Célpont</th><th>Csatorna</th><th>Tárgy</th><th>Státusz</th><th>Follow-up</th></tr></thead>
        <tbody>${data.items.map((o) => html`<tr onClick=${() => targetOpen(o, openDrawer, go)}>
          <td class="mono">${fmtTime(o.sent_at || o.created_at)}</td>
          <td><strong>${o.target_name || o.target_id}</strong> <span class="faint">${o.target_type}</span></td>
          <td>${o.channel}</td><td class="truncate">${o.subject || ''}</td>
          <td><span class="badge ${outreachClass(o.status)}">${o.status}</span></td>
          <td class="mono">${o.follow_up_at ? fmtTime(o.follow_up_at) : ''}</td></tr>`)}</tbody></table></div>`}
  `;
}

function TasksView({ openDrawer, go, rev }) {
  const [showDone, setShowDone] = useState(false);
  const [lrev, setLrev] = useState(0);
  const { data, err } = useFetch('/tasks?done=' + (showDone ? '1' : '0'), rev + '|' + lrev);
  if (err) return html`<${ErrBlock} err=${err} />`;
  if (!data) return html`<${Loading} />`;
  const today = new Date().toISOString().slice(0, 10);
  const bucket = (t) => (t.done ? 'kész' : !t.due_at ? 'nincs határidő' : t.due_at.slice(0, 10) < today ? 'lejárt' : t.due_at.slice(0, 10) === today ? 'ma' : 'később');
  const order = ['lejárt', 'ma', 'később', 'nincs határidő', 'kész'];
  const groups = {};
  for (const t of data.items) (groups[bucket(t)] = groups[bucket(t)] || []).push(t);
  const toggleDone = async (t) => { await apiWrite('PATCH', '/tasks/' + t.id, { done: !t.done }); setLrev((x) => x + 1); };
  const bucketColor = { 'lejárt': 'var(--red)', 'ma': 'var(--amber)', 'később': 'var(--blue)', 'nincs határidő': 'var(--muted)', 'kész': 'var(--green)' };
  return html`
    <div class="view-head"><h2>Teendők</h2><span class="total">${data.items.length}</span>
      <div class="spacer"></div>
      <label class="muted" style="font-size:13px;display:flex;align-items:center;gap:5px"><input type="checkbox" checked=${showDone} onChange=${(e) => setShowDone(e.target.checked)} /> kész is</label></div>
    ${data.items.length === 0
      ? html`<div class="empty">nincs teendő ✓ — adj hozzá egyet egy helyszín drawerében (+ Follow-up)</div>`
      : order.filter((b) => groups[b]).map((b) => html`
        <div class="panel" style="margin-bottom:12px"><h3 style="color:${bucketColor[b]}">${b} <span class="pill">${groups[b].length}</span></h3>
          ${groups[b].map((t) => html`<div class="wq-item">
            <input type="checkbox" checked=${!!t.done} onChange=${() => toggleDone(t)} />
            <span style=${t.done ? 'text-decoration:line-through;opacity:.55' : ''} onClick=${() => targetOpen(t, openDrawer, go)}>${t.title}</span>
            ${t.target_name ? html`<span class="faint">· ${t.target_name}</span>` : ''}
            <span class="meta">${t.due_at ? fmtTime(t.due_at) : ''}</span></div>`)}
        </div>`)}
  `;
}

// ---------------------------------------------------------------- shell
const NAV = [
  { route: 'overview', label: 'Áttekintés' },
  { group: 'Pipeline' },
  { route: 'venues', label: 'Helyszínek', ck: 'venues' },
  { route: 'referrals', label: 'Partnerek', ck: 'referrals' },
  { route: 'media', label: 'Média', ck: 'media' },
  { route: 'fb', label: 'FB csoportok', ck: 'fb_groups' },
  { group: 'Operáció' },
  { route: 'outreach', label: 'Outreach' },
  { route: 'tasks', label: 'Teendők' },
  { group: 'Elemzés' },
  { route: 'funnel', label: 'Tölcsér' },
  { route: 'ops', label: 'Fiók-egészség' },
];

function Shell() {
  const [route, setRoute] = useState((location.hash.slice(2) || 'overview').split('/')[0]);
  const [drawer, setDrawer] = useState(null);
  const [rev, setRev] = useState(0);
  const [counts, setCounts] = useState({});
  const [lastSync, setLastSync] = useState('');
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('crm_theme') || 'dark');
  const [navOpen, setNavOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('crm_theme', theme); }, [theme]);
  useEffect(() => {
    const onHash = () => { setRoute((location.hash.slice(2) || 'overview').split('/')[0]); setNavOpen(false); };
    addEventListener('hashchange', onHash);
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); searchRef.current && searchRef.current.focus(); }
      if (e.key === 'Escape') setDrawer(null);
    };
    addEventListener('keydown', onKey);
    return () => { removeEventListener('hashchange', onHash); removeEventListener('keydown', onKey); };
  }, []);

  // counts for nav (cheap, from overview)
  useEffect(() => { api('/overview').then((d) => setCounts(d.counts)).catch(() => {}); }, [rev]);

  // meta poll → bump rev (live refresh) + sync indicator
  useEffect(() => {
    let last = null;
    const tick = () => api('/meta').then((m) => {
      const sig = JSON.stringify(m.sources);
      if (last && sig !== last) { setRev((r) => r + 1); setToast('⟳ új adat a workertől — frissítve'); setTimeout(() => setToast(''), 3500); }
      last = sig;
      setLastSync(fmtTime(m.sources && m.sources.venues));
    }).catch(() => {});
    tick();
    const iv = setInterval(tick, 45000);
    return () => clearInterval(iv);
  }, []);

  const go = (r) => { location.hash = '#/' + r; };
  const openDrawer = (d) => setDrawer(d);

  let view;
  if (route === 'overview') view = html`<${OverviewView} openDrawer=${openDrawer} go=${go} rev=${rev} />`;
  else if (route === 'venues') view = html`<${VenuesView} openDrawer=${openDrawer} rev=${rev} />`;
  else if (route === 'referrals') view = html`<${ListView} title="Partnerek" endpoint="/referrals" columns=${REF_COLS} drawerFields=${REF_FIELDS} editFields=${PARTNER_EDIT} patchBase="/referrals" idKey="id" rev=${rev} />`;
  else if (route === 'media') view = html`<${ListView} title="Média" endpoint="/media" columns=${MEDIA_COLS} drawerFields=${MEDIA_FIELDS} editFields=${MEDIA_EDIT} patchBase="/media" idKey="site" rev=${rev} />`;
  else if (route === 'fb') view = html`<${ListView} title="FB csoportok" endpoint="/fb-groups" columns=${FB_COLS} drawerFields=${FB_FIELDS} editFields=${FB_EDIT} patchBase="/fb-groups" idKey="id" rev=${rev} />`;
  else if (route === 'outreach') view = html`<${OutreachView} openDrawer=${openDrawer} go=${go} rev=${rev} />`;
  else if (route === 'tasks') view = html`<${TasksView} openDrawer=${openDrawer} go=${go} rev=${rev} />`;
  else if (route === 'funnel') view = html`<${FunnelView} rev=${rev} />`;
  else if (route === 'ops') view = html`<${OpsView} rev=${rev} />`;
  else view = html`<div class="empty">Ismeretlen nézet</div>`;

  return html`
    <div class="topbar">
      <button class="iconbtn hamburger" onClick=${() => setNavOpen((o) => !o)}>☰</button>
      <span class="brand"><span class="pulse"></span>Rezerver CRM</span>
      <${GlobalSearch} openDrawer=${openDrawer} go=${go} inputRef=${searchRef} />
      <div class="right">
        ${lastSync && html`<span title="utolsó worker-adat">⟳ ${lastSync}</span>`}
        <button class="iconbtn" title="téma" onClick=${() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>${theme === 'dark' ? '☀' : '☾'}</button>
      </div>
    </div>
    <div class="layout">
      <nav class="nav ${navOpen ? 'open' : ''}">
        ${NAV.map((n) => n.group
          ? html`<div class="group">${n.group}</div>`
          : html`<a class=${route === n.route ? 'active' : ''} href="#/${n.route}">${n.label}${n.ck ? html`<span class="count">${counts[n.ck] ?? ''}</span>` : ''}</a>`)}
      </nav>
      <div class="content">
        ${view}
        ${drawer && drawer.type === 'venue' && html`<${VenueDrawer} id=${drawer.id} rev=${rev} onClose=${() => setDrawer(null)} />`}
      </div>
    </div>
    ${toast && html`<div class="toast" onClick=${() => setToast('')}>${toast}</div>`}
  `;
}

// ---------------------------------------------------------------- column defs
const REF_COLS = [
  { key: 'name', label: 'Név', render: (r) => html`<strong>${r.name}</strong>` },
  { key: 'company', label: 'Cég' },
  { key: 'type', label: 'Típus', render: (r) => html`<span class="faint">${r.type || ''}</span>` },
  { key: 'city', label: 'Város' },
  { key: 'tier', label: 'Tier', render: (r) => html`<${TierBadge} tier=${r.tier} />` },
  { key: 'status', label: 'Státusz', render: (r) => html`<${StatusBadge} value=${r.status} />` },
  { key: 'email', label: 'Email', render: (r) => html`<span class="muted">${r.email || '–'}</span>` },
];
const REF_FIELDS = [
  { key: 'note', label: 'Jegyzet' },
  { key: 'segment', label: 'Szegmens' },
  { key: 'website', label: 'Web', render: (v) => html`<a href=${safeHref(v)} target="_blank" rel="noopener noreferrer">${v}</a>` },
  { key: 'instagram', label: 'Instagram' },
  { key: 'email', label: 'Email' },
  { key: 'venues_worked_with', label: 'Helyszínek', render: (v) => (Array.isArray(v) ? v.map((x) => html`<span class="tag">${x}</span>`) : v) },
  { key: 'last_touched', label: 'Utolsó érintés' },
];
const MEDIA_COLS = [
  { key: 'site', label: 'Lap', render: (r) => html`<strong>${r.site}</strong>` },
  { key: 'editor_name', label: 'Szerkesztő' },
  { key: 'category', label: 'Kategória', render: (r) => html`<${SegChip} value=${r.category} />` },
  { key: 'priority', label: 'Prioritás', render: (r) => html`<span class="badge ${r.priority === 'HIGH' ? 'b-green' : r.priority === 'MEDIUM' ? 'b-amber' : 'b-slate'}">${r.priority || '–'}</span>` },
  { key: 'status', label: 'Státusz', render: (r) => html`<${StatusBadge} value=${r.status} />` },
];
const MEDIA_FIELDS = [
  { key: 'url', label: 'URL', render: (v) => html`<a href=${safeHref(v)} target="_blank" rel="noopener noreferrer">${v}</a>` },
  { key: 'angle', label: 'Angle' },
  { key: 'editor_name', label: 'Szerkesztő' },
  { key: 'editor_email', label: 'Szerk. email' },
  { key: 'deputy_editor', label: 'Helyettes' },
  { key: 'notes', label: 'Jegyzet' },
  { key: 'recent_relevant_articles', label: 'Cikkek', render: (v) => (Array.isArray(v) ? html`${v.map((a) => html`<div><a href=${safeHref(a.url)} target="_blank" rel="noopener noreferrer">${a.title}</a> <span class="faint">${a.date || ''}</span></div>`)}` : v) },
];
const FB_COLS = [
  { key: 'name', label: 'Csoport', render: (r) => html`<strong>${r.name}</strong>` },
  { key: 'members', label: 'Tagság', render: (r) => html`<span class="muted">${r.members || '–'}</span>` },
  { key: 'relevance_score', label: 'Relev.', render: (r) => html`<${Stars} n=${r.relevance_score} />` },
  { key: 'join_status', label: 'Csatlakozás', render: (r) => html`<${StatusBadge} value=${r.join_status} />` },
  { key: 'warmup_phase', label: 'Warmup' },
];
const FB_FIELDS = [
  { key: 'url', label: 'URL', render: (v) => html`<a href=${safeHref(v)} target="_blank" rel="noopener noreferrer">${v}</a>` },
  { key: 'category', label: 'Kategória' },
  { key: 'language', label: 'Nyelv' },
  { key: 'group_kind', label: 'Típus' },
  { key: 'discovered', label: 'Felfedezve' },
  { key: 'notes', label: 'Jegyzet' },
  { key: 'actions_log', label: 'Akciók', render: (v) => html`<div class="timeline">${(v || []).map((a) => html`<div class="ev">${a.date || ''} · ${a.text}</div>`)}</div>` },
  { key: 'incidents', label: 'Incidensek', render: (v) => html`<div class="timeline">${(v || []).map((a) => html`<div class="ev">${a.date || ''} · ${a.text}</div>`)}</div>` },
];

// ---------------------------------------------------------------- bootstrap
function Root() {
  const [authed, setAuthed] = useState(!!TOKEN);
  if (!authed) return html`<${Gate} onAuth=${() => setAuthed(true)} />`;
  return html`<${Shell} />`;
}
render(html`<${Root} />`, document.getElementById('app'));
