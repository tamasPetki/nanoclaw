Listázd ki a hub elérhető slash command-jait egy `mcp__nanoclaw__send_card`-ban:

```
title: "📋 Hub parancsok"
description: "Telegram-on a `/` gombbal autocomplete. Argumentum a parancs után space-szel."
children:
  - { type: "section", title: "🔄 Riportok / pillanatkép", children: [
      { type: "text", text: "• `/projektek` — projekt-státusz\n• `/teendok` — Todoist 7 nap\n• `/naptar` — ma + holnap" }
    ]}
  - { type: "section", title: "⚡ Cron-ok ad-hoc", children: [
      { type: "text", text: "• `/email` — email-check\n• `/hirek` — napi digest\n• `/edzo` — reggeli edző-riport" }
    ]}
  - { type: "section", title: "🔍 Egyéb", children: [
      { type: "text", text: "• `/wiki <query>` — wiki keresés\n• `/szia` — bemutatkozás\n• `/help` — ez a lista" }
    ]}
fallbackText: "Parancsok: /projektek /teendok /naptar /email /hirek /edzo /wiki /szia /help"
```
