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

## Konvenciók

- Markdown-fájlok kisbetűsek, kötőjellel (`gorgey32-summary.md`, `pinter-tüzep.md` — ékezetek tárolva).
- Egy oldal = egy téma. Ha >500 sor, bontsd `<oldal>/index.md` + alfájlok.
- Datum formátum: `YYYY-MM-DD` (ISO).
- Frontmatter opcionális, de ha van: `tags`, `status`, `last-updated`.
