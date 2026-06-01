#!/usr/bin/env python3
"""Save a reply/forward as an IMAP draft so Tomi sees/edits/sends it from his mail client.

Usage:
  email-save-draft.py <account> <to> <subject> <body_html_file> [in_reply_to] [--attach PATH ...]

- <account>: pietscarlet | trinkenessen | lupaobol  (same env convention as email-prefilter.py)
- <body_html_file>: path to a file containing the full HTML body (incl. signature for pietscarlet).
  Passed as a file (not argv) so multi-line HTML and quotes survive intact.
- [in_reply_to]: optional Message-ID for threading (replies). Omit for new/forward mails.
- --attach PATH: optional, repeatable. Local file(s) to attach (e.g. a downloaded invoice PDF).
  Use the MCP `download_attachment` tool first to fetch the file to a path, then pass it here.

Appends the message to the account's Drafts folder with the \\Draft flag, so it
shows up in the Piszkozatok/Drafts folder of any mail client on that account.
Nothing is ever sent -- Tomi is the gate.
"""
import argparse
import imaplib
import mimetypes
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


def attach_file(msg, path):
    """Attach a local file, guessing the MIME type from its extension."""
    ctype, _ = mimetypes.guess_type(path)
    maintype, subtype = (ctype.split("/", 1) if ctype else ("application", "octet-stream"))
    with open(path, "rb") as f:
        data = f.read()
    msg.add_attachment(data, maintype=maintype, subtype=subtype, filename=os.path.basename(path))


def save_draft(account, to_addr, subject, body_html, in_reply_to=None, attachments=None):
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
    # add_attachment restructures the message to multipart/mixed automatically
    for path in attachments or []:
        attach_file(msg, path)

    m = imaplib.IMAP4_SSL(host, port)
    m.login(user, pwd)
    mailbox = find_drafts_mailbox(m)
    typ, _ = m.append(mailbox, "(\\Draft)", imaplib.Time2Internaldate(time.time()), msg.as_bytes())
    m.logout()
    return typ, mailbox


def main():
    p = argparse.ArgumentParser(description="Save an IMAP draft (never sends).")
    p.add_argument("account", choices=sorted(ACCOUNTS))
    p.add_argument("to")
    p.add_argument("subject")
    p.add_argument("body_html_file")
    p.add_argument("in_reply_to", nargs="?", default=None)
    p.add_argument("--attach", action="append", default=[], metavar="PATH",
                   help="local file to attach; repeatable")
    args = p.parse_args()

    with open(args.body_html_file, "r", encoding="utf-8") as f:
        body_html = f.read()
    typ, mailbox = save_draft(args.account, args.to, args.subject, body_html,
                              args.in_reply_to, args.attach)
    extra = f" attachments={len(args.attach)}" if args.attach else ""
    print(f"draft saved: status={typ} mailbox={mailbox} to={args.to} subject={args.subject!r}{extra}")


if __name__ == "__main__":
    main()
