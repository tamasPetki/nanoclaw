#!/usr/bin/env python3
"""
One-time Telegram authentication — generates a StringSession.
Run on HOST (not in container). Interactive: asks for phone + SMS code.

Usage: python3 scripts/telegram-auth.py

The output StringSession goes into .env as TELEGRAM_SESSION.
"""

import asyncio
import sys

try:
    from telethon import TelegramClient
    from telethon.sessions import StringSession
except ImportError:
    print("telethon not installed. Run: pip3 install telethon")
    sys.exit(1)

API_ID = 30260003
API_HASH = "5a6c6a611ac631dadc1580def9a60bcd"


async def main():
    client = TelegramClient(StringSession(), API_ID, API_HASH)
    await client.start()

    session_string = client.session.save()
    print("\n=== TELEGRAM_SESSION ===")
    print(session_string)
    print("========================\n")
    print("Add this to .env:")
    print(f"TELEGRAM_SESSION={session_string}")

    await client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
