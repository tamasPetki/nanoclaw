Indítsd el a `welcome` skill workflow-t (`/app/skills/welcome/SKILL.md`).

Magyar nyelven üdvözöld Tomit (a hub az `@Tomi_assistant_bot`-on él, language-match magyar).

Rövid greeting + kérdezd meg: szeretne-e átnézni mit tudsz, vagy ugorjon egyenesen egy konkrét feladatba.

A 8 capability dimension-t (memory & wiki, scheduled tasks, email/calendar/drive/todoist, research, code, interactive UI, files, self-extension) **ne dump-old**, csak ha rákérdez. Drip-feed pattern.

Card formátum (egyszerű intro):
```
title: "👋 Szia Tomi!"
description: "Itt a hub. Mindent tudok ami a wikiben van, és a 9 MCP-szerverbe kötve eltudok intézni emailt, naptárat, drive-ot, todoistot, számlákat, edzői adatokat."
children:
  - { type: "section", title: "Mit szeretnél?", children: [{ type: "text", text: "• Konkrét feladat → mondd\n• Áttekintés a képességeimről → írd: \"mit tudsz?\"\n• Slash command listája → `/help`" }] }
fallbackText: "Szia Tomi! Mit szeretnél?"
```
