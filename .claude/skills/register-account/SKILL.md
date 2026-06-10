---
name: register-account
description: Host-szintű manual account-regisztráció bot-detektált platformra (Reddit, X, FB, Bluesky, Google, hasonlók) ad-hoc stealth-browse containerből. Akkor használd, ha Tomi azt mondja "regisztrálj fiókot", "csinálj új <platform> usert", "Lloyd/Dani/<perszóna> új fiók", "új Reddit user", "új X account", vagy bármilyen account-onboarding-flow. NEM agent-feladat — host-szintű manual flow (a worker-LLM context-jét NEM szabad belekeverni). A skill tartalmaz proxy-pre-flight checket, ad-hoc container indítást, stealth-browse + CDP coord-click + CapSolver tooling-et, IMAP-poll script-et email-verify-hez, cookie-dump + state.json persist patternt.
---

# Account Registration Playbook

Ez egy **host-szintű operator** skill, NEM agent-feladat. Tomi (vagy másik operator) futtatja egy egyszer használatos `<persona>-reg` ad-hoc containerből. A worker-LLM context-jét NEM szabad belekeverni — minden a host bash + docker exec szinten történik.

A skill két szinten dolgozik:
- **Generic flow**: minden bot-detektált platformra alkalmazható (proxy + stealth + CDP + captcha + IMAP-verify)
- **Platform-specific deep-dive**: Reddit playbook részletesen (Lloyd-flow 2026-05-12 alapján), pár soros mintával más platformra (X, FB, Bluesky)

## Mikor invocálni

- "új Reddit user", "regisztrálj fiókot lloyd-nak", "csinálj <perszóna> accountot" — egyértelmű
- Tomi említi a `bulltrapp/state.json` vagy `rezerver/state.json` `<platform>.account_status=pending_registration` állapotot
- Új persona építésekor a host-szintű registráció része
- `groups/<group>/<context>/platforms/<platform>.md` doks lutilizal "host-szintű manual registration" lépést

## Pre-flight: 4 reality-check **mielőtt** browser-flow-t indítasz

A Lloyd-flow 2026-05-12-én ezeken bukott el először, ezért kötelező:

### 1. Email-cím deliverability check (ha email-verify lesz)

Ha a platform email-verify-t küld, **előbb verify-eld hogy az** **email-cím tényleg fogad emaileket**:

```bash
# IMAP login + folder list — ha login-fail, akkor minden további értelmetlen
python3 << 'PYEOF'
import imaplib
env = {l.split('=',1)[0]: l.split('=',1)[1].strip().strip('"').strip("'") for l in open('/root/nanoclaw-v2/.env') if '=' in l and not l.startswith('#')}
M = imaplib.IMAP4_SSL('imap.zoho.eu', 993)  # vagy ahogy a Zoho/Gmail beállítva
M.login('<email-cím>', env['<EMAIL_PASSWORD_KEY>'])
print('LOGIN_OK')
typ, data = M.list()
print('folders:', [l.decode().split(' "/" ')[-1].strip('"') for l in data])
M.logout()
PYEOF
```

### 2. Domain SPF/DMARC sanity check (email-verify-s platformra)

Ha custom domainről jössz (mint `lloyd@bulltrapp.com`), **a Reddit anti-spam ellenőrzi a SPF-et** és silent-dropja ha broken include van. Ellenőrizd:

```bash
echo "--- SPF rekord ---"
dig +short TXT <domain> | grep -E '^"v=spf'
# Ha broken include látszik (pl. dc-xxx._spfm) → minden include-ot rekurzívan check:
for inc in $(dig +short TXT <domain> | grep -oE 'include:[^ ]+' | sed 's/include://'); do
  printf '%-50s ' "$inc:"
  dig +short TXT $inc | head -1 || echo "(empty - BROKEN)"
done
```

