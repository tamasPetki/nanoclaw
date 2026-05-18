#!/usr/bin/env python3
"""Refresh Google OAuth tokens for NanoClaw MCP servers.

Walks /root/nanoclaw-v2/data/shared/google-oauth/*_tokens.json and refreshes
any access_token expiring within REFRESH_THRESHOLD_MS, using the
gcp-oauth.keys.json credentials in the same directory.

Handles two on-disk shapes:
  - Flat (drive_tokens.json):   {access_token, refresh_token, expiry_date, ...}
  - Nested (gcal_tokens.json):  {"<account>": {access_token, refresh_token, ...}, ...}

Idempotent: prints a one-line status per token and only rewrites the file if
something actually changed. Designed to run under systemd-timer once per hour;
no agent involvement.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

OAUTH_DIR = "/root/nanoclaw-v2/data/shared/google-oauth"
KEYS_FILE = os.path.join(OAUTH_DIR, "gcp-oauth.keys.json")
REFRESH_THRESHOLD_MS = 30 * 60 * 1000  # refresh if <30 min remaining


def load_creds():
    with open(KEYS_FILE) as f:
        keys = json.load(f)
    inner = keys.get("installed") or keys.get("web")
    if not inner:
        raise SystemExit(f"ERROR: {KEYS_FILE} has neither 'installed' nor 'web'")
    return inner


def refresh_one(creds, token_obj):
    """Refresh a single token dict in place. Returns (changed, status_string)."""
    expiry_ms = int(token_obj.get("expiry_date") or 0)
    now_ms = int(time.time() * 1000)
    remaining_ms = expiry_ms - now_ms
    if remaining_ms > REFRESH_THRESHOLD_MS:
        return False, f"valid for {remaining_ms // 60000} min, skip"
    rt = token_obj.get("refresh_token")
    if not rt:
        return False, "no refresh_token — cannot refresh"
    data = urllib.parse.urlencode(
        {
            "client_id": creds["client_id"],
            "client_secret": creds["client_secret"],
            "refresh_token": rt,
            "grant_type": "refresh_token",
        }
    ).encode()
    req = urllib.request.Request(creds["token_uri"], data=data, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:200]
        return False, f"HTTP {e.code}: {body}"
    except Exception as e:  # network glitch, DNS, etc.
        return False, f"refresh failed: {e}"
    token_obj["access_token"] = result["access_token"]
    token_obj["expiry_date"] = now_ms + int(result.get("expires_in", 3600)) * 1000
    if "refresh_token" in result:
        token_obj["refresh_token"] = result["refresh_token"]
    return True, f"refreshed, valid {result.get('expires_in', '?')}s"


def process_file(path, creds):
    name = os.path.basename(path)
    with open(path) as f:
        data = json.load(f)

    changed = False
    if isinstance(data, dict) and "access_token" in data:
        c, msg = refresh_one(creds, data)
        print(f"[{name}] flat: {msg}")
        if c:
            changed = True
    elif isinstance(data, dict):
        for acct, tok in data.items():
            if isinstance(tok, dict) and "access_token" in tok:
                c, msg = refresh_one(creds, tok)
                print(f"[{name}] {acct}: {msg}")
                if c:
                    changed = True
    else:
        print(f"[{name}] unrecognized shape, skipping")
        return

    if changed:
        # Write atomically: temp file in same dir, then rename. Keeps the
        # consumer (the MCP server) from ever observing a half-written file.
        tmp = path + ".tmp"
        with open(tmp, "w") as f:
            json.dump(data, f, indent=2)
        os.chmod(tmp, 0o600)
        os.rename(tmp, path)


def main():
    if not os.path.isdir(OAUTH_DIR):
        print(f"ERROR: {OAUTH_DIR} not found", file=sys.stderr)
        sys.exit(1)
    creds = load_creds()
    token_files = sorted(
        os.path.join(OAUTH_DIR, f)
        for f in os.listdir(OAUTH_DIR)
        if f.endswith("_tokens.json")
    )
    if not token_files:
        print(f"No *_tokens.json files in {OAUTH_DIR}")
        return
    for path in token_files:
        process_file(path, creds)


if __name__ == "__main__":
    main()
