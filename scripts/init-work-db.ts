/**
 * Initialize / migrate the Axiom work-tracker DB from the host (better-sqlite3).
 *
 * The container CLI (`groups/shift-lead/work/work.ts`, bun:sqlite) self-migrates
 * on every run too — this host entry point lets the operator create/inspect/migrate
 * the same file without bun. Schema is the shared `migrations.ts`.
 *
 * Usage: pnpm exec tsx scripts/init-work-db.ts
 */
import Database from 'better-sqlite3';
import path from 'path';
import { MIGRATIONS, runMigrations } from '../groups/shift-lead/work/migrations.ts';

const DB_PATH = path.join('/root/nanoclaw-v2/groups/shift-lead/work/work.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = DELETE');
db.pragma('busy_timeout = 5000');

const applied = runMigrations(
  (sql) => db.exec(sql),
  () => db.pragma('user_version', { simple: true }) as number,
  (v) => db.pragma(`user_version = ${v}`),
);

console.log(`work.db @ ${DB_PATH}`);
console.log(`schema version: ${applied} (latest defined: ${MIGRATIONS[MIGRATIONS.length - 1].version})`);
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[];
console.log('tables:', tables.map((t) => t.name).filter((n) => n !== 'sqlite_sequence').join(', '));
db.close();
