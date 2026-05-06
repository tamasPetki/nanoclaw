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

## [2026-05-06T17:35:33.111Z] tomi-feedback (directive)
<context timezone="Europe/Budapest" />
<message id="108" from="unknown:telegram:telegram:1243781160" sender="Tom" time="May 6, 2026, 7:35 PM">sortöréseket használhatsz, hogy tagoltabb legyen. Jegyezd meg 🙂</message>

## [2026-05-06 19:35] quick-learning-applied | /workspace/agent/CLAUDE.local.md | Card-okban sortörések / üres sorok használata a tagoltabb olvashatóságért.

## [2026-05-06T18:26:11.537Z] tomi-feedback (frustration)
<context timezone="Europe/Budapest" />
<message id="138" from="worker" sender="Unknown" time="May 6, 2026, 8:26 PM">[worker:rezerver] phase=fb-warmup-2 action=ABORT result=playbook fájl hiányzik (rezerver/platforms/facebook-groups.md nincs a workspace-ben, find-del se találom) — a 10-lépéses flow + Phase-policy + STOP-pingek mind ott vannak, anélkül felelőtlen FB session-t indítani. next=Tomi: vagy commit-eld be a platforms/facebook-groups.md-t, vagy adj zöld jelet a state.json-ban dokumentált Phase 2 szabályok alapján futtatni (max 2 lájk SAFE / hét, NO csatlakozás, badge+search-discovery only).</message>

## [2026-05-06T18:26:48.645Z] tool-failure
tool=Bash
error=Exit code 1
csobanka
gorgey32
lupaobol
pietscarlet
torokhegyi
trinkenessen
---
# Wiki log

Append-only kronológia. Minden ingest, query-szintézis, lint-pass ide naplózódik.

## [2026-05-06] init | Wiki rendszer felhúzva (D3)
Hub Karpathy LLM-Wiki ráhúzva. `wiki/`, `sources/`, `container/skills/wiki/SKILL.md`, schema-réteg a CLAUDE.local.md-ben. Ingest még nem kezdődött el; D4-től edző-források jön
