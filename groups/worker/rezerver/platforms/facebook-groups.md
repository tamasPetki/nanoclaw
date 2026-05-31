# Facebook Groups — HU HoReCa warmup + reputáció-építés

> **⚙️ FB WARMUP AKTÍV (2026-04-18-tól). Lépcsőzetes fázis-rendszer.**
>
> Tomi 2026-04-18-án profilképet töltött fel a Dani FB fiókhoz (Dani Bene, user_id 61569002698901). Az agent első login-ja ugyanakkor sikeres volt HU sticky DataImpulse proxy-ról — feed betöltött, zéró checkpoint. A fiókot ezentúl az agent kezeli, **lépcsőzetes warmup** szerint. A fiatal fiók érzékeny, minden túl-engagement = azonnali flag.
>
> **Fázis-állapot:** `state.json` `fb_warmup_phase` (1-4+). Automatikus fázisváltás ha `fb_warmup_phase_ends_at` < ma → phase+1, új ends_at = ma + 7 nap.

> **FIGYELEM:** A Facebook az egyik legagresszívebb bot-detektációval dolgozik. Checkpoint / SMS verify / "ideiglenes zárolás" = AZONNAL stop, Discord ping. Minden szabályt komolyan vegyél — egy gyors lájk-sorozat vagy HoReCa-témájú lájk azonnali account-lock lehet.

## Warmup fázisok

| Fázis | Időszak | Engedélyezett akció | Napi/heti kvóta |
|-------|---------|---------------------|----------------|
| **1** (kezdeti) | Hét 1 (2026-04-18 → 2026-04-25) | ZÉRÓ engagement. Csak login-check, feed-görgetés 3-5 perc, FB-internal search HU HoReCa kulcsszavakra, csoport-discovery `facebook_group_log.md`-be. | 0 lájk, 0 csatlakozás, 0 komment, 0 profil-követés |
| **2** (első lájkok) | Hét 2 (2026-04-26 →) | Feed-lájk SAFE tartalomra (időjárás, sport, közhír, mém). Discovery folytatódik. Shortlist TOP 5 csoport. | Max 2 lájk/hét SAFE, 0 csoport-csatlakozás |
| **3** (első csoport) | Hét 3 | 1 csoport-csatlakozási kérelem a shortlist legjobbjába. Preferált: admin-approval-os. Csatlakozás után: 0 akció 1 hétig, csak olvasás. | Max 1 csoport-kérelem/hét, max 2 lájk/hét SAFE |
| **4+** (lassú skálázás) | Hét 4-től | 1 csoport-kérelem/hét, feed-lájk 2-3/hét SAFE, csoportban max 1 lájk/hét másik tag SAFE-posztjára. | 0 komment, 0 Rezerver-említés |

**Fázisváltás logikája:** minden session elején a `state.json` `fb_warmup_phase_ends_at`-et vesd össze a mai dátummal. Ha mai ≥ ends_at → fázis+1, új ends_at = ma + 7 nap.

## Notification / friend-request check — BADGE-alapú

Tomi megkér pár ismerőst, hogy jelöljék be Dani-t. Egy üres-ismerős fiók önmagában gyanús, 5-10 barát sokkal hitelesítőbb. **Minden fázisban aktív**, már Phase 1-től.

### Szabály — CSAK badge-re reagálj

Session elején a feed betöltése után snapshot-old a **felső nav-sávot** (jobb felső sarokban a harang / értesítések ikon + ismerős-ikon). Csak akkor kattints, ha **piros badge** (szám vagy pötty) látszik. Ha nincs badge → NE nyisd meg, hagyd. NE URL-lel navigálj — mindig az ikonon át, mint egy ember.

### Ha van badge

Kattints az ikonra, snapshot-old a megnyíló listát:

- **Friend-request:** fogadj el 1-2-t. **Max 2/session, max 3/nap, max 8/hét.** Ha 2-t egy session-ben, köztük 5-15 perc feed-görgetés. **Bárki elfogadható** (Tomi ismerősei + ismeretlenek is — a fiók még üres, nincs mit védeni).
- **Komment / említés / lájk Dani posztjára:** olvasd el, **NE reagálj** (ne lájkold, ne válaszolj). Csendes fázis szabálya.
- **Csoport-kérelem visszaigazolása** (admin elfogadta): logold `facebook_group_log.md`-be "JOINED" státusszal, utána 1 hét passzív olvasás (Phase 3 szabály).
- **Egyéb értesítés** (barát posztja, emlékek, rendezvény-javaslat): átnézheted passzívan, NE reagálj.

