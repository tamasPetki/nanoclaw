import type Database from 'better-sqlite3';

import type { CrmMigration } from './index.js';

/**
 * Initial Rezerver CRM schema. Tables derived from the real fields the
 * `worker` agent collects in groups/worker/rezerver/. Phase A tables are the
 * durable mirror of the worker's JSON/MD pipelines; Phase B tables are the
 * CRM-native concepts the source data lacks (outreach log, funnel, tasks,
 * competitors, legitimacy audit trail, account-health snapshots).
 *
 * Convention (matches the rest of the repo): ISO-8601 TEXT timestamps, TEXT
 * enums with CHECK constraints, irregular arrays stored as JSON TEXT, stable
 * business ids as natural keys so ingest upserts are idempotent.
 */
export const migration001: CrmMigration = {
  version: 1,
  name: '001-init',
  up(db: Database.Database) {
    db.exec(`
      -- ===================== Phase A: durable pipeline mirror =====================

      CREATE TABLE crm_venues (
        id                 INTEGER PRIMARY KEY,
        name               TEXT NOT NULL,
        city               TEXT,
        segment            TEXT,
        tier               INTEGER,
        hook               TEXT,
        trigger_event      TEXT,
        status             TEXT NOT NULL DEFAULT 'NOT_CONTACTED'
                             CHECK (status IN ('NOT_CONTACTED','CONTACTED','INTERESTED','ONBOARDED')),
        legitimacy_check   TEXT NOT NULL DEFAULT 'pending'
                             CHECK (legitimacy_check IN ('pending','green','yellow','red')),
        notes              TEXT,
        contact_email      TEXT,
        contact_phone      TEXT,
        website_url        TEXT,
        instagram          TEXT,
        owner_name         TEXT,
        capacity           INTEGER,
        price_range        TEXT,
        last_touched       TEXT,
        source_provenance  TEXT,
        ingest_mode        TEXT NOT NULL DEFAULT 'mirror'
                             CHECK (ingest_mode IN ('mirror','frozen')),
        created_at         TEXT NOT NULL,
        updated_at         TEXT NOT NULL
      );
      CREATE INDEX idx_crm_venues_status  ON crm_venues(status);
      CREATE INDEX idx_crm_venues_segment ON crm_venues(segment);
      CREATE INDEX idx_crm_venues_city    ON crm_venues(city);
      CREATE INDEX idx_crm_venues_tier    ON crm_venues(tier);

      CREATE TABLE crm_referral_partners (
        id                 INTEGER PRIMARY KEY,
        name               TEXT NOT NULL,
        company            TEXT,
        type               TEXT,
        city               TEXT,
        website            TEXT,
        instagram          TEXT,
        email              TEXT,
        contact_known      INTEGER NOT NULL DEFAULT 0,
        tier               INTEGER,
        segment            TEXT,
        note               TEXT,
        venues_worked_with TEXT NOT NULL DEFAULT '[]',
        status             TEXT NOT NULL DEFAULT 'NOT_CONTACTED',
        last_touched       TEXT,
        created_at         TEXT NOT NULL,
        updated_at         TEXT NOT NULL
      );
      CREATE INDEX idx_crm_referral_status ON crm_referral_partners(status);
      CREATE INDEX idx_crm_referral_type   ON crm_referral_partners(type);

      CREATE TABLE crm_media_outlets (
        site                     TEXT PRIMARY KEY,
        url                      TEXT,
        email                    TEXT,
        contact_page             TEXT,
        category                 TEXT,
        priority                 TEXT,
        angle                    TEXT,
        status                   TEXT NOT NULL DEFAULT 'NOT_CONTACTED'
                                   CHECK (status IN ('NOT_CONTACTED','SENT','REPLIED')),
        sent                     TEXT,
        followup                 TEXT,
        reply                    TEXT,
        editor_name              TEXT,
        editor_email             TEXT,
        deputy_editor            TEXT,
        recent_relevant_articles TEXT NOT NULL DEFAULT '[]',
        notes                    TEXT,
        created_at               TEXT NOT NULL,
        updated_at               TEXT NOT NULL
      );
      CREATE INDEX idx_crm_media_status ON crm_media_outlets(status);

      CREATE TABLE crm_fb_groups (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        url             TEXT,
        members         TEXT,
        category        TEXT,
        relevance_score INTEGER,
        join_status     TEXT NOT NULL DEFAULT 'NOT_YET_REQUESTED'
                          CHECK (join_status IN ('NOT_YET_REQUESTED','PENDING','APPROVED','DENIED','JOINED')),
        approval_date   TEXT,
        warmup_phase    TEXT,
        language        TEXT,
        group_kind      TEXT,
        discovered      TEXT,
        notes           TEXT,
        actions_log     TEXT NOT NULL DEFAULT '[]',
        incidents       TEXT NOT NULL DEFAULT '[]',
        raw_block       TEXT,
        created_at      TEXT NOT NULL,
        updated_at      TEXT NOT NULL
      );
      CREATE INDEX idx_crm_fb_groups_join ON crm_fb_groups(join_status);

      CREATE TABLE crm_trigger_events (
        code        TEXT PRIMARY KEY,
        description TEXT,
        occurred_at TEXT,
        created_at  TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      );

      -- ===================== Phase B: CRM-native concepts =====================

      CREATE TABLE crm_outreach (
        id               TEXT PRIMARY KEY,
        target_type      TEXT NOT NULL CHECK (target_type IN ('venue','referral','media')),
        target_id        TEXT NOT NULL,
        channel          TEXT NOT NULL CHECK (channel IN ('email','instagram_dm','facebook_dm','phone','form','other')),
        template_version TEXT,
        subject          TEXT,
        body_snapshot    TEXT,
        sent_at          TEXT,
        reply_at         TEXT,
        status           TEXT NOT NULL DEFAULT 'queued'
                           CHECK (status IN ('queued','sent','bounced','replied','no_reply','closed')),
        follow_up_at     TEXT,
        outcome          TEXT,
        created_at       TEXT NOT NULL,
        updated_at       TEXT NOT NULL
      );
      CREATE INDEX idx_crm_outreach_target   ON crm_outreach(target_type, target_id);
      CREATE INDEX idx_crm_outreach_followup ON crm_outreach(follow_up_at);
      CREATE INDEX idx_crm_outreach_status   ON crm_outreach(status);

      CREATE TABLE crm_stage_events (
        id          TEXT PRIMARY KEY,
        target_type TEXT NOT NULL CHECK (target_type IN ('venue','referral','media')),
        target_id   TEXT NOT NULL,
        from_stage  TEXT,
        to_stage    TEXT NOT NULL,
        reason      TEXT,
        actor       TEXT NOT NULL DEFAULT 'worker',
        occurred_at TEXT NOT NULL,
        created_at  TEXT NOT NULL
      );
      CREATE INDEX idx_crm_stage_target ON crm_stage_events(target_type, target_id, occurred_at);

      CREATE TABLE crm_tasks (
        id          TEXT PRIMARY KEY,
        target_type TEXT,
        target_id   TEXT,
        title       TEXT NOT NULL,
        due_at      TEXT,
        done        INTEGER NOT NULL DEFAULT 0,
        done_at     TEXT,
        assignee    TEXT,
        created_at  TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      );
      CREATE INDEX idx_crm_tasks_due ON crm_tasks(done, due_at);

      CREATE TABLE crm_competitors (
        id           TEXT PRIMARY KEY,
        name         TEXT NOT NULL,
        url          TEXT,
        segment      TEXT,
        positioning  TEXT,
        pricing_note TEXT,
        strengths    TEXT,
        weaknesses   TEXT,
        first_seen   TEXT,
        source       TEXT,
        notes        TEXT,
        created_at   TEXT NOT NULL,
        updated_at   TEXT NOT NULL
      );

      CREATE TABLE crm_legitimacy_checks (
        id         TEXT PRIMARY KEY,
        venue_id   INTEGER NOT NULL REFERENCES crm_venues(id),
        source     TEXT NOT NULL CHECK (source IN ('e-cegjegyzek','NAV','Opten','other')),
        result     TEXT NOT NULL CHECK (result IN ('green','yellow','red','pending')),
        detail     TEXT,
        checked_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX idx_crm_legit_venue ON crm_legitimacy_checks(venue_id, checked_at);

      CREATE TABLE crm_account_health (
        id             TEXT PRIMARY KEY,
        platform       TEXT NOT NULL,
        account        TEXT,
        snapshot_at    TEXT NOT NULL,
        daily_stats    TEXT,
        weekly_stats   TEXT,
        warmup_phase   TEXT,
        incident_count INTEGER,
        raw            TEXT,
        created_at     TEXT NOT NULL
      );
      CREATE INDEX idx_crm_health_platform ON crm_account_health(platform, snapshot_at);
    `);
  },
};
