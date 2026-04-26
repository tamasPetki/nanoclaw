# Facebook Groups — HU HoReCa warmup + reputáció-építés

> **⚙️ FB WARMUP AKTÍV (2026-04-18-tól). Lépcsőzetes fázis-rendszer.**
>
> Tomi 2026-04-18-án profilképet töltött fel a Dani FB fiókhoz (Dani Bene, user_id 61569002698901). Az agent első login-ja ugyanakkor sikeres volt HU sticky DataImpulse proxy-ról — feed betöltött, zéró checkpoint. A fiókot ezentúl az agent kezeli, **lépcsőzetes warmup** szerint. A fiatal fiók érzékeny, minden túl-engagement = azonnali flag.
>
> **Fázis-állapot:** `state.json` `fb_warmup_phase` (1-4+). Automatikus fázisváltás ha `fb_warmup_phase_ends_at` < ma → phase+1, új ends_at = ma + 7 nap.

> **FIGYELEM:** A Facebook az egyik legagresszívebb bot-detektációval dolgozik. Checkpoint / SMS verify / "ideiglenes zárolás" = AZONNAL stop, Discord ping. Minden szabályt komolyan vegyél — egy gyors lájk-sorozat vagy HoReCa-témájú lájk azonnali account-lock lehet.

## Daily warmup playbook

Napi **1× session**, automatizáltan beillesztett task egy random **18:00–21:00 CET** közötti időpontra (`scripts/schedule-fb-warmup.sh` + cron 17:00 CET). Magyar FB-peak: vacsora utáni böngészés. A task-prompt **vékony orchestrate-utalás** erre a doksira — minden részlet a meglévő szekciókban él (Cookie-restore, SAFE lájk, Notification badge, Stealth workflow, AZONNALI STOP).

### Lépésenkénti flow

1. **Secrets + proxy IP-check.**
   ```bash
   source /workspace/agent/.secrets
   HU_PROXY="${REDDIT_PROXY/cr.us/cr.hu}"
   curl -sS -x "$HU_PROXY" --max-time 15 https://ipinfo.io/json | jq -c '{ip,city,region,country}'
   ```
   Ha nem HU → **STOP, Tomi-ping**, ne folytasd. (HU-sticky a fiók-IP-konzisztenciához kötelező — bármilyen geo-jump fraud-flag.)

2. **State + phase olvasás.**
   ```bash
   jq '. | {fb_warmup_phase, fb_warmup_phase_ends_at, fb_weekly_stats, fb_daily_actions}' /workspace/agent/state.json
   ```
   Vesd össze `fb_warmup_phase_ends_at` a mai dátummal — ha mai ≥ ends_at, **léptesd a fázist** (phase+1, új ends_at = ma + 7 nap), state-update-be is bevezetni. A heti kvótákat (likes_total, group_join_requests_total) ellenőrizd: maradt-e még keret.

