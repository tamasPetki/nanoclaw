---
name: email-assistant
description: >
  MINDIG használd ezt a skillt, ha bármilyen email-kezelés történik. Ez azt jelenti:
  email lekérés, email olvasás, email válasz, email írás, email továbbítás, email összefoglaló,
  email áttekintés, vagy bármilyen kérés ami a hello@pietscarlet.hu fiókkal kapcsolatos.
  Konkrét trigger szavak: "email", "mail", "levél", "levelezés", "válaszolj", "írj emailt",
  "nézd meg az emaileket", "mi jött", "mi a helyzet ezzel a partnerrel", "fogalmazz választ",
  "továbbítsd", "küld el", "inbox", "bejövő". Ha az előző üzenetben emailek voltak felsorolva
  és a felhasználó azt mondja "válaszolj", "erre válaszolj", "az X-esre", vagy bármilyen
  emailre hivatkozik — SZINTÉN használd ezt a skillt, még akkor is ha már korábban le lettek
  kérve az emailek a beszélgetésben.
---

# Email Asszisztens — PietScarlet

## Hogyan működik

Ez a skill segít Tominak hatékonyan kezelni a hello@pietscarlet.hu email fiókot úgy, hogy
minden válaszhoz összegyűjti a szükséges kontextust több forrásból. A cél az, hogy Tominak
ne kelljen manuálisan keresgélnie az adatokat — a skill behúzza a releváns információkat
és egy válasz-tervezetet készít.

## IMAP Teljesítmény — Kötelező szűrés

Az INBOX 2000+ emailt tartalmaz. A `list_emails_metadata` hívás szűrők nélkül
**MINDIG TIMEOUTOL** (30 másodperces MCP limit). Ez nem bug — a postafiók mérete
meghaladja azt, amit szűrés nélkül 30 másodperc alatt be lehet járni.

### Szabály: SOHA ne hívd a `list_emails_metadata`-t `since` paraméter nélkül!

**Helyes használat:**
- Napi áttekintés: `since: "YYYY-MM-DDT00:00:00Z"` (aznapi dátum, UTC)
- Utolsó pár nap: `since` = aktuális dátum minus 3-5 nap
- Partner előzmények: `since` = 30 nappal ezelőtt + `from_address` szűrő kombinálva

**Hibás használat (TILOS — TIMEOUT lesz belőle):**
- `list_emails_metadata(account_name="pietscarlet")` — szűrő nélkül
- `list_emails_metadata(account_name="pietscarlet", page_size=5)` — page_size ÖNMAGÁBAN NEM elég, `since` KELL!

### Ajánlott lekérési stratégia
1. Első próbálkozás: `since` = ma 00:00 UTC
2. Ha kevés találat: szélesítsd 3 napra, majd 7 napra
3. Partner előzmények: `since` = 30 nappal ezelőtt + `from_address`
4. Maximum időablak: 30 nap (ennél többet ne kérj egyszerre)

A mai dátumot Bash `date -u +%Y-%m-%dT00:00:00Z` parancsból vedd — soha ne hardkódold.

## Adatforrások és keresési szabályok

A skill négy adatforrásból dolgozik. Minden forrásnak megvan a pontos szerepe — csak ott
keress, ahol az adott típusú információ található.

**1. Email (mcp-email-server, account: "pietscarlet")**
Mire jó: korábbi levelezés az adott partnerrel, előzmények, hangnem.
Mikor használd: mindig, amikor egy konkrét emailre válaszolsz — nézd meg az utolsó 3-5
emailt ugyanattól a feladótól (`list_emails_metadata` + `from_address` szűrő).

**2. Projekt-dokumentumok (ha a PietScarlet mappa be van mountolva)**

A PietScarlet projekt-dokumentumok (Google Drive-ból szinkronizálva) a `/workspace/extra/pietscarlet-drive/`
könyvtárban érhetők el, ha az admin beállította az additionalMounts-ot a csoporthoz.

### A PietScarlet mappa struktúrája

