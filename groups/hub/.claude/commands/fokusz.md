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

## 2. Szintézis — KÖTELEZŐ EGYSÉGES FORMÁTUM

A card minden alkalommal **pontosan ugyanezzel a struktúrával** menjen, hogy Tomi szem-szinten gyorsan tudja olvasni. NE kreatívkodj a sorrenddel/címekkel/sor-formátummal.

### Title + description

```
title: "🎯 Fokusz — {weekday_hu}, {YYYY-MM-DD} {HH:MM}"
description: "{N1} lejárt · {N2} mai · {N3} héten · {N4} esemény · {N5} új email"
```

`weekday_hu` = `hétfő|kedd|szerda|csütörtök|péntek|szombat|vasárnap`. Számok nullával ha 0.

### Section 1 — `🔥 MOST AZONNAL`

Kritikus blokkolók. Max 5 sor. Sor-formátum:

```
{emoji} [{projekt}] {feladat} · {miért most} · {effort}
```

- `emoji`: 🚨 ha 24h+ overdue, 📞 ha telefon-call kell, 💰 ha pénz/számla, 📧 ha email-válasz, ⏰ ha óra-szintű deadline
- `[projekt]`: `[Görgey 32]` `[Csobánka]` `[Törökhegy]` `[Rózsa u.]` `[Lupa]` `[Trinken]` `[PS]` `[edző]` `[személyes]`
- `{feladat}`: konkrét akció ige + tárgy. NEM "gondold át". Pl. "hívd Bérczyt vízbekötés ügyben".
- `{miért most}`: 1 frázis ami magyarázza miért nem várhat. "lejárt 2 napja", "11:00 deadline", "ügyfél vár".
- `{effort}`: `~5p` `~15p` `~30p` `~1ó` `~2ó+`. Pesszimista becslés.

Ha 0 kritikus item: ne küldd ezt a szekciót, hanem hagyd ki és a description-ben jelezd: "0 kritikus".

### Section 2 — `🟡 MAI PRIO`

Mai esedékes / prioritás P3-P4. Pontosan ugyanaz a sor-formátum mint a fenti. Max 7 sor.

### Section 3 — `📊 Projektek pillanatkép`

Minden aktív projekt **EGY sor**, fix sorrenddel: Görgey 32 → Csobánka → Törökhegy → Rózsa u. → Lupa Öböl → Trinken Essen → PS-ernyő → személyes/egyéb. Sor-formátum:

```
{emoji} [{projekt}] {fázis 2-3 szó} · {blokkoló vagy "halad"} · {következő mérföldkő}
```

- `emoji`: 🏗️ ingatlan, 🍴 vendéglátós, 📁 egyéb, 💼 PS-ernyő, 🏠 személyes
- `{fázis}`: pl. "tetőcserepezés", "vízszerelés", "tervezés", "felvétel-egyeztetés"
- `{blokkoló}`: ha valami stuck, ⚠️ + 1 mondat. Ha minden megy magától: "halad".
- `{következő mérföldkő}`: 1 frázis dátum-utalással ha van. "kőzetgyapot ajánlat e hét", "május 15 stat. terv".

### Section 4 — `📅 Naptár — ma`

Sor-formátum:

```
{HH:MM} — {esemény címe} · {helyszín ha van} {emoji ha link}
```

- `emoji`: 📹 ha videó-meet (Meet/Zoom), 📍 ha fix helyszín, ⏳ ha várakozás-jellegű (dentist, érkezés)

Ha 0 esemény: hagyd ki ezt a szekciót.

### Section 5 — `🗓️ Holnap + holnapután`

Sor-formátum:

```
{nap-rövid} {HH:MM} — {esemény} · {előkészület-utalás ha kell}
```

- `nap-rövid`: `kedd`, `sze`, `csüt`, `pé`, `szo`, `vas`. Holnap-holnapután 2 nap.
- `{előkészület-utalás}`: ha kell előkészület. "összeszedni anyagot", "agendát írni", "telefon előtte". Ha nem kell: hagyd ki.

### Section 6 — `💡 Darálási sorrend`

Tomi **alulról felfelé** darálja. 5-10 item. Sor-formátum:

```
{sorszám}. {emoji} [{projekt}] {feladat} · {effort}
```

Sorrend logika:
1. **Első 1-2 = quick win** (`~5p`, `~15p`) — megerősíti a flow-t, adrenalint ad
2. **Középső 3-5 = blokkoló-feloldók** — feloldja a függő dolgokat (telefon-callok, email-válaszok, döntések)
3. **Utolsó 1-3 = nagyobb feladat** (`~1ó`, `~2ó+`) — addig amíg friss az agy

Számozás 1-től felfelé (Tomi alulról kezdi → azaz 1-es a legutolsó). Vagy fordítva: számozás "Most:", "Aztán:", "Utána:" — válaszd ezt:

```
1. 🚨 [Görgey 32] hívd Bérczyt vízbekötés ügyben · ~15p
2. 💰 [PS] Erika számla továbbítás (MOBIL-CENTRUM) · ~5p
3. 📞 [Lupa] Borsóval felvétel-egyeztetés · ~20p
4. 📧 [Csobánka] válasz a tervezőnek · ~30p
5. 🏗️ [Görgey 32] kőzetgyapot ajánlat-kérés 3 helyre · ~1ó
```

### Záró fallback

```
fallbackText: "Fokusz {YYYY-MM-DD}: {N1} lejárt, {N2} mai, {N3} esemény, {N4} email. Most: {1. tétel rövid}. Részletek a card-ban."
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
- ❌ **`Card kiment` / `Összerakom...` / bármi szöveges üzenet a card MELLÉ vagy UTÁN**. A card a teljes turn-output. Egy turn = egy `mcp__nanoclaw__send_card` hívás, és KÉSZ. Ha közben olvasol/várakozol, NE küldj köztes szöveget ("1 perc..."). A card a végén megjelenik magától, ha csinálni kellett.
- ❌ Külön szöveges narratíva a card mellé — Tomi a card-ot nézi, plus szöveg zaj.
- ❌ Email-tartalom részletes feldolgozása — csak heading-szintű észrevétel ("3 új levél, 1 számla várja a továbbítást Erikának").
- ❌ Crypto / hírek bevonása — azokra `/hirek` és `/edzo` van. A `/fokusz` business-fókuszú.
- ❌ Javaslat ami nem konkrét: "gondold át a Görgey 32 stratégiát" — helyette: "[Görgey 32] hívd fel Bérczyt 11:00-ig (vízbekötés döntés)".

## 5. EGY TURN = EGY KIMENET

A `/fokusz` egyetlen `mcp__nanoclaw__send_card` hívás. NEM:
- `send_message` "Összerakom..." előtte
- `send_message` "Card kiment..." utána
- Két külön card

Ha **olvasnod/várnod** kell tool-okra (Todoist, Calendar, email pre-filter), csak hívd őket — Tomi nem lát közben semmit, és ez OK. A végén egyetlen card megy ki.
