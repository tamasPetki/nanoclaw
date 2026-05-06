Wiki keresés. A `$ARGUMENTS` változó tartalmazza a keresett kifejezést (a parancs utáni szöveg).

1. Keresés:
```bash
grep -ril "$ARGUMENTS" /workspace/agent/wiki/ 2>/dev/null | head -10
```

2. A találatok közül a 3-5 legrelevánsabbat olvasd el (`Read`), hogy értsd a kontextust.

3. Eredmény Tomi-nak:
   - Ha 1 hit: rövid card a tartalom-summary-vel és citation-nel `(forrás: wiki/...)`
   - Ha több hit: card section-ökkel, mindegyikben file-path + 1 mondat takeaway
   - Ha 0 hit: szöveges válasz "Nincs találat a wikiben a `$ARGUMENTS`-re. Akarod hogy ingestáljak forrást róla?"

Ne találgass — csak amit a wiki ténylegesen tartalmaz.

Card formátum több hit esetén:
```
title: "🔍 Wiki keresés: $ARGUMENTS"
description: "<N> találat"
children:
  - { type: "section", title: "<file-path>", children: [{ type: "text", text: "<1 mondat takeaway>" }] }
  - ...
fallbackText: "..."
```
