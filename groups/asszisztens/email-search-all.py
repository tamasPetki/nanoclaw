#!/usr/bin/env python3
"""Search ALL folders (not just INBOX) for keyword in to/from/cc/bcc/subject/body."""
import imaplib, os, sys, email, re
from email.header import decode_header

ACCOUNTS = [("pietscarlet","PIETSCARLET"),("trinkenessen","TRINKENESSEN"),("lupaobol","LUPAOBOL")]

def dec(s):
    if not s: return ""
    out = ""
    for t,enc in decode_header(s):
        out += t.decode(enc or "utf-8", errors="replace") if isinstance(t,bytes) else t
    return out

keywords = sys.argv[1:]

for key,prefix in ACCOUNTS:
    host=os.environ.get(f"{prefix}_IMAP_HOST")
    if not host: continue
    user=os.environ[f"{prefix}_IMAP_USER"]
    pwd=os.environ[f"{prefix}_IMAP_PASSWORD"]
    port=int(os.environ.get(f"{prefix}_IMAP_PORT","993"))
    m=imaplib.IMAP4_SSL(host,port); m.login(user,pwd)
    typ,folders=m.list()
    folder_names=[]
    for f in folders or []:
        s=f.decode() if isinstance(f,bytes) else f
        # Format: (flags) "." FOLDERNAME  OR  (flags) "." "FOLDER NAME"
        match=re.match(r'\([^)]*\)\s+"[^"]*"\s+(?:"([^"]+)"|(\S+))$', s)
        if match: folder_names.append(match.group(1) or match.group(2))
    print(f"=== {key} (folders: {len(folder_names)}) ===")
    total_hits=set()
    for folder in folder_names:
        try:
            m.select(folder, readonly=True)
        except: continue
        for kw in keywords:
            for field in ("TEXT","FROM","TO","CC","SUBJECT"):
                try:
                    typ,data=m.uid("SEARCH","CHARSET","UTF-8",field,kw.encode("utf-8"))
                    if typ=="OK" and data and data[0]:
                        for uid in data[0].split():
                            total_hits.add((folder,uid))
                except: pass
    for folder,uid in sorted(total_hits, key=lambda x:(x[0],int(x[1]))):
        try:
            m.select(folder, readonly=True)
            typ,data=m.uid("FETCH",uid,"(BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE)])")
            if typ=="OK" and data and data[0]:
                msg=email.message_from_bytes(data[0][1])
                print(f"  [{folder}] UID {uid.decode()} | {dec(msg.get('Date',''))[:25]} | {dec(msg.get('From',''))[:40]} → {dec(msg.get('To',''))[:30]} | {dec(msg.get('Subject',''))[:70]}")
        except: pass
    m.logout()
