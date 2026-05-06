Wiki keresés. `$ARGUMENTS` a keresett kifejezés.

1. `bash grep -ril "$ARGUMENTS" /workspace/agent/wiki/ 2>/dev/null | head -10`

2. A 3-5 legrelevánsabb hit-et olvasd el (`Read`).

3. **Markdown szöveg válasz** (NE card):

```
*🔍 Wiki: $ARGUMENTS*
{N} találat

*{file-path}*
{1-2 mondat takeaway / releváns idézet}

*{file-path}*
{1-2 mondat...}
```

Üres sor minden hit között.

Ha 1 hit van: "Markdown szöveg, fő tartalmával + citation `(forrás: wiki/...)`."

Ha 0 hit: "Nincs találat a wikiben a `$ARGUMENTS`-re. Akarod hogy ingestáljak forrást róla?"
