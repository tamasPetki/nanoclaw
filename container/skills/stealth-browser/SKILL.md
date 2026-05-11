---
name: stealth-browser
description: Headed Chrome on virtual display (Xvfb) with human-like mouse/typing for Cloudflare bypass, X reply, directory submissions, registrations. Uses residential proxy + canvas/audio/WebGL fingerprint patches. Optional STEALTH_MOBILE=1 (Pixel 7 Android persona) and STEALTH_PARANOID=1 (×1.8 slower input timing) modes for stricter anti-bot UIs. WebRTC IP-leak prevention default-on.
allowed-tools: Bash(stealth-browse:*), Bash(bash /home/node/.claude/skills/stealth-browser/*:*)
secrets:
  - DISCORD_TOKEN
  - FB_C_USER
  - FB_DATR
  - FB_SB
  - FB_XS
  - FB_LOCALE
  - FB_WD
---

# Stealth Browser — Headed Chrome with Human Input

Use `stealth-browse` when `agent-browser` gets blocked or when you need genuinely human-like interaction (X reply, social posting, registration). It runs **real headed Chrome** on a virtual X display (Xvfb), so JS/canvas/audio fingerprints look identical to a desktop user. Mouse moves use the **WindMouse algorithm** (gravity + wind noise — defeats Pearson-r linearity detection). Typing uses **`Input.dispatchKeyEvent` keyDown/keyUp per character** with **log-normal inter-key intervals** (Aalto 136M keystrokes paper) and ~2% typo+correct — real keystroke dynamics, not synthetic injection. The persona is **Linux x86_64 Chrome 124** to match the headed Chromium TLS/JA4 fingerprint (avoids JA4-vs-UA mismatch).

**THIS IS THE MANDATORY WAY** to interact with X.com via the web UI, registrations, and Cloudflare-protected forms. Do **not** use `agent-browser` for these — it lacks the headed Chrome + WindMouse + keystroke dynamics layer and will get flagged.

## When to use

- **X (Twitter) reply / posting via web UI** — when API is restricted (set X_CT0 + X_AUTH_TOKEN cookies first)
- Directory submissions (ProductHunt, BetaPage, SideProjectors, etc.)
- Sites that show "Just a moment..." / Cloudflare challenge
- Any site that blocks agent-browser
- Registration flows that need to look human

For normal browsing without Cloudflare/bot issues, use `agent-browser` (faster, more features).

## Quick start

```bash
source /workspace/agent/.secrets   # Loads REDDIT_PROXY, X_CT0, X_AUTH_TOKEN
stealth-browse open https://example.com
stealth-browse snapshot            # Get interactive elements with @refs
stealth-browse fill @e2 "text"     # Human typing into element
stealth-browse click @e3           # Bezier mouse + real click
stealth-browse close               # Close when done
```

## Logged-in X (Twitter) flow

```bash
source /workspace/agent/.secrets
# Open about:blank to launch browser, then inject cookies BEFORE first real navigation
stealth-browse open about:blank
stealth-browse cookies x.com auth_token=$X_AUTH_TOKEN ct0=$X_CT0
stealth-browse open https://x.com/home
stealth-browse screenshot /tmp/x-home.png   # Verify you see the timeline
```

**Easy reply via helper script** (handles cookies + flow automatically):
```bash
source /workspace/agent/.secrets
bash /home/node/.claude/skills/stealth-browser/x-reply.sh \
  "https://x.com/jack/status/123456" \
  "great point, thanks for sharing"
```
The helper writes screenshots to `/tmp/x-reply-<timestamp>/` so you can verify what happened. Exit code 0 = modal closed cleanly (likely sent), exit 2 = modal still open (rate limit, restricted, or text rejected).

**Manual reply** (for edge cases):
```bash
stealth-browse open https://x.com/SOMEONE/status/123456
stealth-browse snapshot                # Note the testid="..." entries
# Click reply via data-testid (language-independent):
stealth-browse click '[data-testid="reply"]'
sleep 2
stealth-browse click '[data-testid="tweetTextarea_0"]'
stealth-browse type "your reply text here"
stealth-browse click '[data-testid="tweetButton"]'
```

**Note on UI language:** if the X account is set to non-English, the snapshot's `aria=` and visible-text fields will be in that language. **Always use `data-testid` selectors** for X — they are language-independent.

## Commands

### Navigation
```bash
stealth-browse open <url>                    # Open URL (auto-waits for Cloudflare)
stealth-browse open <url> --proxy user:pass@host:port  # Explicit proxy
stealth-browse close                         # Kill browser
```

### Snapshot (interactive elements)
```bash
stealth-browse snapshot                      # List all interactive elements with @refs
```

Output format:
```
[@e1] input[type=text] name="title" placeholder="Project name"  {#title}
[@e2] textarea name="description"  {textarea[name="description"]}
[@e3] button "Submit"  {#submit-btn}
```

### Interactions (use @refs or CSS selectors)
```bash
stealth-browse fill @e1 "BullTrapp"          # Clear and type
stealth-browse click @e3                     # Click
stealth-browse type "some text"              # Type via keyboard (no selector)
stealth-browse press Enter                   # Press key
stealth-browse select @e4 "Finance"          # Select dropdown
stealth-browse scroll down 500               # Scroll
```

### Information
```bash
stealth-browse get text @e1                  # Element text
stealth-browse get html @e1                  # Element HTML
stealth-browse get url                       # Current URL
stealth-browse get title                     # Page title
stealth-browse eval "document.title"         # Run JavaScript
```

### Wait
```bash
stealth-browse wait 3000                     # Wait milliseconds
stealth-browse wait --text "Success"         # Wait for text
stealth-browse wait --url "dashboard"        # Wait for URL
stealth-browse wait --load                   # Wait for page load
```

### Screenshot
```bash
stealth-browse screenshot                    # Save to /tmp/
stealth-browse screenshot form.png           # Save to path
```

## Proxy

The proxy is auto-detected from environment (in priority order):
1. `--proxy` flag
2. `STEALTH_PROXY` env var
3. `REDDIT_PROXY` env var (DataImpulse residential proxy)

Always `source /workspace/agent/.secrets` before using to load proxy credentials.

## Anti-detection features

- **Headed Chrome on Xvfb** — not `--headless`. Real desktop Chromium running on a virtual 1920x1080 X display (mobile mode: 412×915), so JS-detectable headless markers are gone.
- `navigator.webdriver = false`, persona-matched `platform`, `hardwareConcurrency = 8`, `deviceMemory = 8`
- **Desktop persona** (default): User-Agent `Linux x86_64 Chrome 124`, platform=`Linux x86_64`, JA4-fingerprint matched (Chromium on Linux)
- **Mobile persona** (`STEALTH_MOBILE=1`): User-Agent `Pixel 7 Android 14 Chrome 124`, platform=`Linux armv81`, viewport 412×915, DPR 2.625, 5 touch points, ANGLE/Mali-G710 WebGL renderer, separate user-data-dir
- Chrome plugins present (5 PDF-style entries like real Chrome)
- **WebGL** persona-matched: desktop = Mesa Intel, mobile = ARM/Mali-G710
- **Canvas fingerprint noise**: per-pixel LSB jitter on `toDataURL`/`getImageData`
- **AudioContext noise**: tiny per-100-sample drift in `getChannelData`
- **Battery API removed** (Chrome 124+ removed it; presence is a flag)
- Screen colorDepth=24, userAgentData brands persona-matched
- **WebRTC IP-leak prevention**: Chrome flag `--webrtc-ip-handling-policy=disable_non_proxied_udp` + JS RTCPeerConnection patch
- **Bezier mouse movement** (WindMouse): 15-60 waypoints with perpendicular arc + jitter
- **Gaussian typing**: ~95ms ± 40ms per char, punctuation/space pauses, 4% "thinking" delays
- **Paranoid timing** (`STEALTH_PARANOID=1`): all gauss-distributed delays scaled ×1.8 (slower hover/click/type/post-action)
- Permissions query patched, stack trace sanitized
- Residential proxy via CDP `Fetch.continueWithAuth`

## Personas + env flags

| Env | Default | Effect |
|---|---|---|
| `STEALTH_MOBILE=1` | off | Pixel 7 Android Chrome 124 persona (mobile UA, 412×915 viewport, touch events, ARM WebGL, separate user-data-dir) |
| `STEALTH_PARANOID=1` | off | All gauss-timing scaled ×1.8 (slower human-input pacing for stricter sites) |
| `STEALTH_USER_DATA_DIR=<path>` | (auto) | Persistent profile path (overrides default ephemeral dir). Use when site needs cookie + LocalStorage continuity (Telegram Web, multi-session flows) |
| `STEALTH_DISPLAY=:N` | `:99` | Xvfb display number |
| `STEALTH_PROXY=<url>` | (none) | Proxy URL fallback when `--proxy` flag not given |

**Combo example** (banking, social signup, strict anti-bot UI):
```bash
STEALTH_MOBILE=1 STEALTH_PARANOID=1 stealth-browse open https://example.com
```

## Known limitations — what stealth-browse CANNOT bypass

1. **Google account creation** — Google's mobile-only sign-up flow ends at native carrier-attestation `Send SMS` modal (`pnv_flow=2`). The flow does NOT offer a phone-input field; it expects the device's actual SIM to send an SMS to a Google-specified number. URL hack to `pnv_flow=1` shows the same `Loading… Try Again` state. Stealth-browse cannot trigger native `tel:` schema. **Verified 2026-05-07 across 5 attempts** — `signup/error/1` instant-flag on desktop persona, `Send SMS` carrier-attestation dead-end on mobile persona. Use a real device for Google account creation, or a SMS-receiving service (smsactivate.org, 5sim.net) integration as a future skill.
2. **Phone-verify modals** in general — any flow that requires SIM-level identification (sending FROM the user's number, not just receiving). Google, Apple, banking, and some social platforms use these.
3. **CapSolver-resistant captchas** — Google reCAPTCHA Enterprise account-creation flow has been hardened beyond CapSolver's typical solve-rate. Reddit reCAPTCHA Enterprise during signup IS solvable (verified 2026-04-25 with u/dani_horeca + 2026-05-07 manual Lloyd attempt path).
4. **Platforms requiring a verified phone history** (e.g., WhatsApp registration) — same SIM-level barrier as Google.

## Browser persistence

The browser stays running between commands (state in `/tmp/stealth-browser-state.json`). Always `stealth-browse close` when done to free resources.

## Example: Directory submission

```bash
source /workspace/agent/.secrets

# Open the submission page (proxy auto-loaded from REDDIT_PROXY)
stealth-browse open https://www.sideprojectors.com/submit
stealth-browse snapshot

# Fill the form using @refs from snapshot
stealth-browse fill @e1 "BullTrapp"
stealth-browse fill @e2 "https://bulltrapp.com"
stealth-browse fill @e3 "Multi-asset portfolio tracker for crypto, stocks, and Polymarket positions"
stealth-browse select @e4 "Finance"
stealth-browse click @e5

# Verify submission
stealth-browse wait --load
stealth-browse screenshot submission-result.png
stealth-browse get title

stealth-browse close
```
