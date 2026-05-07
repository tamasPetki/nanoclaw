Email-check ad-hoc futtatás. Ugyanaz a workflow mint a `task-hub-email-check` cron-é, de manuális trigger:

1. Futtasd a pre-filter scriptet:
```bash
source /workspace/agent/.secrets && python3 /workspace/agent/email-prefilter.py
```

2. A `data` mezőből megkapod fiókonként az új levelek headerjeit (3 fiók: pietscarlet, lupaobol, trinkenessen).

3. Workflow innen ugyanaz mint a cron-prompt-ban: per-fiók summary, ask_user_question card döntés-igénylő itemekhez, "send_email" ha approve. A részletek a `/app/skills/email-assistant/SKILL.md`-ben.

4. Eredmény Tomi-nak Telegramra (NEM Discord — minden Discord channel megszűnt).

**Output formátum — KRITIKUS**:
- A reggeli/ad-hoc email-summary MAGA **plain Markdown szöveg** (nem `send_card`!). Telegramon a card `actions: [{label,value}]` mező nélkül is csak szöveggé renderelődik gombok nélkül, és a sortörést sem tagolja jól. Sima text üres sorral elválasztva minden fiók-szekciót:
  ```
  📧 *Reggeli email — 3 új*

  Egyik döntést sem igényel azonnal, de a lupaobol-ra jött FB partner request gyanús.

  *🏢 PietScarlet — 1 új*
  UID 2426 — Serwis Budowy (PL): ...

  *🍺 Trinkenessen — 1 új*
  UID 1609 — ...

  *🏠 Lupa Obol Strand — 1 új*
  UID 593 — ...
  ```
- Minden szekció (fiók) **után üres sor**. A szekción belül nincs üres sor.
- **Card CSAK akkor**, ha tényleg interaktív gomb kell (számla-továbbítás Erikának, scam-jelölés, válasz-tervezet jóváhagyása) — és akkor is `mcp__nanoclaw__ask_user_question` (NEM `send_card`), rövid (≤25 char) label-ekkel hogy ne csonkoljon a Telegram inline keyboard.
- Egy üzenetben EGY-egy döntésre EGY card. Több döntés-igénylő item → több külön ask_user_question, sorban.

Ha nincs új levél: 1-2 mondatos plain text "📭 Üres inboxok (3 fiók) — minden tiszta." NE küldj részletes elemzést ha 0 új.
