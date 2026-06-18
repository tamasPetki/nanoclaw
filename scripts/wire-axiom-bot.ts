/**
 * Wire Tomi's DM to the Axiom agent (ag-shift-lead) over the dedicated
 * @..._bot Telegram bot (channel_type 'telegram-axiom'). Mirrors wire-hex-bot.ts.
 *
 * Creates: messaging_group (the DM), messaging_group_agents (DM ↔ Axiom wiring),
 * Tomi as a channel-prefixed member, and the 'tomi' channel destination so Axiom
 * can `<message to="tomi">`. No session UPDATE — Axiom has no session yet; the
 * router creates it on first message.
 *
 * Idempotent. Usage: pnpm exec tsx scripts/wire-axiom-bot.ts
 */
import Database from 'better-sqlite3';

const db = new Database('/root/nanoclaw-v2/data/v2.db');
const now = new Date().toISOString();
const PLATFORM = 'telegram:1243781160'; // Tomi's Telegram DM chat id
const AG = 'ag-shift-lead'; // Axiom
const UID = 'telegram-axiom:1243781160'; // channel-prefixed member id for the second bot

const existing = db
  .prepare("SELECT id FROM messaging_groups WHERE channel_type='telegram-axiom' AND platform_id=?")
  .get(PLATFORM) as { id: string } | undefined;
const mgId = existing?.id ?? `mg-axiom-bot-${Date.now()}`;
if (!existing) {
  db.prepare(
    `INSERT INTO messaging_groups (id, channel_type, platform_id, name, is_group, unknown_sender_policy, created_at)
     VALUES (@id,'telegram-axiom',@p,'Tomi DM (Axiom bot)',0,'strict',@now)`,
  ).run({ id: mgId, p: PLATFORM, now });
  console.log('messaging_group:', mgId);
} else console.log('messaging_group már létezik:', mgId);

const wired = db
  .prepare('SELECT id FROM messaging_group_agents WHERE messaging_group_id=? AND agent_group_id=?')
  .get(mgId, AG) as { id: string } | undefined;
if (!wired) {
  db.prepare(
    `INSERT INTO messaging_group_agents (id, messaging_group_id, agent_group_id, session_mode, priority, created_at, engage_mode, engage_pattern, sender_scope, ignored_message_policy)
     VALUES (@id,@mg,@ag,'shared',0,@now,'pattern','.','all','drop')`,
  ).run({ id: `mga-axiom-${Date.now()}`, mg: mgId, ag: AG, now });
  console.log('wiring kész');
} else console.log('wiring már létezik');

db.prepare(`INSERT OR IGNORE INTO users (id, kind, display_name, created_at) VALUES (?,?,?,?)`).run(
  UID,
  'telegram-axiom',
  'Tomi',
  now,
);
db.prepare(`INSERT OR IGNORE INTO agent_group_members (user_id, agent_group_id, added_by, added_at) VALUES (?,?,?,?)`).run(
  UID,
  AG,
  null,
  now,
);
console.log('Tomi member az ag-shift-lead-ben:', UID);

// 'tomi' channel destination so Axiom can <message to="tomi"> (see the
// agent_destinations-missing-channel gotcha — wiring alone is not enough).
db.prepare(
  `INSERT OR IGNORE INTO agent_destinations (agent_group_id, local_name, target_type, target_id, created_at)
   VALUES (?, 'tomi', 'channel', ?, ?)`,
).run(AG, mgId, now);
console.log('destination: ag-shift-lead →"tomi"→', mgId);

db.close();
