Napi hírdigest ad-hoc. Markdown szöveg (NE card — info-only).

4 kategória:

1. **Politika** — top 3 magyar+globális, 1 mondat összefoglaló + puszta URL
2. **Kriptó** — BTC/ETH/SOL ár, top mover, 2 hír + puszta URL
3. **AI** — top 3-5 AI-releváns poszt az X "AI" listából (id 2026028408996823510). Futtasd: `source /workspace/agent/.secrets && bash /home/node/.claude/skills/x-browser/fetch-list.sh 2026028408996823510 20`
4. **X lista — Crypto/Investor** (id 1763666482175631479) — ugyanaz, top 3

Formátum:

```
*📰 Napi digest — {YYYY-MM-DD}*

*🇭🇺 Politika*
• {1 mondat hír} https://...
• ...

*₿ Kriptó*
BTC ${ár} ({Δ%}) · ETH ${ár} ({Δ%}) · SOL ${ár} ({Δ%})
• {hír} https://...

*🤖 AI*
• @{handle}: {hír 1 mondat} https://...
• ...

*💰 X — Crypto/Investor*
• @{handle}: ... https://...
```

Üres sor minden kategória között.

**Link-szabály (KRITIKUS — Telegram channel)**: csak puszta `https://...` URL-eket használj. **TILOS** `<https://...>` (Discord-only embed-suppress, Telegram MarkdownV2 parse-error → 3× retry → giving up → user nem kap semmit). **TILOS** `[szöveg](url)` markdown link is, mert a `text` rész escape-eletlen `_*[]()~>#+-=|{}.!` karaktereket tartalmazhat → ugyanaz az error. Telegram a puszta URL-t automatikusan klikkelhetővé teszi, és csak az első URL-re generál preview-t (a többi nem zajos).

Mentés: `wiki/news/YYYY-MM-DD.md` és `wiki/crypto/YYYY-MM-DD.md` napi blokkok.

Ne küldj emailt.
