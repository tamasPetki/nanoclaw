Worker (ag-worker) háttér-agent állapota és vezérlése.

A worker session DB readonly mountolva van a hub container-be: `/workspace/extra/worker-sessions/`. Ezen keresztül kérdezed le a workert akkor is ha NEM fut.

## Argumentum-parsing

```
/worker            → státusz pillanatkép (alábbi formátum)
/worker log        → utolsó 24h aktivitás-kivonat
/worker <bármi>    → cross-agent üzenet a workernek a `mcp__nanoclaw__send_message` toollal
                     (destination név: "worker"). Ha halott, figyelmeztesd Tomi-t hogy
                     a következő spawn fogja feldolgozni.
```

## Lekérdezési minta — Bun one-liner SQLite-on

A hub container-ben nincs `sqlite3` CLI, viszont van `bun:sqlite`. Minden DB-lekérdezést így futtass (a worker DB-ket readonly nyitod, a worker írja őket):

```bash
bun -e '
import { Database } from "bun:sqlite";
const db = new Database("<DB-PATH>", { readonly: true });
const rows = db.prepare("<SQL>").all();
console.log(JSON.stringify(rows, null, 2));
'
```

Vagy soros formában (egyetlen `bun -e "..."` blokkban) — a Bash tool-od hívja meg.

## Státusz pillanatkép (üres argumentum)

Lépések:

1. **Aktuális session megkeresése**:
   ```bash
   SESS=$(ls -td /workspace/extra/worker-sessions/sess-*/ 2>/dev/null | head -1)
   ```
   Ha üres → válasz: `*🛠️ Worker*\n\nNincs aktív session.` STOP.

2. **Heartbeat kor**:
   ```bash
   HB_AGE=$(($(date +%s) - $(stat -c %Y "$SESS/.heartbeat" 2>/dev/null || echo 0)))
   ```
   - `<90s` → 🟢 **él** (`{HB_AGE}s`)
   - `<900s` → 🟡 **csendes** (kb `{HB_AGE/60} perc`)
   - `>=900s` → 🔴 **halott** (`{HB_AGE/60} perc, container valószínűleg lejárt`)

3. **Current tool** + **utolsó 3 outbound** + **pending input** — egy bun-script-tel:
   ```bash
   bun -e "
   import { Database } from 'bun:sqlite';
   const sess = '$SESS';
   const out = new Database(sess + '/outbound.db', { readonly: true });
   const ino = new Database(sess + '/inbound.db', { readonly: true });
   const cs = out.prepare('SELECT current_tool, datetime(tool_started_at,\"localtime\") AS started FROM container_state').get();
   const last = out.prepare('SELECT seq, kind, datetime(timestamp,\"localtime\") AS ts, substr(content,1,160) AS content FROM messages_out ORDER BY seq DESC LIMIT 3').all();
   const pending = ino.prepare('SELECT kind, COUNT(*) AS n FROM messages_in WHERE status=\"pending\" GROUP BY kind').all();
   console.log(JSON.stringify({ cs, last, pending }, null, 2));
   "
   ```

4. **Worker-activity wiki** mai blokk (ha létezik):
   ```bash
   awk -v d="$(date +%Y-%m-%d)" '/^## / { p = ($0 ~ d) } p' /workspace/agent/wiki/worker-activity.md 2>/dev/null | head -40
   ```
   Ha üres / fájl nincs → "Mai blokk üres."

Output formátum (Telegram, üres sor szekciók között, NINCS `<url>`, csak nyers URL):

```
*🛠️ Worker — {timestamp}*

*Állapot:* 🟢 él · {HB_AGE}s
*Csinál:* {current_tool} (started {started}) — vagy "tétlen / poll-loop" ha üres
*Várólistán:* 2 task · 1 chat-sdk — vagy "üres"

*Utolsó 3 output:*
• `seq=42 chat 21:00` Bulltrapp outreach 3-ből 2 ment ki
• `seq=40 send_message 20:55` [worker→hub] phase=outreach action=...
• `seq=38 task 20:30` cron-fire bulltrapp-daily

*Mai napló:*
{worker-activity.md mai blokk vagy "üres"}
```

## Log sub-command (`/worker log`)

24h aggregát:

```bash
bun -e "
import { Database } from 'bun:sqlite';
const sess = '$SESS';
const out = new Database(sess + '/outbound.db', { readonly: true });
const agg = out.prepare(\"SELECT kind, COUNT(*) AS n FROM messages_out WHERE datetime(timestamp) > datetime('now','-24 hours') GROUP BY kind ORDER BY n DESC\").all();
const lastTool = out.prepare(\"SELECT current_tool, datetime(tool_started_at,'localtime') AS started FROM container_state\").get();
console.log(JSON.stringify({ agg, lastTool }, null, 2));
"
```

Plusz `wiki/worker-activity.md` utolsó 1-2 napjának kivonata. Markdown válasz, szekciókra tagolva.

## Send sub-command (bármi más)

```
mcp__nanoclaw__send_message({
  to: "worker",
  text: "<Tomi által írt üzenet>"
})
```

Ezután válaszolj Tomi-nak EGY rövid sorral:
- Ha él (HB_AGE < 900s): `Üzenet a workernek elküldve.`
- Ha halott (HB_AGE >= 900s): `Üzenet a worker inboxába tettem, de most halott — a következő cron-spawn fogja feldolgozni.`
