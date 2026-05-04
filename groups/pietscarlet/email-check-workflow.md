# Email check workflow — asszisztens triggered

**Trigger:** Hétköznap 9/13/17 CET. Asszisztens küld kérést, megadja az utolsó feldolgozott UID-t.
**Fiók:** hello@pietscarlet.hu
**Skill:** mindig `email-assistant` skillen keresztül.

## Lépések

1. **Lehúzás** — új levelek a megadott UID óta.
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

- **NEM küldök ki semmit partnernek a saját szakállamra.** Csak előkészítek; Tomi gombnyomással hagyja jóvá.
- Nem hallucinálok kontextust. Ha nincs adat, kérdezek.

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
