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
