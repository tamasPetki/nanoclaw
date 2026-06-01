// Channel self-registration barrel.
// Each import triggers the channel module's registerChannelAdapter() call.
//
// Main ships with one default channel — `cli`, the always-on local-terminal
// channel. Other channel skills (/add-slack, /add-discord, /add-whatsapp,
// ...) copy their module from the `channels` branch and append a
// self-registration import below.

import './cli.js';
// Discord retired 2026-05-31 — no active wirings, only an orphan CrypTom DM
// group remained and the adapter kept a Gateway connection open for nothing.
// Re-enable by uncommenting + restoring DISCORD_* in .env if ever needed again.
// import './discord.js';
import './telegram.js';
import './telegram-stokes.js';
import './telegram-worker.js';
import './telegram-hex.js';
