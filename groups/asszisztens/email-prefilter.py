#!/usr/bin/env python3
"""
Email pre-filter for scheduled email check.
Connects to 3 IMAP accounts, finds new messages since last UID (or last 24h on first run),
outputs {wakeAgent, data} JSON for schedule_task.
"""
import imaplib
import json
import os
import sys
import email
from datetime import datetime, timedelta, timezone
from email import policy
from email.header import decode_header, make_header

STATE_PATH = "/workspace/agent/email-state.json"

ACCOUNTS = [
    {"key": "pietscarlet", "host_env": "PIETSCARLET_IMAP_HOST", "port_env": "PIETSCARLET_IMAP_PORT",
     "user_env": "PIETSCARLET_IMAP_USER", "pass_env": "PIETSCARLET_IMAP_PASSWORD"},
    {"key": "trinkenessen", "host_env": "TRINKENESSEN_IMAP_HOST", "port_env": "TRINKENESSEN_IMAP_PORT",
     "user_env": "TRINKENESSEN_IMAP_USER", "pass_env": "TRINKENESSEN_IMAP_PASSWORD"},
    {"key": "lupaobol", "host_env": "LUPAOBOL_IMAP_HOST", "port_env": "LUPAOBOL_IMAP_PORT",
     "user_env": "LUPAOBOL_IMAP_USER", "pass_env": "LUPAOBOL_IMAP_PASSWORD"},
]


def header_value(msg, name):
    """Decoded header value, robust to folding + encoded-words. Empty string if missing."""
    raw = msg.get(name)
    if raw is None:
        return ""
    try:
        return str(raw).strip()
    except Exception:
        try:
            return str(make_header(decode_header(str(raw)))).strip()
        except Exception:
            return ""


def load_state():
    if not os.path.exists(STATE_PATH):
        return {}
    try:
        with open(STATE_PATH) as f:
            return json.load(f)
    except Exception:
        return {}


def save_state(state):
    with open(STATE_PATH, "w") as f:
        json.dump(state, f, indent=2)


def fetch_account(acct, state):
    key = acct["key"]
    host = os.environ.get(acct["host_env"])
    port = int(os.environ.get(acct["port_env"], "993"))
    user = os.environ.get(acct["user_env"])
    pwd = os.environ.get(acct["pass_env"])

    if not all([host, user, pwd]):
        return {"error": f"missing env vars for {key}"}

    try:
        m = imaplib.IMAP4_SSL(host, port)
        m.login(user, pwd)
        m.select("INBOX", readonly=True)

        last_uid = state.get(key, {}).get("last_uid")

        if last_uid is None:
            since = (datetime.now(timezone.utc) - timedelta(hours=24)).strftime("%d-%b-%Y")
            typ, data = m.uid("search", None, f'(SINCE "{since}")')
        else:
            typ, data = m.uid("search", None, f"UID {int(last_uid)+1}:*")

        if typ != "OK":
            m.logout()
            return {"error": f"search failed: {typ}"}

        uids = [u.decode() if isinstance(u, bytes) else u for u in data[0].split()]
        if not uids:
            m.logout()
            return {"new_count": 0, "max_uid": last_uid}

        headers = []
        for uid in uids[-50:]:
            try:
                typ, msg_data = m.uid("fetch", uid, "(BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])")
                if typ == "OK" and msg_data and msg_data[0]:
                    raw = msg_data[0][1] if isinstance(msg_data[0][1], bytes) else str(msg_data[0][1]).encode("utf-8", errors="replace")
                    msg = email.message_from_bytes(raw, policy=policy.default)
                    from_val = header_value(msg, "From")
                    h = {
                        "uid": uid,
                        "from": from_val or "(ismeretlen feladó)",
                        "from_missing": not from_val,
                        "subject": header_value(msg, "Subject") or "(nincs tárgy)",
                        "date": header_value(msg, "Date"),
                    }
                    headers.append(h)
            except Exception as e:
                headers.append({"uid": uid, "error": str(e)})

        max_uid = max(int(u) for u in uids)
        m.logout()
        return {"new_count": len(uids), "max_uid": max_uid, "headers": headers}

    except Exception as e:
        return {"error": str(e)}


def main():
    state = load_state()
    result = {"accounts": {}}
    any_new = False
    any_error = False

    for acct in ACCOUNTS:
        r = fetch_account(acct, state)
        result["accounts"][acct["key"]] = r
        if "error" in r:
            any_error = True
        elif r.get("new_count", 0) > 0:
            any_new = True
            state.setdefault(acct["key"], {})["last_uid"] = r["max_uid"]
        elif r.get("max_uid") is not None and acct["key"] not in state:
            state[acct["key"]] = {"last_uid": r["max_uid"]}

    save_state(state)

    print(json.dumps({
        "wakeAgent": any_new or any_error,
        "data": result,
    }))


if __name__ == "__main__":
    main()
