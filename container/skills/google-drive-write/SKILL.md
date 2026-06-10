---
name: google-drive-write
description: >
  Use this skill when modifying or uploading files on Google Drive via the
  `google-drive` MCP server. Covers the choice between `updateFile` /
  `updateTextFile` (preserves revision history on an existing file) and
  `createTextFile` / new upload (creates a separate file with no revision
  link), plus the `search` → `fileId` lookup pattern when the agent doesn't
  already know the file's ID. Trigger words: "updateFile", "createTextFile",
  "Drive feltöltés", "Drive módosítás", "fileId", "új verzió",
  "verziókövetés", "upload to Drive", "edit on Drive".

  This skill describes HOW to write to Drive. It does NOT decide WHERE the
  agent is allowed to write — that scope is set by the agent's CLAUDE.md /
  CLAUDE.local.md and must be respected before any write call.
---

# Google Drive — írás és módosítás

Ez a skill akkor aktiválódik, ha Drive-ra írsz a `google-drive` MCP-vel
(`@piotr-agier/google-drive-mcp`). A cél, hogy meglévő fájlok frissítésénél
NE veszítsünk verziótörténetet, és új fájl is csak akkor jöjjön létre, amikor
tényleg új dokumentumról van szó.

## A KÖTELEZŐ döntés: meglévő fájl vagy új?

A Drive a fájlokat `fileId` alapján azonosítja, nem név szerint. Ha azonos
névvel feltöltesz egy új fájlt, az **külön fájl** lesz egy új ID-vel, a régi
mellett — Tomi nem tudja "verziókat kezelni" menüből visszaállítani, mert a
két fájlnak nincs közös története.

### Meglévő fájl frissítése → `updateFile` / `updateTextFile`

- A toolnak **az eredeti `fileId`-t** add át, ne új névvel uploadolj
- A Drive automatikusan revision-t készít az előző tartalomról
  (default: 30 napig vagy 100 verzióig őrzi)
- Tomi a Drive UI-ban "Verziók kezelése" menüből bármikor visszaállíthatja
- Példák: ütemterv xlsx, költségvetés xlsx, projekt-státusz doc, bármi ami
  már létezik

### Új dokumentum → `createTextFile` / új upload

- Csak akkor, ha a fájl tényleg most jön létre (eddig nem létezett)
- Adj jól beszélő nevet, és a megfelelő `parentFolderId`-t

## `fileId` lookup, ha nem ismert

Ha nem tudod a `fileId`-t (pl. Tomi csak nevet ír, vagy a fájl a Drive UI-ban
készült):

1. **`search` tool** — keress névre vagy mappa + név kombinációra
2. A találatból vedd a `fileId`-t
3. Ezzel hívd az `updateFile`-t

```
1. search({ query: "name contains 'Ütemterv' and '<parentFolderId>' in parents" })
   → találat: { id: "1AbCd...", name: "Ütemterv 2026.xlsx" }
2. updateFile({ fileId: "1AbCd...", content: ... })
```

Ha a `search` több találatot ad vissza:
- Nézd meg a `parents` és `modifiedTime` mezőket
- Bizonytalanság esetén kérdezz vissza Tominak ahelyett, hogy random találatot
  frissítenél — verzió-szennyezés rosszabb mint egy extra kérdés

## Mit NE csinálj

- ❌ Új upload azonos névvel "úgyis felülírja" alapon → nem írja felül,
  második fájl lesz mellette
- ❌ Régi fájl törlése + új feltöltése → revision history elvész
- ❌ `fileId` találgatás → ha nem tudod, `search`-elj
- ❌ Olyan mappába írás, amit a CLAUDE.local.md scope-szabálya nem enged —
  mindig először nézd meg, hogy az agentnek van-e write-engedélye az adott
  útvonalon

## Megjegyzés a scope-ról

Ez a skill a HOGYAN-t írja le. A HOL (melyik mappákat módosíthatja az adott
agent) az adott group CLAUDE.md / CLAUDE.local.md fájljában van — azt mindig
előbb ellenőrizd, mielőtt írsz.
