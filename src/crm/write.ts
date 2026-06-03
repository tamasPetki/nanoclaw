/**
 * Shared CRM write semantics — used by BOTH the `ncl rezerver` path (worker)
 * and the dashboard HTTP PATCH/POST path (human). One source of truth for
 * validation, the extra-JSON catch-all, frozen ownership, and stage-event audit.
 *
 * `actor` distinguishes who made the change ('worker' | 'ui:<user>') in the
 * stage-event log.
 */
import { getCrmDb } from './db.js';
import { exportCrmSnapshot } from './export-snapshot.js';

export const VENUE_STATUS = ['NOT_CONTACTED', 'CONTACTED', 'INTERESTED', 'ONBOARDED'];
export const LEGIT = ['pending', 'green', 'yellow', 'red'];

export type EntityCfg = {
  table: string;
  idCol: string;
  cols: Set<string>;
  ints: Set<string>;
  enums: Record<string, string[]>;
  statusCol?: string;
  targetType?: string;
};

export const ENTITIES: Record<string, EntityCfg> = {
  venue: {
    table: 'crm_venues',
    idCol: 'id',
    cols: new Set([
      'name',
      'city',
      'segment',
      'tier',
      'hook',
      'trigger_event',
      'status',
      'legitimacy_check',
      'notes',
      'contact_email',
      'contact_phone',
      'website_url',
      'instagram',
      'owner_name',
      'price_range',
      'contact_name',
      'contact_role',
      'booking_email',
      'facebook',
      'venue_type',
      'event_types',
      'capacity_seated',
      'capacity_standing',
      'est_events_per_year',
      'prestige',
      'current_booking_tool',
      'pain_points',
      'price_tier',
      'fit_score',
      'fit_reason',
      'stage',
      'source',
      'next_action',
      'next_action_date',
      'owner',
      'needs_verification',
      'confidence',
    ]),
    ints: new Set([
      'tier',
      'capacity_seated',
      'capacity_standing',
      'est_events_per_year',
      'fit_score',
      'needs_verification',
    ]),
    enums: { status: VENUE_STATUS, legitimacy_check: LEGIT },
    statusCol: 'status',
    targetType: 'venue',
  },
  partner: {
    table: 'crm_referral_partners',
    idCol: 'id',
    cols: new Set([
      'name',
      'company',
      'type',
      'city',
      'website',
      'instagram',
      'email',
      'contact_known',
      'tier',
      'segment',
      'note',
      'status',
      'contact_name',
      'phone',
      'coverage_area',
      'preferred_channel',
      'years_active',
      'est_events_per_year',
      'prestige',
      'price_segment',
      'specialization',
      'referral_potential',
      'warm_intro',
      'reciprocity',
      'stage',
      'next_action',
      'next_action_date',
    ]),
    ints: new Set(['tier', 'contact_known', 'years_active', 'est_events_per_year']),
    enums: {},
    statusCol: 'status',
    targetType: 'referral',
  },
  media: {
    table: 'crm_media_outlets',
    idCol: 'site',
    cols: new Set([
      'url',
      'email',
      'contact_page',
      'category',
      'priority',
      'angle',
      'status',
      'editor_name',
      'editor_email',
      'deputy_editor',
      'notes',
      'language',
      'media_type',
      'frequency',
      'reach',
      'audience',
      'pr_contact',
      'submission_guidelines',
      'relevant_topics',
      'best_pitch_angle',
      'covers_competitors',
      'relationship_warmth',
      'stage',
      'next_action',
      'next_action_date',
    ]),
    ints: new Set([]),
    enums: { status: ['NOT_CONTACTED', 'SENT', 'REPLIED'] },
    statusCol: 'status',
    targetType: 'media',
  },
  fbgroup: {
    table: 'crm_fb_groups',
    idCol: 'id',
    cols: new Set([
      'name',
      'url',
      'members',
      'category',
      'relevance_score',
      'join_status',
      'approval_date',
      'warmup_phase',
      'language',
      'group_kind',
      'discovered',
      'notes',
      'admins',
      'posting_rules',
      'activity_level',
      'key_topics',
      'thought_leaders',
      'best_post_time',
      'our_persona',
      'next_action',
    ]),
    ints: new Set(['relevance_score']),
    enums: { join_status: ['NOT_YET_REQUESTED', 'PENDING', 'APPROVED', 'DENIED', 'JOINED'] },
  },
};