### Accept után

20-40s feed-görgetés (mint egy ember aki megnézte az új kapcsolatot). Utána visszatérsz a session eredeti tervéhez.

### Technikai

```bash
# A feed betöltése után:
stealth-browse snapshot
# Keress [aria-label*="Értesítések"] vagy [aria-label*="Notifications"] a harangra
# + [aria-label*="Ismerős"] vagy [aria-label*="Friend"] az ismerős-ikonra
# Mindkettő badge-ét ellenőrizd (pl. aria-label-ben a szám, vagy data-* attribútum)
# Ha badge > 0, kattints rá
# Snapshot a megnyitott popover-ben → keress "Visszaigazolás" / "Confirm" gombot
```

### Stop-jelek

Azonnal stop + Discord ping, ha: captcha, "Too many requests", "Please slow down", 2FA, security-check overlay, "You are doing that too much". Ha ilyen → ma NEM próbálkozunk újra.

### Napló

`state.json` `fb_daily_actions.friend_accepts_today`, `fb_weekly_stats.friend_accepts_total` + `friends_count`. Minden accept után 1 soros Discord update: "Dani elfogadott 1 jelölést (X → Y barát)."

## SAFE lájk szabály (fázis 2+)

**CSAK** lájkolható:
- Időjárás (meteorológiai poszt, évszak-váltás)
- Sport (közhírű eredmény, pl. magyar válogatott)
- Közhír / napi hírek (politika KIVÉVE — kerülendő)
- Mém / humor (általános, nem téma-specifikus)
- Utazás-kép, természet-fotó (ha egy "barát" megosztott)
- Jókívánság (szülinap, évfordulóra)

**SOHA** nem lájkolható:
- HoReCa / étterem / catering / rendezvényhelyszín / esküvő / kulináris tartalom → új fiók + szándékos HoReCa-lájk = azonnali gyanú, hogy marketing-fiók
- Politikai párt / kampány (moderáció-flag kockázat)
- Üzleti hirdetés / ad
- Bármi Rezerver-rel asszociálható (foglalási rendszer, SaaS, HoReCa-tech)

## FB csoport discovery workflow

### Search kulcsszavak (FB internal search bar)

Rotálj ezek között, ne mindig ugyanazt keress:
- "vendéglátás"
- "HoReCa magyarország"
- "étterem"
- "esküvőhelyszín" / "esküvőszervező"
- "rendezvényhelyszín"
- "catering"
- "rendezvény Magyarország"
- "étteremvezetők"

Plusz Google: `site:facebook.com/groups "vendéglátás"` stb. — ez is hasznos, de FB-ban bejelentkezett állapotban a belső search sokkal több releváns találatot ad.

### Log formátum (`facebook_group_log.md`)

Minden talált csoportot rögzíts ezzel a blokkal:

```
## {csoport-név}
- URL: https://www.facebook.com/groups/{id vagy slug}
- Tagszám: ~{szám}
- Típus: publikus / zárt / titkos
- Csatlakozás: azonnali / admin-approval-os
- Posztolási jog: minden tag / csak admin
- Nyelv: HU / EN / mixed
- Utolsó aktivitás: {dátum}
- Relevancia-score: 1-5 (5 = magas, célpartnerek tagok)
- Jegyzet: {rövid, mi tetszett / mire figyelj}
- Discovered: {dátum}
- Phase-action: phase 3-ra shortlisted / phase 4-re halasztva / elutasítva (ok)
```

### Jó csoport kritériumai (shortlistre)

- 3000+ tag (nagyobb = kisebb admin-figyelem rád belépéskor)
- Publikus VAGY zárt de admin-approval-os
- Napi 3+ aktivitás (nem haldokló csoport)
- HU nyelv, HU vendéglátós/rendezvény téma
- Posztolási jog minden tagnak (vagy legalább komment)
- NINCS erős anti-promo admin-szabály (olvasd el a csoport About / Rules szekciót!)

### Kihagyandó

- <500 tag csoport (túl kicsi + túl személyes)
- Spam-csoportok (adásvétel, apróhirdetés-jellegű)
- Éttermi menü-foto gyűjtők (túl szűk fókusz)
- Külföldi (nem HU) HoReCa csoportok (legalábbis Phase 1-ben)

