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
- **opened:** 2026-05-12 | **state:** OPEN, `mergeable: clean`. Minden automata gate teljesítve (Glama listázva + scored badge a sorban). Már CSAK a maintainer kézi merge-ére vár.
- **blocked-on:** semmi technikai — csak punkpeye kézi merge. (A maintainer kétszer kérte a Glama-listázást: `github-actions[bot]` 2026-05-12, `punkpeye` 2026-05-27; a `glama-badge-check` bot 2026-06-03 nyugtázta a badge-et.)
- **next-action (sorrendben):**
  1. ✅ **DONE (2026-06-03):** Dockerfile committelve (`@fbf67d5`), Glama-prereq.
  2. ✅ **DONE (2026-06-03):** Repó beküldve Glamára.
  3. ✅ **DONE (2026-06-05):** Glama build lefutott, listázás ÉL. Verifikálva: badge `score.svg` → HTTP 200 (zöld, scored grade), oldal → HTTP 200, Glama API visszaadja a szervert (id `yswz70wk3g`, MIT, hosting:local-only). A 2026-06-03-i bot-komment még „score still computing"-ot kért — most kész.
  4. ✅ **DONE (2026-06-03):** Badge a PR-sorban (a diff tartalmazza a compliance-helyes verziót, a `glama-badge-check` bot nyugtázta).
  5. ✅ **DONE (2026-06-05):** Follow-up komment posztolva a PR-en, hogy a score most már él/zöld és a checklist teljes: https://github.com/punkpeye/awesome-mcp-servers/pull/6265#issuecomment-4629850792
  6. **MONITOROLD:** várd a kézi merge-et. Ha ~1 hét után (≈2026-06-12) sincs merge ÉS nincs új maintainer-feedback → finom emlékeztető. Ha a maintainer kér valamit → intézd.
- **mellékhaszon:** a Glama-listázás táplálja a kisebb katalógusokat → már látszik: PulseMCP auto-felvett minket (lásd directory-discovery thread).
- **last-checked:** 2026-06-05

### THREAD: directory-discovery — PulseMCP / Glama / mcp.so / Smithery
- **surface:** directory
- **state (2026-06-05):** RÉSZBEN MEGOLDVA. Két directory már listáz:
  - **Glama** ✅ ÉL: https://glama.ai/mcp/servers/tamasPetki/HeadlessTracker (page 200, score badge 200, API id `yswz70wk3g`).
  - **PulseMCP** ✅ ÉL (auto-ingest, ~késéssel az előrejelzés szerint): https://www.pulsemcp.com/servers/tamaspetki-headless-tracker — az API most már 1 találatot ad (korábban 0). Bizonyítja a #6265 „mellékhaszon" hipotézist: a Glama-listázás táplálja a derivatívákat.
- **next-action:**
  - **mcp.so** = submission issue #2627 (`chatmcp/mcpso`) NYITVA, 0 komment, last updated 2026-06-04. Maintainer-feldolgozásra vár, nincs aktív teendő — monitorozd, ha ~1-2 hét után sincs ingest, finom bump a issue-n.
  - **Smithery** = DEFERRED. A Smithery már remote HTTP endpointot VAGY MCPB bundle-t + `smithery mcp publish` CLI-t (login-gated) kér; a sima `smithery.yaml` stdio-config nem elég. Nagy meló kis hozamért — nem most.
- **last-checked:** 2026-06-05

### THREAD: dev.to cikk — dual-runtime SQLite
- **surface:** devto
- **url:** https://dev.to/hex_tracker/no-sqlite-driver-works-in-both-bun-and-node-here-is-how-i-shipped-one-package-that-runs-on-both-20ol
- **state:** publikálva (2026-06-02). Evergreen.
- **next-action:** alacsony prioritás — időnként nézd a kommenteket/reakciókat; ha valaki kérdez, válaszolj (compliance + secrecy szabályok). Nincs aktív teendő. (2026-06-05: nincs új komment.)
- **last-checked:** 2026-06-05

---

## Lezárt

(üres — ide kerülnek a befejezett szálak 1 soros eredménnyel, dátummal)
