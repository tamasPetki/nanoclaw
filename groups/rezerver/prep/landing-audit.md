# Landing Page E2E Audit — rezerver.com/demo

> Dani venue-tulajdonosként végigjárta a `rezerver.com/demo` flow-t. Audit dátuma: 2026-04-21, esti session.

---

## Összefoglaló

**Általános benyomás:** Meglepően erős demo — nulla súrlódásos belépés, dual view (guest + owner), élethű adatok. A technika rendben. **A fő probléma az üzenetküldés:** a legfontosabb konverziós hook (3 hónapig ingyen béta, első 30 helyszín) sehol nem szerepel a landing page-en.

---

## Session 1 — First impression (venue-tulajdonos szemmel)

**Dátum:** 2026-04-21
**URL:** https://www.rezerver.com/demo

**Első 5 másodperc:**
- Headline: „Interactive Demo" / „Interaktív demo"
- Alcím: *"Choose a demo venue and see how Rezerver helps bring in more bookings — no registration required."*
- Értékajánlat azonnal látható: több foglalás, regisztráció nélkül próbálható
- 3 demo helyszín kártya (Duna Terasz, Kert22, Palazzo Étterem) + Guest View / Owner View gombok

**Első 30 másodperc:**
- Érthető mit csinál a termék ✅
- Guest View = vendor landing page amit a vendég lát → valós booking flow-t lehet végigjárni
- Owner View = dashboard (foglalások, analytics, venue-kezelés) → ez nyomja meg a B2B konverziót

**Melyik CTA-ra kattintanék természetesen:** „Explore venue →" (Duna Terasz kártyán), majd átmentem a Guest View-ra. Második próba: Owner View → dashboard.

---

## Session 2 — Demo flow végigjárás

### Guest View (amit a vendég lát a helyszín publikus oldalán)

- **Booking form:** 5 lépéses, jól strukturált (Space → Dátum → Vendégszám → Csomag → Extras)
- **Real-time árazás:** ✅ MŰKÖDIK — Space kiválasztás után azonnal frissül az összeg
- **Árak (Duna Terasz):**
  - Nagyterem: 8.000 Ft/fő (50–200 fő)
  - VIP szoba: 150.000 Ft (fix, 10–30 fő)
  - Kert: 6.000 Ft/fő (30–120 fő)
  - Korai foglalás: -10%, hétvégi felár: +20%
- **Csomagok:** Prémium vacsora 15.000/fő, Koktél 8.000/fő, Alap ital 5.000/fő
- **Extras:** DJ+hang 80.000, Virágdekor 120.000, Fotófal 45.000, Projektor 35.000
- **Reviews:** 4.6★, 5 HU értékelés, teli névvel + event típussal → erős social proof
- **FAQ:** 4 kérdés HU-ban → jó, de csak a page alján
- **Mobil:** responsive layout, megjelenik mobilon ✅
- **Nyelv:** vegyes HU/EN — a page-copy HU, a form labelek és CTA-k részben EN

### Owner View (dashboard)

- **Sidebar navigáció:** 13 almenü — Spaces, Packages, Addons, Pricing Rules, Reviews, Gallery, Settings, Team, Documents, My Events
- **Fő metrikák:** Today's Bookings, Pending Approval, Monthly Revenue (450K Ft, +12.5%), Conversion Rate (68%)
- **Recent activity:** New Booking, Payment Received, Booking Approved, Booking Cancelled — élethű timeline
- **Settings:** 12 konfigurációs szekció — ez megmutatja, mennyire részletes a beállítási rendszer

---

## Session 3 — Signup flow

**Sign Up gomb:** jobb felső sarokban, sticky → mindig látható ✅

**Modal form:**
- Name, Email, Password, Confirm Password — full account registration (NEM waitlist)
- „Continue with Google" gomb (OAuth) ✅
- Tagline a formban: *"More bookings, less back-and-forth"*
- Subheadline: *"Guests book faster, you make more from your venue, and you can get started with no upfront cost."*
- Features: Simple online payments, Instant pricing, Hungarian & English support

---

## SEO / indexálhatóság

| Mező | Tartalom |
|---|---|
| Title tag | „Rezerver — Rendezvényhelyszín foglalás online" |
| Meta description | „Fedezd fel és foglald le a tökéletes rendezvényhelyszínt! Valós idejű elérhetőség, csomagok, online fizetés. Budapest és egész Magyarország." |
| OG image | Nem ellenőrzött (Tomi ellenőrzi) |
| URL struktúra | `/demo` — nincs `/hu` lokalizáció |
| Language | HU-primary, EN-secondary |

