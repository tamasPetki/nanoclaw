import type Database from 'better-sqlite3';

import type { CrmMigration } from './index.js';

/**
 * Adds a first-class `country` column to venues (and partners), promoting it
 * out of the `extra` JSON catch-all now that the growth agent collects venues
 * across countries (HU + UK and onward). 2-letter uppercase convention ("HU",
 * "UK"). Existing venues predate any non-HU expansion, so backfill them to
 * 'HU'; partners stay NULL (country is optional there).
 */
function addColumns(db: Database.Database, table: string, cols: [string, string][]) {
  const existing = new Set((db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((r) => r.name));
  for (const [name, type] of cols) {
    if (!existing.has(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
  }
}

export const migration004: CrmMigration = {
  version: 4,
  name: '004-country',
  up(db: Database.Database) {
    addColumns(db, 'crm_venues', [['country', 'TEXT']]);
    addColumns(db, 'crm_referral_partners', [['country', 'TEXT']]);

    // Backfill the pre-expansion venues — they were all Hungarian.
    db.prepare("UPDATE crm_venues SET country = 'HU' WHERE country IS NULL OR country = ''").run();

    db.exec('CREATE INDEX IF NOT EXISTS idx_crm_venues_country ON crm_venues(country)');
  },
};
