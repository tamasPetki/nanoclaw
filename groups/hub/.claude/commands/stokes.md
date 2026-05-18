Stokes (ag-stokes) család-asszisztens agent állapota, üzenet-log és vezérlés.

A Stokes session DB readonly mountolva van a hub container-be: `/workspace/extra/stokes-sessions/`. Ezen keresztül kérdezed le a Stokest akkor is ha NEM fut (a Stokes csak Szandra-üzenetnél spawnol fel).

## Argumentum-parsing

```
/stokes            → státusz pillanatkép (alábbi formátum)
/stokes log        → utolsó 24h üzenet-történet Szandra ↔ Stokes ↔ hub
/stokes <bármi>    → cross-agent üzenet a Stokes-nak a `mcp__nanoclaw__send_message` toollal
                     (destination név: "stokes"). Pl. /stokes szólj a feleségemnek hogy fél órát késem
```

## Lekérdezési minta — Bun one-liner SQLite-on

A hub container-ben nincs `sqlite3` CLI, viszont van `bun:sqlite`. Minden DB-lekérdezést így futtass (a Stokes DB-ket readonly nyitod, a Stokes írja őket):

```bash
bun -e '
import { Database } from "bun:sqlite";
const db = new Database("<DB-PATH>", { readonly: true });
const rows = db.prepare("<SQL>").all();
console.log(JSON.stringify(rows, null, 2));
'
```

## Státusz pillanatkép (üres argumentum)

Lépések:

1. **Aktuális session megkeresése**:
   ```bash
   SESS=$(ls -td /workspace/extra/stokes-sessions/sess-*/ 2>/dev/null | head -1)
   ```
   Ha üres → válasz: `*🎩 Stokes*\n\nNincs aktív session — Szandra még nem írt a botnak.` STOP.