```
/workspace/extra/pietscarlet-drive/
  Ingatlanok/
    Vác, 4091 - Rózsa u. 4./
      Társasház/
      Kivitelezés/
      Szerződések/
        Lakás adásvételik/
      Költségterv/
      Engedélyeztetés/
    Vác, Görgey u. 32./
      társasház/
      Kiviteli terv - közös/
      Engedélyeztetés/
      Szerződések/
      Költségvetési tervezet/
    Vác, Kőhíd utca/
    Vác, Felső Törökhegy/
    Csobánka, Kilátó utca/
    1134., Budapest, Tüzér utca 46./
    ...további projektek
  Szerződések/
  Számlák/
  Partnerek/
  Dokumentumok/
  Bankkivonatok PIETSCARLET KFT./
```

### Projekt-dokumentumok keresése lépésről lépésre

**Előfeltétel:** Ellenőrizd, hogy a `/workspace/extra/pietscarlet-drive/` mappa tartalmaz-e PietScarlet fájlokat.
Ha nem, jelezd Tominak: "A projekt-dokumentumok jelenleg nincsenek becsatolva a munkamenetbe."

**0. lépés — Keresési segédfájlok használata (MINDIG ELŐSZÖR!):**

A drive gyökérben két segédfájl van:
- `PIETSCARLET_INDEX.md` — Teljes mappastruktúra index, gyors navigációhoz
- `PIETSCARLET_CATALOG.md` — 1007 PDF szöveges kivonata, tartalom alapján kereshető

```bash
cat "/workspace/extra/pietscarlet-drive/PIETSCARLET_INDEX.md"
```
Ha a keresett információ konkrét PDF-ben lehet (szerződés, engedély, műszaki leírás stb.), keresd a CATALOG-ban:
```bash
grep -i "<keresett kifejezés>" "/workspace/extra/pietscarlet-drive/PIETSCARLET_CATALOG.md"
```
Ezekből gyakran közvetlenül kiderül, melyik mappában és fájlban van amit keresel — így nem kell rekurzívan végigmenni a mappákon.

**1. lépés — Projekt mappa azonosítása:**

Az email tárgyából/tartalmából azonosítsd a helyszínt (város, utca, helyrajzi szám).
Listázd az Ingatlanok mappát:
```bash
ls "/workspace/extra/pietscarlet-drive/Ingatlanok/" 2>/dev/null || echo "Projekt-dokumentumok nem elérhetők"
```
A projekt-almappák nevében benne van a cím (város + utca). Keresd meg a megfelelőt.

**2. lépés — Projekt mappa tartalmának listázása:**
```bash
ls -R "/workspace/extra/pietscarlet-drive/Ingatlanok/<projekt_mappa_neve>/"
```

**3. lépés — PDF fájlok keresése:**
```bash
find "/workspace/extra/pietscarlet-drive/Ingatlanok/<projekt_mappa_neve>/" -name "*.pdf"
```

**4. lépés — PDF tartalmának olvasása:**

A `Read` tool-lal közvetlenül olvasd a PDF fájlt a teljes elérési útján:
```
Read: file_path = "/workspace/extra/pietscarlet-drive/Ingatlanok/<projekt>/<almappa>/<fájlnév>.pdf"
```

**5. lépés — Ha a fájl nem olvasható:**
- NE mondd azt, hogy "nem találom" — mert megtaláltad, csak olvasni nem tudtad
- Mondd el Tominak pontosan MELYIK fájlokat találtad és MELYIK mappában
- Kérd meg, hogy töltse fel a releváns PDF-et a chatbe

### Fontos keresési elvek

- **Fájlnevekből azonosítsd a releváns dokumentumot:**
  - "Műszaki leírás" -> műszaki kérdésekhez
  - "Alapító okirat" -> lakásszámokhoz, tulajdonosokhoz, társasházi adatokhoz
  - "Kiviteli terv" -> építészeti, gépészeti kérdésekhez
  - "Költségvetés" / "Költségterv" -> árakhoz, tételekhez
  - "Adásvételi szerződés" -> vevők, eladási árak, feltételek
  - "Eljárást indító kérelem" -> engedélyeztetési ügyek
  - "Tulajdonlap" / "TULLAP" -> ingatlan-nyilvántartási adatok

- **Rekurzív keresés:** Mindig használd az `ls -R` vagy `find` parancsot, hogy az
  almappákat is bejárd. A dokumentumok gyakran 2-3 szinttel mélyebben vannak.

