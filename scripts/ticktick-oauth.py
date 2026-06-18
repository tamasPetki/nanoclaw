#!/usr/bin/env python3
"""TickTick OAuth2 helper for the mcp-ticktick integration.

karbassi/mcp-ticktick has no built-in auth command, so we run the standard
OAuth2 authorization-code flow by hand:

  1) url      — print the authorize URL; Tomi opens it, logs in, approves.
                TickTick redirects to <redirect_uri>?code=XXX&state=YYY.
                The redirect_uri does NOT need to load — just copy the `code`
                from the browser address bar.
  2) exchange — swap that code for an access_token (+ refresh_token).

Usage:
  ./ticktick-oauth.py url      --client-id <ID> [--redirect-uri <URI>]
  ./ticktick-oauth.py exchange --client-id <ID> --client-secret <SECRET> \
                               --code <CODE> [--redirect-uri <URI>]

Default redirect_uri is http://localhost:8080/callback — register EXACTLY this
URI in the TickTick app (https://developer.ticktick.com/manage), or pass your own
with --redirect-uri (must match the registered one byte-for-byte).
"""
import argparse
import base64
import json
import sys
import urllib.parse
import urllib.request

AUTHORIZE = "https://ticktick.com/oauth/authorize"
TOKEN = "https://ticktick.com/oauth/token"
SCOPE = "tasks:write tasks:read"
DEFAULT_REDIRECT = "http://localhost:8080/callback"


def build_url(client_id, redirect_uri):
    q = urllib.parse.urlencode({
        "client_id": client_id,
        "scope": SCOPE,
        "state": "nanoclaw",
        "redirect_uri": redirect_uri,
        "response_type": "code",
    })
    return f"{AUTHORIZE}?{q}"


def exchange(client_id, client_secret, code, redirect_uri):
    body = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "scope": SCOPE,
        "redirect_uri": redirect_uri,
    }).encode()
    basic = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    req = urllib.request.Request(TOKEN, data=body, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    req.add_header("Authorization", f"Basic {basic}")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)

    u = sub.add_parser("url")
    u.add_argument("--client-id", required=True)
    u.add_argument("--redirect-uri", default=DEFAULT_REDIRECT)

    e = sub.add_parser("exchange")
    e.add_argument("--client-id", required=True)
    e.add_argument("--client-secret", required=True)
    e.add_argument("--code", required=True)
    e.add_argument("--redirect-uri", default=DEFAULT_REDIRECT)

    a = p.parse_args()
    if a.cmd == "url":
        print(build_url(a.client_id, a.redirect_uri))
    else:
        try:
            tok = exchange(a.client_id, a.client_secret, a.code, a.redirect_uri)
        except urllib.error.HTTPError as ex:
            print(f"HTTP {ex.code}: {ex.read().decode()}", file=sys.stderr)
            sys.exit(1)
        print(json.dumps(tok, indent=2, ensure_ascii=False))
        if "access_token" in tok:
            print("\n--- add ezeket a .env-be ---", file=sys.stderr)
            print(f"TICKTICK_ACCESS_TOKEN={tok['access_token']}", file=sys.stderr)
            if tok.get("refresh_token"):
                print(f"TICKTICK_REFRESH_TOKEN={tok['refresh_token']}", file=sys.stderr)


if __name__ == "__main__":
    main()
