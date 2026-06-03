/**
 * Rezerver CRM — dedicated host-owned SQLite store.
 *
 * Separate file from the central `data/v2.db` on purpose: the CRM is an
 * application dataset, not core infra. Keeping it apart means its own
 * migration chain, its own backups, and zero risk of bloating the system DB
 * that everything else depends on.
 *
 * Single writer = the host `nanoclaw-v2` process. This file is NEVER
 * bind-mounted into a container, so the cross-mount `journal_mode=DELETE`
 * hazard (see container/agent-runner/src/db/connection.ts) does not apply —
 * we can safely use WAL here.
 *
 * The worker reaches this data in Phase B through the `ncl` container→host
 * transport (host applies the write), never by touching this file directly.
 */
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

import { DATA_DIR } from '../config.js';
import { log } from '../log.js';
import { crmMigrations } from './migrations/index.js';

let _crmDb: Database.Database | null = null;

export function getCrmDb(): Database.Database {
  if (_crmDb) return _crmDb;
  const dbPath = path.join(DATA_DIR, 'rezerver-crm.db');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  _crmDb = new Database(dbPath);
  _crmDb.pragma('journal_mode = WAL');
  _crmDb.pragma('foreign_keys = ON');
  runCrmMigrations(_crmDb);
  log.info('Rezerver CRM DB ready', { path: dbPath });
  return _crmDb;
}

export function closeCrmDb(): void {
  _crmDb?.close();
  _crmDb = null;
}

function runCrmMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      name    TEXT NOT NULL,
      applied TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_schema_version_name ON schema_version(name);
  `);
  const applied = new Set<string>(
    (db.prepare('SELECT name FROM schema_version').all() as { name: string }[]).map((r) => r.name),
  );
  const pending = crmMigrations.filter((m) => !applied.has(m.name));
  if (pending.length === 0) return;
  log.info('Running CRM migrations', { count: pending.length });
  for (const m of pending) {
    db.transaction(() => {
      m.up(db);
      const next = (db.prepare('SELECT COALESCE(MAX(version), 0) + 1 AS v FROM schema_version').get() as { v: number })
        .v;
      db.prepare('INSERT INTO schema_version (version, name, applied) VALUES (?, ?, ?)').run(
        next,
        m.name,
        new Date().toISOString(),
      );
    })();
    log.info('CRM migration applied', { name: m.name });
  }
}
