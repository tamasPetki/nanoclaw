/**
 * Intel DB schema — versioned migrations (CORE tool, project-agnostic).
 *
 * Shared by the container CLI (`intel.ts`, bun:sqlite) and the host init/import
 * (`scripts/init-intel-db.ts`, better-sqlite3). Pure data — NO runtime imports —
 * so both Node (tsx) and Bun can import it.
 *
 * Growth rule (Tomi, 2026-06-15): structured/growing data lives in this DB, never
 * in md/json files. The schema is designed to evolve — append a new {version} here,
 * never edit a shipped migration. Both runtimes apply pending migrations on startup
 * via PRAGMA user_version (idempotent).
 *
 * The schema is product-agnostic (competitors / pains / targets / channels / gtm /
 * insights / sources) so it carries across projects; only the DB *data* is per-project
 * and archives on switch-project.
 */
export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'init',
    sql: `
      CREATE TABLE IF NOT EXISTS competitors (
        id          INTEGER PRIMARY KEY,
        name        TEXT NOT NULL UNIQUE,
        region      TEXT,                       -- intl | hu | regional
        pricing     TEXT,
        key_features TEXT,
        strengths   TEXT,
        weaknesses  TEXT,
        ai_status   TEXT,
        last_move   TEXT,
        url         TEXT,
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_competitors_region ON competitors(region);

      CREATE TABLE IF NOT EXISTS pain_signals (
        id           INTEGER PRIMARY KEY,
        dedup_key    TEXT NOT NULL UNIQUE,      -- stable slug; re-add bumps frequency
        title        TEXT NOT NULL,
        description  TEXT,
        vertical     TEXT,                      -- e.g. construction
        severity     TEXT,                      -- validated-strong | validated | weak | unvalidated
        frequency    INTEGER NOT NULL DEFAULT 1,
        source_quote TEXT,
        source_url   TEXT,
        brief_ref    TEXT,                      -- brief pain # it maps to, or 'new'
        verdict      TEXT,
        created_at   TEXT NOT NULL DEFAULT (datetime('now')),
        last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_pain_vertical ON pain_signals(vertical);
      CREATE INDEX IF NOT EXISTS idx_pain_freq ON pain_signals(frequency DESC);

      CREATE TABLE IF NOT EXISTS outreach_targets (
        id          INTEGER PRIMARY KEY,
        name        TEXT NOT NULL UNIQUE,       -- segment or specific company
        segment     TEXT,
        profile     TEXT,
        why_fit     TEXT,
        warm_status TEXT NOT NULL DEFAULT 'cold', -- cold|identified|contacted|talking|pilot|lost
        contact     TEXT,
        source      TEXT,
        notes       TEXT,
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_targets_status ON outreach_targets(warm_status);

      CREATE TABLE IF NOT EXISTS channels (
        id          INTEGER PRIMARY KEY,
        name        TEXT NOT NULL UNIQUE,
        kind        TEXT,                       -- association|event|directory|fb-group|community|ads|content
        reach_size  TEXT,
        access      TEXT,                       -- how to reach / contact
        cost        TEXT,
        priority    INTEGER,                    -- 1 = highest
        status      TEXT NOT NULL DEFAULT 'untested', -- untested|testing|works|dead
        url         TEXT,
        notes       TEXT,
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_channels_priority ON channels(priority);

      CREATE TABLE IF NOT EXISTS gtm_notes (
        id                   INTEGER PRIMARY KEY,
        category             TEXT,              -- positioning|pricing|channel|audience|decision|todo
        title                TEXT NOT NULL,
        content              TEXT,
        hypothesis           TEXT,
        evidence             TEXT,
        rationale            TEXT,
        alternative_rejected TEXT,
        status               TEXT NOT NULL DEFAULT 'open', -- open|validated|rejected|done
        created_at           TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_gtm_category ON gtm_notes(category);

      CREATE TABLE IF NOT EXISTS insights (
        id         INTEGER PRIMARY KEY,
        domain     TEXT,                        -- competitor|pain|gtm|wedge|cross
        title      TEXT NOT NULL,
        body       TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sources (
        id           INTEGER PRIMARY KEY,
        url          TEXT NOT NULL UNIQUE,
        title        TEXT,
        kind         TEXT,                      -- article|forum|review|vendor|registry|social
        note         TEXT,
        first_seen   TEXT NOT NULL DEFAULT (datetime('now')),
        last_checked TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
];

/** Apply pending migrations. `db` is any object with .exec()/.pragma()-equivalent. */
export function runMigrations(
  exec: (sql: string) => void,
  getUserVersion: () => number,
  setUserVersion: (v: number) => void,
): number {
  let current = getUserVersion();
  const pending = MIGRATIONS.filter((m) => m.version > current).sort((a, b) => a.version - b.version);
  for (const m of pending) {
    exec(m.sql);
    setUserVersion(m.version);
    current = m.version;
  }
  return current;
}
