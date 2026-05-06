# Email check workflow (asszisztens triggered)

**Trigger:** Hétköznap 9/13/17 órakor pre-filter script futtatja, csak akkor ébreszt fel ha új levél van a `hello@lupaobolstrand.hu` fiókban. Asszisztens átadja az utolsó UID-t.

**Cél:** Tomi egy összesített Discord card-ot kap gombokkal — minden item-hez 1-klikkes jóváhagyás (`Küldd / Archive / Várj`). NEM küldök ki semmit, csak előkészítek; akció csak gombnyomás után. Discord card UX **támogatott** — `mcp__nanoclaw__ask_user_question` tool, részletek lent: "Card UX használata".

## Credentials & adatfolyam (v2)

Tomi kívülről kezeli a credeket — nem foglalkozom vele.
- **Pre-filter** asszisztens konténerében fut, check-kor átadja az új UID-okat / headereket
- **Body-fetch a TIÉD (default):** saját email MCP-vel (`mcp__email__*`) húzom le a full body-t
- **MCP halott esetén:** konkrét hibaüzenettel failovert kérek asszisztenstől, ő IMAP-pal lehúzza és raw-val átadja. **NE adj hallucinált header-elemzést body nélkül.**

## Card UX használata (1-klikkes jóváhagyás)

Minden processed email-hez kérek explicit user-választ a `mcp__nanoclaw__ask_user_question`
MCP tool-lal — Tomi a Discord-on egy embed-et lát button-okkal, kattint, az agent megkapja
a választ és folytatja. Blokkoló call (max 300s timeout default).

**Tool szignatúra:**
```
mcp__nanoclaw__ask_user_question({
  title: "<rövid card-cím, pl. 'Foglalás-kérés válasz'>",
  question: "<a kérdés szöveg, részletekkel — markdown OK>",
  options: [
    { label: "<gomb-szöveg>", selectedLabel: "<post-click szöveg>", value: "<callback-érték>" },
    ...
  ]
})
```

**Példa (foglalás-kérdésre válasz):**
```
mcp__nanoclaw__ask_user_question({
  title: "Foglalás-válasz: Kovács Béla 5 fő szombat 18:00",
  question: "Draft elkészült:\n\n> Kedves Béla, köszönjük a foglalási kérelmét...\n\nKüldjem ki?",
  options: [
    { label: "Küldd el",     selectedLabel: "✅ Elküldve",  value: "send" },
    { label: "Módosítok",    selectedLabel: "✏️ Várok módosításra", value: "edit" },
    { label: "Mégsem",       selectedLabel: "❌ Eldobva",   value: "cancel" }
  ]
})
```

Tomi gomb-választása után a tool eredményeként megkapom a `value`-t (pl. `"send"`),
és aszerint folytatom (küldés, várakozás új inputra, vagy törlés).

**Mikor használj card-ot:**
- számla továbbítás Erikának (`Küldd / Várj / Mégsem`)
- válasz draft jóváhagyás (`Küldd / Módosítok / Eldobom`)
- archiválás vagy Todoist task döntés (`Archive / Todoist / Hagyjuk`)
- bármilyen kétséges kategória (`Igen / Nem / Megnézem maga` Tomira átadva)

**Mikor NE használj card-ot:**
- pure tájékoztató ami nem igényel akciót (csak summary szöveg)
- failure-jelentés (sima text)
- batch összesítő amelyhez nincs egyedi döntés (pl. "5 newsletter archived")

## Akció végrehajtás

Tomi jóváhagyása után (card-button vagy szöveges) az akciót:
A végrehajtás után **konkrét evidenciát** küldök vissza:
- `send_email` → Message-ID, timestamp, full tool-response
- archive/törlés → tool-response, érintett UID
- **Tilos** csak ✅ vagy "kész" — mindig konkrét output

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
