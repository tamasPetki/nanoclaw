// Live GROUNDING smoke-test (NOT committed; reads the Kept key from env — never echo/commit).
// Probes the three groundings on a real Haiku call: (a) relative date -> absolute ISO,
// (b) pronoun -> resolved name, (c) salience present. Run direct (proxy bypassed):
//   env -u HTTPS_PROXY -u HTTP_PROXY bash -c 'set -a; source .secrets.kept; set +a; bun run test-extract-live.ts'
import { AnthropicModelClient, extractCommitments, type SourceMessage } from "./product/repo/src/extract";

// Fixed anchor: 2026-06-22 is a Monday → "next Friday" = 2026-06-26; "the 30th" = 2026-06-30.
const now = new Date("2026-06-22T10:00:00.000Z");
const msg: SourceMessage = {
  id: "live-grounding-1",
  from: "anna.kovacs@label.example",
  date: now.toISOString(),
  subject: "Re: Midnight EP — masters, split sheet, stems",
  body:
    "Hey! Great call today. I'll send you the final master of 'Midnight' by next Friday so you can drop it to the " +
    "distributor. Also — can you get the split sheet signed by both writers before the release on the 30th? " +
    "Tom mentioned he needs the instrumental stems too, so make sure he gets them by Wednesday. " +
    "And let's reconnect about the Q4 tour booking once you've had a chance to think it over, no rush.",
};

const client = new AnthropicModelClient(); // reads ANTHROPIC_API_KEY from env
console.log("calling api.anthropic.com direct (model=claude-haiku-4-5), anchor =", now.toISOString());
try {
  const { commitments, dropped } = await extractCommitments(client, msg, now);
  console.log(`\nextracted ${commitments.length} commitment(s), dropped ${dropped.length}:\n`);
  for (const c of commitments) {
    console.log(`- [${c.factClass}] for "${c.counterparty.name}": ${c.expectation}`);
    console.log(`    due: ${c.due ?? "(none — cadence " + JSON.stringify(c.cadence) + ")"}`);
    console.log(`    salience: ${c.salience ?? "(none)"} | confidence: ${c.confidence}`);
    console.log(`    evidence: "${c.evidence.quote}"`);
  }
  if (dropped.length) console.log("\ndropped:", JSON.stringify(dropped, null, 2));

  // GROUNDING ASSERTIONS (informational — printed, not thrown):
  const isoRe = /^\d{4}-\d{2}-\d{2}T/;
  const hardDues = commitments.filter((c) => c.factClass === "hard-promise").map((c) => c.due);
  const allAbsolute = hardDues.every((d) => typeof d === "string" && isoRe.test(d));
  const noPronouns = commitments.every((c) => !/^(he|she|they|it|him|her|them)$/i.test(c.counterparty.name.trim()));
  const haveSalience = commitments.some((c) => typeof c.salience === "number");
  console.log("\nGROUNDING CHECK:");
  console.log(`  absolute-date (all hard dues ISO): ${allAbsolute} -> ${JSON.stringify(hardDues)}`);
  console.log(`  coref (no bare-pronoun counterparty): ${noPronouns}`);
  console.log(`  salience captured on >=1: ${haveSalience}`);
  console.log("\nLIVE_GROUNDING_OK");
} catch (e) {
  console.log("LIVE_GROUNDING_ERROR:", e instanceof Error ? e.message : String(e));
  process.exit(1);
}