export const FIELD_GUIDE = {
  venue: [...ENTITIES.venue.cols].concat(['extra:<bármi egyéb JSON-kulcs>']),
  partner: [...ENTITIES.partner.cols].concat(['extra:<bármi egyéb>']),
  media: [...ENTITIES.media.cols].concat(['extra:<bármi egyéb>']),
  fbgroup: [...ENTITIES.fbgroup.cols].concat(['extra:<bármi egyéb>']),
};

function nowIso(): string {
  return new Date().toISOString();
}
function uuid(): string {
  return (getCrmDb().prepare('SELECT lower(hex(randomblob(16))) AS id').get() as { id: string }).id;
}

/** Framework/control keys that must never become data. */
const CONTROL = new Set(['id', 'site', 'agent_group_id', 'group', 'cli_scope', 'reason']);

export function setEntity(cfg: EntityCfg, args: Record<string, unknown>, actor = 'worker'): unknown {
  const db = getCrmDb();
  const id = args[cfg.idCol] ?? args.id;
  if (id == null || id === '') throw new Error(`--${cfg.idCol} is required`);

  const existing = db.prepare(`SELECT * FROM ${cfg.table} WHERE ${cfg.idCol} = ?`).get(id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) throw new Error(`${cfg.targetType || cfg.table} not found: ${id}`);

  const setCols: Record<string, unknown> = {};
  const extra: Record<string, unknown> = JSON.parse((existing.extra as string) || '{}');
  let extraChanged = false;

  for (const [k, v] of Object.entries(args)) {
    if (CONTROL.has(k)) continue;
    if (cfg.cols.has(k)) {
      if (cfg.enums[k] && !cfg.enums[k].includes(String(v))) {
        throw new Error(`${k} must be one of: ${cfg.enums[k].join(', ')}`);
      }
      setCols[k] = cfg.ints.has(k) ? (v === '' || v == null ? null : parseInt(String(v), 10)) : v;
    } else {
      extra[k] = v;
      extraChanged = true;
    }
  }

  let stageEvent: { from: unknown; to: unknown } | null = null;
  if (
    cfg.statusCol &&
    cfg.targetType &&
    setCols[cfg.statusCol] != null &&
    setCols[cfg.statusCol] !== existing[cfg.statusCol]
  ) {
    stageEvent = { from: existing[cfg.statusCol], to: setCols[cfg.statusCol] };
  }

  const now = nowIso();
  const assignments = Object.keys(setCols).map((k) => `${k} = @${k}`);
  if (extraChanged) assignments.push('extra = @__extra');
  assignments.push(`ingest_mode = 'frozen'`);
  assignments.push('updated_at = @__now');

  db.transaction(() => {
    db.prepare(`UPDATE ${cfg.table} SET ${assignments.join(', ')} WHERE ${cfg.idCol} = @__id`).run({
      ...setCols,
      __extra: JSON.stringify(extra),
      __now: now,
      __id: id,
    });
    if (stageEvent) {
      db.prepare(
        `INSERT INTO crm_stage_events (id, target_type, target_id, from_stage, to_stage, reason, actor, occurred_at, created_at)
         VALUES (lower(hex(randomblob(16))), @tt, @ti, @from, @to, @reason, @actor, @now, @now)`,
      ).run({
        tt: cfg.targetType,
        ti: String(id),
        from: stageEvent.from,
        to: stageEvent.to,
        reason: args.reason ?? null,
        actor,
        now,
      });
    }
  })();

  const updated = db.prepare(`SELECT * FROM ${cfg.table} WHERE ${cfg.idCol} = ?`).get(id);
  exportCrmSnapshot();
  return updated;
}

