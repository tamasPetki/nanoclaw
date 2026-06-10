#!/usr/bin/env python3
"""Universal OAuth token refresher for NanoClaw MCP servers.

Handles every provider whose token file lives somewhere under
/root/nanoclaw-v2 and supports refresh_token-based renewal. Each
provider is a small adapter below; add new ones by appending to PROVIDERS.

If a refresh fails (invalid_grant, missing refresh_token, repeated HTTP
errors) and TELEGRAM_BOT_TOKEN is set, a one-line alert is sent to
Tomi's DM so an MCP outage doesn't go silent until the next manual
interaction.

Idempotent: only refreshes if <REFRESH_THRESHOLD_MIN remain.
"""
import datetime
import json
import os
import sqlite3
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

# ── Config ────────────────────────────────────────────────────────────────────
NANOCLAW_ROOT = "/root/nanoclaw-v2"
REFRESH_THRESHOLD_MIN = 30           # refresh if <30 min remaining
ENV_FILE = f"{NANOCLAW_ROOT}/.env"
CENTRAL_DB = f"{NANOCLAW_ROOT}/data/v2.db"
DEFUNCT_AFTER_DAYS = 3               # group considered defunct if no wiring + no session in N days
TOMI_TELEGRAM = "1243781160"         # Tomi DM chat ID for alerts

# Sentinel state dir so we don't spam Telegram every hour with the same failure.
STATE_DIR = "/var/lib/nanoclaw-token-refresh"


def active_group_folders():
    """Return set of agent-group folders that are alive.

    A group is alive if it has at least one wiring (messaging_group_agents)
    OR has a session with last_active within the last DEFUNCT_AFTER_DAYS.
    Used to skip refresh on consolidated/archived groups so their stale
    refresh_tokens don't trigger noisy 'invalid_grant' alerts forever.

    Returns None if the DB is unreachable — caller should treat all as active
    to avoid silently masking real outages.
    """
    if not os.path.isfile(CENTRAL_DB):
        return None
    cutoff = (datetime.datetime.now(datetime.UTC) - datetime.timedelta(days=DEFUNCT_AFTER_DAYS)).isoformat().replace("+00:00", "Z")
    try:
        conn = sqlite3.connect(f"file:{CENTRAL_DB}?mode=ro", uri=True, timeout=5)
        try:
            rows = conn.execute(
                """
                SELECT DISTINCT ag.folder FROM agent_groups ag
                WHERE EXISTS (SELECT 1 FROM messaging_group_agents WHERE agent_group_id = ag.id)
                   OR EXISTS (SELECT 1 FROM sessions WHERE agent_group_id = ag.id AND last_active >= ?)
                """,
                (cutoff,),
            ).fetchall()
            return {r[0] for r in rows}
        finally:
            conn.close()
    except Exception as e:
        print(f"[active-groups] DB query failed: {e} — refreshing all groups", file=sys.stderr)
        return None


def load_env_var(name):
    """Read a single KEY=value from .env without sourcing the whole file."""
    if not os.path.isfile(ENV_FILE):
        return None
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if line.startswith(f"{name}="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def send_telegram_alert(msg):
    token = load_env_var("TELEGRAM_BOT_TOKEN")
    if not token:
        print(f"[alert-skip] no TELEGRAM_BOT_TOKEN: {msg}", file=sys.stderr)
        return
    data = urllib.parse.urlencode({
        "chat_id": TOMI_TELEGRAM,
        "text": f"⚠️ MCP token refresh alert\n\n{msg}",
        "disable_notification": "false",
    }).encode()
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=10)
        print(f"[alert-sent] {msg[:80]}")
    except Exception as e:
        print(f"[alert-fail] {e}: {msg}", file=sys.stderr)


def alert_once(key, msg):
    """Send Telegram alert only if we haven't already alerted on this key
    in the last 6 hours — keeps the channel quiet on persistent breakage."""
    os.makedirs(STATE_DIR, exist_ok=True)
    flag = os.path.join(STATE_DIR, f"alerted-{key}")
    now = time.time()
    if os.path.isfile(flag) and now - os.path.getmtime(flag) < 6 * 3600:
        print(f"[alert-throttled] {key}: already alerted in last 6h")
        return
    send_telegram_alert(msg)
    open(flag, "w").close()
    os.utime(flag, (now, now))


def clear_alert_flag(key):
    flag = os.path.join(STATE_DIR, f"alerted-{key}")
    if os.path.isfile(flag):
        os.remove(flag)


def atomic_write(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f, indent=2)
    os.chmod(tmp, 0o600)
    # Preserve original ownership (token files are read by container UID 1000).
    try:
        st = os.stat(path)
        os.chown(tmp, st.st_uid, st.st_gid)
    except FileNotFoundError:
        pass
    os.rename(tmp, path)


# ── Provider: Google (Drive, Calendar, …) ─────────────────────────────────────
def refresh_google_one(creds, token_obj):
    expiry_ms = int(token_obj.get("expiry_date") or 0)
    now_ms = int(time.time() * 1000)
    remaining_min = (expiry_ms - now_ms) / 60000
    if remaining_min > REFRESH_THRESHOLD_MIN:
        return False, f"valid {remaining_min:.0f}min, skip"
    rt = token_obj.get("refresh_token")
    if not rt:
        return False, "FAIL: no refresh_token"
    data = urllib.parse.urlencode({
        "client_id": creds["client_id"],
        "client_secret": creds["client_secret"],
        "refresh_token": rt,
        "grant_type": "refresh_token",
    }).encode()
    try:
        req = urllib.request.Request(creds["token_uri"], data=data, method="POST")
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:300]
        return False, f"FAIL: HTTP {e.code} {body}"
    except Exception as e:
        return False, f"FAIL: {e}"
    token_obj["access_token"] = result["access_token"]
    token_obj["expiry_date"] = now_ms + int(result.get("expires_in", 3600)) * 1000
    if "refresh_token" in result:
        token_obj["refresh_token"] = result["refresh_token"]
    return True, f"refreshed, valid {result.get('expires_in', '?')}s"


