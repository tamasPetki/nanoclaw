# Email — HU HoReCa + Startup sajtó pitch

> **🛑 DORMANT — CSENDES FÁZIS (2026-04-18-tól).** Jelenleg NEM küldünk sajtó-pitch-et. Ez a fájl referencia a majdani aktiváláshoz. Csendes fázisban a feladat: **pipeline-bővítés** — szerkesztő nevek, releváns cikkek (utolsó 90 nap), SimilarWeb traffic-becslés gyűjtése `media_pipeline.json`-ba. Éles pitch email DRAFTOT se készíts kivéve ha Tomi explicit kéri.

Minél kevesebb szöveg, minél világosabb pitch → sokkal jobb reply rate a HU sajtónál mint a nemzetközi (kisebb inbox, kevesebb zaj). Ezt majd hasznosítjuk aktiváláskor.

## ⚠ KÖTELEZŐ: Legitimacy check minden új media target előtt

Bár szinte biztos nem scam, de eltérő típusú ellenőrzés kell:
- **ÉL-E még** a kiadvány? (frissítettek-e cikket az elmúlt 3 hónapban)
- **Van-e impressum** + felelős szerkesztő?
- **Hány olvasót várunk?** (SimilarWeb, Semrush traffic estimate) → alacsony-trafikú halott site ≠ érdemes pitch-elni

Log a `state.json` `legitimacy_log`-ba mindegyikre.

## Target kiadvány-lista (kezdőlista)

### HU HoReCa szakmai sajtó

| Kiadvány | URL | Olvasótípus | Angle |
|----------|-----|-------------|-------|
| Trademagazin | trademagazin.hu | HoReCa döntéshozók | Startup-intro, digitalizáció |
| Vendeglatas.hu | vendeglatas.hu | Étteremvezetők | Foglalási-automatizálás story |
| Menumagazin | menumagazin.hu | Étterem-séfek, tulajdonosok | Rendezvény-kapacitás értékesítés |
| Dining Guide | diningguide.hu | Gasztro-kritikusok, foodie-k | Vendégélmény-fókusz |
| HVG Turizmus | hvg.hu/turizmus | Hotel + vendéglátás | Hibrid piac lemma |

### HU startup / tech sajtó

| Kiadvány | URL | Angle |
|----------|-----|-------|
| Transindex Startupdate | startupdate.hu | HU startup scene |
| Startup Safari | startupsafari.hu | Pre-seed / seed startupok |
| Forbes HU — startup rovat | forbes.hu | Business-oriented |
| G7.hu | g7.hu | Gazdasági elemzés, HoReCa + tech |
| Telex — tech rovat | telex.hu | Modern HU tech |
| 24.hu — tech/gazdaság | 24.hu | Szélesebb közönség |

### HU üzleti / SMB sajtó

| Kiadvány | URL | Angle |
|----------|-----|-------|
| Világgazdaság | vg.hu | B2B SaaS story |
| Portfolio | portfolio.hu | Fintech / payment angle (1% Stripe) |
| Piac & Profit | piacesprofit.hu | SMB digitalizáció |

## Pitch angle-ök (választanod kell 1-et target-függően)

| Angle | Mikor használd | Lead mondat |
|-------|----------------|-------------|
| **Startup-intro** | Startup sajtó, Forbes, Transindex | "Új magyar SaaS — foglalási rendszer vendéglátóknak, 1% tranzakciós fee-vel." |
| **Digitalizáció-trend** | Trademagazin, HVG Turizmus | "A HU vendéglátás 80%-a manuálisan foglal. Erre építünk megoldást." |
| **Foglalási-automatizálás story** | Vendeglatas, Menumagazin | "Egy 30 fős szülinapra 4 emailt kell váltani egy étteremmel. Miért?" |
| **Fintech/payment** | Portfolio, VG | "Stripe-on keresztüli azonnali foglalási előleg a HU HoReCa-ban — mitől működik." |

## Pitch struktúra (max 150 szó)

1. **Subject:** "Új HU SaaS a vendéglátóknak — lenne téma a [kiadvány]-nak?" / "Rezerver — digitalizálja a HU rendezvény-foglalást" (NE legyen túl salesy)
2. **Nyitás:** Konkrét szám / tény a HoReCa iparról (ami a cikkírót érdekelheti)
3. **Mini-backstory:** "Dani vagyok, a Rezerver growth kollégája. Tomi (az alapító) 3 hónapja építi..."
4. **USP 1 mondatban:** 1% fee, real-time foglalás, HU-lokalizált
5. **Ajánlat cikkíróra szabva:**
   - Exkluzív adat (HU HoReCa statisztikák, benchmark)
   - Személyes interjú (email-ben, NE telefon)
   - Képanyag (screenshot, folyamat-diagramok)
   - Embargóig tartott launch-info
6. **CTA:** "Ha érdekel, küldök egy rövid press kitet" (NEM "hívjuk meg egy kávéra")
7. **Szignatúra + GDPR opt-out**

## Példa pitch-email (Trademagazin-nak)

```
Subject: Új HU SaaS rendezvény-foglaláshoz — lenne témája?

Szia Attila,

Trademagazin-on olvastam legutóbb a [konkrét cikk címe] riportot a HU HoReCa
digitalizációjáról. Rezerver néven most építünk egy foglalási rendszert
pontosan erre a problémára.

Dani vagyok, a Rezerver-nél a growth kolléga. Tomi (Petki Tamás) az alapító,
3 hónapja fejleszti. A vendég valós időben látja az árakat, le tudja
foglalni a helyszínt, és online előleget is tud fizetni. A helyszínek 1%
Stripe tranzakciós fee-t fizetnek, ennyi.

Béta fázisban tartunk, az első 30 helyszín 3 hónapig fizetés-mentes.
Ha érdekel a téma, szívesen küldök:
- HU HoReCa benchmark adatokat (hány helyszín használ foglalási rendszert,
  átlag reakcióidő ajánlatra stb.)
- Screenshotokat a rendszerről
- Tomi (alapító) interjú-anyagát email-ben

Nincs nálunk PR szolgáltató, ez közvetlen megkeresés.

Üdv,
Dani
Rezerver · growth
dani@rezerver.com

Ha nem akarsz több ilyen levelet, válaszolj vissza hogy "kivenni" és törllek a listáról.
```

## Follow-up szabály

- **7 nap no-reply** → 1 follow-up (még rövidebb, 3-4 mondat max)
- **14 nap no-reply** → DECLINED státusz, NE küldj többet
- **"Sajnos nem fér be most"** → köszönés + pipeline-ba `FUTURE_RETRY` 3 hónap múlva
- **Pozitív reply** → azonnali gyors reakció, amit kértek (adatok / screenshot) 24 órán belül

## Mennyiség

Max 2 media email / nap → **heti 10-12 pitch**. HU sajtó kicsi, gyorsan elfogy a target, utána vár follow-up + új forrás. Ne spammelj.
