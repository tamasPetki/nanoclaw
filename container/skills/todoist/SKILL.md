---
name: todoist
description: >
  MINDIG használd ezt a skillt, ha Tomi todoist-ot említ vagy ha bármilyen task-rel,
  teendővel, projekttel kapcsolatos művelet kerül szóba. Trigger szavak: "todoist",
  "feladat", "teendő", "task", "projekt", "rakd be", "add hozzá", "végeztem",
  "teljesítve", "kipipáltam", "mit kell ma", "mai feladatok", "due", "határidő",
  "emlékeztető", "label", "címke". Akkor is, ha Tomi azt mondja "ezt jegyezd fel"
  vagy "tegyük fel a listára" — feladatkezelésnek számít.
---

# Todoist — Tomi feladatkezelés

Tomi minden projekt-task-ja Todoist-ban van. A hub-on **két interface** áll rendelkezésre, használati sorrendben:

1. **Az `mcp__todoist__*` tool-ok** (alapértelmezett) — a helyi `/opt/mcp-servers/todoist/` Python MCP-szerver, direkt API token-nel.
2. **Curl fallback** — ha az MCP elérhetetlen vagy specifikus endpoint kell amit nem expose-ál.

## Tomi projekt-térképe

A projekt-azonosítók STABILAK, listában tartva. Ha Tomi azt mondja "Görgey 32", a skill ezt projekt-id-vé fordítja.

### Cégesek (PietScarlet Kft. ernyő)
- `6FHmWmmMGrHVjmrh` — **PietScarlet Kft.** (top-level cég-projekt)
  - `6fxVRrh7JJmrJ7hq` — Vác, Görgey u. 32. (sub)
  - `6fxVRm5gh6rfPx4G` — Csobánka, Kilátó utca (sub) — **megj.**: külön top-level is létezik `6g86PmRCJ6JqQ2Vr` ID-vel; tisztázandó Tomi-val melyik az aktív
  - `6fxm4c6vcR4mwH3X` — Vác, Rózsa utca 4. (sub)
  - `6fxph324j87M9Mrw` — Vác, Felső Törökhegy — Telkek (sub)

### Önálló céges
- `6F9J5PG4CgC7x2r8` — Trinken Essen Kft.
- `6J4v4xfFPhVpC9Mf` — Lupa Öböl
- `6VJPjrvC79rMq794` — Rezerver

### Ingatlan / projektek
- `6GMWVp2fc2fC55gR` — Dunakeszi - Rozmaring u. 16.
- `6g3924M5xhq2395J` — Fót - Penész probléma
- `6g86PmRCJ6JqQ2Vr` — Csobánka, Kilátó utca (top-level dupla)

### Személyes / általános
- `6CrcmPcc4MpP6X4Q` — Inbox (alapértelmezett, ha Tomi nem mond projektet)
- `6CrcmPcc4fQJV6gJ` — Személyes
- `6CrcmPcc547PVVjf` — Teendők - közös
- `6GMWWcVFC6jm6FfR` — Projekt ötletek
- `6XxJC32w7p38GJ4C` — Pénzügyi dolgok
- `6c25xqQ5v5VHjW4q` — Érdeklődők
- `6g2Vf6wm44rmxvPR` — 🏋️ Fogyás - 97→85 kg (edzo-projekt)

### Frissítés (új projekt esetén)

Ha Tomi új projektet hoz létre Todoist-ban (vagy a hub teszi), **frissítsd ezt a listát** itt a SKILL.md-ben. A lista nélkül találgatni kell.

## Címkék (labels)

Aktuálisan **1 label**: `folyamatban`. Ezt egy state-flag — Tomi épp dolgozik a feladaton (vs. backlog).

- Új munka kezdésénél: `labels: ["folyamatban"]`-t adj hozzá az updatelt task-hoz.
- Befejezésnél: vedd le a `folyamatban`-t (vagy `close`-old a taskot, ami automatikusan elviszi).

## Műveletek

### Új task

```
mcp__todoist__create_task
  content: "Hívd vissza Erikát az új vízóra ügyben"
  project_id: "6fxVRrh7JJmrJ7hq"   # Görgey 32
  priority: 3                       # 1=alacsony … 4=urgent (Todoist-fordítva: 4=urgent, 1=normal)
  due_string: "holnap 10:00"        # természetes nyelvű, magyar OK
  labels: ["folyamatban"]           # opcionális
  description: "Eredetileg 2026-04-15-i levél. Részletek: wiki/projects/gorgey32/..."
```

