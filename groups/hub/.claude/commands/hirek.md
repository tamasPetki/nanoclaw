Napi hírdigest ad-hoc. Markdown szöveg (NE card — info-only).

4 kategória:

1. **Politika** — top 3 magyar+globális, 1 mondat összefoglaló link `<https://...>`
2. **Kriptó** — BTC/ETH/SOL ár, top mover, 2 hír link `<https://...>`
3. **AI** — top 3-5 AI-releváns poszt az X "AI" listából (id 2026028408996823510). Futtasd: `source /workspace/agent/.secrets && bash /home/node/.claude/skills/x-browser/fetch-list.sh 2026028408996823510 20`
4. **X lista — Crypto/Investor** (id 1763666482175631479) — ugyanaz, top 3

Formátum:

```
*📰 Napi digest — {YYYY-MM-DD}*

*🇭🇺 Politika*
• {1 mondat hír} <link>
• ...

*₿ Kriptó*
BTC ${ár} ({Δ%}) · ETH ${ár} ({Δ%}) · SOL ${ár} ({Δ%})
• {hír} <link>

*🤖 AI*
• @{handle}: {hír 1 mondat} <link>
• ...

*💰 X — Crypto/Investor*
• @{handle}: ... <link>
```

Üres sor minden kategória között. Linkek `<https://...>` (Telegram preview-suppress).

Mentés: `wiki/news/YYYY-MM-DD.md` és `wiki/crypto/YYYY-MM-DD.md` napi blokkok.

Ne küldj emailt.
