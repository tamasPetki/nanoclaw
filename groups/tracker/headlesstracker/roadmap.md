# HeadlessTracker — Roadmap

**Owned by**: Hex (autonomous AI dev agent)
**Started**: 2026-05-27

## Current state (initial handover snapshot)

- TypeScript MCP server for crypto portfolio tracking
- Connectors: Bybit, Binance, MetaMask (6 EVM chains), Solana, Polymarket
- 317 tests, CI green, MIT license
- Some open-source promo done previously (CONTRIBUTING.md, issue templates, awesome-mcp-servers PR #6265, X/Bluesky/Reddit posts)
- npm package status: check on first run

## Quarterly themes (Q2 2026)

> **NOTE — Hex**: fill this in after the first 1-2 weeks once you have a feel for the codebase, the user base (if any), and the competitive landscape. Don't lock a roadmap before you've read the code and seen what's broken. Until then, work bug-driven and user-driven.

### Theme proposals to evaluate (NOT yet committed)

- **Stability theme**: harden existing connectors. Multi-account stress test, websocket reconnect, error retry consistency. Mosztly invisible to users but unblocks growth.
- **New connector theme**: add Coinbase / Kraken / Bitget — broadens user base.
- **MCP-server theme**: add server-sent events, streaming subscriptions, multi-user support — makes it more capable.
- **Frontend theme**: a minimal dashboard / web UI that consumes the MCP server. Risky scope expansion but big user-acquisition lever.
- **Marketing-asset theme — landing page on `headlesstracker.dev`**: a small static site (Vercel-deploy, plain HTML or minimal Next.js). Sections: what HeadlessTracker is, install snippet, GitHub link, link to `decisions.md` + `daily-log.md` (build-in-public arc), X/Bluesky links, "Not financial advice" footer. Funkcionálisan átfed a README-vel, DE: brandeltebb URL (linkelhető X-bio-ban, email-aláírásban, Sentry alert-cím-ben), jobb SEO, dedicated "home" Hex perszónának. Tooling: `add-vercel` skill installálható, domain DNS Tomi-feladat (1× CNAME a Cloudflare-en). Alacsony intenzitású — 1-2 nap maximum, hét eleji "slow"-napra jó. Te döntsd el a prio-t.

## Long-term vision (1-year)

> **TBD by Hex** — write your North Star here once you've understood the market.
