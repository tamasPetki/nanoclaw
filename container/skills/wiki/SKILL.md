---
name: wiki
description: >
  MINDIG használd ezt a skillt, ha a hub wiki-jével dolgozol — ingest, query, lint, vagy
  bármilyen tudásbázis-művelet. Trigger szavak: "wiki", "ingest", "olvasd be", "tölts fel",
  "tudásbázis", "mit tudsz X-ről", "mit tudunk X-ről", "ki ez", "milyen projekt", "mi a státusza",
  "lint", "ellenőrizd a wikit", "kérdezz a wikiből", "források", "sources/". Akkor is, ha a
  felhasználó forrásfájl(oka)t ad át (PDF, .md, .docx, link, kép) és integrálni kell az
  ismerettárba — ez ingest-művelet.
---

# Hub Wiki Maintenance — Karpathy LLM-Wiki Pattern

Te vagy a wiki gondnoka. A `wiki/` Tomi konszolidált tudásbázisa a saját életéről és projektjeiről.

## Three-layer architecture

- **`sources/`** — read-only nyersanyag (cikkek, PDF-ek, levelezés-archívumok, voice-jegyzetek, képek, eredeti `groups/*/context.md`-k). Olvasod, nem módosítod. Új forrás idekerül.
- **`wiki/`** — TE generálod és karbantartod: summary oldalak, entitás-oldalak, koncepció-oldalak, projekt-oldalak, kereszthivatkozások. Ez a kompilált tudás.
- **schema (ez a skill + a hub `CLAUDE.local.md`)** — workflow, konvenciók.

## Three operations

### Ingest — KRITIKUS DISCIPLINA

Tomi forrást ad. **Egyenként dolgozod fel — SOHA nem batch-elve.** Ha 10 fájlt ad át, az 10 külön kör, nem 1.

Egy forrás-kör workflow:

1. **Olvasd végig** (Read tool, full content). Ha URL: `bash curl -sL <url>`, NEM WebFetch (mert csak summary-t adna). Ha PDF: `/add-pdf-reader` skill. Ha kép: `/add-image-vision`.
2. **Beszéld át Tomival** a fő takeaway-t — 1-2 mondat, megerősítés.
3. **Frissítsd a wikit, lehetséges hatások:**
   - `wiki/index.md` — ha új szekció vagy oldal jött létre
   - érintett `wiki/projects/<projekt>/`, `wiki/entities/<személy>.md`, `wiki/concepts/<téma>.md` oldalak (létrehoz vagy frissít)
   - kereszthivatkozások (`[[entitás]]` Markdown-link, vagy relatív path)
   - meglévő ellentmondás → flag a `wiki/log.md`-ben
4. **Append `wiki/log.md`** új sor: `## [YYYY-MM-DD HH:MM] ingest | <forrás-cím vagy filepath> | <1 mondat takeaway>`
5. **CSAK EZUTÁN lépj a következő forrásra.**

**Miért ez a disciplina?** Ha batch-elsz, a lapok felszínesek és generikusak lesznek — nem épül a Karpathy-féle "compounding artifact". Az érték a kereszthivatkozás-háló minőségében van.

### Query

Felhasználó kérdez. Workflow:

1. **Először `wiki/index.md`** — onnan tájékozódsz a struktúráról.
2. **Drill down** a releváns entitás/projekt/koncepció-oldalra.
3. **Válasz** a wikiből, citation-nel: `(forrás: wiki/projects/gorgey32/summary.md)`.
4. **Filed back** opció — ha az új query+szintézis hosszú, ajánld fel: "Ezt elmenthetem új wiki-oldalként a `wiki/<...>`-be?"

### Lint (heti cron, `0 10 * * 0`)

Wiki egészség-ellenőrzés:

- **Ellentmondások** — két oldal mást állít ugyanarról
- **Orphan oldalak** — sem `wiki/index.md`, sem más wiki-oldal nem hivatkozza
- **Stale tartalom** — utolsó update >3 hónap, érdemes-e még megtartani
- **Hiányzó kereszthivatkozások** — entitás-oldal ami csak 1 helyről linkelt
- **Gap-ek** — log szerint volt ingest, de a tartalom nem épült be teljesen

Az eredmény Tomi-nak Telegram-on, javaslat-listával. NE javíts automatikusan — egyezz meg vele kávétöltögetés közben.

## Worker activity dimension (D15+)

A `wiki/worker-activity.md` oldalt te vezeted a háttér-worker-től érkező cross-agent message-ek alapján.

