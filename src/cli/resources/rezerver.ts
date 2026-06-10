/**
 * `ncl rezerver ...` — thin proxy into the standalone `rezerver-crm` service
 * (separate repo + systemd service at /root/rezerver-crm, port CRM_PORT). The
 * CRM DB, write semantics, ingest, dashboard, and warmup-state all live in that
 * service now; this file only forwards each verb to its `POST /api/ncl`
 * dispatch endpoint and keeps the worker-only access guard on the host side.
 *
 * Why a proxy and not a file-inbox (like radar): the worker relies on the
 * synchronous JSON echo (venue-add returns the created row with its id), so the
 * call must be request/response. The service trusts the Bearer token; the
 * caller-identity guard stays here where CallerContext is available.
 */
import type { CallerContext } from '../frame.js';
import { registerResource } from '../crud.js';
import { readEnvFile } from '../../env.js';
import { log } from '../../log.js';

const WORKER_GROUP = 'ag-worker';

function guard(ctx: CallerContext): void {
  if (ctx.caller === 'host') return;
  if (ctx.caller === 'agent' && ctx.agentGroupId === WORKER_GROUP) return;
  throw new Error('rezerver CRM is restricted to the worker agent.');
}

const crmEnv = readEnvFile(['CRM_SECRET', 'CRM_PORT']);
const CRM_SECRET = process.env.CRM_SECRET || crmEnv.CRM_SECRET;
const CRM_PORT = process.env.CRM_PORT || crmEnv.CRM_PORT || '3200';
const CRM_URL = `http://127.0.0.1:${CRM_PORT}/api/ncl`;

async function callCrm(op: string, args: Record<string, unknown>): Promise<unknown> {
  if (!CRM_SECRET) throw new Error('CRM service not configured (CRM_SECRET missing in .env)');
  let res: Response;
  try {
    res = await fetch(CRM_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${CRM_SECRET}` },
      body: JSON.stringify({ op, args }),
    });
  } catch (err) {
    log.error('rezerver-crm service unreachable', { op, err });
    throw new Error(`rezerver-crm service unreachable on ${CRM_URL} — is rezerver-crm.service running?`);
  }
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: unknown; error?: string };
  if (!json.ok) throw new Error(json.error || `rezerver-crm service error (HTTP ${res.status})`);
  return json.data;
}

/** Verb surface — mirrors the standalone service's `/api/ncl` dispatch ops. */
const OPS: { op: string; description: string }[] = [
  {
    op: 'schema',
    description: 'List the settable fields per entity (venue/partner/media/fbgroup). Unknown fields go into `extra`.',
  },
  {
    op: 'venue-list',
    description:
      'List venues. Optional --status --tier --segment --city --country --legitimacy --q. ' +
      'Outreach filters: --fit-min <n> (fit_score >= n), --has-contact (has email/phone/booking_email), ' +
      '--booking-type <substr> (current_booking_tool LIKE, e.g. --booking-type manual).',
  },
  { op: 'venue-get', description: 'Full venue record by --id.' },
  {
    op: 'venue-audit',
    description:
      'Data-quality sweep over venues. Returns {summary, exactDuplicates, nearDuplicates, phantoms, incomplete}: ' +
      'normalized-name duplicate groups, prefix near-duplicates (Sentio vs Sentio Étterem), empty-shell phantom rows, ' +
      'and reachable rows with no contact channel. No args.',
  },
  {
    op: 'warmup-get',
    description:
      'Durable account-warmup state from the host DB (reddit/fb). Optional --key reddit|fb|meta. ' +
      'Authoritative even if the workspace state.json was lost — use this to recover/verify cumulative warmup state.',
  },
  {
    op: 'venue-add',
    description:
      'Create a new venue. --name <n> [--city --country --segment ... any field]. Auto id, frozen ownership. ' +
      'Dedupe on (name, city) — pass --allow-dup to override. Unknown fields → extra. Returns the new row.',
  },
  {
    op: 'venue-set',
    description:
      'Update a venue. --id <n> + any field (lásd `ncl rezerver schema`). Unknown fields → extra. Takes ownership (frozen).',
  },
  {
    op: 'partner-add',
    description:
      'Create a new referral partner/subcontractor. --name <n> [--type --specialization --country ... any field]. ' +
      'Auto id, frozen ownership. Dedupe on name — pass --allow-dup to override. Unknown fields → extra. Returns the new row.',
  },
  { op: 'partner-set', description: 'Update a referral partner. --id <n> + any field. Unknown → extra.' },
  {
    op: 'media-add',
    description:
      'Create a new media outlet. --site <site> (natural key) + any field. Frozen ownership. ' +
      'Errors if the site already exists (use media-set). Unknown fields → extra. Returns the new row.',
  },
  { op: 'media-set', description: 'Update a media outlet. --site <site> + any field. Unknown → extra.' },
  {
    op: 'fbgroup-add',
    description:
      'Create a new FB group. --name <n> [--id <fb-group-id> --url ... any field]. If --id is omitted it is ' +
      'slugified from --name. Frozen ownership. Errors if the id already exists (use fbgroup-set). Unknown → extra.',
  },
  { op: 'fbgroup-set', description: 'Update an FB group. --id <id> + any field. Unknown → extra.' },
  {
    op: 'outreach-add',
    description:
      'Log an outreach attempt. --target-type venue|referral|media --target-id <id> --channel email|... [--subject --status --follow-up-at --outcome].',
  },
  { op: 'task-add', description: 'Add a follow-up task. --title <t> [--target-type --target-id --due-at --assignee].' },
  {
    op: 'competitor-add',
    description:
      'Add/record a competitor. --name <n> [--url --positioning --pricing-note --strengths --weaknesses --first-seen --source].',
  },
  {
    op: 'legitimacy-add',
    description:
      'Record a legitimacy check for a venue. --venue-id <n> --source e-cegjegyzek|NAV|Opten|other --result green|yellow|red|pending [--detail]. Also updates the venue.',
  },
];

registerResource({
  name: 'rezerver',
  plural: 'rezerver',
  table: 'crm_venues', // placeholder — no generic ops are enabled
  description:
    'Rezerver CRM — biz-dev pipeline (venues, partners, media, FB groups, outreach, tasks). Backed by the rezerver-crm service.',
  idColumn: 'id',
  columns: [],
  operations: {},
  customOperations: Object.fromEntries(
    OPS.map(({ op, description }) => [
      op,
      {
        access: 'open' as const,
        description,
        handler: async (args: Record<string, unknown>, ctx: CallerContext) => {
          guard(ctx);
          return callCrm(op, args);
        },
      },
    ]),
  ),
});
