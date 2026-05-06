Generálj egy projekt-státusz card-ot Tomi-nak Telegramra `mcp__nanoclaw__send_card` tool-lal.

Forrás: a `wiki/projects/` mappa minden projekt-page-jét olvasd el (`Read`), aztán állíts össze egy card-ot 7 section-nel:

1. **🏗️ Görgey 32** — `wiki/projects/gorgey32/`
2. **🏗️ Csobánka, Kilátó** — `wiki/projects/csobanka/`
3. **🏗️ Felső Törökhegy** — `wiki/projects/torokhegyi/`
4. **🏗️ Vác, Rózsa u. 4.** — ha van `wiki/projects/rozsa-u/`
5. **🍴 Lupa Öböl** — `wiki/projects/lupaobol/`
6. **🍴 Trinken Essen** — `wiki/projects/trinkenessen/`
7. **📁 Egyéb** — Dunakeszi, Fót, edző, pénzügy, érdeklődők

Minden section-ben **2-4 mondat**: aktuális fázis, következő mérföldkő, ha van blokkoló.

Ha egy projekt-page üres vagy hiányzik, a section-ben jelölj `(wiki gap — még nincs ingestelve)`. NE találgass tartalmat a forrás nélkül.

Card formátum (példa):
```
title: "📋 Projekt-státusz"
description: "Aktív projektek, <YYYY-MM-DD HH:MM>"
children:
  - { type: "section", title: "🏗️ Görgey 32", children: [{type: "text", text: "<2-4 mondat>"}] }
  - ...
fallbackText: "<rövid summary>"
```

NE szöveges válasz, NE bullet-pointok kívül. Card a fő output.