## Technikai login

Minden FB session elején:

```bash
source /workspace/group/.secrets

# HU sticky proxy (ha lehet — suffix+port 10000)
# .env-ben a REDDIT_PROXY base rotating; az agent itt konstruálja a sticky variánst:
# (felhasználó__cr.hu;sessttl.30:password@gw.dataimpulse.com:10000)

stealth-browse open about:blank
stealth-browse cookies www.facebook.com \
  c_user=$FB_C_USER \
  datr=$FB_DATR \
  sb=$FB_SB \
  "xs=$FB_XS" \
  locale=$FB_LOCALE \
  wd=$FB_WD

stealth-browse open https://www.facebook.com/
stealth-browse wait 3000
stealth-browse eval "document.querySelector(\"[role=feed]\") ? \"FEED_OK\" : \"NO_FEED\""
```

Ha `NO_FEED`, NE STOP-olj rögtön — előbb diagnoszticáld:

1. **Account-picker (több profil-tile, pl. "Bene Dani" + "Száblet Tomi")** → NEM session-expired. A cookie-k jók, FB csak nem tudja melyik profilba lépjen. Klikkelj a saját profil-tile-ra (`Bene Dani`), `wait 2000`, FEED_OK újrapróba. Ez tipikusan akkor jön elő, ha a böngészőben több FB c_user-szal jártunk korábban (multi-account state).
   ```bash
   stealth-browse eval "Array.from(document.querySelectorAll('a,div[role=button]')).find(e => e.innerText && e.innerText.includes('Bene Dani'))?.click()"
   stealth-browse wait 2500
   stealth-browse eval "document.querySelector(\"[role=feed]\") ? \"FEED_OK\" : \"STILL_NO_FEED\""
   ```
2. **Login form (email+password input látható, profil-name NEM)** → **agent-direct relogin, TE oldod meg, NEM Tomi-ping.** Töltsd ki a formot a vault-credekkel proxy mögött (clean path, lásd `feedback_fb_direct_login_vs_chrome_export`). Ha "Something went wrong" jön: NE add fel — várj 30-60s + retry; kétszeri elakadásnál válts friss proxy-sticky-session-re és úgy próbáld. Manuális Tomi-belépést SOHA ne kérj. (A puszta login-form NEM "session expired → Tomi" eset — ez a régi rossz reflex.)
3. **Checkpoint URL (`/checkpoint/`), captcha, 2FA modal** → ez az EGYETLEN valódi fal. HARD STOP, incident-log + `[reflect:rezerver] step=abort`, de NE kérj manuális belépést (holnap újrapróba).
4. **Egyéb "unusual"** → előbb screenshot + DOM-vizsgálat; ne ugorj STOP-ra és főleg ne "cookie lejárt"-ra. Csak ha tényleg azonosított checkpoint/captcha → akkor STOP.

**KRITIKUS**: Tomi NEM lép be saját IP-ről FB-re — a residential proxy → home IP váltás flag-eli a fiókot (veszélyesebb mint amit megold). Minden belépést/cookie-frissítést az agent old meg containerből. Lásd a HARD RULE-t a `CLAUDE.local.md` tetején.

## AZONNALI STOP szabályok

Ha BÁRMELYIK ezek közül: stop, session close, NE próbálj újra, Discord ping Tomi-nak:

- "Unusual login activity" / "Please confirm your identity"
- SMS verify kérés
- Captcha bárhol
- 2FA prompt amit nem vártunk
- "Account temporarily restricted" / "Account disabled"
- Checkpoint bármilyen típusa

**NEM tartozik ide a puszta login-form** (feed helyett email+pass mező): az **agent-direct relogin** esete (lásd NO_FEED diagnózis 2. pont), azt MAGAD oldod meg, nem STOP. Csak ha a relogin után jön checkpoint/captcha/2FA → AKKOR stop.

A valódi STOP-eseteknél (fent) NE próbáld automatikusan helyrehozni, de manuális Tomi-belépést SE kérj (home-IP flag) — incident-log + `[reflect:rezerver] step=abort`, a holnapi warmup újrapróbál. Tomi a saját eszközeivel dönt.

## Emberi session-minta — random-izálás

Ne minden session ugyanazt csinálja. Session-típusok (véletlenszerű kiválasztás a fázis korlátain belül):

