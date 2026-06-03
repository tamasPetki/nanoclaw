/**
 * Phase A ingest: mirror the worker's JSON/MD pipeline files into the
 * host-owned CRM DB so the data is durable (survives the context-compaction
 * losses that wiped venue_pipeline.json once before).
 *
 * Source of truth in Phase A = the JSON files; the DB is an indexed replica.
 * Idempotent upserts keyed by stable id. In Phase B a row's ingest_mode flips
 * to 'frozen' and ingest stops overwriting it (insert-new-only), so worker/UI
 * edits via the DB are not clobbered.
 *
 * Robustness over strictness: a malformed/partially-written file is skipped
 * for this cycle (retried next tick) and NEVER deletes existing rows.
 */
import crypto from 'crypto';
import fs from 'fs';

import { log } from '../log.js';
import { onShutdown } from '../response-registry.js';
import { getCrmDb } from './db.js';
import { exportCrmSnapshot } from './export-snapshot.js';
import { parseFbLog } from './parse-fb-log.js';
import { accountHealthSnapshots } from './ops-sanitize.js';
import { REZERVER_DIR, SOURCE_FILES } from './paths.js';

const VENUE_STATUS = new Set(['NOT_CONTACTED', 'CONTACTED', 'INTERESTED', 'ONBOARDED']);
const LEGIT = new Set(['pending', 'green', 'yellow', 'red']);
const MEDIA_STATUS = new Set(['NOT_CONTACTED', 'SENT', 'REPLIED']);

const fileHashes = new Map<string, string>();

function readFileMaybe(p: string): string | null {
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch {
    return null;
  }
}

function parseJsonMaybe<T>(raw: string | null, label: string): T | null {
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    // Likely a partial write mid-save — skip this cycle, retry next tick.
    log.warn('CRM ingest: JSON parse failed, skipping file this cycle', { label, err });
    return null;
  }
}

function hashOf(content: string): string {
  return crypto.createHash('sha1').update(content).digest('hex');
}

/**
 * Ingest one source file. The content hash is recorded ONLY after the ingest
 * succeeds, so a throwing ingest (e.g. a bad row) does NOT poison the hash —
 * the file is retried on the next tick. Each file is isolated: one file's
 * failure never aborts the others in the pass.
 */
function ingestFile(path: string, raw: string | null, fn: (raw: string) => void): boolean {
  if (raw == null) return false;
  const h = hashOf(raw);
  if (fileHashes.get(path) === h) return false;
  try {
    fn(raw);
    fileHashes.set(path, h);
    return true;
  } catch (err) {
    log.error('CRM ingest failed for file (will retry next tick)', { path, err });
    return false; // hash intentionally NOT recorded → retry next tick
  }
}

function num(v: unknown): number | null {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : null;
}

function ingestVenues(db: import('better-sqlite3').Database, raw: string, now: string): void {
  const doc = parseJsonMaybe<{ _meta?: { provenance?: string }; venues?: any[] }>(raw, 'venues');
  if (!doc?.venues) return;
  const prov = doc._meta?.provenance ?? null;
  const stmt = db.prepare(`
    INSERT INTO crm_venues (id, name, city, segment, tier, hook, trigger_event, status, legitimacy_check,
                            notes, source_provenance, created_at, updated_at)
    VALUES (@id, @name, @city, @segment, @tier, @hook, @trigger_event, @status, @legitimacy_check,
            @notes, @prov, @now, @now)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, city=excluded.city, segment=excluded.segment, tier=excluded.tier,
      hook=excluded.hook, trigger_event=excluded.trigger_event, status=excluded.status,
      legitimacy_check=excluded.legitimacy_check, notes=excluded.notes,
      source_provenance=excluded.source_provenance, updated_at=excluded.updated_at
    WHERE crm_venues.ingest_mode = 'mirror'
  `);
  db.transaction(() => {
    for (const v of doc.venues!) {
      const id = num(v?.id);
      if (id == null || !v?.name) continue; // non-numeric id would become NULL → autoassigned rowid → dupes
      stmt.run({
        id,
        name: String(v.name),
        city: v.city ?? null,
        segment: v.segment ?? null,
        tier: num(v.tier),
        hook: v.hook ?? null,
        trigger_event: v.trigger_event ?? null,
        status: VENUE_STATUS.has(v.status) ? v.status : 'NOT_CONTACTED',
        legitimacy_check: LEGIT.has(v.legitimacy_check) ? v.legitimacy_check : 'pending',
        notes: v.notes ?? null,
        prov,
        now,
      });
    }
  })();
}

