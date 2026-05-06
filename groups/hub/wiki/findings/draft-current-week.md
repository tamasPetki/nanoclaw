---
title: "Draft — aktuális heti findings buffer"
type: finding
tags: [meta, draft]
---

# Draft — aktuális heti findings buffer

Ezt a fájlt a hub és a runtime hookok írják menet közben (zajmentesen). A vasárnapi `self-improvement` reflection ezt **első helyen** olvassa, és aggregálja a végleges `wiki/findings/YYYY-W<NN>.md`-be. Vasárnap után törlődik (új héthez friss draft).

Forrás-jelek:

- `[YYYY-MM-DD HH:MM] tomi-feedback (frustration/repeat/directive/correction-prefix)` — az `tomi-feedback-logger` hook (claude.ts) Tomi frusztrációs / korrekciós mintáit detektálta.
- `[YYYY-MM-DD HH:MM] tool-failure` — a `tool-failure-logger` hook MCP / tool-hibát naplózott.
- `[YYYY-MM-DD HH:MM] quick-learning-applied` — a hub instant skill-edit (Tomi explicit "jegyezd meg / ne csináld többé / mostantól mindig X" kérésére).

Bejegyzések alább, append-only:

## [2026-05-06T17:22:05.478Z] tomi-feedback (directive)
<context timezone="Europe/Budapest" />
<message id="100" from="unknown:telegram:telegram:1243781160" sender="Tom" time="May 6, 2026, 7:21 PM">Jegyezd meg, hogyha valami baj volt és sikerült megoldani, akkor mi volt a megoldás</message>

## [2026-05-06 19:21] quick-learning-applied | /workspace/agent/CLAUDE.local.md | Új "Probléma → megoldás napló" szekció + wiki/troubleshooting.md létrehozva — megoldott hibák ezentúl ide kerülnek.
