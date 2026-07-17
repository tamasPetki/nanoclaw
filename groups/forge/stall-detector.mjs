import fs from "fs";

// Read run-log.jsonl to find the most recent non-done task
const lines = fs.readFileSync("/workspace/agent/run-log.jsonl", "utf8").trim().split("\n");
const entries = lines.map(l => JSON.parse(l));

// Last entry per task (latest stage wins)
const byTask = new Map();
for (const e of entries) {
  byTask.set(e.task, e);
}

// Find tasks that are not done/shipped
const stalled = [...byTask.values()].filter(e => e.stage !== "done" && e.stage !== "shipped");

if (stalled.length === 0) {
  console.log(JSON.stringify({ wakeAgent: false, reason: "no active build" }));
  process.exit(0);
}

const task = stalled[0];
const ageMs = Date.now() - new Date(task.ts).getTime();
const ageHours = ageMs / (1000 * 60 * 60);

if (ageHours < 6) {
  console.log(JSON.stringify({ wakeAgent: false, reason: "build is fresh" }));
  process.exit(0);
}

// Check GitHub for last commit on the feature branch
const branch = task.branch || ("feature/" + task.task);
const res = await fetch(
  "https://api.github.com/repos/tamasPetki/foursight/branches/" + encodeURIComponent(branch),
  { headers: { "User-Agent": "Forge-stall-detector" } }
);

let commitAge = null;
if (res.ok) {
  const data = await res.json();
  const commitDate = new Date(data.commit.commit.author.date).getTime();
  commitAge = (Date.now() - commitDate) / (1000 * 60 * 60);
}

// If no branch on GitHub AND log is > 2h old, it might be stalled waiting for gate
console.log(JSON.stringify({
  wakeAgent: true,
  data: {
    task: task.task,
    stage: task.stage,
    branch: branch,
    logAgeHours: parseFloat(ageHours.toFixed(1)),
    commitAgeHours: commitAge !== null ? parseFloat(commitAge.toFixed(1)) : null
  }
}));