def provider_google():
    oauth_dir = f"{NANOCLAW_ROOT}/data/shared/google-oauth"
    keys_file = f"{oauth_dir}/gcp-oauth.keys.json"
    if not os.path.isfile(keys_file):
        return
    with open(keys_file) as f:
        creds = json.load(f).get("installed") or json.load(open(keys_file)).get("web")
    if not creds:
        print(f"[google] keys file missing 'installed'/'web'")
        return
    for fn in sorted(os.listdir(oauth_dir)):
        if not fn.endswith("_tokens.json"):
            continue
        path = os.path.join(oauth_dir, fn)
        with open(path) as f:
            data = json.load(f)
        changed = False
        had_fail = False
        if isinstance(data, dict) and "access_token" in data:
            ok, msg = refresh_google_one(creds, data)
            print(f"[google/{fn}] flat: {msg}")
            if ok:
                changed = True
            elif "FAIL" in msg:
                had_fail = True
                alert_once(f"google-{fn}", f"google/{fn} refresh failed: {msg}")
        elif isinstance(data, dict):
            for acct, tok in data.items():
                if isinstance(tok, dict) and "access_token" in tok:
                    ok, msg = refresh_google_one(creds, tok)
                    print(f"[google/{fn}] {acct}: {msg}")
                    if ok:
                        changed = True
                    elif "FAIL" in msg:
                        had_fail = True
                        alert_once(f"google-{fn}-{acct}", f"google/{fn}/{acct} refresh failed: {msg}")
        if changed:
            atomic_write(path, data)
        if not had_fail:
            clear_alert_flag(f"google-{fn}")


# ── Provider: Withings ────────────────────────────────────────────────────────
def refresh_withings_one(client_id, client_secret, token_obj):
    expires_at_s = int(token_obj.get("expires_at") or 0)
    now_s = int(time.time())
    remaining_min = (expires_at_s - now_s) / 60
    if remaining_min > REFRESH_THRESHOLD_MIN:
        return False, f"valid {remaining_min:.0f}min, skip"
    rt = token_obj.get("refresh_token")
    if not rt:
        return False, "FAIL: no refresh_token"
    data = urllib.parse.urlencode({
        "action": "requesttoken",
        "grant_type": "refresh_token",
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": rt,
    }).encode()
    try:
        req = urllib.request.Request("https://wbsapi.withings.net/v2/oauth2", data=data, method="POST")
        with urllib.request.urlopen(req, timeout=15) as resp:
            envelope = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return False, f"FAIL: HTTP {e.code} {e.read().decode()[:200]}"
    except Exception as e:
        return False, f"FAIL: {e}"
    # Withings returns { "status": 0, "body": { access_token, refresh_token, expires_in, ... } }
    if envelope.get("status") != 0:
        return False, f"FAIL: status={envelope.get('status')} {envelope.get('error', '')}"
    body = envelope.get("body") or {}
    token_obj["access_token"] = body["access_token"]
    token_obj["refresh_token"] = body.get("refresh_token", rt)
    token_obj["expires_at"] = now_s + int(body.get("expires_in", 10800))
    if "userid" in body:
        token_obj["userid"] = body["userid"]
    return True, f"refreshed, valid {body.get('expires_in', '?')}s"


def provider_withings():
    client_id = load_env_var("WITHINGS_CLIENT_ID")
    client_secret = load_env_var("WITHINGS_CLIENT_SECRET")
    if not client_id or not client_secret:
        return
    groups_dir = f"{NANOCLAW_ROOT}/groups"
    if not os.path.isdir(groups_dir):
        return
    active = active_group_folders()
    for group in sorted(os.listdir(groups_dir)):
        path = os.path.join(groups_dir, group, ".withings", "withings_tokens.json")
        if not os.path.isfile(path):
            continue
        if active is not None and group not in active:
            print(f"[withings/{group}] skip-defunct (no wiring + no session in {DEFUNCT_AFTER_DAYS}d)")
            clear_alert_flag(f"withings-{group}")
            continue
        with open(path) as f:
            data = json.load(f)
        ok, msg = refresh_withings_one(client_id, client_secret, data)
        print(f"[withings/{group}] {msg}")
        if ok:
            atomic_write(path, data)
            clear_alert_flag(f"withings-{group}")
        elif "FAIL" in msg:
            alert_once(f"withings-{group}", f"withings/{group} refresh failed: {msg}")


# ── Main ──────────────────────────────────────────────────────────────────────
PROVIDERS = [
    ("google", provider_google),
    ("withings", provider_withings),
]


def main():
    selected = sys.argv[1:] or [n for n, _ in PROVIDERS]
    for name, fn in PROVIDERS:
        if name in selected:
            try:
                fn()
            except Exception as e:
                print(f"[{name}] provider crashed: {e}", file=sys.stderr)
                alert_once(f"{name}-crash", f"refresh-mcp-tokens.py {name} crashed: {e}")


if __name__ == "__main__":
    main()
