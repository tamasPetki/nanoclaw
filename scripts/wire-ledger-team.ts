/**
 * Stand up the "Ledger" product-incubator trio that builds an internal financial
 * management app (QuickBooks-alternative) for Tomi's own companies. Separate from
 * the Axiom+Drift incubator (which keeps working on "Second Memory"/Kept).
 *
 *   Ledger (ag-ledger)  — Lead: product owner + interview + design-sprint + build.
 *                         Has the dedicated @..._bot Telegram bot (telegram-ledger).
 *   Tally  (ag-tally)   — Finance domain + integrations (NAV/bank/ÁFA/double-entry,
 *                         mapping the real company data flows). A2A-only.
 *   Form   (ag-form)    — Design / UX (design system, UX flows, UI quality). A2A-only.
 *
 * Tally + Form report to Ledger via A2A (<message to="ledger">); Ledger integrates and
 * talks to Tomi on the bot. Mirrors scripts/wire-axiom-bot.ts but creates the whole trio.
 *
 * Idempotent (INSERT OR IGNORE / upsert). Usage: pnpm exec tsx scripts/wire-ledger-team.ts
 *
 * NOTE: the bot only goes live once TELEGRAM_BOT_TOKEN_LEDGER is in .env + the host is
 * restarted + Tomi /starts the bot. This script only does the DB wiring (safe to run early).
 */
import Database from 'better-sqlite3';

const db = new Database('/root/nanoclaw-v2/data/v2.db');
const now = new Date().toISOString();

const TOMI = 'telegram-ledger:1243781160'; // channel-prefixed identity for the Ledger bot
const PLATFORM = 'telegram:1243781160'; // Tomi's Telegram DM chat id (DM: chat_id == user_id)
const MODEL = 'claude-opus-4-8[1m]';

interface GroupDef {
  id: string;
  name: string;
  folder: string;
  effort: string;
}
const GROUPS: GroupDef[] = [
  { id: 'ag-ledger', name: 'Ledger', folder: 'ledger', effort: 'xhigh' },
  { id: 'ag-tally', name: 'Tally', folder: 'tally', effort: 'high' },
  { id: 'ag-form', name: 'Form', folder: 'form', effort: 'high' },
];

// 1. Agent groups + container configs (provider=claude, opus-4-8[1m], cli_scope=group).
for (const g of GROUPS) {
  db.prepare(
    `INSERT OR IGNORE INTO agent_groups (id, name, folder, agent_provider, created_at)
     VALUES (@id, @name, @folder, 'claude', @now)`,
  ).run({ id: g.id, name: g.name, folder: g.folder, now });

  // Upsert the container config so model/effort/cli_scope are set even if the row
  // already exists (e.g. ensureContainerConfig created a bare default at first spawn).
  db.prepare(
    `INSERT INTO container_configs
       (agent_group_id, provider, model, effort, assistant_name, cli_scope, skills, updated_at)
     VALUES (@id, 'claude', @model, @effort, @name, 'group', '"all"', @now)
     ON CONFLICT(agent_group_id) DO UPDATE SET
       provider='claude', model=@model, effort=@effort, assistant_name=@name,
       cli_scope='group', updated_at=@now`,
  ).run({ id: g.id, model: MODEL, effort: g.effort, name: g.name, now });

  console.log(`agent_group + config: ${g.id} (${g.name}, ${g.effort})`);
}

// 2. Tomi's user identity for the Ledger bot (channel-prefixed — roles are per-user-id;
//    the existing telegram:1243781160 owner does NOT carry over to this prefix).
db.prepare(`INSERT OR IGNORE INTO users (id, kind, display_name, created_at) VALUES (?,?,?,?)`).run(
  TOMI,
  'telegram-ledger',
  'Tomi',
  now,
);
console.log('user:', TOMI);

// 3. Messaging group (the DM). instance is NOT NULL → set it to the channel_type.
const existing = db
  .prepare("SELECT id FROM messaging_groups WHERE channel_type='telegram-ledger' AND platform_id=?")
  .get(PLATFORM) as { id: string } | undefined;
const mgId = existing?.id ?? `mg-ledger-bot-${Date.now()}`;
if (!existing) {
  db.prepare(
    `INSERT INTO messaging_groups (id, channel_type, platform_id, instance, name, is_group, unknown_sender_policy, created_at)
     VALUES (@id,'telegram-ledger',@p,'telegram-ledger','Tomi DM (Ledger bot)',0,'strict',@now)`,
  ).run({ id: mgId, p: PLATFORM, now });
  console.log('messaging_group:', mgId);
} else console.log('messaging_group már létezik:', mgId);

// 4. Wire the DM to Ledger (pattern '.' = respond to all DMs).
const wired = db
  .prepare('SELECT id FROM messaging_group_agents WHERE messaging_group_id=? AND agent_group_id=?')
  .get(mgId, 'ag-ledger') as { id: string } | undefined;
if (!wired) {
  db.prepare(
    `INSERT INTO messaging_group_agents (id, messaging_group_id, agent_group_id, session_mode, priority, created_at, engage_mode, engage_pattern, sender_scope, ignored_message_policy)
     VALUES (@id,@mg,'ag-ledger','shared',0,@now,'pattern','.','all','drop')`,
  ).run({ id: `mga-ledger-${Date.now()}`, mg: mgId, now });
  console.log('wiring kész: DM → ag-ledger');
} else console.log('wiring már létezik');

// 5. Owner role (global) + member of ag-ledger.
db.prepare(
  `INSERT OR IGNORE INTO user_roles (user_id, role, agent_group_id, granted_by, granted_at) VALUES (?,?,?,?,?)`,
).run(TOMI, 'owner', null, null, now);
db.prepare(
  `INSERT OR IGNORE INTO agent_group_members (user_id, agent_group_id, added_by, added_at) VALUES (?,?,?,?)`,
).run(TOMI, 'ag-ledger', null, now);
console.log('owner + member:', TOMI);

// 6. A2A destinations (Tally + Form ↔ Ledger; Ledger → Tomi channel).
function dest(agentGroupId: string, localName: string, targetType: 'agent' | 'channel', targetId: string): void {
  db.prepare(
    `INSERT OR IGNORE INTO agent_destinations (agent_group_id, local_name, target_type, target_id, created_at)
     VALUES (?,?,?,?,?)`,
  ).run(agentGroupId, localName, targetType, targetId, now);
  console.log(`destination: ${agentGroupId} →"${localName}"→ ${targetType}:${targetId}`);
}
dest('ag-ledger', 'tally', 'agent', 'ag-tally');
dest('ag-ledger', 'form', 'agent', 'ag-form');
dest('ag-ledger', 'tomi', 'channel', mgId);
dest('ag-tally', 'ledger', 'agent', 'ag-ledger');
dest('ag-form', 'ledger', 'agent', 'ag-ledger');

db.close();
console.log('\n✅ Ledger trió bekötve. Hátra: .env token + restart + Tomi /start a boton.');