**Ha bármelyik include üres → tisztítsd a SPF-et a registrárnál ELŐBB.** A "Reddit cache-ben még a régi" reputation néha 24-48h-ig fennmarad még a fix után is, az `lloyd@bulltrapp.com`-flow ezt megfigyelte.

### 3. Proxy reality-check — KRITIKUS, ezen bukik a legtöbb attempt

A DataImpulse port és country-filter sokszor inkonzisztens. Mielőtt browser-t indítasz:

```bash
# A) Sticky stabil-e? 3 hívás → ugyanaz az IP?
PROXY="<user>:<pass>@gw.dataimpulse.com:<port>"
for i in 1 2 3; do curl -sS -x "http://$PROXY" --max-time 15 https://api.ipify.org; echo; done

# B) Geo + ASN? (residential vs datacenter)
LAST_IP=$(curl -sS -x "http://$PROXY" --max-time 15 https://api.ipify.org)
curl -sS "https://ipinfo.io/$LAST_IP/json" | jq '.hostname, .org, .city, .country'
# Acceptable: residential ASN (Verizon AS701, Comcast AS7922, T-Mobile, AT&T)
# UNACCEPTABLE: Level3 AS3356, Cogent AS174, Cloudflare, Linode, Hetzner (datacenter)
```

**Ha datacenter IP jött vissza port 10000-en**:
- Próbáld **port 10001-10005**-öt (DataImpulse extra portok jellemzően residential pool)
- Próbáld **másik country syntax-ot**: `__cr.us` → `__country-us` vagy `_country-us`
- Forgass új sticky session-id-t (`<persona><rand4>` random)
- Ha 5 perc múlva sem áll össze → `__cr.us` route temporary outage, várj 5-10 percet

**Lloyd-flow tanulság**: port 10000-en a `__cr.us` filterre csak Level3 datacenter IP jött, port 10002-en lett Verizon FiOS residential (AS701, Stafford VA). A `BT_REDDIT_PROXY` `.secrets`-ben mostantól port 10002.

### 4. CapSolver kvóta + script-availability

```bash
# CAPSOLVER_API_KEY a .env-ben legyen
grep '^CAPSOLVER_API_KEY=' /root/nanoclaw-v2/.env

# CapSolver kvóta lekérdezés
curl -s "https://api.capsolver.com/getBalance" -H "Content-Type: application/json" -d "{\"clientKey\":\"$CAPSOLVER_API_KEY\"}" | jq

# A solver script ott van-e
ls /root/nanoclaw-v2/scripts/solve-recaptcha-enterprise.sh /root/nanoclaw-v2/scripts/solve-funcaptcha.sh /root/nanoclaw-v2/scripts/cdp-click.js /root/nanoclaw-v2/scripts/cdp-cookies.js
```

## Ad-hoc container indítás

A worker-LLM-et NEM piszkáljuk. Egyszer használatos container:

```bash
mkdir -p /root/nanoclaw-v2/data/<persona>-reg-workspace
chown 1000:1000 /root/nanoclaw-v2/data/<persona>-reg-workspace

docker run -d --name <persona>-reg \
  --entrypoint sleep \
  -e BT_REDDIT_USERNAME="$USERNAME" \
  -e BT_REDDIT_PASSWORD="$PASSWORD" \
  -e BT_REDDIT_PROXY="$PROXY" \
  -e CAPSOLVER_API_KEY="$CAPSOLVER" \
  -e NO_PROXY="localhost,127.0.0.1" \
  -v /root/nanoclaw-v2/scripts/cdp-click.js:/usr/local/lib/cdp-click.js:ro \
  -v /root/nanoclaw-v2/scripts/cdp-cookies.js:/usr/local/lib/cdp-cookies.js:ro \
  -v /root/nanoclaw-v2/scripts/solve-recaptcha-enterprise.sh:/usr/local/bin/solve-recaptcha-enterprise.sh:ro \
  -v /root/nanoclaw-v2/scripts/solve-funcaptcha.sh:/usr/local/bin/solve-funcaptcha.sh:ro \
  -v /root/nanoclaw-v2/data/<persona>-reg-workspace:/workspace/agent \
  --user 1000:1000 \
  nanoclaw-agent-v2-454ebe7e:latest 3600
```

