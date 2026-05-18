---
title: Troubleshooting napló
description: Megoldott problémák és fix-ek archívuma. Append-only.
---

# Troubleshooting

Ha session közben elakadás/hiba történt és sikerült megoldani, ide kerül a megoldás. Cél: ne kelljen kétszer kitalálni.

Formátum:

```
## [YYYY-MM-DD] <rövid tünet>
- Symptom: <mit láttam>
- Root cause: <miért történt, ha kiderült>
- Fix: <mi oldotta meg>
```

---

## [2026-05-17] /workspace/group/.secrets — helytelen elérési út

- Symptom: `bash: /workspace/group/.secrets: No such file or directory` — scheduled task sikertelen
- Root cause: Korábbi prompt-sablonokban `/workspace/group/.secrets` szerepelt; a helyes mount-pont `/workspace/agent/.secrets`
- Fix: Minden scheduled task prompt-ban és bash scriptben a helyes path: `source /workspace/agent/.secrets`
- Érintett feladatok: cron-os taskokban (04:00, 06:00, 08:00) három egymást követő napon ismétlődött (máj. 12, 15, 16)

---

## [2026-05-17] Google Drive OAuth — nincs konfigurálva

- Symptom: `MCP error -32603: Error loading OAuth keys: OAuth credentials not found` és `app_not_connected` — minden google-drive MCP hívás fail
- Root cause: Google Drive MCP OAuth credentials manuális setup szükséges a connect_url flow-n keresztül (nem auto-konfiguráló)
- Fix: Tomi manuálisan kell csatlakozzon — nyissa meg a connect_url-t amit a hiba-válasz tartalmaz, és végezze el a browser OAuth logint
- **User action required** — ez nem auto-fix, Tomi beavatkozása szükséges
