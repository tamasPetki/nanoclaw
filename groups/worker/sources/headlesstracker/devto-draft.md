---
title: How I built a headless crypto portfolio tracker with MCP
published: false
tags: mcp, crypto, javascript, opensource
---

I've been running positions across Bybit, Binance, a few MetaMask wallets on different EVM chains, a Solana wallet, and some Polymarket predictions for a while now. The problem wasn't tracking any single one of them — every exchange has decent UI. The problem was that I had no single place to see the full picture, and every time I wanted to check my total exposure I was opening six tabs, doing mental math, and still probably missing something.

I looked for an existing solution. Most portfolio trackers require you to paste in API keys through their web UI, hand your data to someone's server, and then look at their dashboards on their terms. That wasn't what I wanted.

So I built [HeadlessTracker](https://github.com/tamasPetki/HeadlessTracker) — an MCP server that connects directly to your accounts and exposes your portfolio data as tools that Claude (or any MCP-compatible AI host) can call.

## The MCP angle

The framing that clicked for me was: *build the data layer, let the AI be the renderer.*

Instead of coding a dashboard with charts and tables, I just expose the data through MCP tools. When I ask Claude "what's my total portfolio value right now?" it calls `get_portfolio_summary`, gets back the numbers from Bybit, Binance, my ETH wallet, my SOL wallet, all in one response, and formats the answer however I asked. If I want a different breakdown — by chain, by exchange, by asset class — I just ask differently. No UI changes needed.

This turned out to be much more flexible than any hardcoded dashboard I could have built.

## What's connected

Five connectors so far:

- **Bybit** and **Binance** — spot balances, open positions, unrealized P&L
- **MetaMask / EVM** — six chains: Ethereum, Polygon, BSC, Arbitrum, Optimism, Base
- **Solana** — native SOL plus SPL tokens
- **Polymarket** — active prediction market positions

The server exposes 7 MCP tools and 3 prompts. There's also an interactive dashboard MCP App and a settings interface if you want a more structured view inside Claude Desktop.

## Quick start

```bash
git clone https://github.com/tamasPetki/HeadlessTracker
cd HeadlessTracker
bun install
```

Setup (replace with your actual keys):

```bash
npx headlesstracker setup-bybit --apiKey YOUR_KEY --apiSecret YOUR_SECRET
npx headlesstracker setup-binance --apiKey YOUR_KEY --apiSecret YOUR_SECRET
npx headlesstracker add-wallet --chain eth --address 0xYOUR_ADDRESS
```

Then add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "headlesstracker": {
      "command": "node",
      "args": ["/path/to/HeadlessTracker/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop, and you can ask things like:
- "What's my total portfolio value across all accounts?"
- "Show me my open Bybit positions"
- "What Polymarket markets am I currently in?"

## On the "headless" part

The name is a bit of a statement of intent. There's no web app to log into, no SaaS to subscribe to, no server that holds your API keys except your own machine. The keys live in a local config file. Requests go directly from your machine to the exchange APIs.

For me that was non-negotiable. Portfolio data is sensitive — it shows your total exposure, your entry points, your risk profile. I didn't want that on someone else's server.

## Where it is now

317 tests, CI is green, MIT license. The main thing I'm still missing is more chains on the EVM side (currently six — Base, Arbitrum, Optimism, plus the bigger ones) and I want to add a Hyperliquid connector at some point.

If you're running positions across multiple exchanges and want to query your full picture through Claude, it's at: (link in comments)

Contributions welcome — especially if you want to add a connector for an exchange I haven't covered yet.
