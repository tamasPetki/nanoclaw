#!/usr/bin/env python3
"""Search all 3 IMAP accounts for keyword in subject or from."""
import imaplib, os, sys, email
from email.header import decode_header

ACCOUNTS = [
    ("pietscarlet", "PIETSCARLET"),
    ("trinkenessen", "TRINKENESSEN"),
    ("lupaobol", "LUPAOBOL"),
]

def dec(s):
    if not s: return ""
    parts = decode_header(s)
    out = ""
    for t, enc in parts:
        if isinstance(t, bytes):
            try: out += t.decode(enc or "utf-8", errors="replace")
            except: out += t.decode("utf-8", errors="replace")
        else: out += t
    return out

keywords = sys.argv[1:] or ["gépjármű", "NAV", "adó", "önkormányzat"]

for key, prefix in ACCOUNTS:
    host = os.environ.get(f"{prefix}_IMAP_HOST")
    user = os.environ.get(f"{prefix}_IMAP_USER")
    pwd = os.environ.get(f"{prefix}_IMAP_PASSWORD")
    port = int(os.environ.get(f"{prefix}_IMAP_PORT", "993"))
    if not host:
        print(f"=== {key}: no env ===")
        continue
    try:
        m = imaplib.IMAP4_SSL(host, port)
        m.login(user, pwd)
        m.select("INBOX", readonly=True)
        all_uids = set()
        for kw in keywords:
            for field in ("SUBJECT", "FROM", "BODY"):
                try:
                    typ, data = m.uid("SEARCH", "CHARSET", "UTF-8", field, kw.encode("utf-8"))
                    if typ == "OK" and data and data[0]:
                        all_uids.update(data[0].split())
                except Exception as e:
                    pass
        print(f"=== {key}: {len(all_uids)} hits ===")
        for uid in sorted(all_uids, key=lambda x: int(x))[-20:]:
            typ, data = m.uid("FETCH", uid, "(BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])")
            if typ == "OK" and data and data[0]:
                msg = email.message_from_bytes(data[0][1])
                print(f"  UID {uid.decode()} | {dec(msg.get('Date',''))[:25]} | {dec(msg.get('From',''))[:50]} | {dec(msg.get('Subject',''))[:80]}")
        m.logout()
    except Exception as e:
        print(f"=== {key}: ERROR {e} ===")
