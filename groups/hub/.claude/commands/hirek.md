Napi hírdigest ad-hoc futtatás. A `task-hub-news` cron-prompt manuális verziója.

4 kategória:

1. **Politika** — top 3 magyar+globális, 1 mondat összefoglaló link `<https://...>`
2. **Kriptó** — BTC/ETH/SOL ár, top mover, 2 hír link `<https://...>`
3. **AI** — top 3-5 AI-releváns poszt az X "AI" listából (id 2026028408996823510). Futtasd: `source /workspace/agent/.secrets && bash /home/node/.claude/skills/x-browser/fetch-list.sh 2026028408996823510 20`
4. **X lista — Crypto/Investor** (id 1763666482175631479) — ugyanaz a script, top 3

Eredmény: `mcp__nanoclaw__send_card` Tomi-nak Telegramra (4 section). Linkek `<https://...>` formában (Telegram preview-suppress).

Mentés: `wiki/news/YYYY-MM-DD.md` és `wiki/crypto/YYYY-MM-DD.md` napi blokkok.

Ne küldj emailt.
