---
name: inline-ui
description: >
  MINDIG használd ezt a skillt amikor strukturált, lista-, vagy döntés-jellegű
  választ kéne adni. Trigger: ha a válasz több elemből áll (lista, opciók),
  Tomi-tól döntést igényel, vagy ha egy információt szépen tagolva kéne átadni
  (státusz, összegzés, fő-pontok). NE folyamatos prózát küldj amikor card vagy
  ask_user_question természetes lenne. Ez UX-szabály — minden chat-platformon
  (Telegram, Discord) érvényes.
---

# Inline UI komponensek — UX szabályrendszer

A NanoClaw kétféle inline-komponenst támogat platformokon átfogóan:

1. **`mcp__nanoclaw__send_card`** — display-only kártya, NEM blokkol, nem vár választ
2. **`mcp__nanoclaw__ask_user_question`** — kötelező döntés, **blokkolja** a turnt amíg Tomi tap-pol

Ezek Telegramon **inline keyboard**-ként render-elődnek, Discord-on Embed + Component-ek. Sokkal kezelhetőbbek mint a sima szöveg.

## Mikor MELYIK?

### Sima markdown szöveg
**Default** alapeset — egyszerű válasz, magyarázat, narratíva, beszélgetős reakció.

### `send_card`
Akkor használd, ha:
- **Több diszkrét item** kerül átadásra (pl. státusz-blokk, összegző-jelentés, lista 3-7 kategóriával)
- **Vizuálisan tagolt struktúra** segíti a megértést (címsor + leírás + opcionális gombok)
- **Linkek vagy akciók** opcionális gombokon (pl. "Nyisd a Drive-ban")
- **Reggeli/esti riportok**, ahol Tomi átfutja a fő-pontokat

**Nem kell** card ha:
- Egy mondat
- Tisztán beszélgetős reakció ("értem", "rendben")
- Hosszú próza ami kell-magyarázat

### `ask_user_question`
Akkor használd, ha:
- **Tényleg eldöntendő** kérdés van: küldjem/várj/töröld, igen/nem, válassz egyet a 3-ból
- A **következő lépés Tomi-tól függ** (nem fogsz tovább menni amíg nem mond)
- **Approval típusú döntés** (számla továbbítás, email küldés, projekt-action)

**Nem kell** ask_question ha:
- Csak információt kérdezel ("hány óra van?" típusú free-text)
- Nyitott kérdés ("mit gondolsz?")
- Egyértelmű egyetlen út van — te lépj és jelentsd vissza

## `send_card` API + példák

```ts
mcp__nanoclaw__send_card({
  card: {
    title: "🌅 Reggeli riport (2026-05-07)",
    description: "Withings + edzés + naptár",
    children: [
      { type: "section", text: "**Súly**: 95.8 kg (-0.3 kg / 7 nap)" },
      { type: "section", text: "**Alvás**: 7h12m, REM 1h30m, AHI 18 (jó)" },
      { type: "section", text: "**Mai edzés**: Upper Body — 18:00" },
    ],
    actions: [
      { label: "📊 Withings dashboard", url: "https://healthmate.com/..." },
      { label: "✅ Edzés indítása", value: "start_workout" },
    ],
  },
  fallbackText: "Reggeli riport: 95.8 kg, 7h12m alvás, AHI 18. Mai: Upper Body 18:00."
});
```

`fallbackText` KÖTELEZŐ — ha a platform nem támogat card-ot, ez megy ki.

### Tipikus card-tervek (pattern könyvtár)

#### Reggeli riport (edző / hub)
```
title: "🌅 Reggeli riport (YYYY-MM-DD)"
description: "Heti trend egy ránézéssel"
children:
  - "**Súly**: X kg (Δ -Y kg / 7 nap)"
  - "**Alvás**: Xh, REM Yh, AHI Z"
  - "**Mai edzés**: <típus> — <idő>"
actions: [csak ha ténylegesen van akció Tomi-nak]
```

#### Email-summary (PS / minden céges)
```
title: "📬 X új email — pietscarlet"
description: "Pri sorrend, top 3 lényeg"
children:
  - "🔴 **Sürgős** — Erika MOBIL-CENTRUM számla, vár válaszra"
  - "🟡 **Várhat** — Szabolcs Görgey-előrejelzés"
  - "🟢 **Olvasott** — 2 promo, archív"
actions: [
  { label: "Erika válasz draft", value: "draft_erika" },
  { label: "Mind ráadás megnyitása", value: "open_inbox" }
]
```

**Plusz:** minden DÖNTÉST igénylő item → KÜLÖN `ask_user_question` card sorban (high → med → low). Ne batch-eld egy kártyába a döntéseket.

