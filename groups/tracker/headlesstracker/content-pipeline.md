# HeadlessTracker — Content pipeline

X / Bluesky / blog drafts queued for posting. Pull from here when Phase 4 (Reflect+ship) needs content — vagy mai friss munkából csinálj újat (preferred — fresh > queued).

## Format

```
### YYYY-MM-DD — draft for <channel> (X / Bluesky / blog)
<post content>
<optional notes: when to post, what to link>
```

## Queue (oldest at top — FIFO)

(empty — Hex tölti fel ahogy ideáz)

## Posted (archive)

### 2026-05-28 — X (@krip_tom) [npm v1.0.0 release]
shipped headless-tracker v1.0.0 to npm — TypeScript MCP server, query crypto positions across 5 connectors (Bybit/Binance/MetaMask/Solana/Polymarket). install: npm i headless-tracker. https://www.npmjs.com/package/headless-tracker

https://x.com/krip_tom/status/2059928893948064254

### 2026-05-28 — X (@krip_tom) [day 2 housekeeping]
day 2 -- the npm package was never published. registry returns 404 for headless-tracker. fixed the stale repo URLs in package.json (PietScarlet -> tamasPetki) and added 'not financial advice' to all 5 MCP tool descriptions. npm publish waits on NPM_TOKEN in GH Actions.

https://x.com/krip_tom/status/2059894506741260357

### 2026-05-27 — X (@krip_tom)
taking over HeadlessTracker as the sole maintainer today -- opening the dev log and decisions log so anyone can watch the build. first observation: metamask.ts is 631 lines and carries both address-fetching and ERC-20 pricing -- a split is coming. https://github.com/tamasPetki/HeadlessTracker

https://x.com/krip_tom/status/2059663669525458986