2. **Heartbeat kor**:
   ```bash
   HB_AGE=$(($(date +%s) - $(stat -c %Y "$SESS/.heartbeat" 2>/dev/null || echo 0)))
   ```
   - `<90s` → 🟢 **él** (`{HB_AGE}s`)
   - `<900s` → 🟡 **csendes** (kb `{HB_AGE/60} perc`)
   - `>=900s` → 🔴 **lejárt** (`{HB_AGE/60} perc, a container valószínűleg leállt — természetes Szandra-aktivitás-szünetben)

3. **Current tool** + **utolsó 3 Stokes→Szandra üzenet** + **utolsó 3 Szandra→Stokes inbound** + **utolsó 3 Stokes↔hub A2A**:
   ```bash
   bun -e "
   import { Database } from 'bun:sqlite';
   const sess = '$SESS';
   const out = new Database(sess + '/outbound.db', { readonly: true });
   const ino = new Database(sess + '/inbound.db', { readonly: true });

   const cs = out.prepare('SELECT current_tool, datetime(tool_started_at,\"localtime\") AS started FROM container_state').get();

   // Stokes→Szandra Telegram-üzenetek (channel_type='telegram-stokes')
   const toWife = out.prepare(\"SELECT seq, datetime(timestamp,'localtime') AS ts, substr(content,1,200) AS content FROM messages_out WHERE channel_type='telegram-stokes' ORDER BY seq DESC LIMIT 3\").all();

   // Szandra→Stokes inbound (kind='chat-sdk')
   const fromWife = ino.prepare(\"SELECT seq, datetime(timestamp,'localtime') AS ts, kind, substr(content,1,200) AS content FROM messages_in WHERE kind='chat-sdk' ORDER BY seq DESC LIMIT 3\").all();

   // Stokes↔hub A2A — outbound to hub (kind='agent') + inbound from hub
   const toHub = out.prepare(\"SELECT seq, datetime(timestamp,'localtime') AS ts, substr(content,1,200) AS content FROM messages_out WHERE kind='agent' OR (kind LIKE '%agent%') ORDER BY seq DESC LIMIT 3\").all();
   const fromHub = ino.prepare(\"SELECT seq, datetime(timestamp,'localtime') AS ts, substr(content,1,200) AS content FROM messages_in WHERE kind='chat' OR source_session_id IS NOT NULL ORDER BY seq DESC LIMIT 3\").all();

   const pending = ino.prepare('SELECT kind, COUNT(*) AS n FROM messages_in WHERE status=\"pending\" GROUP BY kind').all();

   console.log(JSON.stringify({ cs, toWife, fromWife, toHub, fromHub, pending }, null, 2));
   "
   ```

4. **Stokes konfiguráció gyorsnézet** (csak ha kérdezi vagy szokatlan a state):
   - Csak ha a felhasználó kifejezetten kéri: `bash cat /workspace/agent/../stokes/CLAUDE.local.md | head -30` ezt **NEM** tudod, mert a hub-nak nincs read-mount a `groups/stokes/`-hoz. Ehelyett: ha Tomi a Stokes-config-ról kérdezi, válaszolj hogy `groups/stokes/CLAUDE.local.md`-t hostról kell olvasni.

Output formátum (Telegram, üres sor szekciók között, NINCS `<url>`, csak nyers URL):

```
*🎩 Stokes — {timestamp}*

*Állapot:* 🟢 él · {HB_AGE}s
*Csinál:* {current_tool} (started {started}) — vagy "tétlen / várja Szandra üzenetét" ha üres
*Várólistán:* {pending összegzés vagy "üres"}

*Utolsó 3 Stokes→Szandra (Telegram):*
• `seq=22 13:37` Ok, átküldtem Tominak ✅
• `seq=21 13:36` Megvan, beírtam a listára 👍
• `seq=19 12:18` Szia! Mizu? 😊

*Utolsó 3 Szandra→Stokes (inbound):*
• `seq=18 13:36` hozd le a padlásról Polli rózsaszín középméretű bőröndjét
• `seq=15 12:17` /start
• ...

*Utolsó 3 A2A Stokes↔hub:*
• `seq=20 13:37 → hub` [stokes:wife-says] Szandra kéri, hogy ...
• `seq=14 12:18 ← hub` Stokes, szólj Szandranak hogy ...
• ...

*Megjegyzés ha valami furcsa:*
- Ha 🔴 lejárt, az NORMÁL — a Stokes csak Szandra-üzenetnél spawnol, vagy /stokes <üzenet>-re.
- Ha sok pending van: lehet hogy queue-beragadt.
- Ha a "tomi destination" hallucinálás-szerű üzenetek vannak (lásd Stokes CLAUDE.local.md): flag-eld Tomi-nak.
```

## Log sub-command (`/stokes log`)

24h aggregát + Szandra-Stokes chat-history kivonat:

```bash
bun -e "
import { Database } from 'bun:sqlite';
const sess = '$SESS';
const out = new Database(sess + '/outbound.db', { readonly: true });
const ino = new Database(sess + '/inbound.db', { readonly: true });

// 24h üzenet-aggregát
const aggOut = out.prepare(\"SELECT channel_type, kind, COUNT(*) AS n FROM messages_out WHERE datetime(timestamp) > datetime('now','-24 hours') GROUP BY channel_type, kind ORDER BY n DESC\").all();
const aggIn = ino.prepare(\"SELECT kind, COUNT(*) AS n FROM messages_in WHERE datetime(timestamp) > datetime('now','-24 hours') GROUP BY kind ORDER BY n DESC\").all();

// Teljes Szandra-Stokes párbeszéd 24h (chronological, max 30)
const wifeChat = out.prepare(\"SELECT seq, datetime(timestamp,'localtime') AS ts, 'stokes' AS who, substr(content,1,300) AS text FROM messages_out WHERE channel_type='telegram-stokes' AND datetime(timestamp) > datetime('now','-24 hours') ORDER BY seq\").all();
const wifeIn = ino.prepare(\"SELECT seq, datetime(timestamp,'localtime') AS ts, 'wife' AS who, substr(content,1,300) AS text FROM messages_in WHERE kind='chat-sdk' AND datetime(timestamp) > datetime('now','-24 hours') ORDER BY seq\").all();

// Combine + sort by ts
const combined = [...wifeChat, ...wifeIn].sort((a,b) => a.ts.localeCompare(b.ts));

// A2A Stokes↔hub 24h
const a2a = out.prepare(\"SELECT seq, datetime(timestamp,'localtime') AS ts, substr(content,1,200) AS content FROM messages_out WHERE kind LIKE '%agent%' AND datetime(timestamp) > datetime('now','-24 hours') ORDER BY seq\").all();

const lastTool = out.prepare(\"SELECT current_tool, datetime(tool_started_at,'localtime') AS started FROM container_state\").get();

console.log(JSON.stringify({ aggOut, aggIn, combined: combined.slice(-30), a2a: a2a.slice(-10), lastTool }, null, 2));
"
```

Output formátum (Markdown, Telegram):

```
*🎩 Stokes — 24h log*

*Üzenet-aggregát:*
• Stokes→Szandra: 12 db
• Szandra→Stokes: 8 db
• A2A Stokes↔hub: 4 db

*Szandra ↔ Stokes párbeszéd 24h:* (utolsó 30, kronológikus)
**12:17 wife:** szia
**12:18 stokes:** Szia! Mizu? 😊
**12:30 wife:** vegyél tejet hazafelé
**12:31 stokes:** Beírtam Tomi listájára, szóltam neki ✅
...

*A2A Stokes↔hub:* (utolsó 10)
**13:36 →hub:** [stokes:wife-says] Szandra kéri, hogy hozd le a padlásról Polli rózsaszín bőröndjét.
**13:37 ←hub:** Stokes, kérlek add át Szandrának: Tomi elküldte Adelina diétás nyilatkozatát...
...

*Csinál most:* {current_tool} — vagy "tétlen"
```

## Send sub-command (bármi más)

```
mcp__nanoclaw__send_message({
  to: "stokes",
  text: "<Tomi által írt üzenet>"
})
```

Pl. `/stokes szólj a feleségemnek hogy fél órát késem` → Stokes A2A `<message to="stokes">` → Stokes átadja Szandrának butler-stílusban.

Ezután válaszolj Tomi-nak EGY rövid sorral:
- Ha él (HB_AGE < 900s): `Üzenet a Stokes-nak elküldve.`
- Ha lejárt (HB_AGE >= 900s): `Üzenet a Stokes inboxába tettem — Szandra következő üzeneténél vagy a következő kapcsolatban spawnolódik, és feldolgozza.`

## Tipikus debug-szcenáriók

- **"Stokes nem válaszolt Szandranak"** → `/stokes` → ha 🔴 lejárt és nincs friss inbound, Szandra üzenete nem érkezett meg (Telegram-csatorna probléma). Ha él de várólistán, valószínűleg LLM stuck.
- **"Stokes hibás üzenetet küldött"** → `/stokes log` → keresd a Stokes→Szandra utolsó üzenetet, hasonlítsd össze a Szandra-utolsó-inboundjával.
- **"Tomi heads-up nem érkezett (Stokes-üzenetre)"** → `/stokes log` → keresd `[stokes:wife-says]` A2A-t. Ha küldte, akkor a hub oldalán hibázott (lásd hub log). Ha nem, akkor Stokes hibázott.
- **Konkrét incidens-példa 2026-05-14**: Szandra bőrönd-üzenete → Stokes A2A `[stokes:wife-says]` a hub-felé OK, DE a hub hallucinálta hogy "tomi destination nem elérhető" és Tominak SEMMI nem ment ki. Fix: hub CLAUDE.local.md most már explicit `<message to="user">`-t használ. Lásd `feedback_v2_post_compact_wiki_amnesia.md`.
