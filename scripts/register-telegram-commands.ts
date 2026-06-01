/**
 * Telegram slash command registráció a Bot API-n keresztül.
 * Ez beállítja a Telegram-felé a parancslistát — Tomi a `/` gombbal autocomplete-et kap.
 *
 * Futtatás: `pnpm exec tsx scripts/register-telegram-commands.ts`
 *
 * Idempotens — minden futtatáskor felülírja a teljes listát az itteni definícióval.
 * Új parancs hozzáadása: bővítsd a COMMANDS tömböt + commit + futtasd újra.
 */

import fs from 'fs';

// Load .env manually (dotenv not in host package.json deps)
function loadEnv(file: string): void {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
  }
}
loadEnv('/root/nanoclaw-v2/.env');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN missing from .env');
  process.exit(1);
}

const COMMANDS: Array<{ command: string; description: string }> = [
  { command: 'fokusz',    description: 'Munkanap-pillanatkép: prioritás-lista mindenből' },
  { command: 'projektek', description: 'Projekt-státusz: PS, Görgey, Csobánka, stb.' },
  { command: 'teendok',   description: 'Mai + 7 napos TickTick teendőlista' },
  { command: 'email',     description: 'Email-check most (PS, Lupa Öböl, Trinken)' },
  { command: 'hirek',     description: 'Napi hírdigest most (politika, kripto, AI)' },
  { command: 'edzo',      description: 'Reggeli edző-riport (Withings + edzésnapló)' },
  { command: 'naptar',    description: 'Mai + holnapi naptár-események' },
  { command: 'wiki',      description: 'Wiki keresés — argumentum: keresett téma' },
  { command: 'szia',      description: 'Hub-bemutatkozás / kezdés' },
  { command: 'worker',    description: 'Worker állapot / 24h log / üzenet' },
  { command: 'help',      description: 'Súgó — elérhető parancsok listája' },
];

const url = `https://api.telegram.org/bot${TOKEN}/setMyCommands`;

const body = {
  commands: COMMANDS,
  // scope: { type: 'default' } — minden chat-re érvényes (default)
};

async function main() {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok: boolean; result?: unknown; description?: string };
  if (!data.ok) {
    console.error(`setMyCommands failed: ${data.description}`);
    process.exit(1);
  }
  console.log(`✓ ${COMMANDS.length} parancs regisztrálva a Telegram-bot-ban`);
  for (const c of COMMANDS) console.log(`  /${c.command}  — ${c.description}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
