import type Database from 'better-sqlite3';

import type { CrmMigration } from './index.js';

/**
 * Durable warmup-state store. The worker's account-warmup state (reddit lurk
 * cadence + cumulative counters, fb warmup phase) previously lived only in the
 * ephemeral workspace file groups/worker/rezerver/state.json, which was lost
 * twice on container rebuild. This table is the host-owned durable backstop:
 * the ingest mirrors state.json here, and the host restores the file from here
 * when it goes missing. One row per logical block (reddit / fb / meta).
 */
export const migration003: CrmMigration = {
  version: 3,
  name: '003-warmup-state',
  up(db: Database.Database) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS crm_warmup_state (
        key        TEXT PRIMARY KEY,
        platform   TEXT,
        account    TEXT,
        state      TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by TEXT
      );
    `);
  },
};