---

## Súrlódás-lista — prioritizálva

### 🚨 Blocking (launch előtt javítandó)

1. **„3 hónapig ingyen béta" ajánlat SEHOL nincs a landing page-en.**
   A coldemailes legfőbb hook — *"első 30 helyszín, 3 hónap ingyen"* — sem a demo page-en, sem a sign up formban nem szerepel. Ha egy venue-tulajdonos átkattint a cold emailből, nem látja az ajánlatot amit az emailben olvasott. Ez konverzió-gyilkos.
   → **Fix:** Hero section-be badge/callout: *„Béta: az első 30 helyszín 3 hónapig ingyen"* + sign up formban is.

2. **Signup form = teljes account regisztráció, nem waitlist.**
   Jelszó megadás azonnal kellemetlen, ha valaki csak érdeklődik. A „no upfront cost" szlogen ott van, de a 4 mezős form mást sugall.
   → **Fix opció A:** Email-only first step, a jelszót csak email-megerősítés után kéri. **Fix opció B:** Waitlist flow (csak email + venue neve) ami előre regisztrál, onboarding mailból jön a jelszóbeállítás.

3. **„Owner View" CTA nem elég hangos a B2B venue-tulajdonosnak.**
   A demo page-re érkezve az első szem az „Explore venue →" (vendég perspective). Egy venue-tulajdonosnak az Owner View a fontos, de az kicsi szöveges link. Ha az outreach email venue-tulajdonosoknak szól, az első kattintásnak az Owner View-ba kellene vinnie.
   → **Fix:** Hero-ban két CTA gomb egyenlő méretben: *„Megnézem vendor szemmel"* + *„Megnézem vendég szemmel"*

### ⚠️ High (érdemes javítani)

4. **Scarcity/urgency nincs sehol.**
   „Első 30 helyszín" kontigentálás = natural scarcity, de nincs kihasználva. Pl. *„Még 22 szabad béta hely"* badge növelné az urgency-t.

5. **Nincs videó.**
   A vendor landing page-en egy 90 másodperces screen-record sokat segítene — az email follow-upban is lehet linkelni. Interaktív demo jó, de videó share-elhetőbb.

6. **Árazás nem látható az első képernyőn.**
   A Rezerver USP-je a real-time árazás — de ezt csak az interaktív booking form-ban látja a user. Egy „Így néz ki a vendég számára" screenshot/GIF a hero-ban megmutatná az értéket regisztráció nélkül is.

7. **A sign up form angolul van, a demo page részben HU.**
   Inkonsisztens. Ha HU-piacnak szól, a sign up form legyen HU-ban.

8. **Trust signal hiánya.**
   Nincs *„Mit mondanak a béta partnerek?"* szekció (mert még nincs partner). Ez elfogadható béta fázisban — de ha lesz az első 1-2 onboarded venue, azonnali prioritás.

### 💡 Low (nice-to-have)

9. Countdown timer vagy „X hely maradt" badge
10. Company credential / Über Tomi-ról 1-2 sor (alapítói hitelesség)
11. Stripe/PCI badge a sign up form közelében (fizetési biztonság)
12. FAQ prominánsabb helyen (jelenleg csak a guest booking page alján)

---

## Mobil vs desktop

- Responsive layout ✅
- Venue kártyák mobilon vertikálisan stack-elnek ✅
- Sidebar navigation Owner View-ban: mobile-toggle szükséges, alapon rejtve — valószínűleg implementált, de Tomi ellenőrizze

---

## Nyitott kérdések Tomi-nak

- [ ] **KRITIKUS:** Mikor kerül fel a „3 hónapig ingyen béta" szöveg a landing page-re? Ez a cold email első touch-point és a landing page-en nem köszön vissza.
- [ ] Waitlist flow vs. full signup — melyik irányba megyünk? Waitlist alacsonyabb barrier, full signup azonnal aktiválható account.
- [ ] Van-e OG image social preview-ra?
- [ ] Beta signup form hová postázza a lead-et (Airtable, Notion, email)?
- [ ] Van-e analytics (Posthog, Plausible, GA) — fontos a bounce rate és conversion funnel méréshez?
- [ ] A Sentry `venue-addons` captureError (2026-04-20, development env) — ez prod-ban is előjöhet? Megoldva?
