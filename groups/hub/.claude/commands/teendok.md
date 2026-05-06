Hívd a `mcp__todoist__list_tasks`-ot filter `(overdue | today | 7 days)`-szel és csoportosítsd a task-okat projekt szerint, majd küldj egy **Markdown szöveget** (NE card).

Formátum:

```
*📝 Teendők — mai + 7 nap*
{összes task száma}, {YYYY-MM-DD}

*🔴 Lejárt ({N})*
• [Görgey 32] feladat (P3) — {napok régen lejárt}
• [Csobánka] feladat (P2) — ...
...

*🟡 Ma ({N})*
• [Lupa] feladat (P3)
...

*🟢 7 napon belül ({N})*
• [Trinken] feladat (P2) — {csüt}
• [PS] feladat (P3) — {pé}
...
```

**Üres sor minden szekció (Lejárt / Ma / 7 napon belül) között.** Egy szekción belül egy bekezdés.

A Todoist projekt-azonosítók a `/app/skills/todoist/SKILL.md`-ben. Priority P1-P4 mutasd (Todoist-fordítva: 4=urgent piros, 1=normal).

Ha 0 task: csak ennyi: "Üres a Todoist 7 napon belül. ✅"
