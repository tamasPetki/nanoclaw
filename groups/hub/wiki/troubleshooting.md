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

## [2026-05-31] Reddit proxy GB IP — warmup ABORT

- **Symptom:** `[worker:bulltrapp] warmup ABORT — proxy GB IP (82.40.124.154, Heston, GB)`. Session el sem indult (US-sticky követelmény), nap kiesett.
- **Root cause:** A `REDDIT_PROXY` (`cr.us` sticky) néha GB IP-t ad vissza (DataImpulse pool hiba). A pre-task script nem ellenőrizte az IP geolocation-t a session indítása előtt.
- **Fix (host-szintű — Tomi task-script frissítése kell):** A `task-bulltrapp-warmup` és `task-rezerver-warmup` pre-task script-jeibe IP-ellenőrzés hozzáadása:

```bash
COUNTRY=$(curl -s --max-time 5 ipinfo.io/country | tr -d '\n')
if [ "$COUNTRY" != "US" ]; then
  echo "{\"wakeAgent\": false, \"data\": {\"skip_reason\": \"proxy not US, got $COUNTRY\"}}"
  exit 0
fi
echo "{\"wakeAgent\": true}"
```

  Ha nem US → `wakeAgent: false` (session el sem indul, nap kiesés helyett csak skip). Proxy csere: DataImpulse panelben új US sticky sessid, vagy `cr.us;sessttl.30` variáns.

## [2026-06-01] TickTick add_task: leírás nem jelenik meg
- Symptom: 15 task `add_task --desc`-kel létrehozva, de a TickTick UI egyiknél sem mutatta a leírást; get_task-nál `content:"" desc:""` (a desc el is tűnt sync után).
- Root cause: TEXT-kind tasknál a TickTick a `content` (markdown notes) mezőt jeleníti meg; a `desc` csak CHECKLIST-kind taskoknál él, TEXT-nél nem perzisztál.
- Fix: a leírást MINDIG a `content` mezőbe tedd (add_task `content=...` vagy edit_task `content=...`), NE `desc`-be. A `desc` csak akkor, ha checklist-item (`items`) van.
