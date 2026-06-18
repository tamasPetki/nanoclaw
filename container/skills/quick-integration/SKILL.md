---
name: quick-integration
description: >
  MINDIG használd ezt a skillt amikor a QUiCK számlázó rendszerrel dolgozol — bejövő/kimenő
  számlák, partnerek, batch-egyeztetések, Excel-számla audit. Trigger szavak: "QUiCK",
  "quick", "számla", "számlaszám", "költség", "Pintér Tüzép", "Feri", "audit", "ellenőrizd
  a számlákat", "Excel egyeztetés". Akkor is, ha alvállalkozó-számlát kell visszakeresni
  PietScarlet könyvelésében.
version: 1.0.0 (NanoClaw port)
author: Hermes Agent → NanoClaw
---

# QUiCK Integráció

QUiCK számlázó API a PietScarlet Kft. könyveléséhez. Két interface áll rendelkezésre, használati sorrendben:

1. **`mcp__quick__*` tool-ok** — alapértelmezett, kis lekérdezésekre (egy-egy számla, partner-keresés).
2. **Direkt REST API curl/Python** — **batch-műveletekhez kötelező** (10+ számla auditja, Excel-egyeztetés).

## API alapadatok

```
Base URL:   https://api.quick.riport.co.hu
Company ID: 1 (PietScarlet Kft.)
Auth:       Authorization: Token <QUICK_API_TOKEN>
            (a host által injektálva, OneCLI-vaultban: `Quick` secret;
             container env: $QUICK_API_TOKEN)
```

## Végpontok

| Cél | Végpont | Megjegyzés |
|---|---|---|
| Bejövő számla lista | `GET /1/expenses?page_size=100&page=N` | Lapoz, ~2500 tétel = 25 oldal |
| Bejövő számla részletek | `GET /2/expenses/{id}?fields=items,payment_history,accounting,post_its` | Tételsorok itt |
| Kimenő számla lista | `GET /1/incomes?page_size=100&page=N` | Ugyanaz struktúra |
| Partnerek | `GET /1/partners` | |
| Keresés | NINCS dedikált — fetch ALL + szűrj in-memory | |

## ⚠️ KRITIKUS: batch-műveletek stratégiája

**SOHA ne használj `mcp__quick__*` tool-t batch-műveletekhez.**

Az MCP tool minden egyes hívásnál:
1. Letölti az ÖSSZES számlát (mind a ~2500-at, 25 API-call)
2. Szűr kliens-oldalon
3. Ezért egyetlen keresés ~25-50 másodperc

100+ számla auditja MCP-szekvenciálisan: 100 × 50s = 5000s = 83 perc → **timeout / context-bloat**.

**Helyes batch-minta:** Python script, fetch ALL egyszer, match in-memory, details csak a hit-ekre.

```python
import json, os, urllib.request

BASE = 'https://api.quick.riport.co.hu'
TOKEN = f'Token {os.environ["QUICK_API_TOKEN"]}'

def api_get(path):
    req = urllib.request.Request(f'{BASE}{path}', headers={
        'Authorization': TOKEN, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

# 1. Fetch all egyszer
all_expenses = []
for page in range(1, 26):
    data = api_get(f'/1/expenses?page_size=100&page={page}')
    all_expenses.extend(data['results']['expenses'])
    if not data.get('next'):
        break

# 2. Match in-memory
for search_term in search_terms:
    matches = [e for e in all_expenses
               if search_term.lower() in (e.get('invoice_number') or '').lower()]
    # 3. Részletek CSAK a találatokra
    if matches:
        detail = api_get(f'/2/expenses/{matches[0]["id"]}?fields=items')
        # tovább...
```

## Számla-részletek értelmezése

`GET /2/expenses/{id}?fields=items` válasz:
- `items[]` — tételsorok: `name`, `quantity`, `unit`, `gross_amount`, `net_unit_price`
- `payment_history[]` — fizetési előzmények
- A felső szintű `gross_amount` lehet 0; a tényleges összeg az `assignments[]`-ban

## Szállító-egyeztetési workflow (Excel-számla audit)

Amikor Feri vagy más szállító Excel-számla-listáját kell ellenőrizni a QUiCK adatokkal:

1. **Excel beolvasás Python `openpyxl`-lel.** A NanoClaw container-ben: `pip install openpyxl` ha nincs (`pnpm exec` nem segít, pythonra kell). Egyszerűbb: convert Excel → CSV előre, és Python `csv` modul.
2. **"Számlaszám" oszlop** a kulcs. Néha a cégnévvel együtt, néha tisztán.
3. **Keresés sorrendje**: pontos string match → első szó (számlaszám-rész) → substring match → normalizált (ékezet/whitespace nélkül).
4. **Ha nincs match**: jelöld `MISSING`-ként a riportban — Tomi dönt manuálisan.

## Audit-eredmény kommunikáció

Az audit-eredmény Tominak **mindig `mcp__nanoclaw__send_card`-ban** menjen:

```
title: "📊 QuiCK audit: <szállító neve>"
description: "<N> számlából <M> találat, <K> hiányzó"
children:
  - "**Talált:** Nnn összesen XXX Ft (link a wiki/projects/.../audit-YYYY-MM-DD.md-re)"
  - "**Hiányzó:** Mmm — Tomi-döntés vár"
  - "**Eltérés:** ..."
actions:
  - { label: "📂 Részletek", value: "open_audit" }
```

A részletes eredményt a wiki-be is appendeld (`wiki/projects/<projekt>/audit-YYYY-MM-DD.md`).

## Gyakori gotcha

- **API-rate limit**: nincs explicit, de 25 oldal egymás után OK. Ha többet, `time.sleep(0.2)` a page-ek közt.
- **Token rotáció**: ha 401-et kapsz → `onecli secrets list` → check `Quick` secret + agent ne "selective" mode-ban legyen (host pattern `api.quick.riport.co.hu` matchel).
- **Page response structure**: `{results: {expenses: [...]}, next: "url-or-null"}`. A `results` MINDIG egy objektum, nem tömb (egy gyakori hibaforrás).
