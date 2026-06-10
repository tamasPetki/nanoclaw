---
name: status
description: Read-only rendszer-állapot riport. Akkor használd, ha Tomi rákérdez "mi a helyzet a rendszerrel", "mit tudsz", "milyen tool-ok vannak", "mi van telepítve", vagy `/status` / `/capabilities` parancsot küld. Lefedi: session context, workspace mountok, telepített skillek, MCP tool-ok, scheduled task-ok.
---

# /status — Rendszer-állapot riport

Read-only health + capabilities riport. **Mindig `mcp__nanoclaw__send_card`-ban add vissza** — több diszkrét tételt sorolsz fel, card a természetes forma.

## Mit gyűjts

### 1. Session context

```bash
echo "Idő: $(date '+%Y-%m-%d %H:%M %Z')"
echo "Dir: $(pwd)"
echo "Agent: $ASSISTANT_NAME ($GROUP_NAME)"
```

### 2. Workspace mountok

```bash
ls /workspace/ 2>/dev/null
ls /workspace/extra/ 2>/dev/null || echo "nincs extra mount"
```

### 3. Telepített skillek

```bash
ls -1 /app/skills/ 2>/dev/null
```

### 4. MCP-szerverek (live status)

```bash
# Az agent-runner regisztrált MCP-ket env-ben tartja
env | grep -E "^NANOCLAW_MCP|^MCP_" | head -10
```

Ha lehet: `mcp__nanoclaw__list_mcp_servers` (ha létezik), vagy egyszerűen sorold fel a container.json-ből származó listát.

### 5. Container utils

```bash
node --version 2>/dev/null
which agent-browser stealth-browse 2>/dev/null
```

### 6. Scheduled tasks

Hívd a `mcp__nanoclaw__list_tasks`-t — kapd meg az aktív task-okat (recurrence + következő futás).

## Card formátum

```
title: "🛠 Rendszer-állapot"
description: "<idő> · <agent neve> · <session-id rövid>"
children:
  - "**Workspace:** group ✓ · extra: <N>"
  - "**Skillek (N):** agent-browser, email-assistant, ticktick, wiki, ..."
  - "**MCP:** withings ✓ · email-pietscarlet ✓ · gcal ✓ · ..."
  - "**Cron:** N aktív task (next: <legközelebbi cron + idő>)"
  - "**Container:** node vX.Y · claude vX.Y · agent-browser ✓"
fallbackText: rövid plain-text összefoglaló (Telegram-kompat ahol nincs card)
```

Tömör, átlátható — gyors health check, nem deep diagnostic. Egyetlen card-ban férjen el. Ha valami **hibás** (pl. MCP `failed` státusz), külön sor `⚠`-vel.

## Tomi-stílus

- Magyar, tegezős. No em-dash, no AI-fillers.
- Ha minden zöld, ne magyarázz hosszan — egy sor: "Minden fut".
- Ha probléma van, konkrétan mondd: "withings MCP failed (last error: ...)".
