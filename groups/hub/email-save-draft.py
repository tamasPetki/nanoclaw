#!/usr/bin/env python3
"""Save a reply as an IMAP draft so Tomi sees/edits/sends it from his mail client.

Usage:
  email-save-draft.py <account> <to> <subject> <body_html_file> [in_reply_to_message_id]

- <account>: pietscarlet | trinkenessen | lupaobol  (same env convention as email-prefilter.py)
- <body_html_file>: path to a file containing the full HTML body (incl. signature).
  Passed as a file (not argv) so multi-line HTML and quotes survive intact.

Appends the message to the account's Drafts folder with the \\Draft flag, so it
shows up in the Piszkozatok/Drafts folder of any mail client on that account.
Nothing is ever sent -- Tomi is the gate.
"""
import imaplib
import sys
import os
import time
from email.message import EmailMessage
from email.utils import formatdate, make_msgid

ACCOUNTS = {
    "pietscarlet": ("PIETSCARLET_IMAP_HOST", "PIETSCARLET_IMAP_PORT", "PIETSCARLET_IMAP_USER", "PIETSCARLET_IMAP_PASSWORD"),
    "trinkenessen": ("TRINKENESSEN_IMAP_HOST", "TRINKENESSEN_IMAP_PORT", "TRINKENESSEN_IMAP_USER", "TRINKENESSEN_IMAP_PASSWORD"),
    "lupaobol": ("LUPAOBOL_IMAP_HOST", "LUPAOBOL_IMAP_PORT", "LUPAOBOL_IMAP_USER", "LUPAOBOL_IMAP_PASSWORD"),
}


def find_drafts_mailbox(m):
    """Return the Drafts mailbox name, preferring the RFC 6154 \\Drafts special-use flag."""
    typ, boxes = m.list()
    if typ != "OK":
        return "INBOX.Drafts"
    def mailbox_name(s):
        # LIST line: (flags) "sep" name  -- name is after the last quote pair,
        # or the last quoted token if the name itself is quoted.
        parts = s.split('"')
        tail = parts[-1].strip()
        return tail if tail else parts[-2].strip()

    named = None
    for b in boxes:
        s = b.decode(errors="replace")
        if "\\Drafts" in s:
            return mailbox_name(s)
        low = s.lower()
        if named is None and ("drafts" in low or "piszkoz" in low):
            named = mailbox_name(s)
    return named or "INBOX.Drafts"


def save_draft(account, to_addr, subject, body_html, in_reply_to=None):
    h_env, p_env, u_env, w_env = ACCOUNTS[account]
    host = os.environ[h_env]
    port = int(os.environ.get(p_env, "993"))
    user = os.environ[u_env]
    pwd = os.environ[w_env]

    msg = EmailMessage()
    msg["From"] = user
    msg["To"] = to_addr
    msg["Subject"] = subject
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid()
    if in_reply_to:
        msg["In-Reply-To"] = in_reply_to
        msg["References"] = in_reply_to
    # plain-text fallback (very rough strip) + HTML
    msg.set_content("A levél HTML formátumú. Nyisd meg HTML-képes klienssel.")
    msg.add_alternative(body_html, subtype="html")

    m = imaplib.IMAP4_SSL(host, port)
    m.login(user, pwd)
    mailbox = find_drafts_mailbox(m)
    typ, _ = m.append(mailbox, "(\\Draft)", imaplib.Time2Internaldate(time.time()), msg.as_bytes())
    m.logout()
    return typ, mailbox


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("usage: email-save-draft.py <account> <to> <subject> <body_html_file> [in_reply_to]")
        sys.exit(2)
    account, to_addr, subject, body_file = sys.argv[1:5]
    in_reply_to = sys.argv[5] if len(sys.argv) > 5 else None
    with open(body_file, "r", encoding="utf-8") as f:
        body_html = f.read()
    typ, mailbox = save_draft(account, to_addr, subject, body_html, in_reply_to)
    print(f"draft saved: status={typ} mailbox={mailbox} to={to_addr} subject={subject!r}")
