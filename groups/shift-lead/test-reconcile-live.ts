// Live RECONCILE smoke-test (NOT committed; reads the Kept key from env — never echo/commit).
// Validates the ONE untested seam: the reconcile JUDGE prompt against a real frontier model
// (claude-sonnet-4-6). The deterministic guard (plan.ts) is exhaustively unit-tested; this only
// checks that the prompt yields parseable, correctly-classified verdicts on real input. Run direct:
//   env -u HTTPS_PROXY -u HTTP_PROXY bash -c 'set -a; source .secrets.kept; set +a; bun run test-reconcile-live.ts'
import { AnthropicModelClient } from "./product/repo/src/extract/anthropic-client";
import { newCommitment, type Commitment, type NewCommitmentInput } from "./product/repo/src/core/commitment";
import { reconcile } from "./product/repo/src/reconcile";
import type { SourceMessage } from "./product/repo/src/extract/types";

function mk(id: string, p: { expectation: string; quote: string; due: string; capturedAt: string }): Commitment {
  const input: NewCommitmentInput = {
    id,
    counterparty: { name: "Anna" },
    expectation: p.expectation,
    evidence: { quote: p.quote, source: id, capturedAt: p.capturedAt },
    confidence: 0.95,
    factClass: "hard-promise",
    due: p.due,
  };
  return newCommitment(input, new Date(p.capturedAt));
}

const judge = new AnthropicModelClient({ model: "claude-sonnet-4-6" });
console.log("reconcile judge = claude-sonnet-4-6 (frontier tier), direct api.anthropic.com\n");

// Existing live commitment: send Anna the master by Friday (2026-06-26).
const existing = mk("old#0", {
  expectation: "send Anna the master of 'Midnight'",
  quote: "I'll send you the final master of 'Midnight' by Friday",
  due: "2026-06-26T17:00:00.000Z",
  capturedAt: "2026-06-22T10:00:00.000Z",
});

async function scenario(name: string, msg: SourceMessage, fresh: Commitment[], expect: string) {
  const plan = await reconcile(judge, msg, fresh, [existing]);
  console.log(`--- ${name} (expect: ${expect}) ---`);
  console.log(`  supersedes: ${plan.supersedes.map((s) => `${s.oldId}->${s.successor.id}`).join(", ") || "(none)"}`);
  console.log(`  closes:     ${plan.closes.map((c) => c.targetId).join(", ") || "(none)"}`);
  console.log(`  noops:      ${plan.noops.map((n) => `${n.freshId}~${n.duplicateOf}`).join(", ") || "(none)"}`);
  console.log(`  creates:    ${plan.creates.map((c) => c.id).join(", ") || "(none)"}`);
  if (plan.guardRejections.length) console.log(`  guard:      ${plan.guardRejections.map((g) => g.floor).join(", ")}`);
  console.log("");
}

try {
  // (1) UPDATE: the deadline moved → supersede the old, insert the successor.
  await scenario(
    "UPDATE (moved deadline)",
    { id: "m-upd", from: "me", date: "2026-06-23T09:00:00.000Z", body: "Quick update: I'll actually send Anna the master of 'Midnight' next Wednesday instead of Friday." },
    [mk("m-upd#0", { expectation: "send Anna the master of 'Midnight'", quote: "I'll actually send Anna the master of 'Midnight' next Wednesday", due: "2026-07-01T17:00:00.000Z", capturedAt: "2026-06-23T09:00:00.000Z" })],
    "supersede old#0",
  );

  // (2) FULFILLMENT: reported done within the due window → close.
  await scenario(
    "FULFILLMENT (reported done)",
    { id: "m-done", from: "me", date: "2026-06-25T16:00:00.000Z", body: "Done — just sent Anna the final master of 'Midnight'. Off my plate." },
    [],
    "close old#0",
  );

  // (3) NEW (different obligation): should NOT touch the old.
  await scenario(
    "NEW (unrelated)",
    { id: "m-new", from: "me", date: "2026-06-23T09:00:00.000Z", body: "Also need to send Anna the split sheet for the EP by next Monday." },
    [mk("m-new#0", { expectation: "send Anna the split sheet for the EP", quote: "send Anna the split sheet for the EP by next Monday", due: "2026-06-29T17:00:00.000Z", capturedAt: "2026-06-23T09:00:00.000Z" })],
    "create only (no supersede/close)",
  );

  console.log("LIVE_RECONCILE_OK");
} catch (e) {
  console.log("LIVE_RECONCILE_ERROR:", e instanceof Error ? e.message : String(e));
  process.exit(1);
}