- **Ne korlátozd a keresést egy almappára:** Ha nem tudod pontosan melyik almappában
  van a dokumentum, keress az egész projekt-mappán belül.

**3. QUiCK (számlázási rendszer)**
Mire jó: számlák, fizetési státuszok, partner adatok, tartozások.
Mikor használd: CSAK ha az email pénzügyi vonatkozású (számla, fizetés, tartozás,
árajánlat, díjbekérő). Keresd a partnert: `search_invoices` vagy `list_partners`.

**4. Cégadatok**
Mire jó: PietScarlet és leányvállalatok hivatalos adatai (adószám, bankszámla, székhely).
Mikor használd: CSAK ha a válaszban hivatalos cégadatra van szükség (bankszámlaszám,
adószám, székhely, cégjegyzékszám stb.).
Forrás: `/workspace/global/references/cegadatok.md` — olvasd be a `Read` tool-lal.

## Munkafolyamat

### 1. Email áttekintés

Amikor Tomi azt kéri, hogy nézd meg az emailjeit:

1. Kérd le az utolsó 10-15 emailt a `list_emails_metadata` tool-lal
   **FONTOS: Mindig használj `since` paramétert!** Kezdd a mai nappal, ha kevés
   találat jön, szélesítsd 3 napra, majd 7 napra.
2. Csoportosítsd őket:
   - **Válaszra vár**: partnertől jött, kérdést tartalmaz vagy választ igényel
   - **Számla (-> Erika)**: számla értesítő, díjbekérő, fizetési felszólítás
   - **Tájékoztató**: rendelés státusz, hírlevél
   - **Sürgős**: határidős, hatósági
3. Adj egy tömör összefoglalót minden releváns emailről (feladó, tárgy, lényeg)
4. **Proaktív választervezet készítése:**
   Ha egy email egyértelműen válaszra vár (kérdést tartalmaz, megerősítést kér,
   egyeztetést kezdeményez, ajánlatot kér stb.), **egyből készíts választervezetet**
   hozzá. Ne várd meg, hogy Tomi külön kérje — az áttekintésben az adott email
   összefoglalója után rögtön mutasd a javasolt választ is.

   **Így nézzen ki az áttekintés formátuma "Válaszra vár" emailekhez:**
   ```
   [Feladó neve] — [Tárgy]
   [1-2 mondatos összefoglaló: miről szól, mit kér]

   Javasolt válasz:
   [A választervezet teljes szövege, kész küldésre — aláírás blokk jelzéssel]

   -> Ha jó, mondd: "mehet" / Ha módosítanád, jelezd mi legyen máshogy.
   ```

   **Fontos szabályok a proaktív tervezetekhez:**
   - A választervezet készítésekor ugyanúgy gyűjtsd össze a kontextust (korábbi
     levelezés, projekt dokumentumok, cégadatok), mint a "Kontextus-gyűjtés" szekcióban
   - Ha egy adat kell a válaszhoz amit nem találsz, jelezd a tervezetben: "[???]"
   - Számla-emaileknél NEM kell választervezet — ott az Erikának továbbítás a teendő
   - Tájékoztató/hírlevél emaileknél NEM kell választervezet
   - Ha az email túl komplex ahhoz hogy kontextus nélkül jó választ adj (pl. részletes
     műszaki kérdés, árkalkuláció kell), inkább írd le mit kellene még begyűjteni és
     kérdezd meg Tomit mielőtt fogalmazol
   - **Több "válaszra vár" email esetén** mindegyikhez külön tervezetet készíts
   - Tomi válaszolhat egyenként ("az 1-es mehet, a 2-esnél változtasd meg X-et")
     vagy egyszerre ("mind mehet")

### 2. Kontextus-gyűjtés egy adott emailhez

Amikor egy konkrét emailre kell válaszolni, az alábbi sorrendben gyűjtsd össze a kontextust.
Nem kell mindig mindent — csak azt kérd le, ami az adott emailhez releváns.

**a) Email tartalom és előzmények**
- Olvasd be az email teljes tartalmát (`get_emails_content`)
- Keresd meg a korábbi levelezést ugyanazzal a feladóval (max 3-5 korábbi email)

