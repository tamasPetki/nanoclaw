"""
OAuth2 setup script for Withings MCP Server.

Run this once to authenticate with your Withings account.
It starts a local web server, opens the auth URL in your browser,
and captures the callback to store tokens.
"""

import asyncio
import os
import sys
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

from dotenv import load_dotenv

from .withings_client import WithingsClient

load_dotenv()

CALLBACK_PORT = 8585
CALLBACK_URI = f"http://localhost:{CALLBACK_PORT}/callback"

_auth_code: str | None = None
_server_should_stop = False


class CallbackHandler(BaseHTTPRequestHandler):
    """Handle the OAuth2 callback."""

    def do_GET(self):
        global _auth_code, _server_should_stop
        parsed = urlparse(self.path)
        if parsed.path == "/callback":
            params = parse_qs(parsed.query)
            _auth_code = params.get("code", [None])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            if _auth_code:
                self.wfile.write(
                    b"<html><body><h1>Authenticated!</h1>"
                    b"<p>You can close this window and return to the terminal.</p>"
                    b"</body></html>"
                )
            else:
                error = params.get("error", ["unknown"])[0]
                self.wfile.write(
                    f"<html><body><h1>Error</h1><p>{error}</p></body></html>".encode()
                )
            _server_should_stop = True
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Suppress default logging


def main():
    """Run the OAuth2 setup flow."""
    global _auth_code, _server_should_stop

    client_id = os.environ.get("WITHINGS_CLIENT_ID", "")
    client_secret = os.environ.get("WITHINGS_CLIENT_SECRET", "")
    token_path = os.environ.get("WITHINGS_TOKEN_PATH", "~/.withings_tokens.json")

    if not client_id or not client_secret:
        print("❌ Error: WITHINGS_CLIENT_ID and WITHINGS_CLIENT_SECRET must be set.")
        print()
        print("1. Go to https://developer.withings.com/dashboard/")
        print("2. Create an app (or use existing)")
        print("3. Set these in your .env file or environment:")
        print("   WITHINGS_CLIENT_ID=your_client_id")
        print("   WITHINGS_CLIENT_SECRET=your_client_secret")
        sys.exit(1)

    client = WithingsClient(client_id, client_secret, token_path)

    if client.is_authenticated:
        print("✅ Already authenticated! Tokens found at:", client.token_path)
        resp = input("Re-authenticate? (y/N): ").strip().lower()
        if resp != "y":
            return

    auth_url = client.get_auth_url(CALLBACK_URI)

    print("🔐 Withings OAuth2 Setup")
    print("=" * 50)
    print()
    print("Opening browser for authentication...")
    print(f"If it doesn't open, visit:\n{auth_url}")
    print()

    # Start callback server
    server = HTTPServer(("localhost", CALLBACK_PORT), CallbackHandler)
    server.timeout = 1

    webbrowser.open(auth_url)

    print(f"Waiting for callback on port {CALLBACK_PORT}...")
    while not _server_should_stop:
        server.handle_request()

    server.server_close()

    if not _auth_code:
        print("❌ No authorization code received.")
        sys.exit(1)

    print("📥 Exchanging code for tokens...")
    tokens = asyncio.run(client.exchange_code(_auth_code, CALLBACK_URI))
    print()
    print("✅ Authentication successful!")
    print(f"   User ID: {tokens.get('userid')}")
    print(f"   Tokens saved to: {client.token_path}")
    print()
    print("You can now use the Withings MCP server.")


if __name__ == "__main__":
    main()
