/**
 * Rezerver CRM HTTP server.
 *
 * Node built-in `http` (minimal-deps, mirrors src/webhook-server.ts). Serves a
 * static SPA from src/crm/public/ and a JSON API at /api/*. Accessed over the
 * Tailscale private network; every /api/* request is gated by a Bearer token
 * (constant-time compare). Static shell assets load without auth so the SPA can
 * present a token-entry gate; all data lives behind /api/*.
 *
 * Phase A is read-only. Phase B write routes (PATCH/POST) are added later.
 */
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import { log } from '../log.js';
import { onShutdown } from '../response-registry.js';
import { getCrmDb } from './db.js';
import { sanitizeOps, scrubInlineCredentials } from './ops-sanitize.js';
import { SOURCE_FILES } from './paths.js';
import { ENTITIES, setEntity, addOutreach, addTask, setTaskDone, addCompetitor, addLegitimacy } from './write.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

let server: http.Server | null = null;

// Defense-in-depth headers on every response. The deployment is Tailscale-only;
// the CSP locks scripts/connections to same-origin so an exfil path (e.g. a
// poisoned href) can't beacon out, and X-Frame-Options blocks clickjacking.
function setSecHeaders(res: http.ServerResponse): void {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'self'",
  );
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  const s = JSON.stringify(body);
  setSecHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(s);
}

// Constant-time Bearer check. Hash both sides to a fixed length first so the
// comparison leaks neither length nor throws on mismatched input lengths.
function authOk(req: http.IncomingMessage, secret: string): boolean {
  const h = req.headers['authorization'];
  if (!h || !h.startsWith('Bearer ')) return false;
  const tok = crypto.createHash('sha256').update(h.slice(7)).digest();
  const exp = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(tok, exp);
}

// Enforce "Tailscale-only" in code, not just by deployment assumption: accept
// loopback + the Tailscale CGNAT range (100.64.0.0/10) + tailnet IPv6 (fd7a::/8).
function sourceAllowed(req: http.IncomingMessage): boolean {
  let ip = req.socket.remoteAddress || '';
  if (ip.startsWith('::ffff:')) ip = ip.slice(7); // IPv4-mapped IPv6
  if (ip === '127.0.0.1' || ip === '::1') return true;
  const m = ip.match(/^(\d+)\.(\d+)\./);
  if (m) {
    const a = +m[1];
    const b = +m[2];
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (Tailscale)
    return false;
  }
  return ip.toLowerCase().startsWith('fd7a:'); // Tailscale ULA
}

// Recursively redact inline credential shapes from every string leaf of a DB
// response. Belt-and-suspenders: free-text columns (notes, incidents,
// actions_log) can contain a pasted xs/cookie value even on business endpoints.
function scrubData<T>(value: T): T {
  if (typeof value === 'string') return scrubInlineCredentials(value) as unknown as T;
  if (Array.isArray(value)) return value.map(scrubData) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = scrubData(v);
    return out as unknown as T;
  }
  return value;
}

function serveStatic(res: http.ServerResponse, urlPath: string): void {
  // Map /crm, /crm/, / → index.html (SPA shell). Everything else → file.
  let rel = urlPath.replace(/^\/crm/, '') || '/';
  if (rel === '/' || rel === '') rel = '/index.html';
  const filePath = path.join(PUBLIC_DIR, path.normalize(rel));
  // Containment with a trailing separator so a sibling dir sharing the prefix
  // (e.g. `${PUBLIC_DIR}-evil`) can't escape the root.
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) {
    setSecHeaders(res);
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    setSecHeaders(res);
    if (err) {
      // SPA fallback: unknown non-asset path → index.html.
      if (!path.extname(filePath)) {
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e2, idx) => {
          setSecHeaders(res);
          if (e2) {
            res.writeHead(404);
            res.end('Not found');
          } else {
            res.writeHead(200, { 'Content-Type': MIME['.html'] });
            res.end(idx);
          }
        });
        return;
      }
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

