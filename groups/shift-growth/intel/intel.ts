#!/usr/bin/env bun
/**
 * `intel` — the canonical intelligence store for the product-incubator team (CORE tool).
 *
 * Tomi's rule (2026-06-15): structured/growing data → THIS DB, never md/json files.
 * Agents reach for files by default and they don't scale; the DB does. Run from the
 * agent workspace:  bun intel/intel.ts <verb> [--flags]
 *
 * The DB (intel.db) sits next to this script and is durable (bind-mounted workspace +
 * nightly backup). Schema is versioned in ./migrations.ts and applied on every run.
 *
 * Verbs:
 *   competitor add|list        pain add|list        target add|list
 *   channel add|list           gtm add|list         insight add|list
 *   source add|list            stats                query "<SELECT ...>"
 *   import <file.json>         maintain
 *
 * Use `intel <noun> help` or `intel help` for flags. bun:sqlite: positional `?` params only.
 */
import { Database } from 'bun:sqlite';
import { join } from 'node:path';
import { runMigrations } from './migrations.ts';

const DB_PATH = join(import.meta.dir, 'intel.db');

function open(): Database {
  const db = new Database(DB_PATH, { create: true });
  db.exec('PRAGMA journal_mode = DELETE;');
  db.exec('PRAGMA busy_timeout = 5000;');
  runMigrations(
    (sql) => db.exec(sql),
    () => (db.query('PRAGMA user_version').get() as { user_version: number }).user_version,
    (v) => db.exec(`PRAGMA user_version = ${v}`),
  );
  return db;
}

// ---- arg parsing -----------------------------------------------------------
function parseFlags(argv: string[]): { _: string[]; flags: Record<string, string> } {
  const _: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next === undefined || next.startsWith('--')) {
          flags[a.slice(2)] = 'true';
        } else {
          flags[a.slice(2)] = next;
          i++;
        }
      }
    } else {
      _.push(a);
    }
  }
  return { _, flags };
}

function die(msg: string): never {
  console.error(`error: ${msg}`);
  process.exit(1);
}

// ---- table specs (columns the CLI accepts on `add`) ------------------------
type Spec = { table: string; cols: string[]; required: string[]; conflict?: string; bump?: string };
const SPECS: Record<string, Spec> = {
  competitor: {
    table: 'competitors',
    cols: ['name', 'region', 'pricing', 'key_features', 'strengths', 'weaknesses', 'ai_status', 'last_move', 'url'],
    required: ['name'],
    conflict: 'name',
  },
  pain: {
    table: 'pain_signals',
    cols: ['dedup_key', 'title', 'description', 'vertical', 'severity', 'frequency', 'source_quote', 'source_url', 'brief_ref', 'verdict'],
    required: ['dedup_key', 'title'],
    conflict: 'dedup_key',
    bump: 'frequency', // re-add bumps frequency + refreshes last_seen_at
  },
  target: {
    table: 'outreach_targets',
    cols: ['name', 'segment', 'profile', 'why_fit', 'warm_status', 'contact', 'source', 'notes'],
    required: ['name'],
    conflict: 'name',
  },
  channel: {
    table: 'channels',
    cols: ['name', 'kind', 'reach_size', 'access', 'cost', 'priority', 'status', 'url', 'notes'],
    required: ['name'],
    conflict: 'name',
  },
  gtm: {
    table: 'gtm_notes',
    cols: ['category', 'title', 'content', 'hypothesis', 'evidence', 'rationale', 'alternative_rejected', 'status'],
    required: ['title'],
  },
  insight: {
    table: 'insights',
    cols: ['domain', 'title', 'body'],
    required: ['title'],
  },
  source: {
    table: 'sources',
    cols: ['url', 'title', 'kind', 'note'],
    required: ['url'],
    conflict: 'url',
  },
};