#### Status / projekt áttekintés (Görgey 32 stb.)
```
title: "🏗️ Görgey 32 — státusz"
description: "Aktív blokkolók + következő 7 nap"
children:
  - "**Most**: tetőcserepezés (1-2 hét), homlokzati EPS félúton"
  - "**Vár vizsgára**: Bérczy vízszerelés újraindítás"
  - "**Költség**: hó eddig 4.2M Ft, plan 4.8M Ft"
actions: [
  { label: "📂 Wiki oldal", value: "open_wiki_gorgey32" },
  { label: "📝 Aktív Todoist (3)", value: "open_todoist" }
]
```

#### Worker activity digest
```
title: "🤖 Worker tegnap"
description: "BullTrapp + Rezerver — naptár"
children:
  - "**07:00 BullTrapp**: 3 cold email, 1 reply pozitív"
  - "**11:00 BullTrapp**: X poszt @Bulltrappcom, 12 like"
  - "**17:30 Rezerver**: FB Phase-1 commenter (2 új)"
```

## `ask_user_question` API + példák

```ts
const choice = await mcp__nanoclaw__ask_user_question({
  title: "Email továbbítás: MOBIL-CENTRUM",
  question: "Erika új vízóra-számlát küldött Görgey 32-re. Továbbítsam Szabolcsnak könyvelésre?",
  options: [
    { label: "Küldd",     selectedLabel: "✅ Elküldve",    value: "send" },
    { label: "Édit",      selectedLabel: "✏️ Szerkesztés", value: "edit" },
    { label: "Várj",      selectedLabel: "⏸️ Halasztva",   value: "wait" },
    { label: "Mégsem",    selectedLabel: "🙅 Mégsem",      value: "skip" },
  ],
  timeout: 600
});

if (choice === "send") { /* küldés */ }
if (choice === "edit") { /* kérdezz vissza szövegesen az edit-tel */ }
// stb.
```

**Konvenciók**:
- `title` rövid, akció-leíró (max ~50 char)
- `question` 1-2 mondat: a tét + a draft összefoglalója
- `options` minimum 3, max 4. Mindig adj egy "Várj/Halasszd"-t és egy "Mégsem"-et (ne csak Igen/Nem)
- `selectedLabel` post-tap visszajelzés — emoji + ige múlt időben ("✅ Elküldve", "❌ Mégsem")
- `timeout`: alapértelmezett 300s. Ha egy döntés tényleg várhat (pl. esti email-summary): 600-1800s. Ha kritikus most: 60-120s. **Scheduled/cron task kontextusban** (pl. reggeli email-summary, heti review) ahol Tomi órákkal később válaszolhat: `86400` (24h) — különben a kérdés lejár mire Tomi a chathez ül, és az agent kénytelen default-tal továbbmenni vagy semmit sem csinálni.

## Tomi UX preferenciák

1. **Folyamatos progress reporting** (memóriából `feedback_agent_progress_reporting.md`) — Tomi szereti látni a haladást. NE batch-eld EOD-digest-be amit menet közben tudsz mondani.
2. **Reflektív hang** (memóriából `feedback_agent_progress_voice.md`) — gondolkodj hangosan: hipotézis + miért + tanulság. NE kompakt bullet-tábla.
3. **Tagolva, strukturáltan** — Tomi explicit kérte ezt. Card > sima próza, ha az infó eleve több tételből áll.
4. **Emoji a chat-üzeneteknél / card-okban OK** — a card title-be lehet egy ikon (🌅 reggeli, 🏗️ projekt, 📬 email, ✅/❌ döntés), Tomi vizuális tagolásra szereti. NE spammeld minden mondatba. **Külső szövegben (email-body, X/LinkedIn poszt) NINCS emoji** — lásd `groups/global/CLAUDE.md` "Emoji-szabály".

## Card vs ask_question — döntésfa

```
Eldöntendő, és nem mehetek tovább nélküle?
  → ask_user_question

Eldöntendő, de én is léphetek alapból?
  → menj és jelentsd vissza, NE kérdezz

Több diszkrét tétel, vizuális struktúra segít?
  → send_card

Egy mondat, beszélgetős?
  → sima text
```

## Platform-specifikus megjegyzések

- **Telegram**: card render-elés inline keyboard-tel, max 100 button/üzenet, button-label max ~64 char. URL-button-ok rendben (callback nélkül kattintáskor megnyit).
- **Discord**: Embed + Components, max 5 row × 5 button. Embed description szöveg max 4096 char.
- **Markdown a card description-ben**: **bold**, *italic*, `code`, link-ek mindkét platformon mennek. Heading-ek (`#`) NEM ajánlottak card-ban — a title-mező az heading.

## Anti-pattern: SOHA

- ❌ Egy card-ba pakolni 7+ döntést — bontsd külön ask_question-okre.
- ❌ Card-ot "dekoratív" célból használni egy mondatos válaszra.
- ❌ ask_question-t használni free-text inputra ("mi a véleményed?") — szöveges üzenettel kérdezz.
- ❌ Hiányzó `fallbackText` — ha a platform nem render-eli a card-ot, üres üzenet megy.
