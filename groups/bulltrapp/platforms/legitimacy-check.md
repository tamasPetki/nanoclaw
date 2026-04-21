# Legitimacy / Scam Check — KÖTELEZŐ minden új email előtt

Tomi feedback: a BullTrapp brandje sérülhet ha scam, pump-and-dump, vagy fake crypto site-tal kötünk partnerséget. Mielőtt **bármilyen új** target-nek emailt küldesz, futtass egy gyors legitimacy check-et. Ne legyél paranoiás — 5-10 perc maximum, de ne hagyd ki.

## Mikor KELL futtatni

- **Új outreach target** (email_pipeline.json `NOT_CONTACTED` → `CONTACTED`) — MINDEN esetben
- **Új platform regisztráció** (directory, listicle, newsletter, blog) — MINDEN esetben
- **Backlink swap ajánlat** — MINDEN esetben (ők is linkelnek minket, az SEO-ra is hat)

## Mikor KIHAGYHATÓ

- Follow-up egy már `CONTACTED` targetre, aki átment a check-en korábban
- Közismert nagy site (CoinDesk, Decrypt, The Block, Cointelegraph, Bankless) — de még ezeket is checkold ha gyanús a contact form
- Ha a `legitimacy_log` (lentebb) már tartalmazza a domain-t és GREEN/YELLOW

## Workflow — 5 perces check

### 1. Homepage scan (`agent-browser`)

```bash
agent-browser open https://example.com
agent-browser snapshot
```

Mit nézz:
- Van-e látható team / about / contact oldal?
- Van-e impressum / cégadat / fizikai cím?
- Mikor publikálták az utolsó cikket? (Ha 6+ hónapja semmi → halott site, hagyd ki)
- A tartalom valódinak tűnik vagy AI-generated tömeg?

### 2. Domain kor (`whois`)

```bash
whois example.com | grep -iE "creation|created|registered"
```

- **<3 hónap** → 🚩 RED FLAG (új scam site-ok jellemző életciklusa)
- **3-12 hónap** → ⚠ YELLOW (extra check kell)
- **1+ év** → ✓ OK (önmagában nem garancia, de baseline)

### 3. Google scam search

```bash
# WebSearch tool VAGY agent-browser google.com
"sitename.com" scam
"sitename.com" "rug pull" OR "exit scam"
"sitename.com" reddit
"sitename.com" trustpilot
```

Mit keresel:
- Reddit/Trustpilot panaszok
- "X site is a scam" típusú posztok
- Bármilyen exit scam, rug pull, paid-promotion-without-disclosure említés

### 4. Red flag checklist

Pontozd a target-et. **3+ piros zászló = NE küldj emailt.**

| Red flag | Súly |
|----------|------|
| Domain <3 hónap | 🚩🚩 |
| Nincs team / about oldal, vagy fake nevek (stock photo) | 🚩🚩 |
| Csak Telegram/Discord contact, nincs publikus email vagy form | 🚩 |
| "Guaranteed 100x", "10000% APY", "risk-free" jellegű copy | 🚩🚩 |
| Saját token vagy ICO promotion | 🚩 |
| Pump-and-dump signal csoport / "VIP signals" | 🚩🚩 |
| Sponsored content disclosure nélkül mindenhol | 🚩 |
| Reddit/Trustpilot panaszok scam-ről | 🚩🚩🚩 |
| Domain neve közismert brand tipo squatja (binnance.com, coinbas.com) | 🚩🚩🚩 |
| Saját "exchange" vagy "wallet" amit senki más nem ismer | 🚩🚩 |
| Tracker/listicle de minden ajánlott tool affiliate link | 🚩 (még OK, csak figyelmeztetés) |
| AI-generated content tömeg (generic, ismétlődő, no author) | 🚩 |
| Adatvédelmi/impressum oldal hiányzik vagy lorem ipsum | 🚩 |

### 5. Verdict

- **GREEN** (0-1 zászló) → küldd az emailt, logold `legitimacy_log`-ba
- **YELLOW** (2 zászló) → még küldhető, DE Discord-on jelezd Tomi-nak: "Kétséges target, ezért és ezért — kiküldöm hacsak nem szólsz". Várj 30 percet, ha nincs válasz, küldd.
- **RED** (3+ zászló) → NE küldd. Logold `legitimacy_log`-ba SKIPPED státusszal és okkal. Discord-on jelezd Tomi-nak rövid magyarázattal.

## Logging — `legitimacy_log` a state.json-ban

Minden check eredményét logold a `state.json` `legitimacy_log` arrayba, hogy ne kelljen újra futtatni:

```json
"legitimacy_log": [
  {
    "domain": "example.com",
    "checked": "2026-04-15",
    "verdict": "GREEN",
    "flags": [],
    "notes": "Domain 4 év, real team, contact email forrás verifikálva"
  },
  {
    "domain": "shadycrypto.io",
    "checked": "2026-04-15",
    "verdict": "RED",
    "flags": ["domain <3mo", "guaranteed APY copy", "no team page"],
    "notes": "Tomi-nak jeleztem Discord-on"
  }
]
```

Cleanup: 30 napnál régebbi entry-ket törölheted (újra ellenőrzendő).

## Példa workflow

```
1. email_pipeline.json: új target = "cryptotrendzz.com"
2. agent-browser open https://cryptotrendzz.com
3. whois cryptotrendzz.com → "Created: 2026-02-10" (2 hónap → 🚩🚩)
4. WebSearch: "cryptotrendzz.com" scam → reddit thread "this site is a paid promo farm" (🚩🚩🚩)
5. Verdict: RED (5 zászló)
6. state.json legitimacy_log update: SKIPPED
7. Discord: "Lloyd: cryptotrendzz.com kihagyva — 2 hónapos domain, reddit thread paid promo farmnak nevezi. NE rakjuk a pipeline-ba."
8. email_pipeline.json: target status = "BLACKLISTED" (új státusz)
```

## BLACKLISTED státusz

Az `email_pipeline.json` `status` mezőbe vegyél fel egy új értéket: `BLACKLISTED`. Ez a target soha többet nem kerül feldolgozásra. Ok mindig kerüljön a `notes` mezőbe.
