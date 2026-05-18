#!/bin/bash
# Run this from the root of the HeadlessTracker repo

set -e

mkdir -p .github/ISSUE_TEMPLATE

# CONTRIBUTING.md
cat > CONTRIBUTING.md << 'ENDOFFILE'
# Contributing to headless-tracker

Thanks for your interest. This project follows a simple principle: **build the data layer, let the AI host be the renderer**. Contributions that add connectors, improve data quality, or fix bugs fit naturally. New UI surfaces don't — the MCP host handles rendering.

## Quick orientation

| Directory | What's there |
|-----------|-------------|
| `src/connectors/` | One file per exchange / wallet / market. Each implements `fetchHoldings`, `fetchPnl`, `fetchTransactions`. |
| `src/mcp/` | MCP server, tools, prompts, and MCP Apps (dashboard, settings). |
| `src/cost_basis.ts` | FIFO cost basis engine. |
| `src/orchestrator.ts` | Aggregates across connectors, applies pricing, produces the unified schema. |
| `test/` | 317 tests. Bun test runner, `--timeout=15000`. |
| `ROADMAP.md` | What's done, what's next, what's intentionally out of scope. Read before opening a feature request. |

## Setup

Requires [Bun 1.3+](https://bun.sh).

```bash
git clone https://github.com/tamasPetki/HeadlessTracker.git
cd HeadlessTracker
bun install
```

Run tests:

```bash
bun test
```

Type-check:

```bash
bun --bun tsc --noEmit
```

Build MCP Apps (dashboard + settings UI):

```bash
bun run build:apps
```

## Adding a connector

1. Create `src/connectors/<name>.ts`. Implement the `Connector` interface: `fetchHoldings`, `fetchPnl`, `fetchTransactions`. Return `null` for operations the exchange doesn't support — don't throw.
2. Add credentials schema to `src/vault.ts`.
3. Wire `setup <name>` into `bin/headless-tracker.ts`.
4. Add a Settings UI form in `src/mcp/apps/settings/`.
5. Add tests under `test/connectors/<name>.test.ts`. Aim for schema validation + at least one happy-path integration test.
6. Update `ROADMAP.md` — add the connector to the Done section with a one-line note.

**Read-only credentials only.** Every connector must request the minimum scope the exchange allows (e.g. Bybit "Read", Binance "Enable Reading"). Withdraw / trade permissions are never needed and must not be requested.

## Submitting a PR

- Keep PRs focused: one connector, one bug, one feature.
- Run `bun test && bun --bun tsc --noEmit` before pushing. CI runs the same check.
- If you're adding a connector: mention in the PR description which exchange, what credentials are needed, and whether you've tested against a live account.
- `CHANGELOG.md`: add a line under an `## Unreleased` section at the top if one exists, or the maintainer will add it on merge.

## Reporting bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). The most useful bug reports include:
- What connector (Bybit, Binance, MetaMask, Solana, Polymarket)
- The exact error message or unexpected output
- Whether the issue is data-wrong or crash/exception

Don't include API keys or wallet addresses in issues.

## Requesting features

Check `ROADMAP.md` first — if it's listed as "out of scope", open a discussion rather than an issue so we can understand the use case before committing to it.

## License

MIT. By contributing you agree your changes are released under the same license.
ENDOFFILE

# bug_report.md
cat > .github/ISSUE_TEMPLATE/bug_report.md << 'ENDOFFILE'
---
name: Bug report
about: Something isn't working correctly
labels: bug
---

**Connector**
Which integration is affected? (Bybit / Binance / MetaMask / Solana / Polymarket / MCP server / dashboard / settings UI / CLI / other)

**What happened**
A clear description of the bug. Include the exact error message or unexpected output if you have it.

**What you expected**
What should have happened instead?

**Steps to reproduce**
1.
2.
3.

**Environment**
- headless-tracker version: (run `bun run bin/headless-tracker.ts --version` or check `package.json`)
- Bun version: (`bun --version`)
- OS: (macOS / Linux / Windows)
- MCP host: (Claude Desktop / Cursor / ChatGPT / other / CLI only)

**Logs / output**
Paste relevant output here. Remove any API keys or wallet addresses before posting.

```
paste here
```

**Additional context**
Anything else that might help — account type, asset class, time window, etc.
ENDOFFILE

# feature_request.md
cat > .github/ISSUE_TEMPLATE/feature_request.md << 'ENDOFFILE'
---
name: Feature request
about: Suggest a new connector, tool, or capability
labels: enhancement
---

**Check ROADMAP.md first**
Is this already listed as planned or out of scope? Link: [ROADMAP.md](../../ROADMAP.md)

**What do you want to do?**
Describe the workflow you're trying to accomplish — not the feature itself, but the outcome you want.

> Example: "I want to ask Claude 'show my Kraken futures P&L for this week' and get a real answer."

**Which connector or area does this touch?**
- [ ] New connector (which exchange / wallet / market?)
- [ ] Existing connector improvement
- [ ] MCP tool / prompt
- [ ] Dashboard UI
- [ ] CLI
- [ ] Cost basis / P&L calculation
- [ ] Other

**Would you be willing to contribute this?**
- [ ] Yes, I can submit a PR
- [ ] Yes, but I'd need guidance
- [ ] No, just suggesting

**Additional context**
API docs, similar projects, or anything else that would help scope the work.
ENDOFFILE

# config.yml
cat > .github/ISSUE_TEMPLATE/config.yml << 'ENDOFFILE'
blank_issues_enabled: false
contact_links:
  - name: ROADMAP — what's planned and what's out of scope
    url: https://github.com/tamasPetki/HeadlessTracker/blob/main/ROADMAP.md
    about: Check here before opening a feature request.
ENDOFFILE

git add CONTRIBUTING.md .github/ISSUE_TEMPLATE/
git commit -m "Add CONTRIBUTING.md and GitHub issue templates"

echo "Done. Push with: git push"
