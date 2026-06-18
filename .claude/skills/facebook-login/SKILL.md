---
name: facebook-login
description: >
  Host-szintű Facebook-belépés / session-cookie frissítés stealth-browse containerből, amikor egy
  agent FB-fiókja (pl. Dani/Rezerver, Lloyd) friss session-t igényel. Akkor használd, ha Tomi azt
  mondja "lépj be a Facebookra", "frissítsd a FB cookie-kat/sessiont", "<persona> FB-je lejárt",
  "szerezz friss xs-t", vagy ha egy worker-cron FB-belépésen akad el. A KULCS: a megbízható út a
  **device-based trusted login** (datr-injekció → account-picker → profil-tile → jelszó-modal),
  ami MEGKERÜLI a reCAPTCHA-t — NEM a fresh email+jelszó login. Tartalmazza a React-input kitöltés,
  cookie-consent, CDP coord-click és cookie-dump+persist mintákat.
---

# Facebook login — host-szintű, reCAPTCHA-megkerülő flow

> **Miért külön skill:** a FB login a legtöbb stealth-flow-tól eltér. A fresh email+jelszó login
> egy reCAPTCHA Enterprise gate-be fut (`fb_login_recaptcha`), amit **NEM lehet megbízhatóan
> megoldani** (lásd lent). A megbízható út a **trusted-device login**, ami a `datr` eszköz-cookie
> alapján megkerüli a reCAPTCHA-t. Ezt a tudást egy teljes session (2026-06-02→03) szívásából
> desztilláltuk — kövesd, és nem kell újra végigszenvedni.

## TL;DR — a működő recept

1. Ad-hoc stealth-browse container HU (vagy a persona országának megfelelő) **residential sticky proxyval**.
2. Friss Chrome-profil + **datr (eszköz-trust cookie) injektálása** a `.secrets`-ből (FB_DATR, FB_C_USER, FB_SB).
3. `stealth-browse open https://www.facebook.com/` → **account-picker** jön elő (a profil-tile-okkal).
4. **CDP coord-click a profil-tile-ra** ("Dani Bene") → **device-login jelszó-modal** (profilkép + CSAK jelszó-mező).
5. Jelszó kitöltése (**JS `.focus()` + valódi keystroke**) → **Log in CDP-click** → **NINCS reCAPTCHA** → belépve.
6. Cookie-dump (c_user, xs, datr, sb) CDP-ből → **`.secrets` frissítése** + `chown 1000:1000`.

Ha nincs még datr a `.secrets`-ben (vadonatúj fiók), akkor kénytelen vagy fresh login-t csinálni a
reCAPTCHA-fallal — lásd "Ha tényleg fresh login kell".

---

## 0. Pre-flight (a register-account skill reality-checkjei)

- **Proxy:** sticky residential, a böngésző ÉS bármely CapSolver-hívás **UGYANAZT a sticky spec-et**
  használja (közös exit-IP). DataImpulse formátum: `<base>__cr.<cc>;sessid-<id>;sessttl-30:<pass>@gw.dataimpulse.com:10000`.
  Ellenőrizd: `curl -x http://$FB_PROXY https://api.ipify.org` 2-3×, ugyanaz az IP + helyes geo + residential ASN.
- A proxy-spec a container env-jében (`FB_PROXY`) legyen, NE a host-parancsban (ne szivárogjon).
- Container: a `nanoclaw-agent` image, `sleep 3600` entrypoint. **Figyelem:** a `sleep 3600` után a
  container magától kilép → a böngésző-session elveszik. Adj elég időt, vagy `docker start <name>`-mel
  újraindítható azonos configgal (env+mount megmarad).

## 1. Böngésző indítása proxyval — GOTCHA-k