- A) Csak feed-görgetés 4-8 perc, 0 interakció
- B) FB internal search 1-3 kulcsszóra + discovery
- C) 1-2 random profil megnyitása (javaslat vagy csoport-tag), 20-40s
- D) (Fázis 2+) 1 SAFE lájk ha heti keret engedi
- E) (Fázis 3+) Csatlakozott csoport feedjében 2-3 perc olvasás
- F) Értesítések fülre ugrás, 10-20s

Session teljes idő: 5-12 perc. Scroll ritmus: `scroll down 400-800px` → `wait 3-8s` → ismétlés.

## Miért prioritás (long-term)

HU vendéglátós közösség **nem Twitter-en, nem Reddit-en**, hanem FB csoportokban beszélget. Wedding planner, étteremvezető, rendezvényszervező napi FB-használó. Ez a **long-term brand-csatorna** a Rezerver számára. A warmup lassú (4+ hét), de megéri — egy élő, ismerős fiók 5-7 HU HoReCa csoportban nagyon értékes asset, amikor a fázis aktiválódik.

## Fiók-szabályok (KRITIKUS)

- **NE Tomi személyes FB fiókját** használjuk → külön **Rezerver-Tomi FB fiók** kell
- Regisztráció: `dani@rezerver.com` címmel, **phone verify előre** (FB később kérni fogja), friss profilkép, ismerősök 0 (üres FB fiók = gyanús, de Tomi személyest nem kockáztatjuk)
- Profil: "Petki Tamás", munkáltató "Rezerver", HU lokalizáció, 1-2 nap minimum "öregedés" mielőtt csoportba próbál belépni
- **Külön sticky HU residential proxy** (`FB_PROXY`), NEM a `REDDIT_PROXY`-val közös — IP-reputáció átfedés kerülendő

## Target HU FB csoportok (kezdőlista)

| Csoport | Kategória | Tagság | Megjegyzés |
|---------|-----------|--------|-----------|
| Éttermesek Közössége | B2B supply | nagy (~10k+) | Étteremtulajdonos, vezető |
| Vendéglátósok Klubja | B2B supply | közepes | Általános HoReCa |
| Éttermes vagyok | B2B supply | nagy | Napi működés, szakmai kérdések |
| Pultosok, Bartenderek, Felszolgálók | B2B staff | nagy | Közvetlenül nem tulajdonos, de indirekt info-csatorna |
| Rendezvényszervezők Magyarországon | B2B mindkét oldal | közepes | **HIGH PRIORITY** — supply és demand oldal keveredik |
| HoReCa Hungary | B2B mindkét oldal | közepes | Szakmai hírek, trend |
| Esküvőszervezők Magyarországon | B2C demand | nagy | **Phase 2** — addig csak read |
| Céges Event Szervezők HU | B2C demand | kicsi-közepes | **Phase 2** |

**Agent bővítheti a listát:** ha jobb csoportot találsz, add hozzá a `facebook_group_log.md`-hez és a `state.json` `fb_groups_pending`-hez.

## Stealth workflow

```bash
source /workspace/group/.secrets   # FB_C_USER, FB_XS, FB_DATR, FB_SESSION_JSON, FB_PROXY betöltése
stealth-browse open about:blank

# 1. Cookie injection
stealth-browse cookies facebook.com c_user=$FB_C_USER xs=$FB_XS datr=$FB_DATR

# 2. localStorage restore (ha van FB_SESSION_JSON — base64-decoded dump)
echo "$FB_SESSION_JSON" | base64 -d > /tmp/fb_ls.json
# (restore JS-en keresztül — részletek a reference_telegram_web_stealth.md-ben, ugyanaz a pattern)

# 3. Navigáció csoportra
stealth-browse open "https://www.facebook.com/groups/<GROUP_ID>"

# 4. Snapshot
stealth-browse snapshot

# 5. Warmup 1 fázis: csak görgetés, screenshot, bezárás
# 4+ fázis: komment írás WindMouse click + log-normal typing

stealth-browse close   # MINDIG zárd be
```

**Screenshot** minden lépésnél a `/tmp/fb-<action>-<timestamp>/` mappába, hogy Tomi tudja audit-álni.

## Bukási szignálok (AZONNAL stop)