- Worker `send_message` cross-agent-tel jelenti az action-t (formátum: `[worker:bulltrapp] phase=X action=Y result=...`).
- Te az aznapi blokkba beillesztesz egy sort.
- **NEM küldöd tovább Tominak push-ban** — ez háttér-info, ő naponta egyszer kérdezi rá.

## Orientation flow (KRITIKUS — minden session elején)

Mielőtt bármit ingestelnél/query-znél/lint-elnél, **olvasd be ezt a hármast**:

1. `wiki/SCHEMA.md` — domain, konvenciók, tag-taxonomy
2. `wiki/index.md` — milyen oldalak vannak, egysoros összefoglalókkal
3. `wiki/log.md` utolsó 20-30 sora — mi történt friss

Csak ezután ingest/query. Ez megelőzi a duplikált oldal-létrehozást, hiányzó kereszthivatkozásokat, schema-konvenciók megsértését, és a már elvégzett munka megismétlését.

Nagy wiki-nél (100+ page) a Grep/Glob is futtatandó az érintett témára, mielőtt új oldalt hozol létre.

## Konvenciók (`SCHEMA.md`-ben rögzítve)

A `wiki/SCHEMA.md` definiálja a struktúrát. Ha még nincs, hozd létre az alábbi template-tel:

```markdown
# Wiki Schema

## Domain
Tomi életmenedzselése: PietScarlet építőipar (Görgey32, Csobánka, Törökhegy, Rózsa u.,
Lupa Öböl, Trinken Essen), egészség (edző, Withings), hírek/crypto, worker-activity.

## Konvenciók
- Fájlnevek: kisbetűs, kötőjelek (`gorgey32-summary.md`), ékezetek megengedettek.
- Minden wiki-page YAML frontmatterrel kezdődik (lásd lent).
- `[[wikilinks]]` Markdown-belső, vagy relatív path: `[Erika](../entities/erika-szabo.md)`.
- Minden új oldalhoz update-eld `index.md`-t a megfelelő szekció alatt.
- Minden ingest/query-szintézis/lint-pass a `log.md`-be.
- 3+ source-ot szintetizáló oldalra rakj `(forrás: raw/articles/x.md)` annotációt
  azon paragrafusoknál, amik konkrét forráshoz kötődnek.

## Frontmatter (kötelező a wiki/-ben)

  ```yaml
  ---
  title: Oldal címe
  created: YYYY-MM-DD
  updated: YYYY-MM-DD
  type: entity | concept | comparison | project | summary
  tags: [taxonomy-listából]
  sources: [sources/projektnév/file.md]
  # Opcionális minőség-jelzők:
  confidence: high | medium | low        # mennyire alátámasztott
  contested: true                        # ha vannak feloldatlan ellentmondások
  contradictions: [másik-oldal-slug]
  ---
  ```

A `confidence` és `contested` opcionálisak de ajánlottak. A heti lint surface-eli a
`contested: true` és `confidence: low` oldalakat — gyenge claim-ek ne ragadjanak be
elfogadott wiki-fact-ként.

### sources/ frontmatter

A `sources/`-ben minden file-t is frontmatterezz:

```yaml
---
source_url: https://example.com/article  # ha URL volt eredet
ingested: YYYY-MM-DD
sha256: <body content sha256-je>
---
```

A `sha256:` lehetővé teszi hogy újra-ingest-nél (URL update) drift-et detektálj.

## Tag taxonomy (`SCHEMA.md`-ben definiálva)

10-20 top-level tag a domainhez. Új tag-et CSAK a SCHEMA.md frissítése után használj
(prevents tag-sprawl).

Tomi domain-jéhez ajánlott induló taxonomy:
- **Projekt:** gorgey32, csobanka, torokhegy, lupaobol, trinkenessen, rozsa-u, dunakeszi
- **Entitás:** alvallalkozo, ugyfel, partner, hatosag, csaladtag
- **Téma:** szamla, szerzodés, határidő, dontés, költség
- **Egészség:** edzés, alvás, ahi, sulykivetes, étkezés
- **Meta:** összegzés, pipeline, lint-finding, contradiction

## Page thresholds

- **Új oldal:** ha egy entitás/koncepció 2+ source-ban szerepel VAGY 1 source-ban központi.
- **Meglévő oldal frissítés:** ha új source érinti egy már wiki-zett témát.

Ha bizonytalan, **add hozzá a meglévő oldalhoz** (alszekcióban) és későbbi lint-ben szükség
esetén bontsd ki külön oldalra.