A `latest:3600` = 1 órás session. Bőven elég. Cleanup `docker rm -f <persona>-reg` a végén.

## Browser-flow: stealth-browse + persistent profile

```bash
# Persistent user-data-dir, hogy a browser-session ne tűnjön el ha valamiért visszaesünk
docker exec -e STEALTH_USER_DATA_DIR=/workspace/agent/.chrome-<persona> <persona>-reg \
  stealth-browse open "https://<platform>/register/" --proxy "$PROXY"
```

A `STEALTH_USER_DATA_DIR` kritikus: alap stealth-browse ephemeral, a registráció közben elveszne a cookie + state.

## Snapshot + interaction loop

Standard ciklus minden lépésnél:

1. **Screenshot** (vizuális verify Tomi-nak):
   ```bash
   docker exec <persona>-reg stealth-browse screenshot /workspace/agent/step-N.png
   # Aztán a host-on: Read /root/nanoclaw-v2/data/<persona>-reg-workspace/step-N.png
   ```

2. **Snapshot** (interactive elements):
   ```bash
   docker exec <persona>-reg stealth-browse snapshot
   ```

3. **Input fill** (shadow-DOM aware, lásd lent)

4. **Continue/submit click** — JS `.click()` először, ha nem megy CDP coord-click

5. **Wait 3-8s** post-click hogy a következő lépés betöltse a DOM-ot

## Shadow-DOM input fill (Reddit-féle faceplate-text-input)

A `faceplate-text-input` web-componentnek `<input>` ChildNode-ja shadow-root-ban él. A stealth-browse `fill <selector>` ezt nem találja. Megoldás:

```javascript
// Walk DOM-on át, shadow-root-okkal együtt
function setShadowInput(name, value) {
  function find(root) {
    if (!root) return null;
    if (root.tagName === "INPUT" && root.name === name) return root;
    if (root.shadowRoot) { let r = find(root.shadowRoot); if (r) return r; }
    for (let c of root.children || []) { let r = find(c); if (r) return r; }
    return null;
  }
  const inp = find(document.body);
  if (!inp) return { ok: false };
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  inp.focus();
  setter.call(inp, value);
  inp.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  inp.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  inp.blur();
  return { ok: true, value: inp.value };
}
```

Bash-ból:

```bash
docker exec <persona>-reg stealth-browse eval '(function(){ ... setShadowInput(...) ... })()'
```

**Top-level `const X = ...` SOHA** — a stealth-browse JS context perzisztens, és ugyanazon a kontextusban `const` re-declare → SyntaxError. **Mindig IIFE-be wrap-old**: `(function(){ const x = ...; return x; })()`.

## Captcha — reCAPTCHA Enterprise minta

```bash
# 1) Sitekey + action extraction
docker exec <persona>-reg stealth-browse eval '(function(){
  const iframe = document.querySelector("iframe[src*=recaptcha]");
  const p = new URLSearchParams(iframe?.src?.split("?")[1] || "");
  return JSON.stringify({sitekey: p.get("k"), action: decodeURIComponent(p.get("sa") || "")});
})()'

# 2) CapSolver solve
TOKEN=$(docker exec <persona>-reg sh -c \
  "solve-recaptcha-enterprise.sh '<page-url>' '<sitekey>' '$PROXY' '<action>'" \
  | tail -1)

# 3) Inject token (textarea + grecaptcha monkey-patch)
docker exec -e TOK="$TOKEN" <persona>-reg sh -c 'stealth-browse eval "(function(){
  var tok = \"$TOK\";
  document.querySelectorAll(\"textarea[name=g-recaptcha-response]\").forEach(t => { t.style.display=\"\"; t.value=tok });
  if (window.grecaptcha) {
    window.grecaptcha.getResponse = () => tok;
    if (window.grecaptcha.enterprise) window.grecaptcha.enterprise.getResponse = () => tok;
  }
  return \"injected\";
})()"'
```

