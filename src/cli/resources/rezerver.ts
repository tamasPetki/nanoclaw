/**
 * `ncl rezerver ...` — the worker's (and host operator's) read/write path into
 * the host-owned Rezerver CRM DB. Write semantics live in src/crm/write.ts
 * (shared with the dashboard HTTP path); this file is the CLI surface + the
 * worker-only access guard.
 */
import type { CallerContext } from '../frame.js';
import { getCrmDb } from '../../crm/db.js';
import {
  ENTITIES,
  FIELD_GUIDE,
  setEntity,
  addEntity,
  addOutreach,
  addTask,
  addCompetitor,
  addLegitimacy,
} from '../../crm/write.js';
import { getWarmupState } from '../../crm/warmup-state.js';
import { registerResource } from '../crud.js';

const WORKER_GROUP = 'ag-worker';

function guard(ctx: CallerContext): void {
  if (ctx.caller === 'host') return;
  if (ctx.caller === 'agent' && ctx.agentGroupId === WORKER_GROUP) return;
  throw new Error('rezerver CRM is restricted to the worker agent.');
}

registerResource({
  name: 'rezerver',
  plural: 'rezerver',
  table: 'crm_venues', // placeholder — no generic ops are enabled
  description: 'Rezerver CRM — biz-dev pipeline (venues, partners, media, FB groups, outreach, tasks).',
  idColumn: 'id',
  columns: [],
  operations: {},
  customOperations: {
    schema: {
      access: 'open',
      description: 'List the settable fields per entity (venue/partner/media/fbgroup). Unknown fields go into `extra`.',
      handler: async (_args, ctx) => {
        guard(ctx);
        return FIELD_GUIDE;
      },
    },
    'venue-list': {
      access: 'open',
      description: 'List venues. Optional --status --tier --segment --city --country --legitimacy --q.',
      handler: async (args, ctx) => {
        guard(ctx);
        const where: string[] = [];
        const p: Record<string, unknown> = {};
        for (const [arg, col] of [
          ['status', 'status'],
          ['tier', 'tier'],
          ['segment', 'segment'],
          ['city', 'city'],
          ['country', 'country'],
          ['legitimacy', 'legitimacy_check'],
        ] as const) {
          if (args[arg] != null) {
            where.push(`${col} = @${arg}`);
            p[arg] = arg === 'tier' ? parseInt(String(args[arg]), 10) : args[arg];
          }
        }
        if (args.q) {
          where.push('(name LIKE @q OR hook LIKE @q OR notes LIKE @q)');
          p.q = `%${args.q}%`;
        }
        const sql = `SELECT id,name,city,country,segment,tier,status,legitimacy_check,fit_score,current_booking_tool,next_action,next_action_date FROM crm_venues ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY tier, name`;
        return getCrmDb().prepare(sql).all(p);
      },
    },
    'venue-get': {
      access: 'open',
      description: 'Full venue record by --id.',
      handler: async (args, ctx) => {
        guard(ctx);
        const row = getCrmDb().prepare('SELECT * FROM crm_venues WHERE id = ?').get(args.id);
        if (!row) throw new Error(`venue not found: ${args.id}`);
        return row;
      },
    },
    'warmup-get': {
      access: 'open',
      description:
        'Durable account-warmup state from the host DB (reddit/fb). Optional --key reddit|fb|meta. ' +
        'Authoritative even if the workspace state.json was lost — use this to recover/verify cumulative warmup state.',
      handler: async (args, ctx) => {
        guard(ctx);
        return getWarmupState(getCrmDb(), args.key ? String(args.key) : undefined);
      },
    },
    'venue-add': {
      access: 'open',
      description:
        'Create a new venue. --name <n> [--city --country --segment ... any field]. Auto id, frozen ownership. ' +
        'Dedupe on (name, city) — pass --allow-dup to override. Unknown fields → extra. Returns the new row.',
      handler: async (args, ctx) => {
        guard(ctx);
        return addEntity(ENTITIES.venue, args);
      },
    },
    'venue-set': {
      access: 'open',
      description:
        'Update a venue. --id <n> + any field (lásd `ncl rezerver schema`). Unknown fields → extra. Takes ownership (frozen).',
      handler: async (args, ctx) => {
        guard(ctx);
        return setEntity(ENTITIES.venue, args);
      },
    },
    'partner-add': {
      access: 'open',
      description:
        'Create a new referral partner/subcontractor. --name <n> [--type --specialization --country ... any field]. ' +
        'Auto id, frozen ownership. Dedupe on name — pass --allow-dup to override. Unknown fields → extra. Returns the new row.',
      handler: async (args, ctx) => {
        guard(ctx);
        return addEntity(ENTITIES.partner, args);
      },
    },
    'partner-set': {
      access: 'open',
      description: 'Update a referral partner. --id <n> + any field. Unknown → extra.',
      handler: async (args, ctx) => {
        guard(ctx);
        return setEntity(ENTITIES.partner, args);
      },
    },
    'media-add': {
      access: 'open',
      description:
        'Create a new media outlet. --site <site> (natural key) + any field. Frozen ownership. ' +
        'Errors if the site already exists (use media-set). Unknown fields → extra. Returns the new row.',
      handler: async (args, ctx) => {
        guard(ctx);
        return addEntity(ENTITIES.media, args);
      },
    },
    'media-set': {
      access: 'open',
      description: 'Update a media outlet. --site <site> + any field. Unknown → extra.',
      handler: async (args, ctx) => {
        guard(ctx);
        return setEntity(ENTITIES.media, args);
      },
    },
    'fbgroup-add': {
      access: 'open',
      description:
        'Create a new FB group. --name <n> [--id <fb-group-id> --url ... any field]. If --id is omitted it is ' +
        'slugified from --name. Frozen ownership. Errors if the id already exists (use fbgroup-set). Unknown → extra.',
      handler: async (args, ctx) => {
        guard(ctx);
        return addEntity(ENTITIES.fbgroup, args);
      },
    },
    'fbgroup-set': {
      access: 'open',
      description: 'Update an FB group. --id <id> + any field. Unknown → extra.',
      handler: async (args, ctx) => {
        guard(ctx);
        return setEntity(ENTITIES.fbgroup, args);
      },
    },
    'outreach-add': {
      access: 'open',
      description:
        'Log an outreach attempt. --target-type venue|referral|media --target-id <id> --channel email|... [--subject --status --follow-up-at --outcome].',
      handler: async (args, ctx) => {
        guard(ctx);
        return addOutreach(args);
      },
    },
    'task-add': {
      access: 'open',
      description: 'Add a follow-up task. --title <t> [--target-type --target-id --due-at --assignee].',
      handler: async (args, ctx) => {
        guard(ctx);
        return addTask(args);
      },
    },
    'competitor-add': {
      access: 'open',
      description:
        'Add/record a competitor. --name <n> [--url --positioning --pricing-note --strengths --weaknesses --first-seen --source].',
      handler: async (args, ctx) => {
        guard(ctx);
        return addCompetitor(args);
      },
    },
    'legitimacy-add': {
      access: 'open',
      description:
        'Record a legitimacy check for a venue. --venue-id <n> --source e-cegjegyzek|NAV|Opten|other --result green|yellow|red|pending [--detail]. Also updates the venue.',
      handler: async (args, ctx) => {
        guard(ctx);
        return addLegitimacy(args);
      },
    },
  },
});
