---
title: Trinken Essen Kft. — Waikiki Beachbar + Tapadeli
created: 2026-05-06
updated: 2026-05-06
type: project
tags: [trinkenessen, projekt]
sources: [sources/trinkenessen/persona.md, sources/trinkenessen/email-check-workflow.md]
---

# Trinken Essen Kft.

Vendéglátóipari cég, **két alegységgel**:

- **Waikiki Beachbar** — nyári szezon, strand-bar
- **Tapadeli étterem** — étterem

## Cégadatok
- Email: hello@trinkenessen.eu
- Drive: MCP-n keresztül (`mcp__google-drive__search_files` + `read_file_content`/`readSpreadsheet`). Lokál sync letiltva 2026-05-18 — Tomi ritkán használja.
  Főkategóriák: `01_Cégadatok`, `02_Pénzügyek`, `03_Szerződések`, `04_Üzemeltetés`, `05_Grafika`, `06_Fotók`. Fájlkeresésnél **először `_INDEX.md`** a Drive gyökerében (`mcp__google-drive__search_files name="_INDEX.md"` → `read_file_content`, ~1000 fájl).
- Részletes cégadatok: `/workspace/global/references/cegadatok.md`

## Email kezelés (kötelező workflow)

Hétköznap **9 / 13 / 17 CET** pre-filter (csak új levélnél ébreszt). Fiók: `hello@trinkenessen.eu`. Body-fetch saját MCP-vel default; header-only hallucináció TILOS.

Levelenként:
- **számla** → **NEM továbbítjuk** (TE számlákat **Tomi maga intézi**). Csak jelölés + összefoglaló a card-on (kitől, mennyi, határidő ha látszik), ő lép.
- **válaszra vár** → válasz-draft, kontextus előbb (múltbeli email, Drive `_INDEX.md`, Todoist, partner-memória — Waikiki/Tapadeli/Wise/Fruitsys/RKMC stb.)
- **tájékoztató** → archive vagy Todoist
- **egyéb** → kérdés Tomihoz

> ⚠️ Lupa Öbölnél a számlák Erikához mennek, **TE-nél nem** — Tomi maga intézi.

Tomi jóváhagyás card-on (`mcp__nanoclaw__ask_user_question`). Akció után konkrét evidencia (Message-ID, timestamp). UID state: `/workspace/agent/email_check_state.md`.

MCP-disconnect → 1× retry → strukturált failover-kérés asszisztenshez (host `TRINKENESSEN_IMAP_*`). Hitelesítési hiba / IMAP-szerver le → jelezz Tomira.

## Kommunikáció
Magyar, tegezés. Operatív ügyintéző. Proaktív flag-elés (szerződés-lejárat, szezonkezdés/zárás, hatósági határidők, számlázási teendők). Email aláírás / hangnem: Erika felé udvarias, kedves, NEM utasító — köszönés + záró formula.
