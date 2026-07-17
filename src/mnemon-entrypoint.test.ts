/**
 * Structural guard for the mnemon entrypoint reach-in.
 *
 * container/entrypoint.sh runs on every container start; the inserted
 * `mnemon setup --target claude-code` line is what registers the Claude Code
 * memory hooks. The entrypoint is a shell script, not an invocable function, so
 * the guard is structural: assert the setup invocation is present. Drop it on an
 * upgrade and the hooks silently never register — this test goes red.
 */
import fs from 'fs';
import path from 'path';

import { describe, it, expect } from 'vitest';

function entrypoint(): string {
  // From src/ up to repo root, then into container/.
  const p = path.resolve(__dirname, '..', 'container', 'entrypoint.sh');
  return fs.readFileSync(p, 'utf8');
}

describe('container/entrypoint.sh runs mnemon setup on start', () => {
  const text = entrypoint();

  it('invokes mnemon setup targeting claude-code', () => {
    expect(text).toMatch(/mnemon\s+setup\s+--target\s+claude-code/);
  });
});

describe('container-runner dynamic-spawn command runs mnemon setup', () => {
  // The dynamic spawn (`--entrypoint bash ... -c '... exec bun run ...'`)
  // BYPASSES container/entrypoint.sh, so the setup line must also be present
  // in the spawn command itself. Found missing 2026-07-03: entrypoint.sh had
  // the line (test above was green) while no spawned agent ever registered
  // hooks — this guard covers the path that actually executes.
  const runner = fs.readFileSync(path.resolve(__dirname, 'container-runner.ts'), 'utf8');

  it('spawn command string invokes mnemon setup before exec bun', () => {
    expect(runner).toMatch(/mnemon setup --target claude-code[^']*; exec bun run/);
  });

  it('mnemon failure cannot block agent spawn (|| true)', () => {
    expect(runner).toMatch(/mnemon setup[^']*\|\| true/);
  });
});
