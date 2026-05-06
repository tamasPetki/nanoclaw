#!/usr/bin/env python3
"""Download attachments from a given UID into ./attachments/<account>_<uid>/."""
import imaplib, os, sys, email, pathlib

ACCOUNT = sys.argv[1]
UID = sys.argv[2]
prefix = ACCOUNT.upper()
host = os.environ[f"{prefix}_IMAP_HOST"]
user = os.environ[f"{prefix}_IMAP_USER"]
pwd = os.environ[f"{prefix}_IMAP_PASSWORD"]
port = int(os.environ.get(f"{prefix}_IMAP_PORT", "993"))

m = imaplib.IMAP4_SSL(host, port)
m.login(user, pwd)
m.select("INBOX", readonly=True)
typ, data = m.uid("FETCH", UID, "(RFC822)")
msg = email.message_from_bytes(data[0][1])
out = pathlib.Path(f"attachments/{ACCOUNT}_{UID}")
out.mkdir(parents=True, exist_ok=True)
for part in msg.walk():
    fn = part.get_filename()
    if fn:
        from email.header import decode_header
        decoded = ""
        for t, enc in decode_header(fn):
            decoded += t.decode(enc or "utf-8", errors="replace") if isinstance(t, bytes) else t
        path = out / decoded
        with open(path, "wb") as f:
            f.write(part.get_payload(decode=True))
        print(f"saved: {path} ({path.stat().st_size} bytes)")
m.logout()