```bash
# X-lock takarítás restart/pkill után (különben "Xvfb failed to start")
docker exec <c> sh -c 'rm -f /tmp/.X99-lock /tmp/.X11-unix/X99; pkill -9 chromium; pkill -9 Xvfb; rm -f /tmp/stealth-browser-state.json'
# Proxy: STEALTH_PROXY env (explicit támogatott) VAGY --proxy. Persistens profil STEALTH_USER_DATA_DIR-rel.
docker exec <c> sh -c 'STEALTH_PROXY="$FB_PROXY" STEALTH_USER_DATA_DIR=/workspace/agent/.chrome-fb stealth-browse open "about:blank"'
```

- **`stealth-browse open` egy MÁR FUTÓ böngészőhöz csatlakozik** (a `/tmp/stealth-browser-state.json`
  alapján) és **ignorálja az új `--proxy`-t** (Chrome proxy csak launch-kor állítható). Ha proxy kell,
  előbb `close` + state-fájl törlése, hogy tényleg friss launch legyen.
- **Verifikáld a tényleges exit-IP-t a böngészőből** (ne csak a state.proxy-t): `stealth-browse open https://api.ipify.org`
  → `eval document.body.innerText`. Ha a host datacenter-IP-jét látod (nem a proxy HU IP-jét) → a proxy nem fogott.
- CDP port: `node -e 'console.log(JSON.parse(require("fs").readFileSync("/tmp/stealth-browser-state.json","utf8")).cdpPort)'`.

## 2. datr (eszköz-trust) cookie injektálása

```bash
# Értékek a .secrets-ből, host-subshell expanzióval (NEM látszanak a parancsban):
docker exec -e FBC="$(. ./groups/<grp>/.secrets >/dev/null 2>&1; printf %s "$FB_C_USER")" \
            -e FBD="$(. ./groups/<grp>/.secrets >/dev/null 2>&1; printf %s "$FB_DATR")" \
            -e FBS="$(. ./groups/<grp>/.secrets >/dev/null 2>&1; printf %s "$FB_SB")" \
  <c> sh -c 'stealth-browse cookies facebook.com c_user="$FBC" datr="$FBD" sb="$FBS"'
```

A `datr` a kulcs: ettől ismeri fel FB az eszközt és kínálja a device-login modált (reCAPTCHA nélkül).
Az `xs`-t NEM kötelező injektálni a re-loginhoz (úgyis lejárt, ezért csináljuk) — a jelszó-modal pótolja.

## 3. Account-picker → profil-tile → device-login modal

```bash
docker exec <c> sh -c 'STEALTH_USER_DATA_DIR=/workspace/agent/.chrome-fb stealth-browse open "https://www.facebook.com/"'
# Screenshot → látnod kell a "Log into Facebook" pickert a profil-tile-okkal.
# A tile-t CDP coord-clickkel kattintsd (a .click() div-en gyakran nem hat):
#   eval-lal szerezd meg a "Dani Bene" szöveget tartalmazó kattintható elem rect-jét → közép → cdp-click.js
```

A tile-click után **device-login modal**: profilkép + név + EGY jelszó-mező (email NINCS). Ez a jó jel.

## 4. Jelszó kitöltése — React-input GOTCHA (fontos!)

A FB login-inputok React-controlled mezők. A megbízható kitöltés:

- **NE** a `stealth-browse fill @ref` (a fókusz-click gyakran egy wrapper DIV-re landol, a keystroke sehová).
- **NE** csak native value-setter (vizuálisan kitölti, de a React submit-flag üres marad → a gomb nem submitál).
- **IGEN:** `stealth-browse eval "document.querySelector('input[type=password]').focus()"` (JS `.focus()`
  megbízhatóan beállítja az activeElement-et) → majd **`stealth-browse type "$FB_PASSWORD"`** (valódi
  keystroke a fókuszba). Verifikáld: `eval` a mező `.value.length`-jét.
- Jelszó/email értéket a container env-jéből add (`sh -c 'stealth-browse type "$FB_PASSWORD"'`), ne a host-parancsban.

A "Log in" gomb egy `div[role=button]` → **CDP coord-click** a pontos rect-közepére (`cdp-click.js <x> <y>`,
`CDP_PORT` env-ben a cdpPort). A sima Enter / JS-click gyakran nem submitál.

