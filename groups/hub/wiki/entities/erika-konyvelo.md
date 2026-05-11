---
title: Erika — könyvelő (PietScarlet)
created: 2026-05-06
updated: 2026-05-07
type: entity
tags: [partner, pietscarlet, lupaobol]
sources: [sources/pietscarlet/email-check-workflow.md, sources/pietscarlet/persona.md, sources/lupaobol/email-check-workflow.md]
confidence: high
---

# Erika — könyvelő

PietScarlet Kft. könyvelője.

- **Email:** penzugy@pietscarlet.hu
- **Szerep:** számlák, díjbekérők, fizetési felszólítások, banki pénzmozgás-értesítők célállomása

## Hangnem / kommunikációs stílus

- Magyar, **tegezés**
- Megszólítás: `Szia Erika,`
- **Mindig nagyon kedves** — udvarias, NEM utasító
- Emoji belefér (mértékkel), egyszerű kedves vicc/könnyed hangulat is OK — **de ne tolja túl**
- Tömör, lényegre törő — nem kell túlmagyarázni
- Záró formula + aláírás-blokk minden levél végén
- HTML email (`html: true`), threading `in_reply_to`-val ha létező szálra megy
- **Aláírás:** PietScarlet branded HTML signature — `/workspace/agent/sources/pietscarlet/signature-tomi.html` (logó + Petki Tamás / ügyvezető / PietScarlet Kft. / tel + email + web). Minden Erikának menő levél végére beilleszteni.

## Draft sablon (számla továbbítás)

```
Szia Erika! 🙂

Csatolva küldöm a(z) [X] számlát — [összeg], határidő [YYYY-MM-DD].

Köszi szépen!

Üdv,
Tomi
```

**Tartsd rövidre.** Ne írj „Ha bármi furcsát látsz, szólj" / „semmi extra, megy a kerékvágásban" / projekt-kontextus-mondatokat — Erika a pénzügyes, jóban vannak, de **nem ennyire chatty** a levelezés. Csak ha tényleg szükséges (pl. szokatlan tétel, magyarázat kell), akkor 1 rövid mondat.

## Workflow

1. Email check (9/13/17 CET) kategorizál → **számla** kategória.
2. Kontextusgyűjtés (Drive INDEX/CATALOG, múltbeli emailek, Todoist).
3. Card Tomi-nak: `ask_user_question` `Küldd / Várj / Mégsem`.
4. Jóváhagyás után `mcp__email__send_email` (HTML, aláírás, in_reply_to).
5. Evidencia visszaküldés: **Message-ID + timestamp**, nem csak ✅.

## Hol jelenik meg

- [PietScarlet](../projects/pietscarlet/summary.md) — minden számla típusú email Erikához továbbítva
- [Lupa Öböl](../projects/lupaobol/summary.md) — ugyanúgy, Erikához továbbítás
- [Trinken Essen](../projects/trinkenessen/summary.md) — **kivétel:** TE számlákat **Tomi maga intézi**, NEM megy Erikához

## Tilalmak

- Tomi jóváhagyása nélkül **TILOS** kiküldeni.
- Header-only "számla" detektálás TILOS — body-fetch kötelező a kontextushoz.
- Hallucinált összeg / határidő TILOS — ha hiányzik, kérdés Tomi-hoz.