**A token EGYSZER használható**. Ha "Something went wrong" / "Please try again" → kérj újat, NE próbáld újra ugyanazzal.

FunCaptcha (Arkose) flow-hoz lásd `solve-funcaptcha.sh` minta (Bluesky, FB-Messenger esetén).

## CDP coord-click — shadow-DOM Continue gomb

A faceplate-féle web-component-ek Continue gombja **pixel-szinten látható**, de a JS-szintű DOM-lekérdezésen `offsetParent: null`, `rect: 0x0`, és néha `b.click()` sem megy át a shadow-DOM eseménybubbling-en. CDP coord-click megoldja:

```bash
# CDP port a stealth-browser-state.json-ban
CDP=$(docker exec <persona>-reg jq -r .cdpPort /tmp/stealth-browser-state.json)

# Click a gomb pixel-koordinátáin (1920×1080 default viewport-on)
# A koordinátát screenshot-ról olvasd: a gomb középső pontja
docker exec -e CDP_PORT=$CDP <persona>-reg node /usr/local/lib/cdp-click.js <X> <Y>
```

A standard register-modal Continue gomb 1920×1080 viewport-on jellemzően kb. (959, 777). Birthday confirm modal-on hasonló pozíció.

## Email-verify (IMAP-poll)

Ha a platform OTP-kódot küld email-be, `helpers/imap-poll.py` reusable poll-script — 5 perc max, 8-mp ciklus, minden mappa végigjárása:

```bash
python3 /root/nanoclaw-v2/.claude/skills/register-account/imap-poll.py \
  --email <user@domain> \
  --from-filter reddit \
  --code-regex '\b(\d{6})\b' \
  --imap-host imap.zoho.eu \
  --imap-port 993 \
  --password-env-key BULLTRAPP_EMAIL_PASSWORD \
  --max-seconds 300
```

A script:
- Backgrounds-ben futtatható (`run_in_background: true` a Bash-tool-hoz)
- Exit 0 + stdout-on `CODE_FOUND ... code=NNNNNN` ha találat
- Exit 1 + `TIMEOUT no code` ha nem jött meg

**Ha 5 perc + 1 manual Resend-click után sem érkezik meg az email**:
- Verify-eld hogy az IMAP-ba **más email** megérkezik-e (pl. más friss inbox-aktivitás látszik-e). Ha igen → a platform aktívan silent-dropja.
- Reddit-jellegű platformokon ilyenkor **a `Skip` gomb** működik. Az account low-rep árnyalattal indul de létrejön.
- 24-48h múlva az email-cím settings-ben utólag is rögzíthető.

## Cookie dump + state.json persist (post-success)

```bash
# Cookie dump CDP-vel
CDP=$(docker exec <persona>-reg jq -r .cdpPort /tmp/stealth-browser-state.json)
docker exec -e CDP_PORT=$CDP <persona>-reg node /usr/local/lib/cdp-cookies.js > /tmp/<persona>-cookies-raw.json

# Move host-side, host-mountolható helyre
cp /tmp/<persona>-cookies-raw.json /root/nanoclaw-v2/groups/<group>/.<platform>-cookies-<username>.json
chown 1000:1000 /root/nanoclaw-v2/groups/<group>/.<platform>-cookies-<username>.json
chmod 600 /root/nanoclaw-v2/groups/<group>/.<platform>-cookies-<username>.json

# Verify auth-cookies a dumpban
python3 -c "
import json
d = json.load(open('/root/nanoclaw-v2/groups/<group>/.<platform>-cookies-<username>.json'))
names = {c['name'] for c in d}
# Platform-szerinti kötelező cookie-k:
# Reddit: reddit_session, token_v2, loid
# X: auth_token, ct0
# FB: c_user, xs
# Bluesky: <none — JWT in JSON>
expected = {'reddit_session','token_v2','loid'}  # vagy ami a platformhoz tartozik
print('auth_present:', expected <= names)
"
```