function doAdd(db: Database, noun: string, flags: Record<string, string>): void {
  const spec = SPECS[noun];
  if (!spec) die(`unknown noun '${noun}'`);
  for (const r of spec.required) if (!flags[r]) die(`--${r} is required for '${noun} add'`);

  const present = spec.cols.filter((c) => flags[c] !== undefined);

  // Upsert on conflict column.
  if (spec.conflict && flags[spec.conflict] !== undefined) {
    const existing = db
      .query(`SELECT * FROM ${spec.table} WHERE ${spec.conflict} = ?`)
      .get(flags[spec.conflict]) as Record<string, unknown> | null;
    if (existing) {
      // dedup bump (pains): frequency += (given freq or 1), refresh last_seen
      if (spec.bump) {
        const inc = flags.frequency ? parseInt(flags.frequency, 10) || 1 : 1;
        const setCols = present.filter((c) => c !== spec.conflict && c !== spec.bump && flags[c]);
        const sets = [
          `${spec.bump} = ${spec.bump} + ?`,
          'last_seen_at = datetime(\'now\')',
          ...setCols.map((c) => `${c} = ?`),
        ];
        const vals: unknown[] = [inc, ...setCols.map((c) => flags[c]), flags[spec.conflict]];
        db.run(`UPDATE ${spec.table} SET ${sets.join(', ')} WHERE ${spec.conflict} = ?`, vals);
        console.log(`bumped ${noun} '${flags[spec.conflict]}' (id=${existing.id}, ${spec.bump}=${(existing[spec.bump] as number) + inc})`);
        return;
      }
      // generic upsert: update provided cols + updated_at if the table has it
      const setCols = present.filter((c) => c !== spec.conflict);
      const hasUpdated = ['competitors', 'outreach_targets', 'channels'].includes(spec.table);
      const sets = [...setCols.map((c) => `${c} = ?`), ...(hasUpdated ? ["updated_at = datetime('now')"] : [])];
      if (sets.length) {
        db.run(`UPDATE ${spec.table} SET ${sets.join(', ')} WHERE ${spec.conflict} = ?`, [...setCols.map((c) => flags[c]), flags[spec.conflict]]);
      }
      console.log(`updated ${noun} '${flags[spec.conflict]}' (id=${existing.id})`);
      return;
    }
  }

  const insCols = present.length ? present : spec.required;
  const placeholders = insCols.map(() => '?').join(', ');
  const r = db.run(
    `INSERT INTO ${spec.table} (${insCols.join(', ')}) VALUES (${placeholders})`,
    insCols.map((c) => flags[c]),
  );
  console.log(`added ${noun} (id=${r.lastInsertRowid})`);
}

function doList(db: Database, noun: string, flags: Record<string, string>): void {
  const spec = SPECS[noun];
  if (!spec) die(`unknown noun '${noun}'`);
  const limit = flags.limit ? parseInt(flags.limit, 10) : 100;
  let where = '';
  const params: unknown[] = [];
  // simple --field value filters
  for (const c of spec.cols) {
    if (flags[c] !== undefined && c !== 'limit') {
      where += where ? ' AND ' : ' WHERE ';
      where += `${c} = ?`;
      params.push(flags[c]);
    }
  }
  const order = noun === 'pain' ? 'frequency DESC, id DESC' : noun === 'channel' ? 'priority ASC, id DESC' : 'id DESC';
  const rows = db.query(`SELECT * FROM ${spec.table}${where} ORDER BY ${order} LIMIT ${limit}`).all(...params) as Record<string, unknown>[];
  if (!rows.length) {
    console.log('(none)');
    return;
  }
  for (const row of rows) {
    const parts = Object.entries(row)
      .filter(([k, v]) => v !== null && v !== '' && k !== 'created_at' && k !== 'updated_at' && k !== 'first_seen' && k !== 'last_checked')
      .map(([k, v]) => `${k}=${String(v).replace(/\s+/g, ' ').slice(0, 200)}`);
    console.log(`- ${parts.join(' | ')}`);
  }
  console.log(`(${rows.length} row${rows.length === 1 ? '' : 's'})`);
}

const HAS_UPDATED = ['competitors', 'outreach_targets', 'channels'];

function doUpdate(db: Database, noun: string, flags: Record<string, string>): void {
  const spec = SPECS[noun];
  if (!spec) die(`unknown noun '${noun}'`);
  const id = flags.id;
  if (!id) die(`--id is required for '${noun} update'`);
  if (!/^\d+$/.test(id)) die('--id must be a positive integer');
  const setCols = spec.cols.filter((c) => flags[c] !== undefined);
  if (!setCols.length) die(`no updatable fields given — cols: ${spec.cols.join(', ')}`);
  const existing = db.query(`SELECT id FROM ${spec.table} WHERE id = ?`).get(id) as { id: number } | null;
  if (!existing) die(`${noun} id=${id} not found`);
  const sets = [
    ...setCols.map((c) => `${c} = ?`),
    ...(HAS_UPDATED.includes(spec.table) ? ["updated_at = datetime('now')"] : []),
  ];
  db.run(`UPDATE ${spec.table} SET ${sets.join(', ')} WHERE id = ?`, [...setCols.map((c) => flags[c]), id]);
  console.log(`updated ${noun} (id=${id}, fields: ${setCols.join(', ')})`);
}

function doDelete(db: Database, noun: string, flags: Record<string, string>): void {
  const spec = SPECS[noun];
  if (!spec) die(`unknown noun '${noun}'`);
  const id = flags.id;
  if (!id) die(`--id is required for '${noun} delete'`);
  if (!/^\d+$/.test(id)) die('--id must be a positive integer');
  const existing = db.query(`SELECT id FROM ${spec.table} WHERE id = ?`).get(id) as { id: number } | null;
  if (!existing) die(`${noun} id=${id} not found`);
  db.run(`DELETE FROM ${spec.table} WHERE id = ?`, [id]);
  console.log(`deleted ${noun} (id=${id})`);
}

