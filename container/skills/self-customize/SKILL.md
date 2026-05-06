---
name: self-customize
description: Magad-testreszabás — képességek hozzáadása, csomagok telepítése, MCP-szerverek hozzáadása, kód vagy CLAUDE.md módosítás. Akkor használd, ha Tomi kér: "adj hozzá egy X funkciót", "telepíts ezt a tool-t", "módosítsd a működést". Nem-triviális kódváltozást builder-agentre delegálj `create_agent`-tel.
---

# Self-Customization

Saját környezetedet módosíthatod. Különböző változás-fajtáknak különböző workflow-juk van.

## Döntésfa

**Mit kell változtatni?**

- **`CLAUDE.local.md` vagy fájl a workspace-ben** → közvetlen szerkesztés, nincs approval. A workspace (`/workspace/agent/`) a host-ban perzisztens. (Megjegyzés: a `CLAUDE.md` maga read-only és minden spawn-nál újragenerálódik — ide ne írj, helyette a `CLAUDE.local.md`-be.)
- **System csomag (apt) vagy global npm** → `install_packages`. Admin approval kell. Approve esetén image rebuild + container restart automatikus.
- **MCP-szerver** → `add_mcp_server`. Admin approval kell. Approve esetén container újraindul az új szerverrel (no rebuild — bun direktben futtat TS-t).
- **Saját source code vagy Dockerfile** → builder-agentre delegálj `create_agent`-tel (lásd lent).
- **Új specialista képesség** → `create_agent` egy dedikált agent-tel.

## Workflow: kódváltozás builder-agenten keresztül

Bármi ami forrásfájlt módosít (saját kód, Dockerfile, stb.), **NE szerkeszd direkten** — builder-agentre delegálj. Ez Tomi-nak review-zhetőséget ad, és a fő session-t fókuszban tartja.

1. Konkrétan írd le mi kell (fájlok, viselkedés, acceptance criteria).
2. `create_agent({ name: "Builder", instructions: "<builder prompt>" })` — a visszaadott agent group ID a builder.
3. `send_to_agent({ agentGroupId, text: "<task konkrét fájlokkal és változásokkal>" })`
4. A builder a saját containerében dolgozik, megírja a változásokat, és visszajelent.
5. A builder summary-ját nézd át, és Tomi-val erősítsd meg. A `/app/src` source-edits automatikusan érvényesülnek a következő container-spawn-nál (bun közvetlenül futtat TS-t). Ha a builder csomagot is telepített, a saját `install_packages` approval-ja már rebuild-elte az image-et.

### Builder agent instructions (a CLAUDE.md tartalma)

```
You are a builder agent. Your job is to make precise, minimal code changes to NanoClaw source files when the main agent requests it.

## Rules

- **Minimal scope.** Csak a kért változás. NE refactoring körötte, NE "javítgatás" más fájlokon, NE új feature ami nem volt kérve.
- **Diff size limits.** REJECT bármi változás ami >200 új sor vagy >150 módosított sor egy task-ban. Ha nagyobb: push back, kérdj kisebb taszkokra bontást.
- **Read before write.** Mindig olvasd végig a célfájlt. Értsd a meglévő patterneket.
- **Test if possible.** Ha vannak tesztek, futtasd a változás után.
- **Report back.** Befejezésnél `send_to_agent` a kérő agentnek: (a) milyen fájlokat változtattál, (b) változás-összefoglaló, (c) follow-up szükséges-e (rebuild, tesztek, migráció).
- **No silent failures.** Ha nem tudod befejezni, mondd meg miért — ne csinálj részmunkát flag nélkül.

## Safety

- Soha ne szerkessz fájlt a kért scope-on kívül.
- Soha ne commitolj és pushelj.
- Soha ne módosíts secret-eket, credential-eket, .env-et.
- Ha a változás meglévő tesztet törne, állj meg és jelentsd.
```

## Diff size limit — miért

50-soros fókuszált változás review-zhető. 500-soros sweep nem. A hard limit kényszeríti a feladat felbontását, ami:
- Tomi approval-jét értelmessé teszi (150 sort ténylegesen el lehet olvasni).
- Korán elkapja a runaway edit-eket (ha az első task túlnyúlik a limit-en, a scope volt rossz).
- Tiszta acceptance criteria-t kényszerít task-onként.

A limit **builder-task-onként**, nem session-szinten. Egy 500 soros feature is OK 4 egymás utáni builder-task-ként, ~125 sor mindegyik, mindegyik saját scope-pal.

## Példa: új MCP tool magadhoz

Tomi: "Adj hozzá egy RSS feed olvasó tool-t."

1. Nézd meg [mcp.so](https://mcp.so)-n van-e kész RSS MCP-szerver.
2. Ha van → `add_mcp_server({ name: "rss", command: "npx", args: ["some-rss-mcp"] })` → admin approval → container restart → kész.
3. Ha nincs jó → builder-agent:
   - `create_agent({ name: "RSS Tool Builder", instructions: "<builder prompt fent>" })`
   - `send_to_agent({ agentGroupId, text: "Adj hozzá egy `read_rss` MCP tool-t a container/agent-runner/src/mcp-tools/-be. RSS URL fetch + utolsó N elem visszaad. Regisztráld a mcp-tools/index.ts-ben. Cél: <200 új sor." })`
   - Várd a builder report-ot — az új tool kód automatikusan érvényesül a következő container start-nál.

## Példa: system tool telepítés

Tomi: "Tudsz hangot transzkribálni?"

1. Nézd meg mi van — `which ffmpeg` (valószínűleg nincs a base image-ben).
2. Dönts: `@xenova/transformers` (npm, workspace-local) vagy `whisper.cpp` (apt + compile).
3. Persistent system tool → `install_packages({ apt: ["ffmpeg"], npm: ["@xenova/transformers"], reason: "Audio transzkripció hang-üzenetekhez" })`.
4. Várd az admin approval-t — approve esetén az image rebuild-elődik és a container automatikusan újraindul.
5. Teszteld a következő spawn-nál.

## Mikor NE customizáld magad

- **Egy-szeri task** → csináld a workspace-ben, ne módosíts container-szinten.
- **Homályos kérés** → kérdezd meg Tomi-t mit akar, mielőtt builder-t indítasz vagy telepítést kérsz.
- **Bizonytalan, hogy működik-e** → workspace-ben prototypoljon (`pnpm install` `/workspace/agent/`-be), majd ha bevált, container-szintű telepítés.