function ingestReferrals(db: import('better-sqlite3').Database, raw: string, now: string): void {
  const arr = parseJsonMaybe<any[]>(raw, 'referrals');
  if (!Array.isArray(arr)) return;
  const stmt = db.prepare(`
    INSERT INTO crm_referral_partners (id, name, company, type, city, website, instagram, email,
                                       contact_known, tier, segment, note, venues_worked_with, status,
                                       last_touched, created_at, updated_at)
    VALUES (@id, @name, @company, @type, @city, @website, @instagram, @email,
            @contact_known, @tier, @segment, @note, @vww, @status, @last_touched, @now, @now)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, company=excluded.company, type=excluded.type, city=excluded.city,
      website=excluded.website, instagram=excluded.instagram, email=excluded.email,
      contact_known=excluded.contact_known, tier=excluded.tier, segment=excluded.segment,
      note=excluded.note, venues_worked_with=excluded.venues_worked_with, status=excluded.status,
      last_touched=excluded.last_touched, updated_at=excluded.updated_at
    WHERE crm_referral_partners.ingest_mode = 'mirror'
  `);
  db.transaction(() => {
    for (const p of arr) {
      const id = num(p?.id);
      if (id == null || !p?.name) continue;
      stmt.run({
        id,
        name: String(p.name),
        company: p.company ?? null,
        type: p.type ?? null,
        city: p.city ?? null,
        website: p.website ?? null,
        instagram: p.instagram ?? null,
        email: p.email ?? null,
        contact_known: p.contact_known ? 1 : 0,
        tier: num(p.tier),
        segment: p.segment ?? null,
        note: p.note ?? null,
        vww: JSON.stringify(p.venues_worked_with ?? []),
        status: p.status ?? 'NOT_CONTACTED',
        last_touched: p.last_touched ?? null,
        now,
      });
    }
  })();
}

function ingestMedia(db: import('better-sqlite3').Database, raw: string, now: string): void {
  const arr = parseJsonMaybe<any[]>(raw, 'media');
  if (!Array.isArray(arr)) return;
  const stmt = db.prepare(`
    INSERT INTO crm_media_outlets (site, url, email, contact_page, category, priority, angle, status,
                                   sent, followup, reply, editor_name, editor_email, deputy_editor,
                                   recent_relevant_articles, notes, created_at, updated_at)
    VALUES (@site, @url, @email, @contact_page, @category, @priority, @angle, @status,
            @sent, @followup, @reply, @editor_name, @editor_email, @deputy_editor,
            @rra, @notes, @now, @now)
    ON CONFLICT(site) DO UPDATE SET
      url=excluded.url, email=excluded.email, contact_page=excluded.contact_page,
      category=excluded.category, priority=excluded.priority, angle=excluded.angle, status=excluded.status,
      sent=excluded.sent, followup=excluded.followup, reply=excluded.reply,
      editor_name=excluded.editor_name, editor_email=excluded.editor_email, deputy_editor=excluded.deputy_editor,
      recent_relevant_articles=excluded.recent_relevant_articles, notes=excluded.notes, updated_at=excluded.updated_at
    WHERE crm_media_outlets.ingest_mode = 'mirror'
  `);
  db.transaction(() => {
    for (const m of arr) {
      if (!m?.site) continue;
      stmt.run({
        site: String(m.site),
        url: m.url ?? null,
        email: m.email ?? null,
        contact_page: m.contact_page ?? null,
        category: m.category ?? null,
        priority: m.priority ?? null,
        angle: m.angle ?? null,
        status: MEDIA_STATUS.has(m.status) ? m.status : 'NOT_CONTACTED',
        sent: m.sent ?? null,
        followup: m.followup ?? null,
        reply: m.reply ?? null,
        editor_name: m.editor_name ?? null,
        editor_email: m.editor_email ?? null,
        deputy_editor: m.deputy_editor ?? null,
        rra: JSON.stringify(m.recent_relevant_articles ?? []),
        notes: m.notes ?? null,
        now,
      });
    }
  })();
}

function ingestFbGroups(db: import('better-sqlite3').Database, raw: string, now: string): void {
  const groups = parseFbLog(raw);
  if (!groups.length) return;
  const stmt = db.prepare(`
    INSERT INTO crm_fb_groups (id, name, url, members, category, relevance_score, join_status,
                               approval_date, warmup_phase, language, group_kind, discovered, notes,
                               actions_log, incidents, raw_block, created_at, updated_at)
    VALUES (@id, @name, @url, @members, @category, @relevance_score, @join_status,
            @approval_date, @warmup_phase, @language, @group_kind, @discovered, @notes,
            @actions_log, @incidents, @raw_block, @now, @now)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, url=excluded.url, members=excluded.members, category=excluded.category,
      relevance_score=excluded.relevance_score, join_status=excluded.join_status,
      approval_date=excluded.approval_date, warmup_phase=excluded.warmup_phase, language=excluded.language,
      group_kind=excluded.group_kind, discovered=excluded.discovered, notes=excluded.notes,
      actions_log=excluded.actions_log, incidents=excluded.incidents, raw_block=excluded.raw_block,
      updated_at=excluded.updated_at
    WHERE crm_fb_groups.ingest_mode = 'mirror'
  `);
  db.transaction(() => {
    for (const g of groups) {
      stmt.run({
        id: g.id,
        name: g.name,
        url: g.url,
        members: g.members,
        category: g.category,
        relevance_score: g.relevance_score,
        join_status: g.join_status,
        approval_date: g.approval_date,
        warmup_phase: g.warmup_phase,
        language: g.language,
        group_kind: g.group_kind,
        discovered: g.discovered,
        notes: g.notes,
        actions_log: JSON.stringify(g.actions_log),
        incidents: JSON.stringify(g.incidents),
        raw_block: g.raw_block,
        now,
      });
    }
  })();
}

