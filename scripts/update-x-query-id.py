#!/usr/bin/env python3
"""
Fetch the current X/Twitter GraphQL queryId for ListLatestTweetsTimeline
directly from X's JavaScript bundle. No third-party library needed.

Usage: python3 scripts/update-x-query-id.py
Output: updates data/x-query-id.txt and the SKILL.md with the fresh queryId.
"""
import re
import sys
import os
import urllib.request

OPERATION = "ListLatestTweetsTimeline"
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))
QUERY_ID_FILE = os.path.join(PROJECT_ROOT, "data", "x-query-id.txt")
SKILL_FILE = os.path.join(PROJECT_ROOT, "container", "skills", "x-browser", "SKILL.md")


def fetch_query_id():
    # Step 1: Fetch x.com to find the main JS bundle URL
    req = urllib.request.Request("https://x.com", headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    bundle_urls = re.findall(
        r'(https://abs\.twimg\.com/responsive-web/client-web/main\.[a-f0-9]+\.js)', html
    )
    if not bundle_urls:
        raise RuntimeError("Could not find main JS bundle URL in x.com HTML")

    bundle_url = bundle_urls[0]

    # Step 2: Download the bundle and extract the queryId
    req = urllib.request.Request(bundle_url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        js = resp.read().decode("utf-8", errors="replace")

    # Pattern: queryId:"<hash>",operationName:"ListLatestTweetsTimeline"
    pattern = rf'queryId:"([^"]+)",operationName:"{OPERATION}"'
    match = re.search(pattern, js)
    if not match:
        raise RuntimeError(f"Could not find queryId for {OPERATION} in {bundle_url}")

    return match.group(1)


def update_skill_file(query_id):
    """Replace the QUERY_ID value in the x-browser SKILL.md."""
    if not os.path.exists(SKILL_FILE):
        return False

    with open(SKILL_FILE, "r") as f:
        content = f.read()

    new_content = re.sub(
        r'QUERY_ID="[^"]*"',
        f'QUERY_ID="{query_id}"',
        content,
    )

    if new_content == content:
        return False

    with open(SKILL_FILE, "w") as f:
        f.write(new_content)

    return True


if __name__ == "__main__":
    try:
        query_id = fetch_query_id()

        # Read previous queryId
        old_id = None
        if os.path.exists(QUERY_ID_FILE):
            with open(QUERY_ID_FILE) as f:
                old_id = f.read().strip()

        # Write queryId file
        os.makedirs(os.path.dirname(QUERY_ID_FILE), exist_ok=True)
        with open(QUERY_ID_FILE, "w") as f:
            f.write(query_id)

        # Update SKILL.md
        skill_updated = update_skill_file(query_id)

        if old_id == query_id:
            print(f"QueryId unchanged: {query_id}")
        else:
            print(f"QueryId updated: {old_id} -> {query_id}")
            if skill_updated:
                print(f"SKILL.md updated: {SKILL_FILE}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
