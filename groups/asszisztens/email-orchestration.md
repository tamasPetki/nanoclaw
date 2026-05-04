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

⚠️ **KRITIKUS routing-szabály** (kompakt-túlélő — minden compact után ellenőrizd!):
A felelős agentnek **csak `<message to="...">` wrapper-rel vagy `mcp__nanoclaw__send_message`
tool-lal** lehet üzenni. Ha plain text-et írsz arról hogy "szóltam pietscarletnek" wrapper
nélkül, az **CSAK Tomi csatornájába megy**, a megnevezett agent NEM kap semmit. Ez
hallucináció — a 2026-05-04 14:19-24 incidensben az asszisztens 3-szor "szólt" a
pietscarletnek text-ben, de a pietscarlet inbox-ja üres maradt.

**Helyesen, példa pietscarlet-felé:**
```
<message to="pietscarlet">
Email check: hello@pietscarlet.hu. Utolsó feldolgozott UID: 2415.
Új levelek: UID 2416-2420 (5 db). Workflow szerint dolgozd fel és küldd vissza strukturáltan.
</message>
```

Vagy MCP tool:
```
mcp__nanoclaw__send_message({
  to: "pietscarlet",
  text: "Email check: ... Új levelek: UID 2416-2420 ..."
})
```

Az agent saját MCP-jén lehúzza a body-kat, kategorizál, action-prep-et csinál,
strukturáltan visszaküldi (szintén `<message to="asszisztens">...</message>`-be wrappelve).
Én aggregálom és Tomi-nak Discord card-on átadom.

**Rendelkezésre álló agent destinations** (system promptodból: ld. "Sending messages"):
`pietscarlet`, `lupaobol`, `trinkenessen`, `csobanka`, `gorgey32`, `torokhegyi`.

**Ellenőrző gondolat minden delegálás után:** "Az utolsó turn-ömben tényleg ott van a
`<message to="...">` wrapper vagy `send_message` tool-call? Ha nem, akkor csak Tomi-nak
beszéltem, az agent nem kapott semmit."

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

### 3. Host-IMAP/SMTP KÜLDÉS egy agent nevében (KÖTELEZŐ szabályok)

Ha az agent email MCP-je tartósan le van és én **küldök ki** levelet host-IMAP/SMTP-vel
az agent fiókjából (pl. `mail.pietscarlet.hu:587` STARTTLS, `hello@pietscarlet.hu`-ról),
az **HÁROM kötelező lépés**:

**(a) Olvasd be az érintett agent email-skilljét ELŐBB.**
A `/home/node/.claude/skills/email-assistant/SKILL.md` (mountolva minden agentnek
a `data/v2-sessions/<group>/.claude-shared/skills/email-assistant/SKILL.md`-ből) tartalmazza
az adott fiók hangnem-szabályait, megszólítás-formulát, aláírás blokkot. **Soha ne improvizálj
saját kapásból** — a SKILL utolsó word a stílusra. A 2026-05-04 16:24 incidens (MOBIL-CENTRUM
forward Erikának: "Kérlek intézd a csatolt számlát. Köszi! Tomi") **3 SKILL-szabályt sértett**
(utasítás, hiányzó kedves zárás, rossz aláírás). Tomi felháborodott, jogosan.

**(b) Készíts draft-ot Tomi-card-on JÓVÁHAGYÁSRA mielőtt küldenél.**
Soha NE küldj host-IMAP-pal anélkül hogy Tomi explicit gombot nyomott volna. A draft-ban
mutasd meg a teljes szöveget (megszólítás, body, aláírás) — Tomi a card-on lássa pontosan
mi megy ki. `mcp__nanoclaw__ask_user_question` opciók: "✅ Küldd", "✏️ Módosítok",
"❌ Mégsem".

**(c) Aláírás az AGENT identitása, NEM "Tomi".**
Ha pietscarlet nevében küldök, az aláírás `PietScarlet Kft.` (vagy az agent
SKILL-jében meghatározott pontos forma) — nem `Tomi`, nem üresen. Az email a fiók
identitásával megy ki, az aláírásnak ezt tükröznie kell.

Ezeket akkor is be kell tartani ha sietsz / akkor is ha "csak gyors" forward — Tomi
inkább vár 30 másodpercet a card-jóváhagyással mint hogy hibás hangnemű email partnernek
menjen ki.

### 3. Mikor SEM failover

- **NONAUTH / hitelesítési hiba** — host-szintről is ugyanazzal a credentiallal megy.
  Ha a host-szintű IMAP-pal nálam is fail, jelezz Tomira (jelszó-rotáció / fiók-zár).
- **IMAP-szerver lent** (host nem éri el a mail-szervert) — Tomira eszkalálni.
- **Több mint 3 nap óta failure** ugyanannál a fióknál — nem-tranziens probléma, Tomi-eszkalálás.

## ⚠️ Turn-end checklist (KÖTELEZŐ minden válasz előtt mielőtt befejezed a turn-t)

A NanoClaw agent reactive — `end_turn` után csak a következő inbound message
ébreszt fel. Ha félbehagyott in-flight workflow van és lezárod a turn-t, az
egész orchestration deadlock-ban marad amíg Tomi újra nem mention-el. A
2026-05-04 16:06 incidens pont ez volt: lezártam a turn-t miközben pietscarletnek
és lupaobolnak failover-t kellett volna küldenem, mindenki egymásra várt.

**Mielőtt a turn-t lezárod, MENJ VÉGIG a következőkön:**

1. **In-flight failover-kérés van-e?**
   Olvasd vissza a saját utolsó turn-edet és minden bejövő agent-üzenetet.
   Ha bármelyik céges agent `failover-kérést` jelzett (mintázat: `⚠️ Email MCP
   nem elérhető — failover`, vagy bármi `disconnected`/`tool unavailable`/
   `body átküldését kéri`), akkor **TE vagy a felelős** — host-IMAP-pal lehúzni
   a body-t és `<message to="agent">` wrapperrel átküldeni.

2. **Fél-delegálás van-e?**
   Ha egy delegáláshoz csak részben jött válasz (pl. 2-ből 1 agent reagált),
   ne várj passzívan a másikra — küldj nudge-ot vagy ellenőrizd hogy ki kell-e
   még valamit küldened.

3. **Tomi-card hiányzik-e döntésre?**
   Ha minden agent-válasz megérkezett, készítsd el a `mcp__nanoclaw__ask_user_question`
   tap-ready card-okat MIELŐTT lezárod a turn-t. Sima text-üzenet ahol döntésre
   van szükség = következő kör vesztett.

4. **Action végrehajtás folyamatban?**
   Ha card-választás után delegáltál action végrehajtást, ne fejezd be a turn-t
   amíg evidencia (Message-ID + Sent-mappa-UID + tool-válasz) vissza nem érkezik.

**Ha bármelyik checklist-pont aktívnak bizonyul, FOLYTASD a turn-t** — küldd ki
a hiányzó üzenetet/cardot/tool-call-t MOST, NE várj következő mention-re. Csak
akkor zárhatod le a turn-t ha:
- Minden in-flight failover teljesítve, VAGY
- Egyértelműen Tomi-bemenetre vár valami (és ezt ki is mondod neki)

## Logging

Minden check eredményét rögzítem a `/workspace/agent/email-check-log.md`-ben (legutóbbi 30
nap, idősorrendben):
- timestamp, fiók, eredmény (no-new / delegált / failover / hiba)
- failover esetén: hibaüzenet + fallback eredmény
