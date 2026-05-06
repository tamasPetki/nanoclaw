---
title: Wiki Schema
created: 2026-05-06
updated: 2026-05-06
type: schema
---

# Wiki Schema

## Domain

Tomi életmenedzselése — három téma-blokk:

1. **PietScarlet Kft. építőipar** — Görgey 32, Csobánka, Felső Törökhegy, Rózsa u. 4., plus alvállalkozók, számlák, határidők, ügyfelek.
2. **Vendéglátós cégek** — Lupa Öböl Kft. (beachbar), Trinken Essen Kft.
3. **Személyes** — egészség (edző / Withings / hideg fürdő / AHI), Tomi-családi, hírek/crypto, worker-activity.

## Layer struktúra

```
wiki/
├── SCHEMA.md          (ez a fájl)
├── index.md           (kategórizált page-katalógus)
├── log.md             (append-only kronológia)
├── projects/          (projekt-oldalak: gorgey32, csobanka, ...)
├── entities/          (személyek, cégek: erika-szabo, pinter-tuzep, ...)
├── concepts/          (visszatérő témák: kőzetgyapot-arak, fizetesi-feltetelek)
├── health/            (edzo, withings-trends)
├── news/              (napi YYYY-MM-DD.md hírdigest)
├── crypto/            (napi YYYY-MM-DD.md crypto briefing)
└── worker-activity.md (napi worker-reportok)
```

A `sources/` mappa a hub root-jában (`groups/hub/sources/`), nem a wiki-ben.

## Konvenciók

- **Fájlnév**: kisbetűs, kötőjellel, ékezetek megengedettek (`gorgey32-summary.md`, `pinter-tüzep.md`).
- **Minden page YAML frontmatterrel kezdődik** (lásd "Frontmatter").
- **Belső link**: `[[entity-slug]]` Markdown-link vagy relatív path (`[Erika](../entities/erika-szabo.md)`).
- **Minden új page** update-eli `index.md`-t a megfelelő szekció alatt.
- **Minden ingest / lint-pass / szintézis** append-elődik `log.md`-be.
- **Provenance markerek**: 3+ source-ot szintetizáló oldalra `(forrás: sources/projektnév/file.md)` annotáció a paragrafusok végén.

## Frontmatter (kötelező a wiki/ alatt)

```yaml
---
title: Oldal címe
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | comparison | project | summary | log
tags: [taxonomy-listából — lásd lent]
sources: [sources/projektnév/file.md]
# Opcionális:
confidence: high | medium | low
contested: true
contradictions: [másik-oldal-slug]
---
```

## sources/ frontmatter

```yaml
---
source_url: https://...                  # ha URL eredetű
ingested: YYYY-MM-DD
sha256: <body sha256 hex>
---
```

## Tag taxonomy

Új tag-et CSAK e listában felvétel után használj. Új tag-et szükség esetén add hozzá ide ELSŐ.

### Projekt
- `gorgey32` — Vác, Görgey u. 32. társasház
- `csobanka` — Kilátó utca telek
- `torokhegy` — Felső Törökhegy telkek
- `rozsa-u` — Vác, Rózsa u. 4
- `lupaobol` — Lupa Öböl Kft.
- `trinkenessen` — Trinken Essen Kft.
- `dunakeszi-rozmaring` — magán
- `fot-penesz` — magán

### Entitás
- `alvallalkozo` (víz, gáz, villany, kőműves, tetőfedő, statikus, festő, stb.)
- `ugyfel`
- `partner`
- `hatosag` (önkormányzat, ETDR, MVM, E.ON)
- `csaladtag`

### Téma
- `szamla` — kimenő/bejövő számla
- `szerzodes`
- `hataridő`
- `dontés` — Tomi-döntés, naplózott
- `koltseg` — pénzügyi kérdés
- `kockazat`

### Egészség
- `edzes` — Upper/Lower split, history
- `alvas` — Withings + AHI trend
- `sulykivetes` — heti súly
- `etkezes` — kalória + makró
- `hideg-furdo` — protokoll + hatás

### Meta
- `osszegzes`
- `pipeline`
- `lint-finding`
- `contradiction`

## Page thresholds

- **Új page** ha entitás/koncepció **2+ source-ban** szerepel VAGY **1 source-ban központi**.
- **Meglévő page bővítés** ha új source érinti egy már wiki-zett témát (alszekcióval).
- **>500 sor** → bontsd `<page>/index.md` + alfájl-mappa.

## Update-szabály

- Minden szerkesztés bumpolja a frontmatter `updated:` mezőjét.
- A `log.md`-be sor: `## [YYYY-MM-DD HH:MM] <action> | <page-name> | <takeaway>`.
- Konfliktus / újraírás: `confidence: low` vagy `contested: true` jelölés a frontmatterben.
