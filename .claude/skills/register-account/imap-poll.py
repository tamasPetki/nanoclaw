#!/usr/bin/env python3
"""Reusable IMAP-poll for OTP-code email-verify flows.

Used by the /register-account skill. Polls every 8s for up to --max-seconds,
scans all folders (INBOX, Spam, Notification, Trash, …) for emails matching
--from-filter, extracts a code matching --code-regex. Exit 0 on first hit
with stdout `CODE_FOUND folder=X uid=N code=NNNNNN`. Exit 1 on timeout.

Usage:
    python3 imap-poll.py \\
        --email lloyd@bulltrapp.com \\
        --from-filter reddit \\
        --code-regex '\\b(\\d{6})\\b' \\
        --imap-host imap.zoho.eu \\
        --imap-port 993 \\
        --password-env-key BULLTRAPP_EMAIL_PASSWORD \\
        --max-seconds 300

Env: reads <PASSWORD_ENV_KEY> from /root/nanoclaw-v2/.env unless --password
     is given inline (don't, leaks via ps).
"""
import argparse
import email
import imaplib
import os
import re
import sys
import time


def load_env(key):
    env_file = '/root/nanoclaw-v2/.env'
    if not os.path.isfile(env_file):
        return None
    for line in open(env_file):
        line = line.strip()
        if line.startswith(f'{key}='):
            return line.split('=', 1)[1].strip().strip('"').strip("'")
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--email', required=True, help='IMAP account')
    ap.add_argument('--from-filter', required=True,
                    help='Substring to match in From header (e.g. "reddit")')
    ap.add_argument('--code-regex', default=r'\b(\d{6})\b',
                    help='Regex to extract code; first group = code')
    ap.add_argument('--imap-host', default='imap.zoho.eu')
    ap.add_argument('--imap-port', type=int, default=993)
    ap.add_argument('--password-env-key', default='BULLTRAPP_EMAIL_PASSWORD')
    ap.add_argument('--max-seconds', type=int, default=300)
    ap.add_argument('--poll-interval', type=int, default=8)
    args = ap.parse_args()

    pw = load_env(args.password_env_key)
    if not pw:
        print(f'ERROR: {args.password_env_key} not found in .env', file=sys.stderr)
        sys.exit(2)

    code_re = re.compile(args.code_regex)
    start = time.time()
    while time.time() - start < args.max_seconds:
        try:
            M = imaplib.IMAP4_SSL(args.imap_host, args.imap_port)
            M.login(args.email, pw)
            typ, data = M.list()
            folders_raw = [l.decode() for l in (data or []) if l]
            for line in folders_raw:
                parts = line.split(' "/" ')
                name = parts[-1].strip().strip('"')
                name_q = f'"{name}"' if ' ' in name or '&' in name else name
                typ, _ = M.select(name_q, readonly=True)
                if typ != 'OK':
                    continue
                typ, sd = M.search(None, f'(FROM "{args.from_filter}")')
                uids = sd[0].split() if (typ == 'OK' and sd[0]) else []
                for uid in uids[-5:]:
                    typ, md = M.fetch(uid, '(RFC822)')
                    if typ != 'OK':
                        continue
                    msg = email.message_from_bytes(md[0][1])
                    subj = msg.get('Subject', '')
                    from_ = msg.get('From', '')
                    body = ''
                    if msg.is_multipart():
                        for p in msg.walk():
                            if p.get_content_type() in ('text/plain', 'text/html'):
                                try:
                                    body += p.get_payload(decode=True).decode('utf-8', 'ignore')
                                except Exception:
                                    pass
                    else:
                        try:
                            body = msg.get_payload(decode=True).decode('utf-8', 'ignore')
                        except Exception:
                            pass
                    m = code_re.search(subj) or code_re.search(body)
                    if m:
                        code = m.group(1) if m.groups() else m.group(0)
                        print(f'CODE_FOUND folder={name!r} uid={uid.decode()} '
                              f'from={from_!r} subj={subj!r} code={code}')
                        M.logout()
                        sys.exit(0)
                    else:
                        print(f'match_no_code folder={name!r} uid={uid.decode()} subj={subj!r}',
                              file=sys.stderr)
            M.logout()
        except Exception as e:
            print(f'poll_error: {e}', file=sys.stderr)
        time.sleep(args.poll_interval)

    print('TIMEOUT no code', file=sys.stderr)
    sys.exit(1)


if __name__ == '__main__':
    main()
