---
title: Görgey Arthur u. 32. — társasház-építés (Vác)
created: 2026-05-06
updated: 2026-05-11
type: project
tags: [gorgey32, projekt, alvallalkozo, szerzodes, hataridő]
sources: [sources/gorgey32/persona.md, sources/gorgey32/alvallalkozok.md, sources/gorgey32/redony_megallapodas.md, sources/gorgey32/status.md]
---

# Görgey 32 — Vác társasház

PietScarlet Kft. társasházat épít Vác, Görgey Arthur u. 32. szám alatt. **7 lakás + 1 iroda, 3 szint, ~780 m².** A projekt 2025 augusztusában indult, 2026 májusára aktív kivitelezésben.

## Aktuális fázis (2026-05-11 status — Tomi helyszíni szemle)

**Garázs mennyezet — soron:**

1. Bérczy Gergő (TLK Invest) felrögzíti a mennyezetre a klíma kültéri egységéhez vezető **rézcsövet + tápkábelt**
2. Utána mehet a **mennyezet-szigetelés** (garázs)
3. Utána Attila csapata (A&D Vill) felteszi a **kábeltálcákat**

**Sürgős indok:** korábban betörtek a garázsba, **levagdalták a vezetékeket** (most kellett újra megcsinálni). A mennyezet-szigetelés egyúttal **védi is a vezetékeket** → minél előbb fel kéne kerüljön. Bérczy **2026-05-12 kedden** mondja a pontos időpontot a rézcső + tápkábel kihúzására.

## Aktuális fázis (2026-05-04 status)

**Tetőszerkezet / cserepezés** — folyamatban. Tetőablakok az egyik oldalon benn vannak. **1, max 2 héten belül kész az egyik oldal → átállványozás** a másik oldalra.

**Homlokzat** — EPS ragasztás kb. félnél, egyik oldal felállványozva.

**Vízszerelés / gépészet (TLK Invest, Bérczy Gergely)** — máj. 5-én folytatódik. Pár hét → **nyomáspróba**. Utána szervezhető a padlószigetelés az 1. emeleten.

**Padlószigetelés sorrend (víz után, 1. emelet):** szigetelés → fólia + háló → fűtéscsövek → **estrich (cél: május vége)**.

**Villany rough-in (A&D Vill / Salgovári Attila)** — **jövő hét 2. fele** kezdik a folytatást.

**E.ON betáplálás** — műszaki-gazdasági tájékoztatót várjuk; valószínűleg térítésmentesen, saját költségen kell rákötni. Tomi intézi.

## Alvállalkozók

| Munka | Cég | Kontakt |
|-------|-----|---------|
| Tetőszerkezet | Horgász Csaba | Horgász Csaba *(Excel ütemtervben hibásan „Unitető 2000")* |
| Villanyszerelés | A&D Vill | Salgovári Attila csapata |
| Gépészet + víz/csatorna | **TLK Invest** | **Bérczy Gergely** |
| Bádogos | Bádog Varázs | — |
| Nyílászáró / redőny | **Top Win Dows Kft.** | **Megyeri Attila** („nyílászárós Attila") |

**Korábban dolgozott, már nem aktív:** Letfusz és Fia (csak az alapszerelést csinálta — TLK Invest folytatja a gépészetet).

Általános alvállalkozó-adatbázis (42 céggel): `/workspace/global/references/alvallalkozok.md`.

## Redőny-megállapodások (vevőkkel)

Forrás: 2025-09-02 email Gergely Tamástól (`fixik@kabelfix.hu`), `Lakás_ár_megosztás_5lakás.xlsx` „Egyéb megállapodás" oszlop.

**Kombi redőnyt kap (vételár tartalmazza):**
- **B lakás** — Gergely Ágnes (Kosd, Erzsébet u. 47.)
- **G lakás** — Gergely Sándor (ugyanott) + P4+P5 GK beálló, T04 tároló

**NEM kap redőnyt (Gergely-családi csomag többi lakása):**
- C lakás — LAKSOLUTION Kft. (képv. Gergely Tamás), P7, T07
- E lakás — Gergely Sándor, T06+T01
- F lakás — Gergely Sándor, P6, T05

Eredetileg 3 lakás (C, E, F) szerepelt, később 5-re bővült (B, G hozzáadva — ők kapták a redőny-extrát). Az A, D, H és iroda lakásokra nincs redőny-megállapodás emailben.

## Következő teendők (pri sorrendben)

1. Cserepezés folytatás (1–2 hét) → átállványozás
2. EPS ragasztás 2. fele
3. Vízszerelés befejezés + nyomáspróba (TLK Invest)
4. Padlószigetelés → fólia/háló → fűtéscső → estrich 1. emelet (cél: máj. vége)
5. Villany rough-in folytatás (A&D Vill, jövő hét 2. fele)
6. E.ON műszaki-gazdasági tájékoztató bevárása → betáplálás
7. Bádogos munkák ütemezése (Bádog Varázs)
8. **QuiCK számla-címkézés (Tomi, ezen a héten)**

## Drive & toolok

- Drive scope: **csak `Ingatlanok/Vác, Görgey u. 32./` írható**, többi projekt-mappa read-only.
- Plugin skillek: `gorgey-koltsegvetes` (xlsx + QuiCK), `gorgey-utemterv` (Gantt). Az ütemterv xlsx **nem feltétlenül naprakész** — „hol tartunk" kérdéseknél a `status.md`/ezen oldal az alap.
