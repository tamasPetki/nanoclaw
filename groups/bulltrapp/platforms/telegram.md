# Telegram Web K — Stealth Browser Referencia

> Minden Telegram művelet a stealth browser-rel történik (`web.telegram.org/k/`).
> Proxy KÖTELEZŐ. Linkekre klikkelni TILOS. DM-ekre válaszolni TILOS.

## Session restore

A Telegram Web K a session-t **localStorage**-ban tárolja. Kritikus kulcs: `user_auth` — enélkül nem működik a restore.

```bash
source /workspace/group/.secrets
# Session JSON a TELEGRAM_WEB_SESSION env var-ban van (base64)
SESSION_JSON=$(echo "$TELEGRAM_WEB_SESSION" | base64 -d)

stealth-browse open about:blank
stealth-browse open "https://web.telegram.org/k/"
# Várd meg az oldal betöltését (3 sec)

# Inject localStorage
stealth-browse eval "(function(){var d=$SESSION_JSON;Object.keys(d).forEach(function(k){localStorage.setItem(k,d[k])});return 'OK';})()"

# Reload — az app felveszi a session-t
stealth-browse open "https://web.telegram.org/k/"
# Várd meg a betöltést (10-12 sec)
```

### Login ellenőrzés

```javascript
// Bejelentkezve?
!!document.querySelector(".input-search")  // true = bejelentkezve

// VAGY: van-e chat list
document.querySelectorAll(".chatlist-chat").length  // >0 = bejelentkezve
```

Ha a login screen jelenik meg (`document.body.innerText` tartalmazza: "Log in to Telegram"), a session lejárt — jelezd Discord-on.

## Navigáció

### Csoport megnyitása

**URL hash-sel** (legmegbízhatóbb):
```bash
stealth-browse open "https://web.telegram.org/k/#@groupname"
# VAGY peer ID-vel:
stealth-browse open "https://web.telegram.org/k/#-1151183138"
```

**tg:// resolve-val** (ha ismered a @username-t):
```bash
stealth-browse open "https://web.telegram.org/k/#?tgaddr=tg%3A%2F%2Fresolve%3Fdomain%3Dgroupname"
```

### Csoport keresés

```javascript
// 1. Focus search bar
var s = document.querySelector(".input-search input");
s.focus(); s.click();
```
```bash
# 2. Type search term
stealth-browse type "crypto trading"
# Várd meg az eredményeket (3-5 sec)
```
```javascript
// 3. Olvasd ki az eredményeket
var items = document.querySelectorAll("[data-peer-id]");
items.forEach(function(el) {
  var title = el.querySelector(".peer-title");
  var peerId = el.dataset.peerId;
  // peerId negatív = csoport/channel, pozitív = user
});
```

### Csoport csatlakozás (JOIN)

```javascript
// Keress JOIN gombot
var btns = document.querySelectorAll("button");
btns.forEach(function(b) {
  if (b.textContent.trim() === "JOIN") b.click();
});
```

## Üzenet küldés

### DOM selectorok

| Elem | Selector | Megjegyzés |
|------|----------|-----------|
| Üzenet input | `.input-message-input` | contenteditable div |
| Send gomb | `.btn-send` | Vagy Enter billentyű |
| Üzenetek | `.bubble` | Chat buborékok |
| Chat cím | `.chat-info .peer-title` | Csoport neve |
| Sidebar search | `.input-search input` | Keresőmező |
| Chat list elemek | `.chatlist-chat` | Sidebar chat lista |
| Peer ID | `[data-peer-id]` | Negatív = csoport |

### Üzenet írás flow

```bash
# 1. Focus input
stealth-browse eval "var i=document.querySelector('.input-message-input'); i.focus(); i.click();"
sleep 1

# 2. Type (human-like delays)
stealth-browse type "message text here"
sleep 2

# 3. Send (Enter)
stealth-browse eval "
  var input = document.querySelector('.input-message-input');
  input.focus();
  var e = new KeyboardEvent('keydown', {key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true});
  input.dispatchEvent(e);
"
```

**FONTOS**: Az input mező bounding rect-je `0x0` lehet ha a chat panel nem aktív. Ellenőrizd:
```javascript
var rect = document.querySelector(".input-message-input").getBoundingClientRect();
// Ha rect.width === 0 → a chat panel nem nyílt meg rendesen
```

### Üzenet ellenőrzés

```javascript
// Utolsó üzenet kiolvasása
var bubbles = document.querySelectorAll(".bubble");
var last = bubbles[bubbles.length - 1];
last ? last.querySelector(".message").textContent : "no messages";
```

## Ismert gotchák

### WebSocket nem működik proxy nélkül
A VPS-ről közvetlen WebSocket connection a Telegram szerverhez NEM működik. **Proxy KÖTELEZŐ** — amúgy a QR login scan megerősítése nem érkezik meg, és az app nem tud real-time kommunikálni.

### QR login NEM renderelődik proxy-val
A QR kód csak proxy nélkül jelenik meg. **OTP login használandó proxy-val.** QR login csak ha a proxy-t átmenetileg kikapcsoljuk.

### localStorage dump: `user_auth` kulcs kritikus
Korábbi dump-ok (login befejezése előtt készültek) nem tartalmazták a `user_auth` kulcsot → restore sikertelen. **Mindig várj 10+ másodpercet a login után** mielőtt dump-olsz.

### Új account warmup
Új Telegram account + sok login + azonnali group join + üzenet = instant limit. **Fokozatos engagement kötelező** — lásd CLAUDE.md warmup terv.

### Stale lock fájlok (STEALTH_USER_DATA_DIR használatakor)
Ha persistent Chrome profilt használsz, container restart után stale `SingletonLock` fájl maradhat:
```bash
rm -f /persist/.chrome-profile/SingletonLock /persist/.chrome-profile/SingletonSocket /persist/.chrome-profile/SingletonCookie
```

### Container-ek közötti állapot
Minden `stealth-browse` parancs **ugyanazon a Chrome-on** belül fut (state file). De a container leállásakor a Chrome meghal. Következő container induláskor: session restore → reload → kész.
