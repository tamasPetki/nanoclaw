/**
 * Durable warmup-state for the worker's account-warmup data (reddit/fb).
 *
 * Problem this solves: the worker keeps cumulative warmup state in
 * `groups/worker/rezerver/state.json` (reddit lurk cadence, cumulative karma,
 * fb warmup phase, etc.). That workspace file has gone missing twice (06-02,
 * 06-04) — most likely an interrupted non-atomic write when the container was
 * killed during a rebuild/respawn. Losing it forces a from-scratch
 * reconstruction and drops cumulative counters.
 *
 * Fix: the host CRM DB becomes the durable source of record. On every ingest
 * the host mirrors state.json into `crm_warmup_state` (split into per-platform
 * rows). If state.json ever goes MISSING, the host re-materializes it from the
 * DB on the next ingest pass (and on startup) — see restoreStateFileIfMissing.
 * The worker keeps writing state.json exactly as before; the DB is a backstop.
 *
 * The worker can also read the authoritative durable copy on demand via
 * `ncl rezerver warmup-get` (goes container→host→DB, independent of any
 * workspace file surviving).
 */
import fs from 'fs';

import { log } from '../log.js';
import { SOURCE_FILES } from './paths.js';

const CONTAINER_UID = 1000;
const CONTAINER_GID = 1000;

export interface WarmupBlock {
  key: string;
  platform: string | null;
  account: string | null;
  state: Record<string, unknown>;
}

/**
 * Split the flat state.json into durable per-platform blocks. Lossless: every
 * top-level key lands in exactly one block (reddit / fb / meta catch-all), so
 * reconstructState() round-trips it back without dropping anything.
 */
export function splitState(state: Record<string, unknown>): WarmupBlock[] {
  const fb: Record<string, unknown> = {};
  const meta: Record<string, unknown> = {};
  let reddit: Record<string, unknown> | null = null;

  for (const [k, v] of Object.entries(state)) {
    if (k === 'reddit') reddit = v as Record<string, unknown>;
    else if (k === 'fb' || k === 'fb_account' || k.startsWith('fb_')) fb[k] = v;
    else meta[k] = v;
  }

  const blocks: WarmupBlock[] = [];
  if (reddit && Object.keys(reddit).length) {
    blocks.push({
      key: 'reddit',
      platform: 'reddit',
      account: (reddit.username_actual as string) ?? (reddit.username_target as string) ?? null,
      state: reddit,
    });
  }
  if (Object.keys(fb).length) {
    const acct = (fb.fb_account as Record<string, unknown> | undefined)?.c_user as string | undefined;
    blocks.push({ key: 'fb', platform: 'facebook', account: acct ?? null, state: fb });
  }
  if (Object.keys(meta).length) {
    blocks.push({ key: 'meta', platform: null, account: null, state: meta });
  }
  return blocks;
}

/** Reverse of splitState: rebuild the flat state.json shape from durable rows. */
export function reconstructState(rows: { key: string; state: string }[]): Record<string, unknown> {
  const byKey: Record<string, Record<string, unknown>> = {};
  for (const r of rows) {
    try {
      byKey[r.key] = JSON.parse(r.state);
    } catch {
      /* skip unparseable row */
    }
  }
  let out: Record<string, unknown> = {};
  if (byKey.meta) out = { ...byKey.meta };
  if (byKey.fb) Object.assign(out, byKey.fb);
  if (byKey.reddit) out.reddit = byKey.reddit;
  out._restored_from_crm_db_at = new Date().toISOString();
  return out;
}

/** Mirror the current state.json into crm_warmup_state (durable replica). */
export function mirrorWarmupState(
  db: import('better-sqlite3').Database,
  state: Record<string, unknown>,
  now: string,
  updatedBy = 'ingest',
): void {
  const blocks = splitState(state);
  if (!blocks.length) return;
  const stmt = db.prepare(`
    INSERT INTO crm_warmup_state (key, platform, account, state, updated_at, updated_by)
    VALUES (@key, @platform, @account, @state, @now, @by)
    ON CONFLICT(key) DO UPDATE SET
      platform=excluded.platform, account=excluded.account, state=excluded.state,
      updated_at=excluded.updated_at, updated_by=excluded.updated_by
  `);
  db.transaction(() => {
    for (const b of blocks) {
      stmt.run({
        key: b.key,
        platform: b.platform,
        account: b.account,
        state: JSON.stringify(b.state),
        now,
        by: updatedBy,
      });
    }
  })();
}

/**
 * Rebuild-proofing: if state.json is MISSING (ENOENT — the loss signature seen
 * on 06-02/06-04) and the DB holds durable warmup-state, re-materialize the
 * file from the DB and chown it to the container UID. Only fires on a fully
 * absent file — a present-but-short file (mid-write) is left alone so we never
 * race a legitimate in-progress write. Returns true if a restore happened.
 */
export function restoreStateFileIfMissing(db: import('better-sqlite3').Database): boolean {
  if (fs.existsSync(SOURCE_FILES.state)) return false;
  const rows = db.prepare('SELECT key, state FROM crm_warmup_state').all() as { key: string; state: string }[];
  if (!rows.length) return false;
  try {
    const reconstructed = reconstructState(rows);
    fs.writeFileSync(SOURCE_FILES.state, JSON.stringify(reconstructed, null, 2));
    try {
      fs.chownSync(SOURCE_FILES.state, CONTAINER_UID, CONTAINER_GID);
    } catch {
      /* not root — ignore */
    }
    log.warn('Restored worker state.json from CRM DB (file was missing)', {
      path: SOURCE_FILES.state,
      keys: rows.map((r) => r.key),
    });
    return true;
  } catch (err) {
    log.error('Failed to restore state.json from CRM DB', { err });
    return false;
  }
}

/** Read the durable warmup-state from the DB (authoritative). For `ncl warmup-get`. */
export function getWarmupState(db: import('better-sqlite3').Database, key?: string): unknown {
  const rows = (
    key
      ? db
          .prepare('SELECT key, platform, account, state, updated_at, updated_by FROM crm_warmup_state WHERE key = ?')
          .all(key)
      : db
          .prepare('SELECT key, platform, account, state, updated_at, updated_by FROM crm_warmup_state ORDER BY key')
          .all()
  ) as { key: string; platform: string; account: string; state: string; updated_at: string; updated_by: string }[];
  return rows.map((r) => ({ ...r, state: safeParse(r.state) }));
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
