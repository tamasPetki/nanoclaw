# Browser — Directory submissions, FB/LinkedIn, új platformok

## ⚠ KÖTELEZŐ szabály

| Use case | Eszköz | Indok |
|----------|--------|-------|
| Normál böngészés (olvasás, research, scrape, Google Maps) | `agent-browser` | Gyors, light-weight |
| **FB groups böngészés, kommentelés** | **`stealth-browse` (KÖTELEZŐ)** + sticky HU residential proxy | Headed Chrome Xvfb, WindMouse, log-normal typing, Linux Chrome persona. FB-n headless = azonnal checkpoint. |
| **LinkedIn login, connect, poszt, komment** | **`stealth-browse` (KÖTELEZŐ)** (ha nem Zapier-en keresztül) | LinkedIn is aggresszív bot-detektációval dolgozik |
| **Regisztráció új platformra** (HoReCa directory, newsletter, blog admin) | **`stealth-browse` + proxy** | Cloudflare / Turnstile / reCAPTCHA gyakran aktív |

## stealth-browse — Headed Chrome (Xvfb)

```bash
source /workspace/group/.secrets   # Proxy + cookies betöltése
stealth-browse open https://example.com   # CF challenge + 1.8-4.5s "olvasás"
stealth-browse snapshot                    # Interaktív elemek @ref-ekkel ÉS data-testid-vel
stealth-browse fill @e1 "text"            # WindMouse click + log-normal typing
stealth-browse click @e3                  # WindMouse + real mouse press/release
stealth-browse hover @e3
stealth-browse cookies facebook.com c_user=VAL xs=VAL datr=VAL   # Cookie inject
stealth-browse close                      # MINDIG zárd be — Chrome+Xvfb leáll
```

**Kötelező használati szabályok:**
1. **Selectorként `data-testid` ha a snapshot-ban van** — nyelv-független. A HU UI-kon az `aria=` magyarul, ne arra építs.
2. **NE használj `agent-browser`-t** FB, LinkedIn, ProductHunt, Turnstile-es site-ok ellen.
3. **Mindig `stealth-browse close`** a végén.

Residential proxy automatikusan: `FB_PROXY` vagy `REZERVER_PROXY` a `.secrets`-ből (különböző célokra különböző IP-k ajánlottak, ne osztozzon FB és LinkedIn ugyanazon IP-n).

## agent-browser — normál browsing

```bash
agent-browser open https://example.com
agent-browser snapshot -i
```

Használd Google Maps scrape, venue weboldalak olvasása, TripAdvisor böngészés, Wedding.hu szállítói címtár, LinkedIn puszta olvasás (nem-logged-in) esetén.

## Rezerver Directory Submission Templates

### Minden HU HoReCa directory-hoz

- **Név:** Rezerver
- **URL:** rezerver.com
- **Tagline HU:** Online foglalás és fizetés rendezvényhelyszíneknek
- **Description HU (rövid):** Foglalási rendszer éttermeknek, bároknak, rendezvényhelyszíneknek. A vendég online látja az árakat és azonnal foglalhat. 1% tranzakciós fee. Béta fázis.
- **Description HU (hosszú):** "A Rezerver egy HU-lokalizált foglalási SaaS: a helyszín beállítja az árakat, csomagokat, férőhelyeket, a vendég pedig maga tud online foglalni és előleget fizetni. Nincs email ping-pong, nincs ajánlatkészítési időveszteség. 1% Stripe tranzakciós fee, béta fázis, első 30 helyszín 3 hónapig fizetés-mentes."
- **Kategória:** Vendéglátás / SaaS / Foglalás / HoReCa Tech
- **Alapító:** Petki Tamás
- **Email:** dani@rezerver.com
- **Ország:** Magyarország

### HU HoReCa directory-k (kipróbálandó lista)

| Directory | URL | Megjegyzés |
|-----------|-----|-----------|
| HoReCa.hu | horeca.hu | Szakmai katalógus |
| Éttermek.hu | ettermek.hu | Éttermi portál |
| Wedding.hu szállítói | wedding.hu/szallitok | Esküvő-fókusz |
| Rendezvenyhely.hu | rendezvenyhely.hu | Rendezvényhelyszínek |
| Jofogas — szolgáltatás | jofogas.hu | Apróhirdetés szint |
| OLX — szolgáltatás | olx.hu | Apróhirdetés szint |

### Nemzetközi startup directory-k (kis prioritás)

| Directory | URL | Eszköz |
|-----------|-----|--------|
| Product Hunt | producthunt.com | ❌ Turnstile — MANUÁLIS Tomi |
| BetaList | betalist.com | agent-browser OK |
| Launching Next | launchingnext.com/submit | stealth-browse + proxy |
| Uneed.best | uneed.best | ❌ Turnstile — MANUÁLIS |
| Saas Hub | saashub.com | agent-browser OK |

## Új HU platformok — regisztráció és posztolás

### Éttermek.hu / HoReCa.hu venue-lista

Ha létezik felhasználói regisztráció + "szolgáltatást ajánlok" funkció, regisztrálj be és tedd fel a Rezerver-t mint szolgáltatót.

```bash
source /workspace/group/.secrets
stealth-browse open https://horeca.hu
stealth-browse snapshot
# Regisztráció dani@rezerver.com-mal
# Profil kitöltés + szolgáltatás-hirdetés
```

### Wedding.hu szállítói regisztráció

Különlegesen értékes — itt wedding planner + rendezvényhelyszín tulajdonos is keres.

```bash
stealth-browse open https://wedding.hu/szallitok/regisztracio
```

Kategória: "Helyszín-foglalási rendszer" / "Technológia / szoftver"

## Új platform felfedezés

Ha új HU HoReCa / rendezvény / event platformot találsz:

1. **Legitimacy check** (cégjegyzék + weboldal frissessége + tagság-aktivitás)
2. **Regisztráció ajánlata értékeléshez:** van-e tényleges reach (forgalom, aktív userek) vagy csak "cégnévjegyzék"?
3. **Profil feltöltés** — céges adatok, Rezerver mint "szolgáltató" / "partner" / "eszköz"
4. **Tomi-ping Discord-on:** "Új platformot regisztráltam: [név] — [előny], [hátrány]. Következő lépés: [X]"
5. **`strategy.md` Exploration log update**

## Cookies / session persistence

FB session:
```
FB_C_USER=<c_user cookie>
FB_XS=<xs cookie>
FB_DATR=<datr cookie>
FB_SESSION_JSON=<base64-encoded localStorage dump (optional, javít session-élettartamon)>
```

LinkedIn session (ha option B active):
```
LINKEDIN_LI_AT=<li_at cookie>
LINKEDIN_JSESSIONID=<JSESSIONID cookie>
LINKEDIN_SESSION_JSON=<base64-encoded localStorage, optional>
```

Ha cookies lejár → Tomi-ping Discord-on: "FB/LinkedIn session lejárt, új cookie-kat kérek a .secrets-be."
