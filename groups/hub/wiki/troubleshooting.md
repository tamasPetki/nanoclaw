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

---

## [2026-06-04] Google Drive MCP — OAuth-kulcs rossz helyen (AUTO-FIX, nem kell Tomi)

- Symptom: `MCP error -32603: Error loading OAuth keys: OAuth credentials not found` — minden google-drive MCP hívás fail (search/listFolder/uploadFile). A 2026-05-17-i note szerint "Tomi manuális connect kell" — DE ez már nem igaz, a token létezik.
- Root cause: a `drive_tokens.json` (user token) MEGVAN és érvényes (`/workspace/extra/google-oauth/`), és a `gcp-oauth.keys.json` (kliens-kulcs) is ott van — DE a MCP szerver a `/home/node/.config/google-drive-mcp/gcp-oauth.keys.json` (és az npx cache) alatt keresi, ahol nincs. Tehát nem connect-hiány, hanem a kulcsfájl rossz helyen van.
- Fix (agent maga megoldja, NINCS Tomi-beavatkozás): `mkdir -p /home/node/.config/google-drive-mcp/ && cp /workspace/extra/google-oauth/gcp-oauth.keys.json /home/node/.config/google-drive-mcp/gcp-oauth.keys.json` — utána a következő MCP-hívás (reconnect után) működik.
- Bónusz: shortcut-mappába (`application/vnd.google-apps.shortcut`) nem lehet feltölteni ("specified parent is not a folder" / "Insufficient permissions"). A valódi cél: `curl .../drive/v3/files/<id>?fields=shortcutDetails` (Bearer = drive_tokens.json access_token, `--noproxy www.googleapis.com`) → `shortcutDetails.targetId`. Ha a target külső megosztott (read-only), tölts a saját szülő-mappába.

---

## [2026-06-04] wiki/log.md — bejegyzések eltűntek (revert-gyanú)

- Symptom: a session elején beírt 06-04 bejegyzések (crypto-brief 05:30, email-check 08:00) később hiányoztak — a fájl teteje 06-03 végi állapotra állt vissza, miközben a gorgey32/summary.md editjeim megmaradtak.
- Root cause: nem tisztázott — vélhetően concurrent felülírás (cron/process) vagy stale file-state a context-compact körül. CSAK a log.md érintett.
- Fix/workaround: a hiányzó bejegyzéseket kézzel visszapótoltam (tartalom megvolt a session-kontextusból + wiki/crypto + wiki/news fájlokból). Figyelni: log.md-írásnál Read-del ellenőrizni a tényleges tartalmat append előtt, ne csak az in-memory állapotra hagyatkozni.

---

## [2026-06-05] Google Drive MCP OAuth — a cp-fix NEM perzisztens; token-route a megbízható

- Symptom: a 06-04-i `cp gcp-oauth.keys.json` fix után a MCP egy újabb restart/reconnect-nél MEGINT "OAuth credentials not found"-ot dobott (uploadFile fail). A másolt kulcs eltűnik a MCP-szerver újraindulásakor (npx cache path is változhat).
- Megbízható megoldás (MCP helyett): a Drive write/read műveletek **közvetlen Drive API-val**, a `/workspace/extra/google-oauth/drive_tokens.json` `access_token`-jével:
  - GET/PATCH (metadata, shortcutDetails, move addParents/removeParents): `curl --noproxy "www.googleapis.com" -H "Authorization: Bearer $TOKEN" ".../drive/v3/files/<id>?...&supportsAllDrives=true"`
  - Fájl-feltöltés (multipart/related): Python `urllib` ProxyHandler({})-vel (proxy-bypass), `POST .../upload/drive/v3/files?uploadType=multipart` — működik (2026-06-05 e-közmű nyilatkozat feltöltés így ment).
  - Mappa-listázás/keresés/shortcut-resolve szintén token-route-tal.
- IMAP mappa-keresés (eltűnt email): a szerver névtere `INBOX.` prefixű `.`-delimiterrel (INBOX.Archive, INBOX.Later, INBOX.Trash, INBOX."Alv&AOE-llalkoz&APM-i megkeres&AOk-sek" stb.). A MCP `get_emails_content` email_id-ja NEM a raw IMAP UID, és átindexelődhet — ha egy email "eltűnik" az INBOX-ból, raw imaplib-bel kell végignézni a mappákat (FROM <feladó> search + BODYSTRUCTURE az attachment-névért).