**Konvenciók**:
- `content` rövid, lényegre. Ne ismételd a projekt nevét (a fa amúgy is mutatja).
- `description` — ide hosszabb context, link a wiki oldalra ahol a részletek vannak (`wiki/projects/<projekt>/...`).
- `due_string` magyarul: "ma", "holnap", "péntek", "minden hétfő 9:00", "holnap 14:30". Todoist érti.
- `priority`: 1 = alapértelmezett, 4 = sürgős/piros. **Csak akkor 4**, ha Tomi explicit "sürgős"-nek mondja.
- **Project NULL → Inbox**. Ha Tomi nem mond projektet, ne találd ki — kérdezd vissza Telegramon.

### Lekérdezés

**Mai feladatok** (filter szintaxis):
```
mcp__todoist__list_tasks
  filter: "today | overdue"
```

**Egy projekt összes nyitott task-ja**:
```
mcp__todoist__list_tasks
  project_id: "6fxVRrh7JJmrJ7hq"
```

**"folyamatban" címkével**:
```
mcp__todoist__list_tasks
  filter: "@folyamatban"
```

A Todoist filter szintaxisa: `today`, `overdue`, `@<label>`, `#<projektnév>`, `p1`/`p2`/`p3`/`p4`, `& | !` (és/vagy/nem). Részletek: developer.todoist.com/api/v1.

### Lezárás

```
mcp__todoist__close_task
  task_id: "<task_id>"
```

A `close` archiválja, NEM töröl. Visszanyitható `reopen_task`-kal (szintén `task_id` paraméter). `delete_task` is `task_id`-t vár.

### Komment task-ra

```
mcp__todoist__create_comment
  task_id: "<task_id>"
  content: "2026-05-06 telefon Erikával: rendben, jövő héten szervezi."
```

Komment perzisztens, history-jellegű. Wiki-be NEM kell ezt ismételni — a komment maga az audit-trail.

## Curl fallback (ha MCP nem elérhető)

Authorization Bearer token a `${TODOIST_API_TOKEN}` env-ben. Példák:

```bash
# Task add
curl -sX POST https://api.todoist.com/api/v1/tasks \
  -H "Authorization: Bearer $TODOIST_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hívd vissza Erikát","project_id":"6fxVRrh7JJmrJ7hq","due_string":"holnap","priority":3}'

# Mai + lejárt
curl -sG https://api.todoist.com/api/v1/tasks \
  -H "Authorization: Bearer $TODOIST_API_TOKEN" \
  --data-urlencode 'filter=today | overdue'

# Close
curl -sX POST "https://api.todoist.com/api/v1/tasks/{id}/close" \
  -H "Authorization: Bearer $TODOIST_API_TOKEN"
```

Endpoint-szótár (REST v1): `GET/POST/DELETE /api/v1/tasks[/<id>][/close|/reopen]`, `/api/v1/projects`, `/api/v1/sections`, `/api/v1/labels`, `/api/v1/comments`. Hibák: 400/401/403/404/429 (rate limit).

## Wiki integráció

A `wiki/projects/<projekt>/summary.md`-ben minden projekt-page-en legyen egy "📝 Aktív Todoist taszkok" szakasz, ami **szöveg-link**-ekkel mutat az aktuális nyitott feladatokra (NEM a teljes lista — csak rövid lista, max 5).

Wiki-ingest kor (Karpathy disciplina) — ha egy forrás említ konkrét teendőt, akár hozz létre Todoist taszkot is, akár csak a wiki-ben jegyezd fel. Tomi-tól kérdezd meg melyik kell.

## Gotchas

- **Project IDs nem stabilak hard-coded API-szövegekben** — ha Tomi átnevezi, az ID maradhat, de ha törli és újrahozza, új ID-t kap. Ezt a skill listáját **mindig frissítsd** ha új projekt jön létre.
- **`due_string` magyar**: működik, de néha félreérti pl. "kedd" vs "Kedd". Mindig pontosabb: `due_string: "2026-05-13 09:00"` ISO-formátum.
- **Idő nélküli due**: csak dátum → minden délelőtt 0:00-kor lejárt-nak számít. Ha időpontot is akarsz, mondd: `"holnap 14:00"`.
- **Sub-task**: `parent_id: "<task_id>"` paraméter, nem `parent`.
- **Reminder**: a free Todoist nem támogat reminder API-t, csak push-on jön. Ne ígérj reminder-eket.
