# Email check workflow — asszisztens triggered

**Trigger:** Hétköznap 9/13/17 CET. Asszisztens küld kérést, megadja az utolsó feldolgozott UID-t.
**Fiók:** hello@pietscarlet.hu
**Skill:** mindig `email-assistant` skillen keresztül.

## Lépések

1. **Lehúzás** — új levelek a megadott UID óta. **Body-fetch a saját email MCP-vel a default eljárás** (`mcp__email__list_emails_metadata` + `get_emails_content`). Header-only elemzést TILOS adni — ha nincs body, nincs feldolgozás (lásd Hibakezelés).
2. **Kategorizálás** levelenként:
   - **számla** — díjbekérő, fizetési felszólítás, banki pénzmozgás értesítő → akció: továbbítás Erikának (cím: `email-assistant` skillből), előkészített továbbítási szöveggel.
   - **válaszra vár** — partner/ügyfél/hatóság konkrét kérdése v. kérése → akció: válasz draft.
   - **tájékoztató** — newsletter, auto értesítés, FYI → akció: archive, vagy Todoist task ha érdemi.
   - **Edge case (nem fér bele):** jelöld `egyéb` kategóriával, írd le miért nem fér bele, kérdezz Tomitól iránymutatást.
3. **Action prep — kontextusgyűjtés MINDIG előbb:**
   - Múltbeli email ezzel a feladóval / témával?
   - Drive fájl (szerződés, terv, dokumentáció) — `PIETSCARLET_INDEX.md` / `PIETSCARLET_CATALOG.md` először.
   - Todoist task kapcsolódik-e?
   - Memória / projektcsatorna (gorgey32 / torokhegyi / csobanka) — ha projekt-specifikus.
   - Ha minden megvan → konkrét draft / továbbítási szöveg.
   - Ha kulcs info hiányzik → NE találj ki, jelezd és tegyél fel konkrét kérdést Tominak.
4. **Visszaküldés asszisztensnek** strukturáltan, levelenként:
   - feladó, tárgy, érkezési idő
   - 1-2 mondatos összefoglaló
   - kategória
   - javasolt akció (típus + előkészített szöveg)
   - urgency: high (deadline ma/holnap) / med (1 héten belül) / low (többi)
   - kérdés Tomihoz, ha van

## Tilalmak

- **NEM küldök ki semmit partnernek a saját szakállamra.** Csak előkészítek; Tomi szöveges jóváhagyásával megy ki.
- Nem hallucinálok kontextust. Ha nincs adat, kérdezek.

## Card UX (Tomi 1-klikkes jóváhagyás)

Discord card UX **támogatott** — az `mcp__nanoclaw__ask_user_question` MCP tool-lal Tomi
embed-et kap button-okkal. Blokkoló call (max 300s timeout default), gombnyomás után az
agent visszakapja a `value`-t.

**Tool szignatúra:**
```
mcp__nanoclaw__ask_user_question({
  title: "<rövid card-cím>",
  question: "<a kérdés szöveg, részletekkel — markdown OK>",
  options: [
    { label: "<gomb-szöveg>", selectedLabel: "<post-click szöveg>", value: "<callback-érték>" },
    ...
  ]
})
```

**Példa (számla továbbítás Erikának):**
```
mcp__nanoclaw__ask_user_question({
  title: "Számla továbbítás: MVM 47 600 Ft",
  question: "**MVM elektromos áram** — 47 600 Ft, határidő 2026-05-15.\nDraft kész:\n\n> Szia Erika, csatolva küldöm az MVM számlát...\n\nTovábbítsam Erikának (penzugy@pietscarlet.hu)?",
  options: [
    { label: "Igen, küldd",     selectedLabel: "✅ Erikának küldve",  value: "forward" },
    { label: "Várj, megnézem",  selectedLabel: "⏸️ Várok",            value: "wait" },
    { label: "Ne küldd",        selectedLabel: "❌ Eldobva",           value: "cancel" }
  ]
})
```

**Mikor használj card-ot:**
- számla továbbítás Erikának (`Küldd / Várj / Mégsem`)
- válasz draft jóváhagyás (`Küldd / Módosítok / Eldobom`)
- bármilyen kétséges kategória (`A / B / Megnézem`)
- engedélyek, alvállalkozói bekért egyeztetések — egyértelmű igen/nem

**Mikor NE card:**
- pure tájékoztató (csak summary)
- failure-jelentés
- batch összesítő egyedi döntés nélkül

A szöveges jóváhagyás (számozott "2-es mehet, 4-est módosítsd X-re") továbbra is működik
mint fallback ha sokszor egyszerre kell döntés.

## Akció végrehajtás (Tomi jóváhagyás után)

Az asszisztens (vagy a card-button közvetlenül) delegálja a végrehajtást.

Végrehajtáskor:
1. Saját email MCP-vel küldöm (`mcp__email__send_email`, `html: true`, aláírás blokk, threading `in_reply_to`).
2. Visszaigazolás az asszisztensnek **konkrét evidenciával** — nem csak ✅:
   - Message-ID (a tool-válaszból)
   - Küldési időbélyeg
   - A `mcp__email__send_email` tool-válasz lényegi mezői (siker/hiba, recipient, subject)
3. Hiba esetén: konkrét hibaüzenet, NEM „nem ment".

## UID state

- Saját state fájl: `/workspace/agent/email-check-last-uid.txt` — minden futás végén frissítem az utolsó feldolgozott UID-re (referenciaként).
- **Forrás minden check elején: az asszisztens által átadott UID** (nem a saját state). A saját state csak akkor segít, ha Tomi külön kérdez.

## Hibakezelés — MCP failure fallback

Ha a saját email MCP nem elérhető (`mcp__email__*` toolok disconnected, IMAP timeout,
egyéb tool-side hiba), a workflow NE blokkoljon. Két lépés:

### 1. Próbáld újra (egyszer)

Ritkán a Claude Code SDK egy következő tool-call-ra reconnect-eli a child MCP-t. Egyszer
újrapróbálom a `list_emails_metadata` hívást, és ha sikerül, folytatom normálisan.

### 2. Kérj failover-t (a kérőtől, általában az asszisztens)

Ha a retry sem ment, küldj **explicit, strukturált failover-kérést** az asszisztensnek
(NE csak "nem megy"-et). Sablon:

```
⚠️ Email MCP nem elérhető — failover kérés

Konkrét hiba: <pl. list_emails_metadata: disconnected, vagy IMAP timeout, stb.>
Próbáltam: 1× retry, ugyanaz.

Failover: tudnál átküldeni nekem az érintett emaileket full body-val
(a hostról IMAP-pel le tudod húzni)? Strukturálva:
  - From, Subject, Date, UID
  - Plain text body (HTML-stripped)
  - Attachment lista (név + size, content nem kell)

Ezután a workflow szerint feldolgozom őket.
```

Ez nem fancy: az asszisztens HU IMAP-pel a hostról közvetlenül lehúzhatja a body-kat
(`source /workspace/agent/.secrets`-ben PIETSCARLET_IMAP_* van), és tool-call helyett
chat-üzenetben átküldi. A pietscarlet MCP halott állapotában is feldolgozható.

### Mikor NEM failover

- **Hitelesítési hiba** (NONAUTH, jelszó-rotáció, fiók-zár) — failover sem segít, mert a
  hostról is ugyanaz a credential. Ilyenkor jelezz és állj le, várj Tomira.
- **IMAP-szerver lent** (mail.pietscarlet.hu nem elérhető) — failover sem segít. Jelezz.