State.json update standard pattern:

```python
import json, datetime, shutil
path = '/root/nanoclaw-v2/groups/<group>/<context>/state.json'
shutil.copy(path, path + '.bak-pre-<persona>-active')
d = json.load(open(path))
p = d.setdefault('<platform>', {})  # pl. 'reddit', 'x', 'facebook'
now = datetime.datetime.now().astimezone().isoformat(timespec='seconds')
p['account_status'] = 'active'
p['username_active'] = '<username>'
p['registered_at'] = now
p['ip_at_creation'] = '<ip>'
p['ip_geo_at_creation'] = '<city, region, country (ASN)>'
p['proxy_session_at_creation'] = '<session-id>'
p['proxy_port_at_creation'] = <port>
p['cookies_file'] = '/workspace/.<platform>-cookies-<username>.json'
log = p.setdefault('registration_attempt_log', [])
log.append({
    'ts': now,
    'step': 'registration_complete',
    'outcome': 'success',
    'username': '<username>',
    'method': '<short summary of flow>',
    'note': '<email verify skipped? captcha solved? edge cases?>',
})
json.dump(d, open(path,'w'), indent=2)
```

Aztán `.secrets`-ben frissítsd a `BT_<PLATFORM>_PROXY`-t arra a port+session kombinációra ami a registrációkor működött (hogy a warmup ugyanazt használja):

```bash
sed -i -E 's|^(BT_<PLATFORM>_PROXY=").*"|\1<new-proxy>"|' /root/nanoclaw-v2/groups/<group>/.secrets
```

## Cleanup

```bash
docker rm -f <persona>-reg
```

A workspace mappát (`data/<persona>-reg-workspace/`) HAGYD MEG egy ideig — a `.chrome-<persona>` user-data-dir tartalmazza a Chrome-profilt ami később hasznos lehet ha re-login kell. Pár nap múlva, vagy a warmup-flow stabilizálódása után törölhető.

## Reddit playbook (Lloyd-flow 2026-05-12, részletes)

A teljes flow a fenti generic blokkok mintájában:

| Lépés | Művelet | Megjegyzés |
|-------|---------|------------|
| 1 | Email-fill `#register-email` + click Continue (`@e5`) | Standard `stealth-browse fill` + `click` működik az első lépésen |
| 2 | OTP-page → 5 perc IMAP-poll | Ha 0 email → **Skip** gomb (DOM-walk minden buttonok között `text==="Skip"`) |
| 3 | Username-fill `#register-username` + password-fill `#register-password` | Password-fill output-ját `sed -E 's/Filled ".*"/Filled "<REDACTED>"/'`-szel maszkold |
| 4 | Continue → reCAPTCHA Enterprise jelenik meg | Sitekey extraction iframe `?k=` paraméterből, action `?sa=` paraméterből (URI-decode!) |
| 5 | CapSolver solve + token injection | Action `register_email_verify_initialize` legtöbb lépésen jó |
| 6 | DOB form (Month/Day/Year shadow-DOM input) | `setShadowInput("month"/"day"/"year", ...)` JS-en át. Continue gomb 0x0 rect → **CDP coord-click (959, 777)** |
| 7 | Birthday confirm modal | "Yes, Confirm" gomb (959, 777) |
| 8 | "About you" (gender) | "Man" pozíció kb. (959, 439) — koordináta screenshot-on mérendő |
| 9 | "Choose your interests" (3 ikonos választás) | 12 kategória 3×4 rácsban, közép-pozíciók: col-x ≈ {812, 910, 1008, 1106}, sor-y ≈ {350, 470, 580} |
| 10 | "Customize your feed" (topic chips) | Lloyd: Crypto/Investing/StockMarket/SoftwareEng/Entrepreneurship/AI/PersonalFinance/SoftwareDev — koordináták screenshot-ról |
| 11 | Final Continue → URL `/register/` → `/` | A `/` URL = success, fiók logged-in. Verify `https://www.reddit.com/user/<username>/` 200-as page-t ad |

