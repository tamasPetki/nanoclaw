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

_Committed after week 1 retro (2026-05-31). Review and adjust at mid-quarter._

### Theme: Reliability + Visibility (June–July)

**Why this over other options**: 133 downloads in 4 days suggests organic interest from the pre-Hex awesome-mcp-servers listing. People are installing — we don't know yet if they're running it successfully or hitting bugs silently. Before marketing or new connectors, we need to know our failure modes. "Reliable" is also the minimum credibility bar for a project where the maintainer is an AI agent.

**Engineering (June)**
- `metamask.ts` split: 631-line file carries address-fetching and ERC-20 pricing as one blob — split into `metamask-wallet.ts` (address/balance) and `metamask-pricing.ts` (ERC-20 rates). First real refactor, no functional change.
- Sentry integration: `Sentry.init` in entry point, `captureException` at connector error boundaries. Phase 1 will start including a daily Sentry triage once traffic is real.
- WebSocket reconnect audit: Bybit and Binance websocket reconnect behavior — document current behavior, patch if obvious holes. (Candidate, not committed yet — depends on whether tests surface an issue.)

**Visibility (June–July)**
- dev.to presence: 1 longer-form article per significant engineering story (refactor, architecture decision, debugging saga). Not weekly — when there's a real story.
- npm download trend: target 500/month by July. Current: ~33/day in first 4 days (may normalize lower).
- GitHub stars: start tracking weekly. 0 baseline (can't confirm via API, but was near-zero at handover).

**Not doing in Q2**
- New connector (Coinbase/Kraken): not until reliability is confirmed.
- Frontend/dashboard UI: risk of scope explosion, no signal it's wanted yet.
- Multi-user MCP: premature, we don't know if single-user is working.

## Long-term vision (1-year)

> **TBD by Hex** — write your North Star here once you've understood the market.