**b) Projekt azonosítás és dokumentum-keresés (ha az email projekthez kapcsolódik)**
- Az email tárgyából/tartalmából azonosítsd a helyszínt (város, utca, helyrajzi szám)
- Kövesd a "Projekt-dokumentumok keresése lépésről lépésre" részt fentebb
- Ha a projekt-dokumentumok nincsenek becsatolva, jelezd Tominak

**c) Partner és pénzügyi adatok (ha pénzügyi vonatkozása van)**
- Keresd meg a QUiCK-ben: `search_invoices` vagy `list_partners`
- Nézd meg van-e nyitott számla vagy tartozás

**d) Cégadatok (ha hivatalos adat kell a válaszba)**
- Bankszámlaszám, adószám, székhely -> `/workspace/global/references/cegadatok.md`

### 3. Számla-továbbítás a pénzügyes felé

Ha az email számlát tartalmaz (bejövő számla, számla értesítő, fizetési felszólítás,
proforma, díjbekérő), azt **tovább kell küldeni Erikának**, a PietScarlet pénzügyesének.

**Elsődleges cím:** penzugy@pietscarlet.hu
**Tartalék cím (ha az elsődleges hibát dob):** erika.szabo.libra@gmail.com

A továbbítás menete:
1. Azonosítsd, hogy az email számlát tartalmaz-e (tárgyból, feladóból, tartalomból)
   - Tipikus jelek: "számla", "invoice", "díjbekérő", "proforma", "fizetési felszólítás",
     "Értesítő: Számla érkezett", szamlazz.hu feladó, PDF csatolmány számla névvel
