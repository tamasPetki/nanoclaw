# Email check workflow (asszisztens triggered)

**Trigger:** Hétköznap 9/13/17 órakor pre-filter script futtatja, csak akkor ébreszt fel ha új levél van a `hello@lupaobolstrand.hu` fiókban. Asszisztens átadja az utolsó UID-t.

**Cél:** Tomi egy összesített Discord card-ot kap gombokkal — minden item-hez készre előkészített akció. NEM küldök ki semmit, csak előkészítek.

## Credentials & adatfolyam

Tomi kívülről kezeli a credeket — nem foglalkozom vele.
- **Pre-filter** asszisztens konténerében fut, check-kor átadja a headereket
- **Full body** lekéréséhez a saját email MCP/tool-omat használom (amikor be lesz állítva)
- Ha hiba van, konkrét hibaüzenetet jelzek vissza

## UID state

Saját UID state-et tárolok itt: `/workspace/agent/lupaobol-last-uid.txt`
- Asszisztens átadása check-kor a forrás
- Saját state csak referencia, minden check után frissítem

## Lépések minden check-nél

1. **Fetch** — új levelek az átadott UID óta
2. **Kategorizálás** levelenként:
   - `számla` → továbbítás Erikának (penzugy@pietscarlet.hu), default szöveg előkészítve
   - `válaszra vár` → válasz draft előkészítve
   - `tájékoztató` → archive vagy Todoist task
   - `egyéb` → edge case, jelzéssel + kérdéssel Tomihoz
3. **Action prep** — kontextus forrásai (HALLUCINÁCIÓ TILOS):
   - Múltbeli email (ugyanattól a feladótól)
   - Drive: `/workspace/extra/lupaobol-drive/` (2026-os árlista, étlap kalkuláció, szerződések)
   - Todoist (mcp__todoist__*)
   - Saját memória (CLAUDE.local.md, jegyzetek)
   - Hiányzó kontextusnál → kérdezek, nem találok ki
4. **Strukturált válasz** asszisztensnek, levelenként:
   - feladó, tárgy, érkezési idő
   - 1-2 mondatos összefoglaló
   - kategória + javasolt akció (előkészített szöveg)
   - urgency: high / med / low
   - kérdések Tomihoz, ha vannak

## Szezonális kontextus (májustól)

Strandszezon nyitása közeleg → szállítók, hatóságok, foglalások jöhetnek.
**Foglalás-jellegű email** = `válaszra vár` + `high` urgency.

## Hiba esetén — MCP failure fallback

Ha a saját email MCP nem elérhető (`mcp__email__*` toolok disconnected, IMAP timeout, egyéb
tool-side hiba), a workflow NE blokkoljon. Két lépés:

### 1. Próbáld újra (egyszer)

Ritkán a Claude Code SDK egy következő tool-call-ra reconnect-eli a child MCP-t. Egyszer
újrapróbálom, és ha sikerül, folytatom.

### 2. Kérj failover-t az asszisztenstől

Ha a retry sem ment, strukturált failover-kérés az asszisztensnek (NE csak "nem megy"):

```
⚠️ Email MCP nem elérhető — failover kérés

Konkrét hiba: <pl. list_emails_metadata: disconnected>
Próbáltam: 1× retry, ugyanaz.

Failover: tudnál átküldeni az új emaileket (UID > <last_uid>) full body-val?
Strukturálva: From, Subject, Date, UID, plain-text body, attachment-lista.

Utána a workflow szerint feldolgozom.
```

Az asszisztens host-szintű IMAP-pal le tudja húzni (`source /workspace/agent/.secrets` →
LUPAOBOL_IMAP_*), és chat-üzenetben átadja. A Lupa Öböl MCP halott állapotában is
feldolgozható.

### Mikor NEM failover

- **Hitelesítési hiba** (NONAUTH, jelszó-rotáció) — failover sem segít, jelezz Tomira.
- **IMAP-szerver lent** (s3.dchosting.hu unreachable) — failover sem segít. Jelezz.

Ne küldj ki semmit partnernek hibás állapotban.

## Email aláírás / hangnem

Email skill workflow-t kövesd (válasz hangnem, aláírás blokk). Erika felé:
udvarias, kedves, NEM utasító. Mindig köszönés + záró formula.
