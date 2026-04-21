# Legitimacy / Scam Check — HU-adaptált

> **Cél:** ne lőjünk spam-emailt kihalt / fiktív / bizniszben-nem-aktív "targetekre". HU piacon ezt könnyebb ellenőrizni (cégjegyzék, NAV, opten) mint nemzetközin.

## Mikor KELL futtatni

- **Új venue outreach target** (`venue_pipeline.json` `NOT_CONTACTED` → `CONTACTED`) — MINDEN esetben
- **Új media / kiadvány target** (`media_pipeline.json`) — MINDEN esetben
- **Új platform regisztráció** (directory, portál, aggregátor) — MINDEN esetben
- **Partnerség-ajánlat** (backlink-swap, integráció) — MINDEN esetben

## Mikor KIHAGYHATÓ

- Follow-up egy már `CONTACTED`-re, aki átment a check-en
- Közismert nagy kiadvány (HVG, Forbes HU, Portfolio, Telex, G7) — de ha gyanús a contact form, azért checkold
- Ha `legitimacy_log` már tartalmazza a domain-t ÉS GREEN/YELLOW ÉS <30 nap

## Workflow — 5-10 perces check

### 1. Homepage scan (`agent-browser`)

```bash
agent-browser open https://example.hu
agent-browser snapshot
```

Nézd:
- Van-e látható **impressum / adatvédelmi nyilatkozat / cégadat / fizikai cím**? (EU / HU kötelezettség — ha hiányzik, RED flag)
- Van-e **nyitvatartási idő / menü / foglalási info** (venue esetén)? Ha nincs, valószínű halott site.
- Mikor publikálták az utolsó hírt / eseményt? Ha 6+ hónapja semmi → halott
- A tartalom valódi (saját fotók, konkrét dátumok) vagy AI-generated / stock?

### 2. Cégjegyzék — e-cegjegyzek.hu

```bash
# Ha tudod a cég nevét vagy adószámát:
agent-browser open "https://www.e-cegjegyzek.hu/?cegnevkereses"
# VAGY direkt WebSearch: "<cégnév>" cegjegyzek
```

Nézd:
- **Van-e** bejegyzett cég (Kft., Bt., egyéni vállalkozó)?
- **Kényszertörlés alatt / felszámolás alatt?** → 🚩🚩 YELLOW minimum
- **Utolsó változás kora** — ha évek óta semmi mozgás, rossz jel
- **Cégnév + weboldal név egyezik?** — ha a venue "Kiosk Budapest" de a cég "XY Üzemeltető Kft." és nincs kapcsolat, gyanús

### 3. Opten / Céginfo gyors check

```
WebSearch: "<cégnév>" opten.hu
WebSearch: "<cégnév>" kenyszerjog
WebSearch: "<cégnév>" felszamolas
```

- **Kényszertörlés hírek** → 🚩🚩🚩 NE küldj
- **Negatív sajtó** (csalás, panasz, bírósági pereskedés) → 🚩🚩

### 4. NAV adószám-ellenőrzés (ha weboldalon szerepel adószám)

```
WebSearch: "adószám ellenőrzés NAV <adószám>"
# VAGY kézzel: https://nav.gov.hu/adoszam
```

- **"Nem regisztrált" / törölt adószám** → 🚩🚩🚩 NE küldj

### 5. Google reputation search

```
WebSearch: "<cégnév>" átverés
WebSearch: "<cégnév>" csalás
WebSearch: "<cégnév>" panaszom
WebSearch: "<cégnév>" reviews vagy ellenmegjegyzés
```

Nézd:
- Reddit HU (r/hungary, r/budapest), Panaszkönyv.hu, Vélemény fórumok
- Google Maps reviews (átlag + 1-2 csillagos kommentek)
- Facebook page reviews
- Érintett ügyfelektől származó negatív visszajelzés?

### 6. Red flag checklist

Pontozd a target-et. **3+ piros zászló = NE küldj emailt (BLACKLISTED).**

| Red flag | Súly |
|----------|------|
| Nincs impressum / adatvédelmi / cégadat az oldalon | 🚩🚩 |
| Weboldal >6 hónapja nem frissült | 🚩 |
| Cégjegyzékben kényszertörlés / felszámolás | 🚩🚩🚩 |
| NAV adószám törölt / "nem regisztrált" | 🚩🚩🚩 |
| Google Maps review < 3.0 ÉS > 20 review (konzisztens rossz) | 🚩🚩 |
| Reddit / panaszfórum panasz csalásra, átverésre | 🚩🚩🚩 |
| Fiktív cégnév (random karakterek, személynévre épül de nem található) | 🚩🚩 |
| Csak Messenger / WhatsApp contact, nincs publikus email vagy cím | 🚩 |
| Domain <3 hónap (whois) | 🚩🚩 |
| Lorem ipsum / placeholder a "Rólunk" oldalon | 🚩🚩 |
| AI-generated tartalom-tömeg (generic, copy-paste) | 🚩 |
| Bárhol "garanciált 100k/nap", "biztos üzletvel" jellegű ígéret | 🚩🚩 |
| Domain tipo-squat (eksuvo.hu vs esküvő.hu) | 🚩🚩 |

### 7. Verdict

- **GREEN** (0-1 zászló) → küldd az emailt, logold `legitimacy_log`-ba
- **YELLOW** (2 zászló) → még küldhető, DE Discord-on jelezd: "Kétséges target [cégnév], okok: [X, Y]. Kiküldöm ha 30 percen belül nincs vétó." Várj, ha nincs válasz, küldd.
- **RED** (3+ zászló) → NE küldd. `BLACKLISTED` státusz + `notes` az okkal. Discord-on jelezd.

## Logging — `legitimacy_log` a state.json-ban

```json
"legitimacy_log": [
  {
    "domain": "kiosk-budapest.hu",
    "company": "Kiosk Kft.",
    "adoszam": "12345678-2-42",
    "checked": "2026-04-18",
    "verdict": "GREEN",
    "flags": [],
    "notes": "Cégjegyzékben aktív, weboldal friss, Google Maps 4.2 csillag"
  },
  {
    "domain": "fantaziaRendezveny.hu",
    "company": "Fantazia XY Kft.",
    "adoszam": "???",
    "checked": "2026-04-18",
    "verdict": "RED",
    "flags": ["kenyszertorles_alatt", "nav_adoszam_torolt", "google_review_2.1"],
    "notes": "Discord-on jeleztem Tominak, NE kerüljön a pipeline-ba"
  }
]
```

Cleanup: 30 napnál régebbi entry-ket törölhetsz (újra ellenőrizhető).

## Példa workflow — cold email target vetting

```
1. venue_pipeline.json: új target = "fantaziarendezveny.hu"
2. agent-browser open https://fantaziarendezveny.hu → snapshot
   → Nincs impressum, nincs adatvédelmi, utolsó "hír" 2024-ből 🚩🚩
3. WebSearch: "Fantazia Rendezvény Kft" cegjegyzek → kényszertörlés 2025-ben 🚩🚩🚩
4. Verdict: RED (5 zászló)
5. state.json legitimacy_log update: RED + flags
6. Discord: "Fantazia Rendezvény kihagyva — kényszertörlés + halott site."
7. venue_pipeline.json status = "BLACKLISTED", notes = ok
```

## BLACKLISTED státusz

A `venue_pipeline.json` / `media_pipeline.json` `status` mezőben használható. BLACKLISTED targetek **soha többet** nem kerülnek feldolgozásra, az ok mindig a `notes` mezőben.
