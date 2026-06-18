# Scheduled Tasks Migration (v1 → v2)

**Cél:** V2-ben minden recurring task az agent saját `schedule_task` MCP hívásán keresztül regisztrálódik (per-session `inbound.db`). A v1 központi `scheduled_tasks` tábla megszűnik; a host-oldali `schedule-*.sh` bash scriptek kiesnek.

**Mikor használjuk ezt a listát:** Phase 6 előtt — minden agent első sessionben meghívja a saját `schedule_task`-jait.

## Host-szintű marad (rendszer-maintenance, NEM agent)

| Task | Cron | Szkript | Indoklás |
|---|---|---|---|
| X query-id auto refresh | `0 5 * * *` | `/root/nanoclaw-v2/scripts/update-x-query-id.py` | Cookie/token rotation, rendszer-szintű |

Ez marad a host crontab-ban, agent-szintre nem költözik.

## Agent self-scheduled taskok

### asszisztens

| Name | Cron | Script gate? | Prompt lényeg |
|---|---|---|---|
| `linkedin-weekly-post` | `0 6 * * 1,4` | nincs | Írj és posztolj EGY LinkedIn posztot a linkedin-context.md + voice.md alapján. Zapier webhookra (URL a .secrets-ben). |
| `x-daily-tool-rec` | `0 10-18/2 * * *` | van (random óra) | X @krip_tom: napi 1 tool-rec poszt (10-18 CET-ben 1×). Session flow a platforms/x.md-ben. |
| `arxiv-ideas` | `0 9 * * *` | nincs | Olvasd az arxiv-cs-AI-t, összefoglalás trending ML paper-ekről. Output: `/workspace/group/arxiv-ideas-YYYY-MM-DD.md` |

### edzo (ex-privatedzo)

| Name | Cron | Prompt |
|---|---|---|
| `edzo-reggeli-riport` | `30 7 * * 1-5` | Reggeli riport Tominak — edzés, súly, alvás, HRV (Withings MCP), következő edzés. |
| `edzo-hetvegi-riport` | `0 10 * * 0,6` | Hétvégi reggeli riport — hosszabb heti áttekintés. |
| `edzo-esti-emlekezteto` | `0 21 * * *` | Esti emlékeztető — holnap mit kell csinálni, aludni menj időben. |

### crypto-advisor

| Name | Cron | Prompt |
|---|---|---|
| `crypto-briefing-reggel` | `30 5 * * *` | Reggeli crypto briefing — BTC/ETH/top10 change 24h, news Coindesk + Bloomberg crypto, Polymarket top events. Magyar, tömör. |
| `crypto-briefing-delutan` | `0 13 * * *` | Afternoon briefing — phased delivery (multiple channels → delay). |

### pietscarlet (superagent)

| Name | Cron | Prompt |
|---|---|---|
| `email-check` (ritkítva) | `0 9,13,17 * * 1-5` | **70% ↓** az óránkéntiről. Email check hello@pietscarlet.hu (email MCP). Csak ha van új, szumma Tominak. |
| `hetfoi-osszefoglalo` | `0 8 * * 1` | Hétfő reggeli projekt szumma — PietScarlet, Görgey u. 32 + mindkét építkezés státusz (sub-agent lekérdezés delegálás). |
| `napi-todoist` | `30 8 * * 1-5` | Todoist áttekintés napra. |
| `napi-szamla-figyelo` | `30 10 * * 1-5` | Címkézetlen számla figyelő — QuiCK MCP. |
| `superagent-daily-heartbeat` | `0 18 * * *` | **ÚJ:** napi heartbeat — sub-agentek (görgey32, csobanka, torokhegyi) státuszának beszedése `send_message`-dzsel, összefoglaló Tominak. Lásd project_nanoclaw_v2_migration.md superagent szekció. |

### rezerver

| Name | Cron | Prompt |
|---|---|---|
| `rezerver-growth-loop` (ritkítva) | `30 17 * * *` | **50% ↓** a napi 2×-ről. Growth session: state.json + strategy.md olvasás, inbox check (Dani hang), pipeline bővítés, FB Phase-check. |

### bulltrapp

| Name | Cron | Prompt |
|---|---|---|
| `bulltrapp-growth-loop` | `0 7,10,13,16,19,22 * * *` | 6×/nap gondolkodó hurok. Figyelt — ha limit szűk, 4×/napra ritkíthatjuk (7, 11, 15, 19). |
| `bulltrapp-telegram-session` | `15 9,14,19 * * *` | 3×/nap TG warmup session — state + preflight + olvasás + (ha warmup engedi) üzenetküldés. |

### napi-hirek

**NEM agent** — push-only plugin. A `task-1773055593449-9hs0z0` (`30 8 * * *`) plugin-szinten fut, NEM agent-szintű `schedule_task`-kal. Külön beállítás Phase 6-ban.

## Maintenance (heti CLAUDE.md audit) → `/compact` csere

V1-ben mindegyik groupnak volt egy heti `task-maintenance-*` cronja ami a `claude-md-maintenance` skillt futtatta. V2-ben a beépített `/compact` skill átveszi. **Ha akarjuk cron-olni is**, minden agentnél:

| Group | Cron | Prompt |
|---|---|---|
| pietscarlet | `0 16 * * 5` | `/compact` |
| crypto-advisor | `30 16 * * 5` | `/compact` |
| gorgey32 | `0 17 * * 5` | `/compact` |
| edzo | `30 17 * * 5` | `/compact` |
| csobanka | `30 18 * * 5` | `/compact` |
| torokhegyi | `0 18 * * 5` | `/compact` |
| bulltrapp | `0 19 * * 5` | `/compact` |
| rezerver | `30 19 * * 5` | `/compact` |
| asszisztens | `0 20 * * 5` | `/compact` |

Vagy: `/compact` helyett **csak akkor** fut, ha a context tényleg nagyra nőtt. V2-ben a provider.claude.ts valószínűleg automatikusan kezeli. **Kérdéses, hogy cron-ként kell-e állítani vagy elég a context-aware auto-compact.**

## Script-gate ajánlások (API credit optimalizáció)

A global CLAUDE.md leírja: ha a task napi 2×+ fut, érdemes `script` hookot tenni elé. Ezek ajánlottak:

- **PietScarlet email check**: script lekéri az IMAP UID MAX-ot, és csak akkor ébreszt ha van új (ez ~50% agent-wake megtakarítás)
- **Bulltrapp email check** (ha lesz): ugyanez
- **Crypto briefing**: nem igényel script (minden reggel kell)

## Összegzés

| Kategória | V1 | V2 |
|---|---|---|
| Host cron (real) | 10 | **1** (X query-id) |
| Host bash schedule-*.sh | 10 | **0** (az agent self-schedule átveszi) |
| Central scheduled_tasks table | 17 cron row | **0** (átkerül per-session inbound.db-kbe) |
| PietScarlet email gyakoriság | 50/hét | **15/hét** (70%↓) |
| Rezerver growth loop | 14/hét | **7/hét** (50%↓) |
