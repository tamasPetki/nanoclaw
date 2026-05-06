**Munkanap-kezdő pillanatkép.** Tomi mindjárt darálja a taskokat — a feladatod: minden forrásból összerakni egy **prioritás-rendezett akció-listát**, hogy ne felejtsen el semmit, és mindegyik aktív projekt haladjon.

## 1. Adatgyűjtés (párhuzamosan, ne egymás után)

### a) Todoist
- `mcp__todoist__list_tasks` filter `(overdue | today)` → lejárt + mai
- `mcp__todoist__list_tasks` filter `7 days` → következő 7 nap
- Minden task-ot project_id alapján csoportosíts (a project-mapping a `/app/skills/todoist/SKILL.md`-ben)

### b) Naptár
- `mcp__google-calendar__list_events` ma + következő 3 nap (ma, holnap, holnapután)
- Külön jelöld ha van Meet/Zoom link, ütközés, vagy fontos resource (helyszín, irodai látogatás)

### c) Email
- `bash source /workspace/agent/.secrets && python3 /workspace/agent/email-prefilter.py` — pre-filter futtatás
- Az új levelek headerjét fiókonként (3 fiók: pietscarlet, lupaobol, trinkenessen)
- **DE**: ne dolgozd fel részletesen — csak vedd észre ha vannak döntés-igényelő levelek (számla, válasz-vár, ügyfél-üzenet). Részletes feldolgozás `/email`-lel külön kérhető.

### d) Wiki — projekt-státuszok
- Olvasd el az aktív projekt summary-ket: `wiki/projects/*/summary.md`
- Minden projekthez extract: jelenlegi fázis, blokkolók, következő mérföldkő
- Ne dump-old a teljes summary-t, csak az 1-mondat heti haladási mutatót

### e) Wiki — friss aktivitás
- `tail -30 wiki/log.md` — utolsó 30 ingest/decision/finding
- `wiki/worker-activity.md` mai szakasz (worker mit csinált)
- `wiki/findings/draft-current-week.md` — friss tomi-feedback és tool-failure jelek (ha van)

## 2. Szintézis

Készíts **egy `mcp__nanoclaw__send_card`-ot** a következő struktúrával:

```
title: "🎯 Fokusz — <weekday>, <YYYY-MM-DD HH:MM>"
description: "<rövid 1-mondat helyzet: pl. 'N lejárt task, M mai esedékes, K naptár-esemény, P email vár'>"
children:
  - { type: "section", title: "🔥 MOST AZONNAL", children: [{ type: "text", text: "Kritikus blokkolók — lejárt task ami 24h+ óta lóg, ma esedékes naptár-esemény ami órán belül van, ügyfél-válasz ami túlesett a deadline-on. 3-5 item max." }] }
  - { type: "section", title: "🟡 MAI PRIO (sorrendben)", children: [{ type: "text", text: "Tomi-féle darálás-sorrendben: a 3-7 task amit ma érdemes elintézni. Project-tag minden item mellett. Javasolt sorrend: könnyű quick win-ek (15-30 perc) → blokkoló-feloldók → értekezletek előkészítése." }] }
  - { type: "section", title: "📊 Projektek pillanatkép", children: [{ type: "text", text: "Minden aktív projekt 1 sora: '🏗️ Görgey 32 — fázis: tetőcserepezés, blokkoló: vízbekötés döntés (Bérczy 10,5M), következő: kőzetgyapot ajánlat'. Ha minden megy magától, írd: 'halad'. Ha valami stuck, jelöld ⚠️-nyel." }] }
  - { type: "section", title: "📅 Naptár — ma", children: [{ type: "text", text: "Ma esedékes események listája: HH:MM — címe (helyszín). Ha üres, kihagyható." }] }
  - { type: "section", title: "🗓️ Holnap-holnapután", children: [{ type: "text", text: "Előzetes — ami készülni kell rá (előkészület, anyaggyűjtés, telefon)." }] }
  - { type: "section", title: "💡 Javasolt darálási sorrend", children: [{ type: "text", text: "5-10 task konkrét sorrendben. Először a quick-win-ek (megerősíti a flow-t), aztán a kritikusak. Becsült idő mellette: '(~15 perc)'. Tomi ezt **darálni fogja** lentről felfelé." }] }
fallbackText: "Fokusz: <N lejárt>, <M mai>, <K esemény>, <P email>. Részletek a card-ban."
```

## 3. Konvenciók

- **Magyar**, tegezős, lényegre. NE töltögess szöveget.
- **Számszerű**: minden szekció elejére darab-szám ("3 lejárt", "7 mai", "2 esemény").
- **Project-tag** minden task mellett: `[Görgey 32]`, `[Csobánka]`, `[Lupa]`, `[Trinken]`, `[személyes]`.
- **Effort-becslés** a "Javasolt darálási sorrend"-ben: `(~15 perc)`, `(~30 perc)`, `(~1 óra)`. Pesszimista becslés.
- **Ne küldj 2 cardot** — egyetlen card mindennel. Ha túl hosszú, vágd vissza a "Holnap-holnapután"-t és a "Projektek pillanatkép"-et 1-1 sorra projektenként.
- **Ne kérdezz vissza** semmit (NE `ask_user_question`) — Tomi ezt megnézi és darálni kezd. A részleteket külön slash commandokkal kéri (`/teendok`, `/email`, `/naptar`, `/projektek`).

## 4. Anti-pattern (NE)

- ❌ "Itt van a teljes Todoist export" — csak a 7 napos ablak, prioritálva.
- ❌ Külön szöveges narratíva a card mellé — Tomi a card-ot nézi, plus szöveg zaj.
- ❌ Email-tartalom részletes feldolgozása — csak heading-szintű észrevétel ("3 új levél, 1 számla várja a továbbítást Erikának").
- ❌ Crypto / hírek bevonása — azokra `/hirek` és `/edzo` van. A `/fokusz` business-fókuszú.
- ❌ Javaslat ami nem konkrét: "gondold át a Görgey 32 stratégiát" — helyette: "[Görgey 32] hívd fel Bérczyt 11:00-ig (vízbekötés döntés)".
