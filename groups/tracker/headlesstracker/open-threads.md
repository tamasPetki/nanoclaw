# Open Threads — külső follow-up ledger

> **Mi ez:** minden NYITOTT külső szál (GitHub PR, directory-submission, dev.to/Reddit/HN/X poszt, email, regisztráció) egy blokk. Ez a szálak közös emlékezete — session-ök között ez akadályozza meg, hogy elfelejtsd mit nyitottál és hagyd elhalni.
>
> **Ki használja:** a `task-tracker-followup` cron (napi ~11:00) végigmegy rajta — frissíti az állapotot, lép a következőt, vagy eszkalál. A build-session-ök is ránézhetnek.
>
> **A te dolgod:** amikor új külső szálat nyitsz (PR/poszt/submission/regisztráció), ADJ HOZZÁ egy blokkot ide azonnal. Amikor lezárul, told át a "Lezárt" szekcióba 1 soros eredménnyel. Minden ellenőrzésnél frissítsd a `last-checked`-et.

---

## Aktív

### THREAD: awesome-mcp-servers PR #6265  ⭐ top-priority
- **surface:** github-pr
- **url:** https://github.com/punkpeye/awesome-mcp-servers/pull/6265
- **opened:** 2026-05-12 | **state:** OPEN, `mergeable: clean` — DE blokkolva a Glama-listázási követelményen
- **blocked-on:** Glama-listázás + score badge. A maintainer kétszer kérte: `github-actions[bot]` 2026-05-12, `punkpeye` (owner) 2026-05-27.
- **next-action (sorrendben):**
  1. ✅ **DONE (2026-06-03 este):** Dockerfile a repóba committelve (`tamasPetki/HeadlessTracker@fbf67d5`). node:22-slim, a published csomagot installálja, `headless-tracker` ENTRYPOINT = MCP stdio server. Lokálisan verifikálva: initialize + tools/list → mind a 15 tool introspektálható credential nélkül. Ez a maintainer által kért Glama-prerekvizit.
  2. ✅ **DONE (2026-06-03 este):** Tomi beküldte a repót Glamára review-ra (glama.ai → Add Server → open-source/GitHub fül, name=HeadlessTracker, repo=github.com/tamasPetki/HeadlessTracker). Most a Glama oldalán review/build van folyamatban.
  3. **MONITOROLD (én tudom, classic token):** várd míg a Glama build lefut és megjelenik a listázás + score badge. Figyeld:
     - badge: https://glama.ai/mcp/servers/tamasPetki/HeadlessTracker/badges/score.svg (most 404 → ha 200/svg lesz, kész)
     - oldal: https://glama.ai/mcp/servers/tamasPetki/HeadlessTracker (most 404)
     Ha a build PIROS (Dockerfile-hiba), diagnosztizáld a Dockerfile-t és push-olj fixet a HeadlessTracker repóba.
  4. **Badge a PR-be** — a sort frissítsd úgy, hogy a link UTÁN bekerül a badge (mint a többi entry a README-ben):
     `- [tamasPetki/HeadlessTracker](https://github.com/tamasPetki/HeadlessTracker) [![tamasPetki/HeadlessTracker MCP server](https://glama.ai/mcp/servers/tamasPetki/HeadlessTracker/badges/score.svg)](https://glama.ai/mcp/servers/tamasPetki/HeadlessTracker) 📇 🏠 ☁️ 🍎 🪟 🐧 - Local-first crypto portfolio aggregation across exchanges (Bybit, Binance), EVM and Solana wallets, and Polymarket. Read-only credentials stored in your OS keychain, no hosted service. Data aggregation only, not financial advice. Install with \`npx headless-tracker\`.`
     Push a fork main-re → a PR auto-frissül (head=`tamasPetki:main`). Lásd CLAUDE.local.md „OSS-katalógus PR-ek".
  5. Opcionális: rövid komment a PR-en hogy mit csináltál (mutatja a maintainernek hogy él a szál).
- **mellékhaszon:** a Glama-listázás táplálja a kisebb katalógusokat is (PulseMCP, glama-derivatívák) → ez kinyit más directory-szálakat is.
- **last-checked:** 2026-06-03

### THREAD: directory-discovery — PulseMCP / Glama auto-index
- **surface:** directory
- **state:** MEGVÁLASZOLVA (2026-06-03 este). NEM auto-indexelnek az official registry-ből (legalábbis nem gyorsan): a HeadlessTracker benne van az official registry-ben (v1.0.3-1.0.5), de Glama (badge 404, API 0 hit), PulseMCP (API 0 hit), mcp.so (403 Cloudflare), Smithery (0 hit) közül EGYIK SEM listáz minket. Vagyis a registry-jelenlét önmagában NEM elég — directory-nként külön submission kell.
- **next-action:** Glama = a #6265 thread alatt (Dockerfile kész, submission Tomi-gated). PulseMCP = van submit-flow / lehet hogy az official registry-ből szinkronizál késéssel (most regisztráltunk, várd ~pár nap, aztán ha nincs → submit). Smithery = `smithery.yaml` kell a repóba + valószínűleg GitHub-connect a smithery.ai-n (Tomi-gated, mint Glama). mcp.so = submission-alapú. Per directory egy-egy mikro-thread, de a Glama az elsődleges (a többit is táplálja).
- **last-checked:** 2026-06-03 (este)

### THREAD: dev.to cikk — dual-runtime SQLite
- **surface:** devto
- **url:** https://dev.to/hex_tracker/no-sqlite-driver-works-in-both-bun-and-node-here-is-how-i-shipped-one-package-that-runs-on-both-20ol
- **state:** publikálva (2026-06-02). Evergreen.
- **next-action:** alacsony prioritás — időnként nézd a kommenteket/reakciókat; ha valaki kérdez, válaszolj (compliance + secrecy szabályok). Nincs aktív teendő.
- **last-checked:** 2026-06-03

---

## Lezárt

(üres — ide kerülnek a befejezett szálak 1 soros eredménnyel, dátummal)
