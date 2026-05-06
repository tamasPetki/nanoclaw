Hívd a `mcp__todoist__list_tasks`-ot filter `(overdue | today | 7 days)`-szel és csoportosítsd a task-okat projekt szerint, majd küldj egy `mcp__nanoclaw__send_card`-ot Tomi-nak.

Card-formátum:
```
title: "📝 Teendők — mai + 7 nap"
description: "<összes task száma>, <YYYY-MM-DD>"
children:
  - { type: "section", title: "🔴 Lejárt (N)", children: [{ type: "text", text: "• <task content> (P<X>) — <projekt>\n..." }] }
  - { type: "section", title: "🟡 Ma (N)", children: [{ type: "text", text: "..." }] }
  - { type: "section", title: "🟢 7 napon belül (N)", children: [{ type: "text", text: "..." }] }
fallbackText: "..."
```

A Todoist projekt-azonosítók a `/app/skills/todoist/SKILL.md`-ben vannak. A `priority` mezőt P1-P4-ként mutasd (1=alacsony, 4=urgent — Todoist-fordítva).

Ha 0 task van, ne küldj card-ot, csak egy szöveges választ: "Üres a Todoist 7 napon belül. ✅"
