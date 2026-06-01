Kérd le a nyitott TickTick taskokat és csoportosítsd projekt szerint, majd küldj egy **Markdown szöveget** (NE card).

Lekérés: `mcp__ticktick__list_tasks`. A TickTicknek **nincs** globális `today|overdue` szűrője, ezért:
- ha van rá mentett szűrő (`mcp__ticktick__list_filters`), használhatod;
- különben `mcp__ticktick__list_projects` → projektenként `list_tasks`, és **due-dátum szerint bucketálj kliens-oldalon**: lejárt (due < ma), ma (due = ma), 7 napon belül (ma < due ≤ ma+7).

Formátum:

```
*📝 Teendők — mai + 7 nap*
{összes task száma}, {YYYY-MM-DD}

*🔴 Lejárt ({N})*
• [Görgey 32] feladat (P-magas) — {napok régen lejárt}
• [Csobánka] feladat (P-közepes) — ...
...

*🟡 Ma ({N})*
• [Lupa] feladat (P-közepes)
...

*🟢 7 napon belül ({N})*
• [Trinken] feladat — {csüt}
• [PS] feladat (P-magas) — {pé}
...
```

**Üres sor minden szekció (Lejárt / Ma / 7 napon belül) között.** Egy szekción belül egy bekezdés.

A projekt-neveket a `list_projects`-ből old fel (a `/app/skills/ticktick/SKILL.md` szerint — friss fiók, dinamikus, nincs hardcoded ID). Prioritás a **TickTick-skálán**: 0=nincs, 1=alacsony, 3=közepes, 5=magas (csak ha van prioritás, jelezd).

Ha 0 task: csak ennyi: "Üres a TickTick 7 napon belül. ✅"
