---
title: Lupa Öböl Kft. — strand & beachbar
created: 2026-05-06
updated: 2026-05-06
type: project
tags: [lupaobol, projekt]
sources: [sources/lupaobol/persona.md, sources/lupaobol/email-check-workflow.md, sources/lupaobol/projekt-allapot.md]
---

# Lupa Öböl Kft.

Strand és beachbar **Budakalász, Tó utca 1.** (volt Dürer Öböl). Szezonális — májustól szezon-előkészítés, nyitás közelít.

## Cégadatok
- Email: hello@lupaobolstrand.hu
- Drive: MCP-n keresztül (`mcp__google-drive__search_files` + `read_file_content`/`readSpreadsheet`). Lokál sync letiltva 2026-05-18 — Tomi ritkán használja.
- Részletes cégadatok: `/workspace/global/references/cegadatok.md`

## Egységek

| Egység | Működési engedély |
|--------|-------------------|
| Lupa Öböl büfé 1. (volt Dürer Öböl) | 120732020/2022 |
| Lupa Öböl büfé 2. (volt Dürer Öböl) | 1220522020/2020 |

## Nyitott teendők (szezonkezdés-blokk, 2026-05-04)

### Személyzet
- **Új emberek felvétele** közelgő hétvégén — egyeztetés **Borsó**val (Tomi üzlettársa)

### Wolt
- **Termékek feltöltése** a Woltba (szezonkezdés előtt időzítve)

### Árazás (több helyen szinkronizálni)
- **FruitSys** — árak frissítése a 2026-os árlista alapján
- **Helyszíni árlapok / menü táblák** — frissítés
- Drive ref: `02 - Pénzügyek/2026/Lupa Öböl - 2026-os árak.xlsx` (MCP: `mcp__google-drive__search_files name="Lupa Öböl - 2026-os árak"` → `readSpreadsheet`)

## Kontaktok
- **Borsó** — Tomi üzlettársa
- **Erika** — könyvelő (penzugy@pietscarlet.hu), számlák célállomása

## Email kezelés (kötelező workflow)

Hétköznap **9 / 13 / 17 CET** pre-filter (csak új levél esetén ébreszt). Fiók: `hello@lupaobolstrand.hu`. Body-fetch saját email MCP-vel default; header-only hallucináció TILOS.

Levelenként: **számla** → továbbítás Erikának · **válaszra vár** → válasz-draft · **tájékoztató** → archive vagy Todoist · **egyéb** → kérdés Tomihoz.

**Foglalás-jellegű email = `válaszra vár` + `high` urgency** (szezonális kontextus).

Tomi jóváhagyás card-on (`mcp__nanoclaw__ask_user_question`). Akció után konkrét evidencia (Message-ID, timestamp, tool-válasz). UID state: `/workspace/agent/lupaobol-last-uid.txt`.

MCP-disconnect → 1× retry → strukturált failover-kérés asszisztenshez (`LUPAOBOL_IMAP_*`-ral host-ról lehúz). Hitelesítési hiba / IMAP-szerver le → nem failover, jelezz Tomira.

## Kommunikáció
Magyar, tegezés. Operatív ügyintéző hozzáállás. Szezonalitás-tudatos: szezon előtt/alatt/után más a prioritás (előkészítés / üzemeltetés / zárás+elszámolás).

## 2026-05-13 update — pénteki meeting napirend

**Forrás**: Tomi 05-13 11:05 + 11:11 chat (recovered 05-14).

Pénteki Lupa-meeting napirendi pontok (MUST ADD a meeting notesba):
- **MOHU egyeztetés** (Bio-Eu alvállalkozó-váltás kontextus, lásd trinkenessen email 2026-05-13/1611)
- **Wolt terméklista** (szezonkezdés előtti termék-feltöltés)
- **Milán bankkártya** — új üzletvezető vásárláshoz tudjon költeni