function doStats(db: Database): void {
  const tables = ['competitors', 'pain_signals', 'outreach_targets', 'channels', 'gtm_notes', 'insights', 'sources'];
  const v = (db.query('PRAGMA user_version').get() as { user_version: number }).user_version;
  console.log(`intel.db (schema v${v}) @ ${DB_PATH}`);
  for (const t of tables) {
    const c = (db.query(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;
    console.log(`  ${t.padEnd(18)} ${c}`);
  }
}

function doQuery(db: Database, sql: string): void {
  if (!/^\s*select\s/i.test(sql)) die('query only allows SELECT');
  const rows = db.query(sql).all() as Record<string, unknown>[];
  console.log(JSON.stringify(rows, null, 2));
}

function doImport(db: Database, file: string): void {
  const data = JSON.parse(require('node:fs').readFileSync(file, 'utf8')) as Record<string, Record<string, string>[]>;
  const nounByTable: Record<string, string> = Object.fromEntries(Object.entries(SPECS).map(([n, s]) => [s.table, n]));
  let total = 0;
  const tx = db.transaction(() => {
    for (const [key, rows] of Object.entries(data)) {
      const noun = SPECS[key] ? key : nounByTable[key];
      if (!noun) {
        console.error(`skip unknown key '${key}'`);
        continue;
      }
      for (const row of rows) {
        doAddSilent(db, noun, row);
        total++;
      }
    }
  });
  tx();
  console.log(`imported ${total} row(s)`);
}

function doAddSilent(db: Database, noun: string, row: Record<string, string>): void {
  const spec = SPECS[noun];
  const present = spec.cols.filter((c) => row[c] !== undefined && row[c] !== null);
  if (spec.conflict && row[spec.conflict] !== undefined) {
    const exists = db.query(`SELECT id FROM ${spec.table} WHERE ${spec.conflict} = ?`).get(row[spec.conflict]);
    if (exists) return; // import is idempotent; skip dup
  }
  const cols = present.length ? present : spec.required;
  db.run(
    `INSERT OR IGNORE INTO ${spec.table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
    cols.map((c) => row[c]),
  );
}

function doMaintain(db: Database): void {
  console.log('=== intel maintenance ===');
  doStats(db);
  // duplicate pain titles with different keys (structure smell)
  const dupPains = db
    .query(`SELECT title, COUNT(*) n FROM pain_signals GROUP BY lower(title) HAVING n > 1`)
    .all() as { title: string; n: number }[];
  if (dupPains.length) {
    console.log('\n⚠ possible duplicate pains (same title, different dedup_key):');
    for (const d of dupPains) console.log(`  - "${d.title}" ×${d.n}`);
  }
  // targets/competitors missing a source
  const noSrcComp = (db.query(`SELECT COUNT(*) n FROM competitors WHERE url IS NULL OR url=''`).get() as { n: number }).n;
  if (noSrcComp) console.log(`\n⚠ ${noSrcComp} competitor(s) without a source url`);
  console.log('\nok — fix structure smells early; never build on faulty foundations.');
}

const HELP = `intel — canonical intelligence store (DB, not md/json)

  intel stats
  intel competitor add --name X --region intl|hu --pricing .. --ai_status .. --weaknesses .. --url ..
  intel pain add --dedup_key slug --title .. --severity validated|weak --frequency N --source_quote .. --source_url .. --brief_ref 1|new --verdict ..
  intel target add --name .. --segment .. --warm_status cold|talking|pilot --why_fit .. --source ..
  intel channel add --name .. --kind association|event|fb-group --priority 1 --access .. --cost .. --url ..
  intel gtm add --category positioning|pricing|channel|decision --title .. --content .. --rationale .. --alternative_rejected ..
  intel insight add --domain wedge|pain|competitor --title .. --body ..
  intel source add --url .. --title .. --kind article|forum|vendor
  intel <noun> list [--<field> value] [--limit N]
  intel <noun> update --id N --<field> value [...]   (edit a row by id)
  intel <noun> delete --id N                          (remove a row by id)
  intel query "SELECT ... "            (SELECT only)
  intel import migration.json          (bulk; idempotent)
  intel maintain                       (structure-smell + counts)

Re-adding a pain with the same --dedup_key bumps its frequency (dedup). Other nouns upsert on their unique key.
update/delete operate by numeric id (find it via list/query); update touches only the --fields you pass.`;

// ---- main ------------------------------------------------------------------
const { _, flags } = parseFlags(process.argv.slice(2));
const [a, b] = _;

if (!a || a === 'help' || a === '--help') {
  console.log(HELP);
  process.exit(0);
}

const db = open();
try {
  if (a === 'stats') doStats(db);
  else if (a === 'maintain') doMaintain(db);
  else if (a === 'query') doQuery(db, b ?? die('query needs a SELECT string'));
  else if (a === 'import') doImport(db, b ?? die('import needs a file path'));
  else if (SPECS[a]) {
    if (b === 'add') doAdd(db, a, flags);
    else if (b === 'list') doList(db, a, flags);
    else if (b === 'update') doUpdate(db, a, flags);
    else if (b === 'delete') doDelete(db, a, flags);
    else if (b === 'help' || !b) console.log(HELP);
    else die(`unknown verb '${b}' for '${a}'`);
  } else {
    die(`unknown command '${a}' — try: intel help`);
  }
} finally {
  db.close();
}
