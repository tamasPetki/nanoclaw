# Email orchestration — asszisztens szemszögből

Tomi nevében koordinálom a céges agentek email-checkjeit. Hétköznap 9/13/17 CET pre-filter
script futtatja: csak akkor delegálok az érintett agentnek, ha új levél van a fiókban.
A céges agentek a saját email MCP-jüket használják a body-k lehúzására.

## Felelős agent / fiók-mapping

| Fiók | Agent | UID-state fájl agent-en |
|---|---|---|
| `hello@pietscarlet.hu` | PietScarlet | `/workspace/agent/email-check-last-uid.txt` |
| `hello@lupaobolstrand.hu` | Lupa Öböl | `/workspace/agent/lupaobol-last-uid.txt` |
| `hello@trinkenessen.eu` | Trinken Essen | `/workspace/agent/trinkenessen-last-uid.txt` |

(BullTrapp + Rezerver fiókok pre-filter NEM része — saját agentjeik kezelik a sajátjukat.)

## Saját UID-state

`/workspace/agent/email-uid-state.json`:
```json
{
  "pietscarlet": <last_uid>,
  "lupaobol":    <last_uid>,
  "trinkenessen": <last_uid>
}
```

Forrás: a céges agent visszajelzése, vagy ha nem volt új levél, az IMAP-ból olvasott aktuális last UID. Minden check után frissítem.

## Pre-filter check (host bash)

Bash IMAP-ot használok host-mód közvetlen LOGIN-nal. Credek: `source /workspace/agent/.secrets`
→ `PIETSCARLET_IMAP_*`, `TRINKENESSEN_IMAP_*`, `LUPAOBOL_IMAP_*`.

Pszeudokód:
```
for fiok in [pietscarlet, trinkenessen, lupaobol]:
    last = state.get(fiok)
    current_uids = imap_search_uid_above(fiok, last)
    if current_uids üres:
        continue  # nincs új, ne ébresszük az agentet
    delegate(felelős_agent_for(fiok), last, current_uids)
```

## Delegálás (normál pálya)

A felelős agentnek üzenet a saját Discord csatornájába:
```
Email check: <fiók>. Utolsó feldolgozott UID: <last>. Új levelek: UID > <last>.
Workflow szerint dolgozd fel és küldd vissza strukturáltan.
```

Az agent saját MCP-jén lehúzza a body-kat, kategorizál, action-prep-et csinál,
strukturáltan visszaküldi. Én aggregálom és Tomi-nak Discord card-on átadom.

## MCP failure fallback (PROAKTÍV — én oldom meg)

Ha a felelős agent visszajelzése `⚠️ Email MCP nem elérhető — failover kérés` mintát
tartalmaz (bármi: disconnected, IMAP timeout, tool unavailable, stb.), **NE blokkolj
és NE delegáld vissza Tomi-hoz**. A workflow:

### 1. Egy retry (gyors)

Várj 30 másodpercet, próbáld újra delegálni. Ritkán a Claude Code SDK reconnect-el a
következő wake-up-on.

### 2. Body-átadás (failover)

Ha a retry sem ment:

a. Saját host-szintű IMAP-pal (Python `imaplib` vagy bash) lehúzom én az érintett emaileket
   (`<FIÓK>_IMAP_HOST/PORT/USER/PASSWORD` env-ből, `source /workspace/agent/.secrets`).
b. Strukturált formátumban átküldöm a felelős agentnek, levelenként:
   - From, Subject, Date, UID
   - Plain text body (HTML-stripped — `html2text` ha kell)
   - Attachment-lista (név + size, content NEM kell)
c. A felelős agent a body-átvétel után csinálja meg a kategorizálást + action prep-et és
   visszaküldi a normál strukturált választ.

Példa: ma (2026-05-04 13:32-kor) PietScarlet failure-t jelzett, én átküldtem az 5 emailt
full body-val, és helyesen feldolgozta. **Ez a deklarált pattern, nem improvizáció.**

### 3. Mikor SEM failover

- **NONAUTH / hitelesítési hiba** — host-szintről is ugyanazzal a credentiallal megy.
  Ha a host-szintű IMAP-pal nálam is fail, jelezz Tomira (jelszó-rotáció / fiók-zár).
- **IMAP-szerver lent** (host nem éri el a mail-szervert) — Tomira eszkalálni.
- **Több mint 3 nap óta failure** ugyanannál a fióknál — nem-tranziens probléma, Tomi-eszkalálás.

## Logging

Minden check eredményét rögzítem a `/workspace/agent/email-check-log.md`-ben (legutóbbi 30
nap, idősorrendben):
- timestamp, fiók, eredmény (no-new / delegált / failover / hiba)
- failover esetén: hibaüzenet + fallback eredmény
