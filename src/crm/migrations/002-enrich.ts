import type Database from 'better-sqlite3';

import type { CrmMigration } from './index.js';

/**
 * Phase B enrichment: give every entity a real biz-dev field set so the worker
 * has somewhere to write what it collects (decision-maker + contact, capacity +
 * event volume, current tool + pain points, financial/fit) plus a flexible
 * `extra` JSON column for the long tail. Core workflow-driving fields are real
 * columns (filterable/sortable/work-queue); the rest live in `extra`.
 *
 * `ingest_mode` is added to referral/media/fb (venues already have it): once the
 * worker writes a row via `ncl rezerver`, it flips to 'frozen' and the JSON
 * mirror stops overwriting it — the worker/UI becomes the owner of that row.
 */
function addColumns(db: Database.Database, table: string, cols: [string, string][]) {
  const existing = new Set((db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((r) => r.name));
  for (const [name, type] of cols) {
    if (!existing.has(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
  }
}

export const migration002: CrmMigration = {
  version: 2,
  name: '002-enrich',
  up(db: Database.Database) {
    addColumns(db, 'crm_venues', [
      // decision-maker + contact
      ['contact_name', 'TEXT'],
      ['contact_role', 'TEXT'],
      ['booking_email', 'TEXT'],
      ['facebook', 'TEXT'],
      // capacity + event volume
      ['venue_type', 'TEXT'],
      ['event_types', "TEXT NOT NULL DEFAULT '[]'"],
      ['capacity_seated', 'INTEGER'],
      ['capacity_standing', 'INTEGER'],
      ['est_events_per_year', 'INTEGER'],
      ['prestige', 'TEXT'],
      // current tool + pain
      ['current_booking_tool', 'TEXT'],
      ['pain_points', 'TEXT'],
      // financial / fit
      ['price_tier', 'TEXT'],
      ['fit_score', 'INTEGER'],
      ['fit_reason', 'TEXT'],
      // pipeline + provenance
      ['stage', 'TEXT'],
      ['source', 'TEXT'],
      ['next_action', 'TEXT'],
      ['next_action_date', 'TEXT'],
      ['owner', 'TEXT'],
      ['needs_verification', 'INTEGER NOT NULL DEFAULT 0'],
      ['confidence', 'TEXT'],
      ['extra', "TEXT NOT NULL DEFAULT '{}'"],
    ]);
    db.exec('CREATE INDEX IF NOT EXISTS idx_crm_venues_fit ON crm_venues(fit_score)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_crm_venues_nextdate ON crm_venues(next_action_date)');

    addColumns(db, 'crm_referral_partners', [
      ['contact_name', 'TEXT'],
      ['phone', 'TEXT'],
      ['coverage_area', 'TEXT'],
      ['preferred_channel', 'TEXT'],
      ['years_active', 'INTEGER'],
      ['est_events_per_year', 'INTEGER'],
      ['prestige', 'TEXT'],
      ['price_segment', 'TEXT'],
      ['specialization', 'TEXT'],
      ['referral_potential', 'TEXT'],
      ['warm_intro', 'TEXT'],
      ['reciprocity', 'TEXT'],
      ['stage', 'TEXT'],
      ['next_action', 'TEXT'],
      ['next_action_date', 'TEXT'],
      ['extra', "TEXT NOT NULL DEFAULT '{}'"],
      ['ingest_mode', "TEXT NOT NULL DEFAULT 'mirror'"],
    ]);

    addColumns(db, 'crm_media_outlets', [
      ['language', 'TEXT'],
      ['media_type', 'TEXT'],
      ['frequency', 'TEXT'],
      ['reach', 'TEXT'],
      ['audience', 'TEXT'],
      ['pr_contact', 'TEXT'],
      ['submission_guidelines', 'TEXT'],
      ['relevant_topics', 'TEXT'],
      ['best_pitch_angle', 'TEXT'],
      ['covers_competitors', 'TEXT'],
      ['relationship_warmth', 'TEXT'],
      ['stage', 'TEXT'],
      ['next_action', 'TEXT'],
      ['next_action_date', 'TEXT'],
      ['extra', "TEXT NOT NULL DEFAULT '{}'"],
      ['ingest_mode', "TEXT NOT NULL DEFAULT 'mirror'"],
    ]);

    addColumns(db, 'crm_fb_groups', [
      ['admins', 'TEXT'],
      ['posting_rules', 'TEXT'],
      ['activity_level', 'TEXT'],
      ['key_topics', 'TEXT'],
      ['thought_leaders', 'TEXT'],
      ['best_post_time', 'TEXT'],
      ['our_persona', 'TEXT'],
      ['next_action', 'TEXT'],
      ['extra', "TEXT NOT NULL DEFAULT '{}'"],
      ['ingest_mode', "TEXT NOT NULL DEFAULT 'mirror'"],
    ]);
  },
};
