Email-check ad-hoc futtatás. Ugyanaz a workflow mint a `task-hub-email-check` cron-é, de manuális trigger:

1. Futtasd a pre-filter scriptet:
```bash
source /workspace/agent/.secrets && python3 /workspace/agent/email-prefilter.py
```

2. A `data` mezőből megkapod fiókonként az új levelek headerjeit (3 fiók: pietscarlet, lupaobol, trinkenessen).

3. Workflow innen ugyanaz mint a cron-prompt-ban: per-fiók summary, ask_user_question card döntés-igénylő itemekhez, "send_email" ha approve. A részletek a `/app/skills/email-assistant/SKILL.md`-ben.

4. Eredmény Tomi-nak Telegramra (NEM Discord — minden Discord channel megszűnt).

Ha nincs új levél: rövid card "📭 Üres inboxok (3 fiók)". NE küldj részletes elemzést ha 0 új.
