---
title: Erika — könyvelő (PietScarlet)
created: 2026-05-06
updated: 2026-05-06
type: entity
tags: [partner]
sources: [sources/pietscarlet/email-check-workflow.md, sources/pietscarlet/persona.md, sources/lupaobol/email-check-workflow.md]
---

# Erika — könyvelő

PietScarlet Kft. könyvelője.

- **Email:** penzugy@pietscarlet.hu
- **Szerep:** számlák, díjbekérők, fizetési felszólítások célállomása
- **Hangnem felé:** udvarias, kedves, NEM utasító — köszönés + záró formula

## Hol jelenik meg

- [PietScarlet](../projects/pietscarlet/summary.md) — minden számla típusú email Erikához továbbítva (card-on Tomi jóváhagyás után)
- [Lupa Öböl](../projects/lupaobol/summary.md) — ugyanúgy, Erikához továbbítás
- [Trinken Essen](../projects/trinkenessen/summary.md) — **kivétel:** TE számlákat **Tomi maga intézi**, NEM megy Erikához

## Workflow

Számla-továbbítás Tomi card-jóváhagyása után (`mcp__nanoclaw__ask_user_question` → `forward`). Saját email MCP `mcp__email__send_email`, `html: true`, aláírás-blokk, threading `in_reply_to`. Akció után Message-ID + timestamp evidencia.
