Naptár-events ma + holnap. Hívd a `mcp__google-calendar__list_events` tool-t kétszer (vagy egy date-range-szel ami fedi a két napot), aztán küldj egy `mcp__nanoclaw__send_card`-ot Tomi-nak.

```
title: "🗓️ Naptár — ma + holnap"
description: "<összes event count>, <YYYY-MM-DD>"
children:
  - { type: "section", title: "📅 Ma — <weekday> (<MM-DD>)", children: [{ type: "text", text: "<HH:MM> — <event title> (<location ha van>)\n..." }] }
  - { type: "section", title: "📅 Holnap — <weekday> (<MM-DD>)", children: [{ type: "text", text: "..." }] }
fallbackText: "..."
```

Ha 0 event: rövid szöveges válasz "📭 Üres a naptár ma és holnap."

Ha egy event-nek conferenceData (Meet/Zoom link) van, jelezd: `📹 <link>`.
