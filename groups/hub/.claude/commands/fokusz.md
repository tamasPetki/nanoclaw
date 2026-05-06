**Munkanap-kezdő pillanatkép.** Markdown szöveg, NEM card (no interakció kell). Üres sorokkal tagolt, gyorsan átfutható.

## 1. Adatgyűjtés (párhuzamosan)

- `mcp__todoist__list_tasks` filter `(overdue | today)` és külön `7 days`
- `mcp__google-calendar__list_events` ma + 3 nap
- `bash source /workspace/agent/.secrets && python3 /workspace/agent/email-prefilter.py` — heading-szintű észrevétel
- `Read wiki/projects/*/summary.md` minden aktív projekthez
- `tail -30 wiki/log.md` + `wiki/findings/draft-current-week.md` friss jelek

## 2. Szintézis — KÖTELEZŐ EGYSÉGES FORMÁTUM

A turn output **egyetlen Markdown szöveg** (a turn végi text auto-küldve Telegramra). NE hívj `send_card`-ot. NE hívj `send_message`-t — csak természetes turn-záró szöveg.

### Szerkezet (mindig pontosan ez, ebben a sorrendben):

```
🎯 *Fokusz — {weekday_hu}, {YYYY-MM-DD} {HH:MM}*
{N1} lejárt · {N2} mai · {N3} héten · {N4} esemény · {N5} új email

🔥 *MOST AZONNAL*
{emoji} [{projekt}] {feladat} · {miért most} · {effort}
{emoji} [{projekt}] {feladat} · {miért most} · {effort}
...

🟡 *MAI / E HETI PRIO*
{emoji} [{projekt}] {feladat} · {miért most} · {effort}
...

📊 *Projektek pillanatkép*
{emoji} [{projekt}] {fázis} · {blokkoló|halad} · {milestone}
{emoji} [{projekt}] {fázis} · {blokkoló|halad} · {milestone}
...

📅 *Naptár — ma*
{HH:MM} — {esemény} · {helyszín} {emoji}
{HH:MM} — {esemény} · {helyszín} {emoji}
...

🗓️ *Holnap + holnapután*
{nap-rövid} {HH:MM} — {esemény} · {előkészület-utalás}
...

💡 *Darálási sorrend (alulról fel)*
1. {emoji} [{projekt}] {feladat} · {effort}
2. {emoji} [{projekt}] {feladat} · {effort}
...
```

### Konvenciók

- **Üres sor minden szekció között** — a `*HEADING*` előtt egy üres sor (kettős `\n\n`).
- **Egy sor egy item** — a szekció-en belül NINCS üres sor a sorok között (zsúfolva, gyorsan átolvasható lista).
- **Heading**: `*BOLD*` Telegram-Markdown.
- **Emoji**: 🚨 24h+ overdue, 📞 telefon-call, 💰 pénz/számla, 📧 email-válasz, ⏰ órás deadline, 🏗️ ingatlan, 🍴 vendéglátós, 📁 egyéb, 💼 PS-ernyő, 🏠 személyes, 📹 videó-meet, 📍 fix helyszín.
- **Project-tag fix**: `[Görgey 32]` `[Csobánka]` `[Törökhegy]` `[Rózsa u.]` `[Lupa]` `[Trinken]` `[PS]` `[edző]` `[személyes]`.
- **Effort konvenció**: `~5p` `~15p` `~30p` `~1ó` `~2ó+` (pesszimista).
- **Projektek fix sorrend**: Görgey 32 → Csobánka → Törökhegy → Rózsa u. → Lupa Öböl → Trinken Essen → PS-ernyő → személyes/egyéb.
- **Darálási sorrend**: 1-2 quick win → 3-5 blokkoló-feloldó → 1-3 mély feladat. Számozás 1-től.

### Üres szekció kezelés

- 0 kritikus → ne add a `🔥 MOST AZONNAL` szekciót, jelezd a fejlécben "0 kritikus"
- 0 mai esemény → ne add a `📅 Naptár — ma` szekciót
- 0 holnap-holnapután → ne add a `🗓️ Holnap + holnapután` szekciót

## 3. Anti-pattern (NE)

- ❌ `mcp__nanoclaw__send_card` hívás — ez nem card, ez szöveg.
- ❌ "Itt van a teljes Todoist export" — csak a 7 napos ablak prio-szerint.
- ❌ Email-tartalom részletes feldolgozása — csak heading-szintű észrevétel ("3 új levél, 1 számla várja a továbbítást Erikának"). Részletes feldolgozásra van `/email`.
- ❌ Crypto / hírek bevonása — azokra `/hirek` és `/edzo` van. A `/fokusz` business-fókuszú.
- ❌ Generikus javaslat: "gondold át a Görgey 32 stratégiát" — helyette: "[Görgey 32] hívd fel Bérczyt 11:00-ig (vízbekötés döntés)".

Köztes / utószöveg ("Összerakom...", "Card kész...") rendben — Tomi continuous progress-reportokat szereti.