2. Kérdezd meg Tomit: "Ez számlának tűnik — továbbítsam Erikának (penzugy@pietscarlet.hu)?"
3. Jóváhagyás után küldd tovább a `send_email` tool-lal:
   - Címzett: penzugy@pietscarlet.hu
   - Tárgy: az eredeti tárgy elé "Fwd: " prefix
   - Body: az eredeti email **teljes tartalma** (beleértve a feladót, dátumot, tárgyat),
     felül egy kedves, udvarias megjegyzéssel (pl. "Szia Erika! Továbbítom a beérkezett
     számlát. Köszönöm szépen, szép napot!")
   - **Csatolmányok:** Ha az eredeti emailben volt csatolmány (PDF számla stb.), azt is
     csatold a továbbított emailhez. Használd a `download_attachment` tool-t a csatolmány
     letöltéséhez, majd az `attachments` paramétert a `send_email` hívásban.
   - Ha a küldés hibát dob, próbáld az erika.szabo.libra@gmail.com címre

**FONTOS — Hangnem Erikának írt emailekben:**
Erika a PietScarlet pénzügyese, tapasztalt szakember — pontosan tudja, hogy egy beérkezett
számlával mit kell csinálnia. Ezért:
- **TILOS** utasításokat vagy kéretlen tanácsokat adni (pl. "Kérlek intézd az utalást
  időben!", "Légy szíves könyveld le!", "Ne felejts el fizetni!")
- A továbbítás szövege legyen **kedves, udvarias és barátságos** — Erikával mindig
  nagyon kedvesen és tiszteletteljesen kommunikálj, de NE adj utasításokat
- **Mindig köszönj** az email elején és zárd kedves formulával
- Helyes példák:
  - "Szia Erika! Továbbítom az XY Kft.-től beérkezett számlát. Köszönöm szépen! Szép napot!"
  - "Kedves Erika! Mellékelem a beérkezett számlát az ABC Kft.-től. Nagyon köszönöm a segítséged! Szép napot kívánok!"
  - "Szia Erika! Jött egy újabb számla, továbbítom neked. Köszi szépen, jó munkát!"
- Helytelen példák:
  - "Erika, továbbítom a beérkezett számlát." <- túl száraz, nincs köszönés
  - "Kérlek intézd időben!" <- utasítás, TILOS
  - Bármilyen email köszönés és kedves záró formula nélkül <- TILOS

### 4. Válasz tervezet készítése

A kontextus összegyűjtése után:

1. **Fogalmazz választ** Tomi nevében, az alábbi elvek mentén:
   - Hangnem: üzleti de barátságos, tegező ha a partner is tegez, magázó ha formális
   - Lényegre törő, nem túl hosszú
   - Ha pénzügyi adatot tartalmaz (bankszámlaszám, összeg), mindig ellenőrizd a cégadatokból
   - Aláírás: mindig az alábbi HTML aláírás blokkal zárd le a levelet (lásd "Email aláírás" szekció)

2. **Mutasd meg Tominak** a tervezetet:
   - **Ha az áttekintés során már proaktívan megmutattad a tervezetet** (lásd "1. Email
     áttekintés" szekció, 4. pont), akkor Tomi válaszát ("mehet" / módosítási kérés)
     közvetlenül kezeld — nem kell újra megmutatni.
   - **Ha külön kérte egy emailre a választ**, mutasd meg és várd a jóváhagyást.
   - Mindkét esetben: Tomi mondhatja hogy "mehet" (-> küldés), vagy kérhet módosítást.

3. **Küldés** csak Tomi kifejezett jóváhagyása után a `send_email` tool-lal.
   Mindig használd az `in_reply_to` paramétert a threading megtartásához.
   **Mindig `html: true` paraméterrel küldd**, hogy az aláírás formázása megjelenjen.

### 5. Proaktív email írás

Amikor Tomi új emailt szeretne írni (nem válasz):

1. Kérdezd meg:
   - Kinek szól? (ha nincs megadva)
   - Mi a témája?
   - Van-e specifikus tartalom amit bele kell tenni?
2. Gyűjtsd össze a kontextust (partner, projekt, cégadatok) a fentiek szerint
3. Fogalmazd meg a tervezetet
4. Küldés csak jóváhagyás után

## Fontos szabályok

### Soha ne hallucinálj
Ez a legfontosabb szabály. Egy email válaszban minden adatnak tényszerűnek kell lennie.
- Ha egy adatot nem tudsz visszakeresni a forrásokból (email, helyi fájlok, QUiCK, cégadatok),
  NE találd ki. Inkább kérdezd meg Tomit.
- Ne feltételezz összegeket, dátumokat, neveket, határidőket — mindig ellenőrizd.
- Ha az email válaszban szerepelne egy adat amiről nem vagy 100%-ig biztos, jelezd
  Tominak: "Ezt az adatot nem találtam meg, kérlek erősítsd meg: [...]"
- Inkább adj kevesebb infót egy válaszban, mint hogy kitalálj valamit.

### Email küldés kizárólag jóváhagyással
- **Soha ne küldj emailt Tomi kifejezett jóváhagyása nélkül.** Mindig mutasd meg először
  a teljes tervezetet és várd meg az "igen" / "küldd" / "ok" típusú választ.
- Ez vonatkozik válaszokra, továbbításokra, és új emailekre egyaránt — kivétel nélkül.

### Dokumentum-keresési prioritás
- **Projekt-dokumentumokhoz a /workspace/extra/pietscarlet-drive/ mountolt mappát használd** (`ls`, `find`, `Read`)
- Ha a mappa nincs mountolva, jelezd Tominak

### Egyéb szabályok
- **Korábbi levelezés hangnemét kövesd.** Ha a partner tegeződik, tegezz. Ha magáz, magázz.
- **Pénzügyi adatokat mindig ellenőrizd.** Ne írj bankszámlaszámot vagy adószámot fejből —
  mindig a `/workspace/global/references/cegadatok.md`-ből vagy QUiCK-ből vedd.
- **Kontextust csak akkor gyűjts, ha releváns.** Ha egy egyszerű emailre kell válaszolni
  ami nem projekthez és nem pénzügyekhez kapcsolódik, ne húzz be feleslegesen adatokat.
- **Rekurzív keresés:** Mindig használd az `ls -R` vagy `find` parancsot almappák
  bejárásához. A dokumentumok gyakran 2-3 szinttel mélyebben vannak.

## Email aláírás

**FONTOS:** Az alábbi HTML aláírás KIZÁRÓLAG a `hello@pietscarlet.hu` fiókhoz tartozik
(`email-pietscarlet` MCP-szerver). NE használd a `hello@lupaobolstrand.hu`,
`hello@trinkenessen.eu`, `lloyd@bulltrapp.com`, `dani@rezerver.com` fiókoknál — azoknál
a fiók saját aláírását használd, vagy ha nincs, sima plain text "Üdvözlettel, Petki Tamás" /
"Lloyd" / "Dani" hangon.

### hello@pietscarlet.hu — Petki Tamás / ügyvezető

Az email body-t mindig HTML-ként formázd (`html: true`). A levél utolsó sora UTÁN
**KÖTELEZŐ** üres sor az aláírás fölött — egyszerű `<br><br>` után a body lezárása
nem elég, mert a Spark/Gmail HTML-renderelése össze tudja csukni. A megoldás:
**egy üres `<p>&nbsp;</p>` paragraphus + az aláírás wrapper div `margin-top: 24px;`-szel**.

A teljes block (másold be EXAKTUL, ne improvizálj):

```html
<p>&nbsp;</p>
<div data-spark-custom-html="true" style="margin-top: 24px;">
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width: 100%; max-width: 480px; border-collapse: separate; font-family: Arial, Helvetica, sans-serif;">
        <tbody>
            <tr>
                <td style="padding: 0;">
                    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width: 100%; border-collapse: separate; background-color: #fbf7f3; border: 1px solid #e6ddd6; border-radius: 10px;">
                        <tbody>
                            <tr>
                                <td style="width: 110px; padding: 14px 12px; vertical-align: top; border-right: 1px solid #e6ddd6; background-color: #f7f1eb; border-left: 4px solid #f7982b; border-top-left-radius: 10px; border-bottom-left-radius: 10px;">
                                    <img src="https://pietscarlet.hu/brand/logo.svg" width="82" alt="PietScarlet" style="display: block; width: 82px; max-width: 82px; height: auto; border: 0;">
                                    <div style="margin-top: 10px; font-size: 9px; line-height: 13px; color: #9a8e86; letter-spacing: 0.12em; text-transform: uppercase;">
                                        Fejlesztés<br>
                                        Kivitelezés
                                    </div>
                                </td>
                                <td style="padding: 14px 16px; vertical-align: top;">
                                    <div style="font-size: 19px; line-height: 22px; font-weight: 700; color: #2f2925;">
                                        Petki Tamás
                                    </div>
                                    <div style="margin-top: 4px; font-size: 10px; line-height: 13px; font-weight: 700; color: #f7982b; text-transform: uppercase; letter-spacing: 0.12em;">
                                        ügyvezető
                                    </div>
                                    <div style="margin-top: 7px; font-size: 13px; line-height: 18px; color: #625851; font-weight: 700;">
                                        PietScarlet Kft.
                                    </div>
                                    <div style="margin-top: 8px; font-size: 12px; line-height: 18px; color: #625851;">
                                        <a href="tel:+36708844929" style="color: #2f2925; text-decoration: none; font-weight: 700;">
                                            +36 70 88 44 929
                                        </a>
                                        <span style="color: #c4b8b0;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                                        <a href="mailto:hello@pietscarlet.hu" style="color: #2f2925; text-decoration: none;">
                                            hello@pietscarlet.hu
                                        </a>
                                    </div>
                                    <div style="margin-top: 2px; font-size: 12px; line-height: 18px; color: #625851;">
                                        <a href="https://pietscarlet.hu" style="color: #2f2925; text-decoration: none;">
                                            pietscarlet.hu
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

**Szabályok:**
- A fenti aláírás blokk MINDIG az email body HTML részének a végére kerül **CSAK** a
  `hello@pietscarlet.hu` fiókkal való küldésnél (akár új, akár válasz, akár továbbítás).
- A `<p>&nbsp;</p>` üres paragrafus KÖTELEZŐ — enélkül az aláírás összecsúszik a body
  utolsó mondatával. A wrapper div `margin-top: 24px;` a Spark/Outlook backup.
- A többi fiók (lupaobol/trinkenessen/bulltrapp/rezerver) nem ezt kapja — a saját
  aláírást vagy plain textet használd. Ha bizonytalan vagy, kérdezd vissza Tomit.
- A Tominak mutatott tervezetben elég szövegesen jelezni: *"[aláírás blokk: Petki Tamás / PietScarlet Kft. — kártya formátum]"*,
  de a tényleges `send_email` hívásban a teljes HTML aláírás (a `<p>&nbsp;</p>` előbloklkal együtt) legyen benne.
- Ha a levél szövege plain textnek tűnne, akkor is HTML-ként formázd (a szöveget `<p>` tagekbe tedd) hogy az aláírás renderelődjön.
