#!/usr/bin/env python3
"""Fetch full email bodies for given account+UIDs. Output JSON list."""
import imaplib
import json
import os
import sys
import email
from email import policy

ACCOUNTS = {
    "pietscarlet": ("PIETSCARLET_IMAP_HOST", "PIETSCARLET_IMAP_PORT", "PIETSCARLET_IMAP_USER", "PIETSCARLET_IMAP_PASSWORD"),
    "trinkenessen": ("TRINKENESSEN_IMAP_HOST", "TRINKENESSEN_IMAP_PORT", "TRINKENESSEN_IMAP_USER", "TRINKENESSEN_IMAP_PASSWORD"),
    "lupaobol": ("LUPAOBOL_IMAP_HOST", "LUPAOBOL_IMAP_PORT", "LUPAOBOL_IMAP_USER", "LUPAOBOL_IMAP_PASSWORD"),
}


def fetch(account, uids):
    h_env, p_env, u_env, w_env = ACCOUNTS[account]
    host = os.environ[h_env]
    port = int(os.environ.get(p_env, "993"))
    user = os.environ[u_env]
    pwd = os.environ[w_env]
    m = imaplib.IMAP4_SSL(host, port)
    m.login(user, pwd)
    m.select("INBOX", readonly=True)
    out = []
    for uid in uids:
        typ, data = m.uid("fetch", str(uid), "(RFC822)")
        if typ != "OK" or not data or not data[0]:
            out.append({"uid": uid, "error": "fetch failed"})
            continue
        raw = data[0][1]
        msg = email.message_from_bytes(raw, policy=policy.default)
        body_text = ""
        for part in msg.walk():
            ctype = part.get_content_type()
            if ctype == "text/plain" and not body_text:
                try:
                    body_text = part.get_content()
                except Exception:
                    body_text = part.get_payload(decode=True).decode("utf-8", errors="replace")
        if not body_text:
            for part in msg.walk():
                if part.get_content_type() == "text/html":
                    try:
                        body_text = part.get_content()
                    except Exception:
                        body_text = part.get_payload(decode=True).decode("utf-8", errors="replace")
                    break
        out.append({
            "uid": uid,
            "from": str(msg.get("From", "")),
            "to": str(msg.get("To", "")),
            "subject": str(msg.get("Subject", "")),
            "date": str(msg.get("Date", "")),
            "body": body_text[:5000],
        })
    m.logout()
    return out


if __name__ == "__main__":
    account = sys.argv[1]
    uids = sys.argv[2].split(",")
    print(json.dumps(fetch(account, uids), ensure_ascii=False, indent=2))
