#!/usr/bin/env python3
"""
Read messages from a Telegram group using a StringSession.
Called by the agent from inside the container.

Usage: python3 telegram-read.py API_ID API_HASH SESSION_STRING GROUP_ID [LIMIT]

Output: formatted messages (newest first), one per line.
"""

import asyncio
import json
import sys
from datetime import datetime, timezone

try:
    from telethon import TelegramClient
    from telethon.sessions import StringSession
except ImportError:
    print("ERROR: telethon not installed", file=sys.stderr)
    sys.exit(1)


async def main():
    if len(sys.argv) < 5:
        print("Usage: python3 telegram-read.py API_ID API_HASH SESSION_STRING GROUP_ID [LIMIT]")
        sys.exit(1)

    api_id = int(sys.argv[1])
    api_hash = sys.argv[2]
    session_string = sys.argv[3]
    group_id = int(sys.argv[4])
    limit = int(sys.argv[5]) if len(sys.argv) > 5 else 50

    client = TelegramClient(StringSession(session_string), api_id, api_hash)
    await client.start()

    try:
        entity = await client.get_entity(group_id)
        messages = await client.get_messages(entity, limit=limit)

        results = []
        for msg in messages:
            if not msg.text:
                continue
            sender_name = "Unknown"
            if msg.sender:
                if hasattr(msg.sender, "first_name"):
                    sender_name = msg.sender.first_name or ""
                    if hasattr(msg.sender, "last_name") and msg.sender.last_name:
                        sender_name += f" {msg.sender.last_name}"
                elif hasattr(msg.sender, "title"):
                    sender_name = msg.sender.title
                sender_name = sender_name.strip() or "Unknown"

            results.append({
                "id": msg.id,
                "date": msg.date.isoformat() if msg.date else None,
                "sender": sender_name,
                "text": msg.text,
            })

        # Print formatted output
        for r in results:
            date_str = r["date"][:16].replace("T", " ") if r["date"] else "?"
            print(f"[{date_str}] {r['sender']}: {r['text']}")
            print()

    finally:
        await client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