export function addOutreach(args: Record<string, unknown>): unknown {
  const tt = String(args.target_type || '');
  const ch = String(args.channel || '');
  if (!['venue', 'referral', 'media'].includes(tt)) throw new Error('target_type must be venue|referral|media');
  if (!args.target_id) throw new Error('target_id is required');
  if (!['email', 'instagram_dm', 'facebook_dm', 'phone', 'form', 'other'].includes(ch))
    throw new Error('channel invalid');
  const now = nowIso();
  const id = uuid();
  getCrmDb()
    .prepare(
      `INSERT INTO crm_outreach (id, target_type, target_id, channel, template_version, subject, body_snapshot, sent_at, status, follow_up_at, outcome, created_at, updated_at)
     VALUES (@id, @tt, @ti, @ch, @tv, @subj, @body, @sent, @status, @fu, @outcome, @now, @now)`,
    )
    .run({
      id,
      tt,
      ti: String(args.target_id),
      ch,
      tv: args.template_version ?? null,
      subj: args.subject ?? null,
      body: args.body ?? null,
      sent: args.sent_at ?? now,
      status: args.status ?? 'sent',
      fu: args.follow_up_at ?? null,
      outcome: args.outcome ?? null,
      now,
    });
  exportCrmSnapshot();
  return getCrmDb().prepare('SELECT * FROM crm_outreach WHERE id = ?').get(id);
}

export function addTask(args: Record<string, unknown>): unknown {
  if (!args.title) throw new Error('title is required');
  const now = nowIso();
  const id = uuid();
  getCrmDb()
    .prepare(
      `INSERT INTO crm_tasks (id, target_type, target_id, title, due_at, assignee, created_at, updated_at)
     VALUES (@id, @tt, @ti, @title, @due, @assignee, @now, @now)`,
    )
    .run({
      id,
      tt: args.target_type ?? null,
      ti: args.target_id != null ? String(args.target_id) : null,
      title: String(args.title),
      due: args.due_at ?? null,
      assignee: args.assignee ?? null,
      now,
    });
  exportCrmSnapshot();
  return getCrmDb().prepare('SELECT * FROM crm_tasks WHERE id = ?').get(id);
}

export function setTaskDone(id: string, done: boolean): unknown {
  const now = nowIso();
  const r = getCrmDb()
    .prepare('UPDATE crm_tasks SET done = @d, done_at = @da, updated_at = @now WHERE id = @id')
    .run({ d: done ? 1 : 0, da: done ? now : null, now, id });
  if (r.changes === 0) throw new Error(`task not found: ${id}`);
  exportCrmSnapshot();
  return getCrmDb().prepare('SELECT * FROM crm_tasks WHERE id = ?').get(id);
}

export function addCompetitor(args: Record<string, unknown>): unknown {
  if (!args.name) throw new Error('name is required');
  const now = nowIso();
  const id = uuid();
  getCrmDb()
    .prepare(
      `INSERT INTO crm_competitors (id, name, url, segment, positioning, pricing_note, strengths, weaknesses, first_seen, source, notes, created_at, updated_at)
     VALUES (@id, @name, @url, @seg, @pos, @pn, @str, @wk, @fs, @src, @notes, @now, @now)`,
    )
    .run({
      id,
      name: String(args.name),
      url: args.url ?? null,
      seg: args.segment ?? null,
      pos: args.positioning ?? null,
      pn: args.pricing_note ?? null,
      str: args.strengths ?? null,
      wk: args.weaknesses ?? null,
      fs: args.first_seen ?? now.slice(0, 10),
      src: args.source ?? null,
      notes: args.notes ?? null,
      now,
    });
  exportCrmSnapshot();
  return getCrmDb().prepare('SELECT * FROM crm_competitors WHERE id = ?').get(id);
}

export function addLegitimacy(args: Record<string, unknown>, actor = 'worker'): unknown {
  const vid = parseInt(String(args.venue_id), 10);
  if (!Number.isFinite(vid)) throw new Error('venue_id is required');
  const source = String(args.source || '');
  const result = String(args.result || '');
  if (!['e-cegjegyzek', 'NAV', 'Opten', 'other'].includes(source)) throw new Error('source invalid');
  if (!LEGIT.includes(result)) throw new Error('result invalid');
  const now = nowIso();
  const db = getCrmDb();
  db.transaction(() => {
    db.prepare(
      `INSERT INTO crm_legitimacy_checks (id, venue_id, source, result, detail, checked_at, created_at)
       VALUES (lower(hex(randomblob(16))), @vid, @source, @result, @detail, @now, @now)`,
    ).run({ vid, source, result, detail: args.detail ?? null, now });
    db.prepare(
      "UPDATE crm_venues SET legitimacy_check = @result, ingest_mode='frozen', updated_at=@now WHERE id = @vid",
    ).run({ result, vid, now });
  })();
  exportCrmSnapshot();
  return db.prepare('SELECT id,name,legitimacy_check FROM crm_venues WHERE id = ?').get(vid);
}