- "Ideiglenesen zárolt fiók" / "Temporarily blocked" üzenet
- "Megerősítjük hogy te vagy" (checkpoint prompt)
- "Biztonsági ellenőrzés — adj meg egy telefonszámot" (phone verification)
- Captcha a belépésnél (ha cookie-val jöttünk be és mégis kéri)
- "A csoport jelenleg nem érhető el" RENDSZERESEN (IP block)
- **VAGY** ha a proxy `curl --proxy "$FB_PROXY" ifconfig.me` nem HU IP-t ad vissza

**Ezekre a reakció:**
1. `stealth-browse close` azonnal
2. `state.json` `warmup` blokkba logold: `fb_incident` tömb új entry (dátum + típus + screenshot path)
3. Discord-on: "FB probléma: [típus]. Session lezárva, várom Tomi döntését."
4. Session FOLYTATÁSA nélkül lépj a következő platform-prioritásra (email, LinkedIn, vagy exploration)

## Komment szabályok (fázis 3+)

- Mindig olvasd végig a posztot + korábbi kommenteket mielőtt írsz → ne duplikálj
- **VOICE.MD kötelező olvasás** a komment előtt
- Legyél SEGÍTŐ: válaszolj konkrét kérdésre konkrét tapasztalattal, nem általánosságban
- Rezerver említés CSAK ha valaki kifejezetten foglalási rendszerről / ár-transzparenciáról kérdez → akkor is max 1 rövid mondattal + disclosure ("mi most építünk pont ilyet, Tomi vagyok, DM-ben szívesen mesélek")
- Max 2-3 mondatos komment, NE legyen markdown list / fejléc

## Logging — `facebook_group_log.md`

Minden FB akciót (belépés, kérelem, komment, lájk, incident) logold a csoport-specifikus fájlban. A `state.json`-ba csak a napi számláló kerül (`fb_actions_today`).

## Reflektív riportok a hubnak (`[reflect:rezerver]`) — real-time push Tomi-Telegramra

A Reddit playbook 10-step flow-jához hasonlóan a FB warmup-session is két reflektív üzenetet küld a hubnak (cross-agent send_message), `[reflect:rezerver]` prefixszel. A hub felismeri, magyarra fordítja (HU-ról HU-ra: minimal change), push-olja Tomi-Telegramjára real-time, és wiki-be is naplóz.

**Korai indítás-jelzés** (warmup-session legelején, a snapshot ELŐTT). Egy mondat, Dani hangon, magyarul. Példa:
```
[reflect:rezerver] step=5 | reggeli FB warmup, ma a 'Vendéglátósok HU' csoportban figyelek
```
Ez biztosítja hogy ha a session később megakad (context-compact, FB-checkpoint), Tomi legalább látja hogy elindult.

**Záró reflektív riport** (warmup-session végén, a `stealth-browse close` ELŐTT). 1-3 mondat, Dani hangon, magyarul. Tartalom-rács: (1) mit néztél (csoport + idő), (2) mire kaptad fel a fejedet (egy konkrét takeaway — egy poszt/komment/diskurzus), (3) opcionális Rezerver-ICP-szignál vagy stratégiai megfigyelés. Példa:
```
[reflect:rezerver] step=8 | 'Vendéglátósok HU'-ban voltam 7 percet. Egy nyári-szezon-tervezés threadnél megakadtam — több étterem-tulaj is jelzi, hogy az online foglalási flow-juk Wolt-on át megy, közvetlen booking szinte nincs. Nálunk pont a saját-domain-os foglalás a value-prop. Lájk 0, csak figyelek.
```

**ABORT-narratíva** ha bukási szignál jön (checkpoint, captcha, 2FA, "Too many requests"): a hagyományos `state.json` `fb_incident` log MELLÉ küldj egy `[reflect:rezerver] step=abort | ...` üzenetet is, hogy Tomi narratívában értse mi történt. Példa:
```
[reflect:rezerver] step=abort | Dani fiókon checkpoint prompt jött a 'Vendéglátósok HU' csoport megnyitásakor. Browser closed, state-be incident logolva. Ma nem erőltetem tovább, holnap a warmup újrapróbál clean session-nel. (Megj.: NE kérj manuális FB-belépést Tomitól — a home-IP login flag-eli a fiókot.)
```

Részletek a worker `CLAUDE.local.md` "Reflektív riportok" szekciójában. **Pontosan 1 záró reflexió per session**, opcionális +1 indítás-jelzés.