Auth cookies amik megvannak post-registrationre:
- `reddit_session` (auth)
- `token_v2` (refresh)
- `loid` (logged-out-id, persistent device fingerprint)
- `csrf_token`, `edgebucket`, `g_state`, `reddit_chat_view`, `reddit_supported_media_codecs`, `session_tracker`

A 10-darabból az első 3 a logged-in-marker. Cookie-dump 5-6 KB jellemzően.

## Más platformra adaptálás

A flow általános, a változó részek:

| Platform | sitekey-helye | captcha-típus | OTP-küldés | Cookie auth-marker |
|----------|---------------|---------------|------------|-------------------|
| Reddit | iframe `?k=` | reCAPTCHA Enterprise | email | reddit_session + token_v2 + loid |
| X (Twitter) | inline JS data-sitekey | FunCaptcha (Arkose) | email/SMS | auth_token + ct0 |
| Facebook | data-sitekey attr | FunCaptcha (Arkose) | email/SMS | c_user + xs + datr |
| Bluesky | n/a (no captcha) | n/a | email | JWT JSON (nem cookie) |
| Google | reCAPTCHA Enterprise + behavior heuristics | reCAPTCHA + phone-verify | phone (kötelező) | __Secure-3PSID, SAPISID, … |

**Google strukturálisan blokkolt** stealth-browse-zal (5 attempt után anti-bot ML-modell minden flow-t bedob). Lloyd-flow 2026-05-07 dokumentálta — Google account-creation NEM járható út, kerüld.

Google nélkül a Reddit/X/FB/Bluesky mind működik ezzel a flow-val. A platform-specifikus deep-dive a `groups/<group>/<context>/platforms/<platform>.md` doks-okban legyen (Lloyd-flow: `groups/worker/bulltrapp/platforms/reddit.md`, Dani-flow: `groups/worker/rezerver/platforms/reddit.md`).

## Pitfalls — gyors checklist

- [ ] Email-cím IMAP-login-OK?
- [ ] SPF tisztított (no broken include)?
- [ ] Proxy IP residential ASN (NEM Level3/Cogent/Cloudflare)?
- [ ] Sticky session stabil 3+ hívásra?
- [ ] CapSolver kvóta ELÉG van? (>$1 jellemzően elég 5-10 attempt-re)
- [ ] Container `STEALTH_USER_DATA_DIR` env-vel indul?
- [ ] Eval-snippet IIFE-be wrap-olva (no top-level `const`)?
- [ ] Captcha token EGYSZER használható — error után új token kell?
- [ ] CDP coord-click pixel-koordináta screenshot-ról mérve (NEM találd ki)?
- [ ] Email-verify SKIP-pelve ha 5+ perc 0 email?
- [ ] Cookie-dump auth-marker cookies-t tartalmaz?
- [ ] State.json + .secrets BT_<PLATFORM>_PROXY updated?
- [ ] Container teardown a végén?

## Hivatkozott memóriák

- `feedback_capsolver_reddit_recaptcha.md` — CapSolver-specifikus quirks
- `feedback_shadow_dom_coord_click.md` — CDP-click shadow-DOM-on
- `feedback_chrome_136_remote_debug_port.md` — Chrome 136+ stealth-browse port=0 + user-data-dir
- `feedback_stealth_browse_mobile_paranoid.md` — mobile persona + paranoid timing (stricter sites)
- `feedback_stealth_proxy_mandatory.md` — proxy + stealth együtt kötelező bot-detektált oldalakon
- `feedback_proxy_http_prefix.md` — DataImpulse proxy URL formátum
- `project_lloyd_reddit_pending_spf_fix.md` — full 2026-05-12 Lloyd-flow lessons
