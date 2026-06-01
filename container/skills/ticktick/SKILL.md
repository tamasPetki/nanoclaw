---
name: ticktick
description: >
  MINDIG használd ezt a skillt, ha Tomi TickTicket említ vagy ha bármilyen task-rel,
  teendővel, projekttel kapcsolatos művelet kerül szóba. Trigger szavak: "ticktick",
  "todoist" (régi név — most TickTick), "feladat", "teendő", "task", "projekt",
  "rakd be", "add hozzá", "végeztem", "teljesítve", "kipipáltam", "mit kell ma",
  "mai feladatok", "due", "határidő", "emlékeztető", "label", "címke", "tag".
  Akkor is, ha Tomi azt mondja "ezt jegyezd fel" vagy "tegyük fel a listára".
---

# TickTick — Tomi feladatkezelés

Tomi feladatai **TickTick**-ben vannak (2026-06-01-én váltottunk Todoistről). A
`mcp__ticktick__*` tool-ok a helyi `/opt/mcp-servers/ticktick/` MCP-szerveren keresztül
mennek (OAuth token + v2 session cookie — a tagek/szűrők/szokások/fókusz a v2-t igénylik).

> A tool-ok pontos paramétereit a live MCP-sémából látod — ez a skill a munkafolyamatot
> és a konvenciókat adja, nem a paraméter-listát. Ha bizonytalan vagy egy mező nevében,
> nézd meg a tool sémáját.

## Tool-térkép (kategóriák)

- **Taskok**: `list_tasks`, `get_task`, `add_task`, `edit_task`, `complete_task`, `delete_task`, `move_task`, `set_subtask`, `unparent_task`, `list_trash`
- **Projektek**: `list_projects`, `get_project`, `add_project`, `edit_project`, `delete_project`
- **Címkék**: `list_tags`, `add_tags`, `rename_tag`, `edit_tag`, `merge_tags`, `delete_tags`
- **Mappák**: `list_folders`, `add_folder`, `rename_folder`, `delete_folders`
- **Szokások**: `list_habits`, `checkin_habit`, `habit_log`, `add_habit`, …
- **Mentett szűrők**: `list_filters`, `add_filter`, `edit_filter`, `delete_filters`
- **Fókusz**: `focus_status`, `focus_stats`, `focus_log`, `focus_timeline`
- **Naptár**: `list_calendars`, `list_events`

## Projektek — dinamikus feloldás (NINCS hardcoded ID)

Friss TickTick-fiók (2026-06-01). A projekteket **név szerint** old fel futásidőben, NE
hardcode-olj ID-t (azok fiók-specifikusak és változhatnak):

1. `list_projects` → keresd a kívánt nevet (pl. "Görgey 32", "PietScarlet", "Family/Shared").
2. Ha **létezik** → használd a kapott `id`-t a `add_task` / `list_tasks` hívásban.
3. Ha **nem létezik** és Tomi egyértelműen oda akar tenni → `add_project` névvel, majd használd.
   - Ha bizonytalan, hogy hova → **kérdezd vissza Tomit**, ne találgass projektet.
4. Ha gyakran használsz egy projektet, az ID-t **cache-elheted a group `CLAUDE.local.md`-jébe**
   (`<projektnév> → <id>`), de mindig fogadd el, hogy stale lehet — kétség esetén `list_projects`.

A régi Todoist-projektek (PietScarlet, Görgey 32, Csobánka, Rózsa u., Felső Törökhegy,
Trinken Essen, Lupa Öböl, Rezerver, Family/Shared, Fogyás, Inbox, Személyes) **nem jöttek
át** — ezek a TickTickben akkor jönnek létre, amikor először kell.

## Címkék (tagek)

A TickTick támogat tageket (`list_tags` / `add_tags`). A korábbi `folyamatban`
state-flag konvenció marad: aktív munkánál tedd rá, befejezésnél vedd le (vagy
`complete_task`). Tag-szűrésnél `list_tags` után a `list_tasks` tag-paraméterét használd.

## Műveletek és konvenciók

### Új task — `add_task`
- `title` rövid, lényegre törő. Ne ismételd a projekt nevét.
- Hosszabb kontextus / wiki-link → a task leírás (content/description) mezőjébe.
- **Prioritás (TickTick skála!)**: `0` = nincs, `1` = alacsony, `3` = közepes, `5` = magas.
  (NEM a Todoist 1–4!) Csak akkor `5`, ha Tomi explicit "sürgős"-nek mondja.
- **Due**: add meg ISO-dátummal a biztonság kedvéért (`2026-06-03` vagy `2026-06-03T14:00:00`).
  Idő nélkül egész napos. A magyar természetes nyelv NEM garantált — ISO a megbízható.
- **Projekt**: ha Tomi nem mond projektet, ne találgass — kérdezd vissza (vagy Inbox, ha van).

### Lekérdezés — `list_tasks`
- Egy projekt taskjai: add meg a `project_id`-t (előbb `list_projects`-szel old fel).
- "Mai / lejárt / 7 nap" nézet: a `list_tasks` szűrőivel (státusz + due-dátum tartomány),
  vagy ha a fiókban van rá **mentett szűrő** (`list_filters`), azt is használhatod.
  Ha a tool nem ad globális "today|overdue" szűrőt, kérd le a projektek taskjait és
  szűrj kliens-oldalon a due-dátumra (ma / korábban = lejárt).
- Tag szerint: `list_tasks` tag-paraméter.

### Lezárás / módosítás / mozgatás
- `complete_task` (task_id) — kipipálja (nem töröl). `delete_task` töröl (kuka: `list_trash`).
- `edit_task` — cím, due, prioritás, tag módosítás.
- `move_task` — másik projektbe. `set_subtask` — alfeladattá tesz egy taskot egy másik alá.

## Wiki integráció

A `wiki/projects/<projekt>/summary.md` projekt-page-eken legyen "📝 Aktív TickTick taszkok"
szakasz, rövid (max 5) szöveg-listával az aktuális nyitott feladatokra. Wiki-ingestkor, ha
egy forrás konkrét teendőt említ, kérdezd Tomit: TickTick task legyen-e vagy csak wiki-jegyzet.

## Gotchas

- **Prioritás-skála 0/1/3/5** (nem 1–4). A `3` a "közepes", `5` a "magas/sürgős".
- **Projektnek léteznie kell** task hozzáadása előtt — friss fiók, dinamikus `list_projects`,
  szükség esetén `add_project`. Soha ne tegyél fel taskot kitalált projekt-ID-re.
- **v2 feature-ök (tagek, mentett szűrők, mappák, szokások, fókusz)** a `TICKTICK_V2_SESSION_TOKEN`
  cookie-t igénylik. Ha ezek a tool-ok `access_forbidden`/auth hibát adnak, a cookie lejárt →
  jelezd Tominak, hogy frissítse (ticktick.com → DevTools → Cookies → `t`). A sima task/projekt
  (v1) az OAuth tokennel megy, az független a cookie-tól.
- **Due idő nélkül** = egész napos (a "ma 0:00" lejártnak tűnhet). Időpont kell → ISO `T<óra>`.