function ingestState(db: import('better-sqlite3').Database, raw: string, now: string): void {
  const state = parseJsonMaybe<Record<string, any>>(raw, 'state');
  if (!state) return;
  const snaps = accountHealthSnapshots(state);
  // Key on the host ingest day (NOT state.date — that's a hand-maintained
  // narrative field that lags, which would pin every snapshot to one stale row).
  // ON CONFLICT preserves created_at; one row per platform per actual day → history accumulates.
  const stmt = db.prepare(`
    INSERT INTO crm_account_health
      (id, platform, account, snapshot_at, daily_stats, weekly_stats, warmup_phase, incident_count, raw, created_at)
    VALUES (@id, @platform, @account, @snapshot_at, @daily, @weekly, @warmup_phase, @incident_count, @raw, @now)
    ON CONFLICT(id) DO UPDATE SET
      account=excluded.account, snapshot_at=excluded.snapshot_at, daily_stats=excluded.daily_stats,
      weekly_stats=excluded.weekly_stats, warmup_phase=excluded.warmup_phase,
      incident_count=excluded.incident_count, raw=excluded.raw
  `);
  const snapshotDate = now.slice(0, 10);
  db.transaction(() => {
    for (const s of snaps) {
      stmt.run({
        id: `${s.platform}:${snapshotDate}`,
        platform: s.platform,
        account: s.account,
        snapshot_at: snapshotDate,
        daily: s.daily_stats != null ? JSON.stringify(s.daily_stats) : null,
        weekly: s.weekly_stats != null ? JSON.stringify(s.weekly_stats) : null,
        warmup_phase: s.warmup_phase,
        incident_count: s.incident_count,
        raw: s.raw != null ? JSON.stringify(s.raw) : null,
        now,
      });
    }
  })();
}

/** Run a full ingest pass. Returns number of source files that changed. */
export function runCrmIngest(): number {
  const db = getCrmDb();
  const now = new Date().toISOString();
  let changedCount = 0;

  if (ingestFile(SOURCE_FILES.venues, readFileMaybe(SOURCE_FILES.venues), (raw) => ingestVenues(db, raw, now)))
    changedCount++;
  if (ingestFile(SOURCE_FILES.referrals, readFileMaybe(SOURCE_FILES.referrals), (raw) => ingestReferrals(db, raw, now)))
    changedCount++;
  if (ingestFile(SOURCE_FILES.media, readFileMaybe(SOURCE_FILES.media), (raw) => ingestMedia(db, raw, now)))
    changedCount++;
  if (ingestFile(SOURCE_FILES.fbGroups, readFileMaybe(SOURCE_FILES.fbGroups), (raw) => ingestFbGroups(db, raw, now)))
    changedCount++;
  if (ingestFile(SOURCE_FILES.state, readFileMaybe(SOURCE_FILES.state), (raw) => ingestState(db, raw, now)))
    changedCount++;

  if (changedCount) {
    log.info('CRM ingest pass', { changedFiles: changedCount });
    exportCrmSnapshot(); // refresh the worker's in-context .crm-export snapshot
  }
  return changedCount;
}

let watcher: fs.FSWatcher | null = null;
let interval: NodeJS.Timeout | null = null;
let debounce: NodeJS.Timeout | null = null;

export function startCrmIngest(): void {
  const intervalMs = parseInt(process.env.CRM_INGEST_INTERVAL_MS || '60000', 10);
  try {
    runCrmIngest();
  } catch (err) {
    log.error('CRM initial ingest failed', { err });
  }

  // fs.watch on the rezerver dir — prompt mirror of worker writes (debounced).
  try {
    watcher = fs.watch(REZERVER_DIR, () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        try {
          runCrmIngest();
        } catch (err) {
          log.error('CRM watch ingest failed', { err });
        }
      }, 1500);
    });
    // Without this, a watcher 'error' event would surface as an uncaught
    // exception. Drop the watcher on error; the interval keeps mirroring.
    watcher.on('error', (err) => {
      log.warn('CRM fs.watch error, falling back to interval', { err });
      watcher?.close();
      watcher = null;
    });
  } catch (err) {
    log.warn('CRM fs.watch unavailable, relying on interval', { err });
  }

  // Interval safety net (fs.watch misses are common on some filesystems).
  interval = setInterval(() => {
    try {
      runCrmIngest();
    } catch (err) {
      log.error('CRM interval ingest failed', { err });
    }
  }, intervalMs);

  onShutdown(() => {
    if (watcher) watcher.close();
    if (interval) clearInterval(interval);
    if (debounce) clearTimeout(debounce);
  });

  log.info('CRM ingest started', { intervalMs });
}
