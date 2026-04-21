# Browser — Directory Submissions, X reply, Új Platformok

## ⚠ KÖTELEZŐ szabály

| Use case | Eszköz | Indok |
|----------|--------|-------|
| Normál böngészés (kutatás, olvasás, YouTube, HN feed, scrape) | `agent-browser` | Gyors, light-weight |
| **Cloudflare-védett site, directory submission, regisztráció, X reply web UI-n** | **`stealth-browse` (KÖTELEZŐ)** | Headed Chrome Xvfb-en, WindMouse, log-normal typing, Linux JA4. NE használd `agent-browser`-t — bukni fog. |
| **X reply / web UI poszt** | **`x-reply.sh` helper** (KÖTELEZŐ) | Lásd `platforms/x.md` |

**A `stealth-browse` 2026-04-09-én frissült: headed Chrome Xvfb-en + WindMouse mouse mozgás + log-normal billentyűzet-dinamika + Linux Chrome 124 persona. Kötelező ezen keresztül menni minden olyan helyzetnél ahol bot-detekció van.**

## stealth-browse — Headed Chrome (Xvfb)

```bash
source /workspace/group/.secrets   # Proxy + cookies betöltése
stealth-browse open https://example.com     # Megvárja a CF challenge-et + 1.8-4.5s "olvasás"
stealth-browse snapshot                      # Interaktív elemek @ref-ekkel ÉS data-testid-vel
stealth-browse fill @e1 "text"              # WindMouse click + log-normal typing
stealth-browse click @e3                    # WindMouse + real mouse press/release
stealth-browse hover @e3                    # Hover only (no click)
stealth-browse cookies x.com KEY=VAL [KEY=VAL ...]   # Inject cookies (X auth)
stealth-browse close                        # Bezárás (MINDIG zárd be — Chrome+Xvfb leáll)
```

**Kötelező használati szabályok:**
1. **Selectorként mindig `data-testid`-t használj** ha a snapshotban van — nyelv-független. A @krip_tom account magyar, tehát az `aria=` és visible text mezők magyarul vannak. Példa: `[data-testid="reply"]` mindig megy, az `@e15` aria="Válasz" csak magyarul.
2. **NE használj `agent-browser`-t** olyan helyen ahol bot detektálás van (X, IndieHackers, Bluesky web, ProductHunt, regisztrációk). A `stealth-browse` az egyetlen amin átmegy.
3. **Mindig `stealth-browse close`** a végén — különben az Xvfb és Chrome lifelongan futnak a containerben.

A residential proxy automatikusan betöltődik `REDDIT_PROXY`-ból. Anti-detection: WindMouse path, log-normal typing keystroke dynamics, Linux x86_64 persona, Linux Mesa WebGL, canvas/audio LSB noise, hardwareConcurrency=8, deviceMemory=8, connection=4g, mediaDevices stub, Battery API DELETED (Chrome 124+ removed it), Function.toString proxy.

## agent-browser — normál browsing

```bash
agent-browser open https://example.com
agent-browser snapshot -i
# ... fill form fields, submit
```

## Directory submission szövegek

### Minden directory-hoz
- **Name:** BullTrapp
- **URL:** https://bulltrapp.com
- **Tagline:** Track crypto, stocks, and Polymarket positions in one dashboard
- **Description (short):** Multi-asset portfolio tracker for crypto exchanges, wallets, stocks, and Polymarket prediction markets. 14+ exchange integrations, 15 blockchain chains, AI-powered insights. Free beta.
- **Category:** Finance / Crypto / Portfolio Management

### Directory-specifikus

| Directory | URL | Eszköz | Megjegyzés |
|-----------|-----|--------|-----------|
| PitchWall (volt BetaPage) | pitchwall.co | `stealth-browse` + proxy | ✅ Cloudflare átjön |
| SideProjectors | sideprojectors.com | `stealth-browse` + proxy | ✅ Cloudflare átjön |
| Launching Next | launchingnext.com/submit | `stealth-browse` + proxy | ✅ Email confirmation kell |
| Uneed.best | uneed.best | `stealth-browse` + proxy | ✅ Cloudflare átjön |
| There's An AI For That | theresanaiforthat.com/submit | `stealth-browse` + proxy | ✅ AI angle hangsúlyos |
| Product Hunt | producthunt.com | ❌ MANUÁLIS | Turnstile challenge, headless nem megy — Tomi kell |

## Új Platformok — Regisztráció és Posztolás

### IndieHackers
Regisztrálj és posztolj product launch-ot. Használd `stealth-browse`-t proxy-val.
```bash
source /workspace/group/.secrets
stealth-browse open https://www.indiehackers.com
stealth-browse snapshot
# Regisztráció, profil kitöltés, product launch poszt
```
Poszt témák: "I built a portfolio tracker that integrates Polymarket" / milestone update

### dev.to
Technikai cikkeket lehet írni — jó SEO, crypto/fintech közönség.
```bash
source /workspace/group/.secrets
stealth-browse open https://dev.to
stealth-browse snapshot
# Regisztráció, profil kitöltés, cikk írás
```
Cikk ötletek: "How I integrated Polymarket API into a portfolio tracker" / "Building a multi-exchange crypto dashboard"

### Hacker News — Show HN
EZ A LEGNAGYOBB IMPACT CSATORNA — egy jó Show HN 100+ user-t hozhat.
**Előkészítés:**
- Title: "Show HN: BullTrapp – Portfolio tracker with Polymarket prediction market integration"
- Rövid description kommentben (a HN formátum rövid)
- Időzítés: kedd vagy szerda 9-11 AM EST (legtöbb engagement)
- FONTOS: csak egyszer lehet posztolni, szóval tökéletesnek kell lennie
```bash
agent-browser open https://news.ycombinator.com/submit
```

### Product Hunt — Upcoming Page
Upcoming page listázás, később launch.
```bash
agent-browser open https://www.producthunt.com
```

### YouTube kommentek
Crypto portfolio tracker review videók alá kommentelés.
```bash
agent-browser open "https://www.youtube.com/results?search_query=best+crypto+portfolio+tracker+2026"
```