3. **Browser indítás + cookie-restore.** Lásd [Cookie-restore + dump](#cookie-restore--dump-kanonikus-pattern-2026-04-25-től) szekció. **NE login-form** — csak `.fb-cookies-dani.json`-ból visszaállítás. Account-picker → kattints "Dani Bene"-re. Ha login-form / "Unusual activity" / 2FA → **STOP + Tomi-ping**, semmi recovery.

4. **Notification badge check.** Lásd [Notification / friend-request check](#notification--friend-request-check--badge-alapú) szekció. Csak akkor klikkelj a harangra/ismerős-ikonra, ha **piros badge** látszik. Friend-request: max 1-2 fogad/session, köztük 5-15 perc feed-görgetés.

5. **Discord korai indítás-jelzés.** **MOST küldd ki**, mielőtt a hosszú session-flow elindul. Egy mondat, Dani hangon: *"Esti FB warmup, Phase 2, ma feed-görgetés + discovery."* Ez akkor is kimegy, ha később bármi elromlik (context-compact, ceiling-kill).

6. **Session-típus pick (random).** Az [Emberi session-minta](#emberi-session-minta--random-izálás) A-F listájából random 1-2-t. Phase-szerinti hardlimit: phase 1 csak A/B/F, phase 2+ A/B/C/D/F, phase 3+ E is. Session teljes idő: 5–12 perc, scroll-cadence random (`400-800px scroll → wait 3-8s → ismétlés`).

7. **State frissítés:**
   - `state.fb_daily_actions.sessions_today` = increment
   - `state.fb_daily_actions.session_minutes_today` += session perc
   - `state.fb_daily_actions.feed_scroll_minutes_today` += scroll perc
   - `state.fb_daily_actions.searches_today` = append (ha B-típus volt)
   - `state.fb_daily_actions.profiles_viewed_today` += (ha C-típus volt)
   - `state.fb_daily_actions.likes_today` += (ha D-típus + SAFE lájk volt)
   - `state.fb_daily_actions.friend_accepts_today` += (ha badge accept volt)
   - `state.fb_weekly_stats.{likes_total, friend_accepts_total, ...}` += increment ha hét még nem zárult (`week_start` ellenőrzés)
   - **Phase-et SOHA ne lépj kvóta alapján** — csak `fb_warmup_phase_ends_at` szerint (step 2).

8. **Discord záró reflektív riport.** **A cookie-dump ELŐTT** küldd ki. 1–2 mondat, Dani hangon, magyarul. Mit nézettél, mire kaptad fel a fejedet, milyen csoportot fedeztél fel. PÉLDA: *"Estém FB-on, 7 perc. A 'Rendezvényszervezők Magyarországon' csoport feedjében sok Balaton-szezon panel-vita — interesszáns, hogy mennyien küzdenek a foglalási overhead-del. Egy lájk, csendes."*

9. **Cookie-dump frissítés.** **CSAK ha FEED_OK volt** (lásd [Dump session végén](#dump-session-végén--csak-feed_ok-után)) — STOP-állapotban a fájl változatlan marad. `jq` szűréssel csak `*.facebook.com` cookie-kat tartsuk meg, atomikus rename.

10. **Browser close:** `stealth-browse close`.

### Random elemek minden session-ben

- Session-típus: lásd step 6.
- Session-hossz: 5–12 perc, ne fix.
- Scroll-cadence: 400–800px scroll, 3–8s wait, ne timer-szerű.
- Search keyword (B-típusnál): rotálj a [Search kulcsszavak](#search-kulcsszavak-fb-internal-search-bar) listából.

### STOP-pingek

A teljes lista a [AZONNALI STOP szabályok](#azonnali-stop-szabályok) szekcióban. Röviden: bármilyen checkpoint / SMS verify / captcha / 2FA / "Unusual activity" / "Account temporarily restricted" → **azonnal `stealth-browse close` + state.fb_incident-be log + Discord ping**, semmilyen recovery-akció.

**Phase-et SOHA ne lépj kvóta alapján** — csak az `fb_warmup_phase_ends_at` dátum szerint. Ne kommentelj. Ne csatlakozz csoporthoz a Phase-szerinti hardlimit felett. SAFE lájk csak Phase 2+ és csak a [SAFE lájk szabály](#safe-lájk-szabály-fázis-2) szerinti tartalomra.

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

## Cookie-restore + dump (kanonikus pattern 2026-04-25-től)

A FB session-cookie-k a `groups/rezerver/.fb-cookies-dani.json`-ban élnek (a containerben `/workspace/agent/.fb-cookies-dani.json`). Egységes pattern a Reddit-tel: JSON-tömb, Chrome/CDP `Network.getAllCookies` formátumban (mező-nevek: `domain, name, value, path, expirationDate, httpOnly, secure, sameSite, session`).

**Két fázis:**

1. **Bootstrap** — első session, a `.fb-cookies-dani.json` Tomi-Chrome-export. Az agent stealth-browse a `cookies` paranccsal visszaállítja, FB-be belép.
2. **Steady-state** — a session VÉGÉN az agent dump-olja a saját CDP-cookie-listáját ugyanide a fájlba (felülírja Tomi-export-ot). Innen a `datr`/`sb` device-fingerprint az agent-böngészőhöz tartozik, a `wd` viewport az 1920×1080-hoz, és minden subsequent session konzisztens.

### Bootstrap restore — minden session elején

```bash
source /workspace/agent/.secrets   # csak proxy + meta változók — FB cookie env-ben már NEM

# Stealth browser indítás US-sticky helyett HU-sticky proxyval (DataImpulse cr.hu)
HU_PROXY="${REDDIT_PROXY/cr.us/cr.hu}"   # vagy explicit env, ha külön HU proxy-t adunk
stealth-browse open about:blank --proxy "$HU_PROXY"

# Cookie-restore JSON-ból: minden eleem a tömbből → stealth-browse cookies <domain> KEY=VAL
jq -r '.[] | "\(.domain)\t\(.name)=\(.value)"' /workspace/agent/.fb-cookies-dani.json \
  | while IFS=$'\t' read -r DOM KV; do
      stealth-browse cookies "$DOM" "$KV"
    done

stealth-browse open https://www.facebook.com/
stealth-browse wait 3000
stealth-browse eval 'document.querySelector("[role=feed]") ? "FEED_OK" : "NO_FEED"'
```

Ha `NO_FEED`, ne kapkodj — nézd meg mit látsz `stealth-browse get text` + screenshot:

- **Account-picker** ("Dani Bene", "Választott fiók" vagy hasonló választó-lista, login-form NÉLKÜL) → **NEM STOP**, ez normál FB UX multi-account state-re. Klikkelj a "Dani Bene"-re (text-alapú click vagy `cdp-click.js` koord-on, ahogy a Reddit-flow-nál a shadow-DOM kezelése volt). Várj feed betöltésre, ellenőrizd újra `[role=feed]`. **Az első sikeres click után az új dump már tisztán Daniá-only session-state-et fog megőrizni** (FB rotálja az `xs` tokent), és a következő restore már nem account-pickerrel jön vissza.
- **Login-form** (jelszó-mező látszik) → STOP, cookie-k lejártak vagy invalid, Tomi-ping cookie-frissítésért.
- **"Unusual login activity" / "Confirm your identity" / 2FA prompt / SMS verify / captcha** → STOP, AZONNAL Tomi-ping. Account-flag jött, ne klikkelj semmire.
- **Egyéb ismeretlen oldal** (pl. policy/terms/privacy interstitial) → screenshot + STOP, Tomi dönt.

### Dump session végén — CSAK FEED_OK után

⚠️ **Ha a session NO_FEED-be / login-form-ba / account-picker-be / bármi STOP-állapotba futott → NE dump-olj.** Az anonim/half-loggedin cookie-tömb felülírná a logged-in fájlt és elveszítenénk a `c_user`/`xs` token-eket. STOP-állapotban a fájl változatlan kell maradjon, hogy Tomi vagy a következő session ugyanonnan próbálkozhasson.

Csak ha `[role=feed]` látszott (FEED_OK) és a session valódi munkát végzett, akkor a session VÉGÉN, mielőtt `stealth-browse close`-olnál:

```bash
NO_PROXY=localhost,127.0.0.1 HTTP_PROXY="" HTTPS_PROXY="" \
  node /workspace/agent/scripts/cdp-cookies.js \
  | jq '[.[] | select(.domain | test("facebook"))]' \
  > /workspace/agent/.fb-cookies-dani.json.tmp \
  && mv /workspace/agent/.fb-cookies-dani.json.tmp /workspace/agent/.fb-cookies-dani.json
```

A jq-szűrő csak a `*.facebook.com` cookie-kat tartja meg (a JSON-dump az ÖSSZES domain cookie-it tartalmazza, többi domain-é → más fájl-be kerül vagy eldobjuk). Atomikus rename, hogy se félig-írt ne legyen ha közben elszáll.

### Miért NEM env-vars

A korábbi `.secrets`-beli `FB_XS`/`FB_C_USER` env-var pattern **deprecated** ehhez a fiókhoz. Indok: `xs` lejárt-rotálás esetén a `.secrets` rewrite-ja bash-source-ra fut, conflict a container-runner secret-propagation-jával (`feedback_credential_refresh_env.md`). JSON-fájl: az agent maga írja, nincs propagation-issue, és atomikus.

`FB_DATR`, `FB_SB`, `FB_C_USER` a `.secrets`-ben maradhat HISTORIC referenciának, de a runtime-cookie-flow a JSON-fájlt használja.

## Technikai login (legacy — csak referencia)

Régi env-var-alapú flow (deprecated, ne használd):

```bash
# DEPRECATED — ne használd új flow-ban
source /workspace/agent/.secrets
stealth-browse cookies www.facebook.com \
  c_user=$FB_C_USER datr=$FB_DATR sb=$FB_SB "xs=$FB_XS" locale=$FB_LOCALE wd=$FB_WD
```

Ha `NO_FEED` vagy login-form → **AZONNAL stop, Discord ping**, ne folytasd.

## AZONNALI STOP szabályok

Ha BÁRMELYIK ezek közül: stop, session close, NE próbálj újra, Discord ping Tomi-nak:

- "Unusual login activity" / "Please confirm your identity"
- SMS verify kérés
- Captcha bárhol
- 2FA prompt amit nem vártunk
- "Account temporarily restricted" / "Account disabled"
- Checkpoint bármilyen típusa
- Feed nem tölt be + login form jelenik meg

Utána NE próbáld helyrehozni automatikusan — Tomi dönti el a következő lépést.

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

## Miért prioritás

HU vendéglátós közösség **nem Twitter-en, nem Reddit-en**, hanem FB csoportokban beszélget. Wedding planner, étteremvezető, rendezvényszervező napi FB-használó. Ez a **long-term brand-csatorna** a Rezerver számára. Warmup lassú, de megéri.

## Fiók-szabályok (KRITIKUS)

- **NE Tomi személyes FB fiókját** használjuk → külön **Rezerver-Tomi FB fiók** kell
- Regisztráció: `dani@rezerver.com` címmel, **phone verify előre** (FB később kérni fogja), friss profilkép, ismerősök 0 (üres FB fiók = gyanús, de Tomi személyest nem kockáztatjuk)
- Profil: "Petki Tamás", munkáltató "Rezerver", HU lokalizáció, 1-2 nap minimum "öregedés" mielőtt csoportba próbál belépni
- **Külön sticky HU residential proxy** (`FB_PROXY`), NEM a `REDDIT_PROXY`-val közös — IP-reputáció átfedés kerülendő

## Warmup fázisok (4 hét)

A warmup fázis állapotát a `state.json` `warmup.fb_phase` tárolja (1-4).

| Fázis | Időszak | Engedélyezett akció | Napi quota |
|-------|---------|---------------------|------------|
| **1** (kezdeti) | Hét 1 (7 nap) | READ-ONLY. Csatlakozási kérelmek (admin approval), görgetés a feedben, ismerkedés. | 0 komment, 0 lájk |
| **2** (low activity) | Hét 2 (7 nap) | Passive engagement | Max 1-2 lájk/nap, 0 komment |
| **3** (soft engagement) | Hét 3 (7 nap) | Első kommentek — **Rezerver-mentes**, értékadó válasz vendéglátós kérdésre | Max 1 komment/nap |
| **4+** (aktív) | Hét 4-től | Értékadó komment + soft Rezerver mention **kizárólag releváns helyzetben** (valaki kérdez foglalási rendszerről, ár-transzparenciáról) | Max 1 komment/nap, ebből max 2/hét mention |

**Fázisváltás logikája:** minden session elején a `state.json` `warmup.fb_phase_ends_at` összevetendő a mai dátummal. Ha mai ≥ ends_at, válts phase+1-re, új `ends_at` = mai + 7 nap.

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
source /workspace/agent/.secrets   # FB_C_USER, FB_XS, FB_DATR, FB_SESSION_JSON, FB_PROXY betöltése
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
