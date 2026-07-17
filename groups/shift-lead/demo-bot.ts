// Live demo runner (NOT committed; reads the token from .secrets.kept, never prints it).
// Sends one real nudge to Tomi's chat and then handles button taps in-process.
import { readFileSync } from "node:fs";
import { TelegramClient } from "./product/repo/src/surface/telegram";
import { pushNudge, runBot } from "./product/repo/src/surface/bot";
import { CommitmentStore } from "./product/repo/src/store/store";
import { newCommitment } from "./product/repo/src/core/commitment";

const token = (readFileSync("/workspace/agent/.secrets.kept", "utf8").match(/TELEGRAM_BOT_TOKEN=(.+)/)?.[1] ?? "").trim();
const tg = new TelegramClient(token);

// find Tomi's chat_id from his /start (or any message to the bot)
const updates = await tg.getUpdates(0, 0);
let chatId: number | undefined;
for (const u of updates) {
  const c = u.message?.chat.id ?? u.callback_query?.message?.chat.id;
  if (typeof c === "number") chatId = c;
}
if (!chatId) {
  console.log("NO_CHAT: no update found — has /start been pressed on the bot?");
  process.exit(2);
}
console.log("chat_id:", chatId);

const now = new Date();
const store = new CommitmentStore(); // in-memory, this process only
store.create(
  newCommitment(
    {
      id: "demo1",
      counterparty: { name: "Anna" },
      expectation: "send her the final master",
      evidence: {
        quote: "I'll get the final master over to you by Wednesday",
        source: "voice memo, call with Anna",
        capturedAt: new Date(now.getTime() - 5 * 864e5).toISOString(),
      },
      confidence: 0.95,
      factClass: "hard-promise",
      due: new Date(now.getTime() - 2 * 864e5).toISOString(), // 2 days overdue → ripe
    },
    now,
  ),
  { now },
);

const sent = await pushNudge(tg, store, chatId, { now });
console.log("nudge_sent:", sent);

// keep handling taps until the container goes away
const ctrl = new AbortController();
process.on("SIGINT", () => ctrl.abort());
process.on("SIGTERM", () => ctrl.abort());
await runBot(tg, store, ctrl.signal);
