---
name: status
description: Read-only health + capabilities report. Use when the user asks for system status, what's installed, what the bot can do, or runs /status or /capabilities. Covers session context, workspace mounts, installed skills, available tools, scheduled tasks.
---

# /status — System health + capabilities

Generate a read-only status report covering session state, workspace, installed skills, tools, and scheduled tasks. This skill replaces the v1 split between `status` (runtime) and `capabilities` (installed skills) — both are now one report.

**Main-channel check:** only the main channel has `/workspace/project` mounted.

```bash
test -d /workspace/project && echo "MAIN" || echo "NOT_MAIN"
```

If `NOT_MAIN`, respond with:
> Ez a parancs csak a fő chatben érhető el. Küldd `/status` vagy `/capabilities` oda.

Then stop — don't generate the report.

## Mit gyűjts

### 1. Session context

```bash
echo "Time: $(date)"
echo "Working dir: $(pwd)"
```

### 2. Workspace + mountok

```bash
ls /workspace/ 2>/dev/null
ls /workspace/group/ 2>/dev/null | head -10
ls /workspace/extra/ 2>/dev/null || echo "none"
```

### 3. Telepített skillek

```bash
ls -1 /home/node/.claude/skills/ 2>/dev/null
```

### 4. Container utils

```bash
which agent-browser stealth-browse 2>/dev/null
node --version 2>/dev/null
claude --version 2>/dev/null
```

### 5. Scheduled tasks

Hívd a `mcp__nanoclaw__list_tasks`-ot → kapd meg az aktív tasks-ot.

### 6. Available tools (statikus)

- **Core:** Bash, Read, Write, Edit, Glob, Grep
- **Web:** WebSearch, WebFetch
- **Orchestration:** Task, TaskOutput, TaskStop, create_agent, send_message
- **MCP (`mcp__nanoclaw__*`):** send_message, schedule_task, list_tasks, pause/resume/cancel/update_task

## Report format

```
🔍 *NanoClaw Status*

*Session:*
• Idő: 2026-04-20 14:30 CEST
• Dir: /workspace/group

*Workspace:*
• Group memory: ✓
• Extra mounts: N
• IPC: ✓

*Telepített skillek (N):*
• agent-browser · bluesky · email-assistant · pdf-reader · …

*Tools:*
• Core/Web/Orchestration/MCP: ✓
• Container: agent-browser ✓, stealth-browse ✓
• Node vX.Y.Z, Claude Code vX.Y.Z

*Scheduled tasks:*
• N aktív (vagy: nincs)
```

Alakítsd az outputot ahhoz amit tényleg találsz. Tömör, átlátható — ez gyors health check, nem deep diagnostic.
