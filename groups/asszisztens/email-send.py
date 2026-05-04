#!/usr/bin/env python3
"""Forward an email via SMTP using the same creds as IMAP. Returns hard proof."""
import imaplib
import json
import os
import smtplib
import ssl
import sys
import time
import uuid
from email.message import EmailMessage
from email import policy
import email as emaillib

ACCOUNTS = {
    "pietscarlet": "PIETSCARLET",
    "trinkenessen": "TRINKENESSEN",
    "lupaobol": "LUPAOBOL",
}


def fetch_original(host, port, user, pwd, uid):
    m = imaplib.IMAP4_SSL(host, port)
    m.login(user, pwd)
    m.select("INBOX", readonly=True)
    typ, data = m.uid("fetch", str(uid), "(RFC822)")
    raw = data[0][1]
    m.logout()
    return raw, emaillib.message_from_bytes(raw, policy=policy.default)


def find_in_sent(host, port, user, pwd, message_id, sent_folder="INBOX.Sent", retries=8):
    for _ in range(retries):
        time.sleep(1.5)
        try:
            m = imaplib.IMAP4_SSL(host, port)
            m.login(user, pwd)
            m.select(sent_folder, readonly=True)
            typ, data = m.uid("search", None, f'HEADER Message-ID "{message_id}"')
            uids = [u.decode() if isinstance(u, bytes) else u for u in (data[0].split() if data and data[0] else [])]
            m.logout()
            if uids:
                return uids[-1]
        except Exception:
            pass
    return None


def main():
    account = sys.argv[1]
    uid = sys.argv[2]
    to_addr = sys.argv[3]

    prefix = ACCOUNTS[account]
    imap_host = os.environ[f"{prefix}_IMAP_HOST"]
    imap_port = int(os.environ.get(f"{prefix}_IMAP_PORT", "993"))
    user = os.environ[f"{prefix}_IMAP_USER"]
    pwd = os.environ[f"{prefix}_IMAP_PASSWORD"]
    smtp_host = os.environ.get(f"{prefix}_SMTP_HOST", imap_host)
    smtp_port = int(os.environ.get(f"{prefix}_SMTP_PORT", "465"))

    raw, orig = fetch_original(imap_host, imap_port, user, pwd, uid)

    fwd = EmailMessage()
    fwd["From"] = user
    fwd["To"] = to_addr
    orig_subj = str(orig.get("Subject", ""))
    fwd["Subject"] = f"Fwd: {orig_subj}"
    fwd["Reply-To"] = user
    msg_id = f"<{uuid.uuid4()}@pietscarlet.hu>"
    fwd["Message-ID"] = msg_id

    body_text = ""
    for part in orig.walk():
        if part.get_content_type() == "text/plain":
            try:
                body_text = part.get_content()
            except Exception:
                body_text = part.get_payload(decode=True).decode("utf-8", errors="replace")
            break

    intro = "Szia Erika,\n\nKérlek intézd a csatolt/lent linkelt számlát. Köszi!\n\nTomi\n\n--- Eredeti üzenet ---\n"
    headers = (
        f"From: {orig.get('From', '')}\n"
        f"Date: {orig.get('Date', '')}\n"
        f"Subject: {orig_subj}\n"
        f"To: {orig.get('To', '')}\n\n"
    )
    fwd.set_content(intro + headers + body_text)

    ctx = ssl.create_default_context()
    try:
        s = smtplib.SMTP_SSL(smtp_host, smtp_port, context=ctx, timeout=20)
        s.login(user, pwd)
        send_resp = s.send_message(fwd)
        s.quit()
        method = f"SMTP_SSL {smtp_host}:{smtp_port}"
    except Exception as e_ssl:
        try:
            s = smtplib.SMTP(smtp_host, 587, timeout=20)
            s.starttls(context=ctx)
            s.login(user, pwd)
            send_resp = s.send_message(fwd)
            s.quit()
            method = f"STARTTLS {smtp_host}:587"
        except Exception as e_tls:
            print(json.dumps({"error": "smtp failed", "ssl_err": str(e_ssl), "tls_err": str(e_tls)}))
            sys.exit(2)

    sent_uid = find_in_sent(imap_host, imap_port, user, pwd, msg_id)

    print(json.dumps({
        "method": method,
        "from": user,
        "to": to_addr,
        "subject": fwd["Subject"],
        "message_id": msg_id,
        "smtp_response": str(send_resp),
        "sent_folder_uid": sent_uid,
        "sent_folder_check": "INBOX.Sent",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
