#!/usr/bin/env python3
"""Move UID(s) from INBOX to Archive folder via IMAP."""
import imaplib
import os
import sys

ACCOUNTS = {
    "pietscarlet": ("PIETSCARLET_IMAP_HOST", "PIETSCARLET_IMAP_PORT", "PIETSCARLET_IMAP_USER", "PIETSCARLET_IMAP_PASSWORD"),
    "trinkenessen": ("TRINKENESSEN_IMAP_HOST", "TRINKENESSEN_IMAP_PORT", "TRINKENESSEN_IMAP_USER", "TRINKENESSEN_IMAP_PASSWORD"),
    "lupaobol": ("LUPAOBOL_IMAP_HOST", "LUPAOBOL_IMAP_PORT", "LUPAOBOL_IMAP_USER", "LUPAOBOL_IMAP_PASSWORD"),
}

ARCHIVE_CANDIDATES = ["Archive", "Archív", "Archivum", "[Gmail]/All Mail", "INBOX.Archive"]


def archive(account, uids):
    h_env, p_env, u_env, w_env = ACCOUNTS[account]
    host = os.environ[h_env]
    port = int(os.environ.get(p_env, "993"))
    user = os.environ[u_env]
    pwd = os.environ[w_env]
    m = imaplib.IMAP4_SSL(host, port)
    m.login(user, pwd)

    import re
    typ, folders = m.list()
    folder_names = []
    for f in folders or []:
        line = f.decode() if isinstance(f, bytes) else f
        # format: (flags) "delim" name   — name may be quoted or unquoted
        match = re.match(r'\([^)]*\)\s+"[^"]*"\s+(?:"([^"]*)"|(\S+))\s*$', line)
        if match:
            folder_names.append(match.group(1) or match.group(2))

    target = None
    for cand in ARCHIVE_CANDIDATES:
        if cand in folder_names:
            target = cand
            break
    if not target:
        # fallback: any folder containing 'rchiv'
        for n in folder_names:
            if "rchiv" in n.lower():
                target = n
                break

    print(f"[{account}] folders: {folder_names}", file=sys.stderr)
    print(f"[{account}] archive target: {target}", file=sys.stderr)

    if not target:
        m.logout()
        return {"error": "no archive folder found", "folders": folder_names}

    m.select("INBOX")
    results = {}
    for uid in uids:
        try:
            typ, data = m.uid("MOVE", str(uid), target)
            results[uid] = {"typ": typ, "data": [d.decode() if isinstance(d, bytes) else str(d) for d in (data or [])]}
        except Exception as e:
            try:
                typ, data = m.uid("COPY", str(uid), target)
                if typ == "OK":
                    m.uid("STORE", str(uid), "+FLAGS", "(\\Deleted)")
                    m.expunge()
                    results[uid] = {"typ": "COPY+DELETE", "data": "ok"}
                else:
                    results[uid] = {"error": f"copy failed: {typ}"}
            except Exception as e2:
                results[uid] = {"error": str(e2)}
    m.logout()
    return {"target": target, "results": results}


if __name__ == "__main__":
    import json
    account = sys.argv[1]
    uids = sys.argv[2].split(",")
    print(json.dumps(archive(account, uids), ensure_ascii=False, indent=2))
