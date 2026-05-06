#!/usr/bin/env python3
"""Send a fresh test email with hard proof (Message-ID + Sent folder check)."""
import imaplib, os, smtplib, ssl, sys, time, uuid, json
from email.message import EmailMessage
from email.utils import formataddr

ACCOUNTS = {
    "pietscarlet": ("PIETSCARLET", "PietScarlet Kft."),
    "trinkenessen": ("TRINKENESSEN", "Trinken Essen Kft."),
    "lupaobol": ("LUPAOBOL", "Lupa Öböl Kft."),
}

account = sys.argv[1]
to_addr = sys.argv[2]
subject = sys.argv[3]
body = sys.argv[4]

prefix, display = ACCOUNTS[account]
host = os.environ[f"{prefix}_IMAP_HOST"]
port = int(os.environ.get(f"{prefix}_IMAP_PORT", "993"))
user = os.environ[f"{prefix}_IMAP_USER"]
pwd = os.environ[f"{prefix}_IMAP_PASSWORD"]
smtp_host = os.environ.get(f"{prefix}_SMTP_HOST", host)
smtp_port = int(os.environ.get(f"{prefix}_SMTP_PORT", "465"))

m = EmailMessage()
sender = formataddr((display, user))
m["From"] = sender
m["To"] = to_addr
m["Subject"] = subject
msg_id = f"<{uuid.uuid4()}@{user.split('@',1)[1]}>"
m["Message-ID"] = msg_id
m.set_content(body)

ctx = ssl.create_default_context()
s = smtplib.SMTP_SSL(smtp_host, smtp_port, context=ctx, timeout=20)
s.login(user, pwd)
resp = s.send_message(m)
s.quit()

# Sent folder check
sent_uid = None
for _ in range(8):
    time.sleep(1.5)
    try:
        im = imaplib.IMAP4_SSL(host, port)
        im.login(user, pwd)
        im.select("INBOX.Sent", readonly=True)
        typ, data = im.uid("search", None, f'HEADER Message-ID "{msg_id}"')
        uids = (data[0].split() if data and data[0] else [])
        im.logout()
        if uids:
            sent_uid = uids[-1].decode()
            break
    except Exception:
        pass

print(json.dumps({
    "from": sender, "to": to_addr, "subject": subject,
    "message_id": msg_id, "smtp_response": str(resp),
    "sent_folder_uid": sent_uid,
}, ensure_ascii=False, indent=2))