**Cookie-consent modal:** friss profilnál előjöhet egy "Allow the use of cookies" modal, ami elnyeli a
clickeket (a login gomb mögötte van). Zárd be **"Allow all cookies" CDP coord-clickkel** (a React-modal
a JS `.click()`-re nem reagál), mielőtt a formmal foglalkozol.

## 5. Sikeres login ellenőrzés + cookie-dump + persist

```bash
# Belépve = c_user + xs cookie megvan (az xs HttpOnly → document.cookie NEM mutatja, CDP Network.getAllCookies kell)
# Dump CDP-ből egy fájlba, majd a .secrets frissítése host-oldalon (értékek nem a chatbe):
#   FB_XS, FB_DATR, FB_C_USER, FB_SB  →  groups/<grp>/.secrets  →  chown 1000:1000
```

A friss `xs`-szel a worker innentől **cookie-injekcióval** dolgozik (c_user/xs/datr), nem kell újra belépnie,
amíg az xs él (hetekig). Lásd `groups/worker/rezerver/platforms/facebook-groups.md` NO_FEED diagnózis.

---

## Ha tényleg fresh login kell (nincs datr / vadonatúj fiók)

A fresh email+jelszó login a **reCAPTCHA Enterprise gate**-be fut. Amit a 2026-06 session megállapított:

- **Sitekey** (FB global): `6LeyIlkaAAAAAE-EjcALU28lwxWPusUvGL3e0avS`, origin `https://www.fbsbx.com`, action `fb_login_recaptcha`, `size=normal` (látható checkbox).
- A reCAPTCHA a **fbsbx.com captcha iframe**-ben renderel (külön CDP-target); a `g-recaptcha-response`
  textarea + `window.successCallback` (a `data-callback`) is ott van. Token-injektálás: a textarea
  beállítása + `window.successCallback(token)` hívása a **fbsbx target** Runtime-jában (CDP `Runtime.evaluate`,
  az eredmény `msg.result.result.value`-nál van, NEM `msg.result.value`).
- **CapSolver NEM működik megbízhatóan:** a `ReCaptchaV2EnterpriseTask` (helyes `isInvisible:false`!) ad
  tokent, de FB az Enterprise **score-gate** miatt **elutasítja** (vissza logged-out homepage-re, csak datr/sb/wd).
  Az `isInvisible:true` (a mountolt `solve-recaptcha-enterprise.sh` defaultja) `ERROR_INVALID_TASK_DATA`-t ad.
- **Kézi image-solve:** az anchor `execute-ms=30000` → ~**30s ablak**, ami az agent-round-trip latency
  mellett (capture → vízió-elemzés → tile-click) gyakorlatilag túl rövid; ráadásul az ismételt
  nyitás/lejárat ciklus a widgetet "unknown error" állapotba degradálja.
- **Tanulság:** fresh login-t kerülj. Ha datr van → device-login (megkerüli a reCAPTCHA-t). Ha nincs datr,
  a fiók-bootstrapot Tomi csinálja manuálisan egyszer (akkor keletkezik a datr), utána az agent device-loginnal frissít.

## Eszközök (a containerbe mountolva / workspace-ben)

- `cdp-click.js <x> <y>` — CDP coord-click (`CDP_PORT` env). WindMouse-szerű mozgás, trusted event.
- `Page.captureScreenshot {clip:{x,y,width,height,scale}}` — nagyított crop a pontos vizuális elemzéshez.
- A full-page screenshot **1:1 a CSS-koordinátákkal** (DPR=1, viewport=screenshot méret) → a screenshot-pixel = CDP-click koordináta.
- Nested cross-origin iframe (fbsbx/recaptcha bframe) → külön CDP-target; az Input event a **target ws-éhez**
  dispatch-elve **frame-lokális** koordinátát használ (nincs offset-matek).

## Takarítás

A flow végén: `stealth-browse close`, ad-hoc container leállítás/törlés, temp scriptek + screenshotok a workspace-ből.