// ---- JSON helpers ----
function parseJsonCols<T extends Record<string, any>>(row: T, cols: string[]): T {
  for (const c of cols) {
    if (typeof row[c] === 'string') {
      try {
        (row as any)[c] = JSON.parse(row[c]);
      } catch {
        /* leave as-is */
      }
    }
  }
  return row;
}

// ---- API route handlers ----
function apiVenues(url: URL): unknown {
  const db = getCrmDb();
  const where: string[] = [];
  const params: Record<string, unknown> = {};
  const eq = (col: string, key: string) => {
    const v = url.searchParams.get(key);
    if (v) {
      where.push(`${col} = @${key}`);
      params[key] = key === 'tier' ? parseInt(v, 10) : v;
    }
  };
  eq('status', 'status');
  eq('segment', 'segment');
  eq('city', 'city');
  eq('tier', 'tier');
  eq('legitimacy_check', 'legitimacy');
  const q = url.searchParams.get('q');
  if (q) {
    where.push('(name LIKE @q OR hook LIKE @q OR notes LIKE @q)');
    params.q = `%${q}%`;
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sortCol = ['name', 'tier', 'city', 'segment', 'status', 'id'].includes(url.searchParams.get('sort') || '')
    ? url.searchParams.get('sort')!
    : 'id';
  const dir = url.searchParams.get('dir') === 'desc' ? 'DESC' : 'ASC';
  const items = db.prepare(`SELECT * FROM crm_venues ${whereSql} ORDER BY ${sortCol} ${dir}`).all(params);
  const facetOf = (col: string) =>
    db
      .prepare(
        `SELECT ${col} AS value, count(*) AS n FROM crm_venues WHERE ${col} IS NOT NULL GROUP BY ${col} ORDER BY n DESC`,
      )
      .all();
  return {
    items,
    total: items.length,
    facets: {
      status: facetOf('status'),
      segment: facetOf('segment'),
      city: facetOf('city'),
      tier: facetOf('tier'),
      legitimacy_check: facetOf('legitimacy_check'),
    },
  };
}

function apiVenueDetail(id: number): unknown {
  const db = getCrmDb();
  const venue = db.prepare('SELECT * FROM crm_venues WHERE id = ?').get(id) as { name?: string } | undefined;
  if (!venue) return null;
  return {
    ...venue,
    // Referral partners who list this venue in venues_worked_with (heuristic
    // substring match against the JSON array text).
    related_partners: venue.name
      ? db
          .prepare(
            "SELECT id,name,company,type FROM crm_referral_partners WHERE venues_worked_with LIKE '%' || ? || '%'",
          )
          .all(venue.name)
      : [],
    legitimacy_checks: db
      .prepare('SELECT * FROM crm_legitimacy_checks WHERE venue_id = ? ORDER BY checked_at DESC')
      .all(id),
    outreach: db
      .prepare("SELECT * FROM crm_outreach WHERE target_type='venue' AND target_id = ? ORDER BY created_at DESC")
      .all(String(id)),
    stage_events: db
      .prepare("SELECT * FROM crm_stage_events WHERE target_type='venue' AND target_id = ? ORDER BY occurred_at DESC")
      .all(String(id)),
  };
}

const TARGET_NAME_JOIN = `
  LEFT JOIN crm_venues v            ON x.target_type='venue'    AND v.id = CAST(x.target_id AS INTEGER)
  LEFT JOIN crm_referral_partners rp ON x.target_type='referral' AND rp.id = CAST(x.target_id AS INTEGER)
  LEFT JOIN crm_media_outlets m      ON x.target_type='media'    AND m.site = x.target_id`;

function apiOutreach(url: URL): unknown {
  const db = getCrmDb();
  const where: string[] = [];
  const p: Record<string, unknown> = {};
  if (url.searchParams.get('status')) {
    where.push('x.status = @status');
    p.status = url.searchParams.get('status');
  }
  if (url.searchParams.get('target_type')) {
    where.push('x.target_type = @tt');
    p.tt = url.searchParams.get('target_type');
  }
  if (url.searchParams.get('follow_up'))
    where.push("x.follow_up_at IS NOT NULL AND x.status NOT IN ('closed','replied')");
  const sql = `SELECT x.*, COALESCE(v.name, rp.name, m.site) AS target_name FROM crm_outreach x ${TARGET_NAME_JOIN}
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY x.created_at DESC`;
  return { items: db.prepare(sql).all(p) };
}

function apiTasks(url: URL): unknown {
  const db = getCrmDb();
  const where: string[] = [];
  if (url.searchParams.get('done') !== '1') where.push('x.done = 0');
  const sql = `SELECT x.*, COALESCE(v.name, rp.name, m.site) AS target_name FROM crm_tasks x ${TARGET_NAME_JOIN}
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY (x.due_at IS NULL), x.due_at, x.created_at`;
  return { items: db.prepare(sql).all() };
}

function apiOverview(): unknown {
  const db = getCrmDb();
  const all = (sql: string, ...p: unknown[]) => db.prepare(sql).all(...p);
  const one = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  const venuesTotal = one('SELECT count(*) n FROM crm_venues');
  const legitDone = one("SELECT count(*) n FROM crm_venues WHERE legitimacy_check != 'pending'");
  return {
    counts: {
      venues: venuesTotal,
      referrals: one('SELECT count(*) n FROM crm_referral_partners'),
      media: one('SELECT count(*) n FROM crm_media_outlets'),
      fb_groups: one('SELECT count(*) n FROM crm_fb_groups'),
    },
    venues_by_status: all('SELECT status AS stage, count(*) AS n FROM crm_venues GROUP BY status'),
    venues_by_tier: all('SELECT tier AS stage, count(*) AS n FROM crm_venues GROUP BY tier ORDER BY tier'),
    legitimacy: {
      total: venuesTotal,
      done: legitDone,
      pending: venuesTotal - legitDone,
      by: all('SELECT legitimacy_check AS stage, count(*) AS n FROM crm_venues GROUP BY legitimacy_check'),
    },
    top_cities: all(
      'SELECT city AS stage, count(*) AS n FROM crm_venues WHERE city IS NOT NULL GROUP BY city ORDER BY n DESC LIMIT 10',
    ),
    media_status: all('SELECT status AS stage, count(*) AS n FROM crm_media_outlets GROUP BY status'),
    fb_join: all('SELECT join_status AS stage, count(*) AS n FROM crm_fb_groups GROUP BY join_status'),
    work_queue: {
      tier1_no_legit: all(
        "SELECT id,name,city FROM crm_venues WHERE tier=1 AND legitimacy_check='pending' ORDER BY name",
      ),
      fb_high_unrequested: all(
        "SELECT id,name,relevance_score FROM crm_fb_groups WHERE relevance_score>=5 AND join_status='NOT_YET_REQUESTED' ORDER BY name",
      ),
      media_high_uncontacted: all(
        "SELECT site,editor_name,priority FROM crm_media_outlets WHERE priority='HIGH' AND status='NOT_CONTACTED' ORDER BY site",
      ),
      partners_known_uncontacted: all(
        "SELECT id,name,email FROM crm_referral_partners WHERE contact_known=1 AND status='NOT_CONTACTED' ORDER BY tier, name",
      ),
    },
  };
}

function apiFunnel(): unknown {
  const db = getCrmDb();
  const grp = (table: string, col: string) =>
    db.prepare(`SELECT ${col} AS stage, count(*) AS n FROM ${table} GROUP BY ${col}`).all();
  return {
    venues_status: grp('crm_venues', 'status'),
    venues_legitimacy: grp('crm_venues', 'legitimacy_check'),
    venues_tier: grp('crm_venues', 'tier'),
    media_status: grp('crm_media_outlets', 'status'),
    referrals_status: grp('crm_referral_partners', 'status'),
    fb_join: grp('crm_fb_groups', 'join_status'),
  };
}

function apiSearch(q: string): unknown {
  const db = getCrmDb();
  const like = `%${q}%`;
  return {
    venues: db
      .prepare('SELECT id,name,city,segment,status FROM crm_venues WHERE name LIKE ? OR hook LIKE ? LIMIT 20')
      .all(like, like),
    referrals: db
      .prepare('SELECT id,name,company,type FROM crm_referral_partners WHERE name LIKE ? OR company LIKE ? LIMIT 20')
      .all(like, like),
    media: db
      .prepare(
        'SELECT site,editor_name,category FROM crm_media_outlets WHERE site LIKE ? OR editor_name LIKE ? LIMIT 20',
      )
      .all(like, like),
    fb_groups: db.prepare('SELECT id,name,join_status FROM crm_fb_groups WHERE name LIKE ? LIMIT 20').all(like),
  };
}

function apiOps(): unknown {
  try {
    const raw = fs.readFileSync(SOURCE_FILES.state, 'utf-8');
    return sanitizeOps(JSON.parse(raw));
  } catch {
    return null;
  }
}

function apiMeta(): unknown {
  const meta: Record<string, string | null> = {};
  for (const [k, p] of Object.entries(SOURCE_FILES)) {
    try {
      meta[k] = fs.statSync(p).mtime.toISOString();
    } catch {
      meta[k] = null;
    }
  }
  return { sources: meta, now: new Date().toISOString() };
}

function handleApi(req: http.IncomingMessage, res: http.ServerResponse, url: URL): void {
  const p = url.pathname;
  const db = getCrmDb();

  if (p === '/api/venues') return sendJson(res, 200, scrubData(apiVenues(url)));
  const vMatch = p.match(/^\/api\/venues\/(\d+)$/);
  if (vMatch) {
    const d = apiVenueDetail(parseInt(vMatch[1], 10));
    return d ? sendJson(res, 200, scrubData(d)) : sendJson(res, 404, { error: 'not found' });
  }
  if (p === '/api/referrals') {
    const rows = db.prepare('SELECT * FROM crm_referral_partners ORDER BY tier, name').all();
    return sendJson(res, 200, scrubData({ items: rows.map((r: any) => parseJsonCols(r, ['venues_worked_with'])) }));
  }
  if (p === '/api/media') {
    const rows = db
      .prepare(
        "SELECT * FROM crm_media_outlets ORDER BY CASE priority WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 WHEN 'LOW' THEN 2 ELSE 3 END, site",
      )
      .all();
    return sendJson(
      res,
      200,
      scrubData({ items: rows.map((r: any) => parseJsonCols(r, ['recent_relevant_articles'])) }),
    );
  }
  if (p === '/api/fb-groups') {
    // Explicit columns — raw_block (the verbatim markdown block) is operator-only
    // context, never exposed via the API (it can contain anything the worker logged).
    const rows = db
      .prepare(
        'SELECT id,name,url,members,category,relevance_score,join_status,approval_date,warmup_phase,language,group_kind,discovered,notes,actions_log,incidents,created_at,updated_at FROM crm_fb_groups ORDER BY relevance_score DESC, name',
      )
      .all();
    return sendJson(
      res,
      200,
      scrubData({ items: rows.map((r: any) => parseJsonCols(r, ['actions_log', 'incidents'])) }),
    );
  }
  if (p === '/api/competitors') {
    return sendJson(
      res,
      200,
      scrubData({ items: db.prepare('SELECT * FROM crm_competitors ORDER BY first_seen DESC').all() }),
    );
  }
  if (p === '/api/overview') return sendJson(res, 200, scrubData(apiOverview()));
  if (p === '/api/outreach') return sendJson(res, 200, scrubData(apiOutreach(url)));
  if (p === '/api/tasks') return sendJson(res, 200, scrubData(apiTasks(url)));
  if (p === '/api/funnel') return sendJson(res, 200, apiFunnel());
  if (p === '/api/ops') return sendJson(res, 200, apiOps());
  if (p === '/api/meta') return sendJson(res, 200, apiMeta());
  if (p === '/api/search') {
    const q = url.searchParams.get('q') || '';
    return sendJson(res, 200, q.length >= 2 ? apiSearch(q) : { venues: [], referrals: [], media: [], fb_groups: [] });
  }
  sendJson(res, 404, { error: 'unknown endpoint' });
}

function readBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c as Buffer));
    req.on('end', () => {
      try {
        const s = Buffer.concat(chunks).toString('utf-8');
        resolve(s ? (JSON.parse(s) as Record<string, unknown>) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Write path (PATCH/POST) — shares write.ts semantics with the `ncl` path.
// actor='ui' so stage-event audit records human edits distinctly.
function handleWrite(res: http.ServerResponse, url: URL, method: string, body: Record<string, unknown>): void {
  const p = url.pathname;
  const ok = (data: unknown) => sendJson(res, 200, scrubData(data));
  let m: RegExpMatchArray | null;

  if (method === 'PATCH' && (m = p.match(/^\/api\/venues\/(\d+)$/)))
    return ok(setEntity(ENTITIES.venue, { ...body, id: parseInt(m[1], 10) }, 'ui'));
  if (method === 'PATCH' && (m = p.match(/^\/api\/referrals\/(\d+)$/)))
    return ok(setEntity(ENTITIES.partner, { ...body, id: parseInt(m[1], 10) }, 'ui'));
  if (method === 'PATCH' && (m = p.match(/^\/api\/media\/(.+)$/)))
    return ok(setEntity(ENTITIES.media, { ...body, site: decodeURIComponent(m[1]) }, 'ui'));
  if (method === 'PATCH' && (m = p.match(/^\/api\/fb-groups\/(.+)$/)))
    return ok(setEntity(ENTITIES.fbgroup, { ...body, id: decodeURIComponent(m[1]) }, 'ui'));
  if (method === 'POST' && p === '/api/outreach') return ok(addOutreach(body));
  if (method === 'POST' && p === '/api/tasks') return ok(addTask(body));
  if (method === 'PATCH' && (m = p.match(/^\/api\/tasks\/(.+)$/)))
    return ok(setTaskDone(decodeURIComponent(m[1]), !!body.done));
  if (method === 'POST' && p === '/api/legitimacy') return ok(addLegitimacy(body, 'ui'));
  if (method === 'POST' && p === '/api/competitors') return ok(addCompetitor(body));
  sendJson(res, 404, { error: 'unknown write endpoint' });
}

export function startCrmServer(opts: { port: number; secret: string }): void {
  if (server) return;

  server = http.createServer((req, res) => {
    // Network-level guard: only loopback + the Tailscale range. Enforces the
    // "private dashboard" guarantee in code, not just by deployment.
    if (!sourceAllowed(req)) {
      setSecHeaders(res);
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const p = url.pathname;

    if (p === '/api/health') return sendJson(res, 200, { ok: true });

    if (p.startsWith('/api/')) {
      if (!authOk(req, opts.secret)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end('{"error":"unauthorized"}');
        return;
      }
      const method = req.method || 'GET';
      if (method === 'GET') {
        try {
          handleApi(req, res, url);
        } catch (err) {
          log.error('CRM API error', { path: p, err });
          sendJson(res, 500, { error: 'internal' });
        }
      } else if (method === 'PATCH' || method === 'POST') {
        readBody(req)
          .then((body) => handleWrite(res, url, method, body))
          .catch((err) => sendJson(res, 400, { error: errMsg(err) }));
      } else {
        sendJson(res, 405, { error: 'method not allowed' });
      }
      return;
    }

    // Static SPA (no auth — shell only; data is behind /api/*).
    serveStatic(res, p);
  });

  server.listen(opts.port, '0.0.0.0', () => {
    log.info('Rezerver CRM server started', { port: opts.port });
  });

  onShutdown(async () => {
    if (server) await new Promise<void>((r) => server!.close(() => r()));
    server = null;
  });
}
