---
title: PietScarlet Kft. — cég-szintű ernyő
created: 2026-05-06
updated: 2026-05-06
type: project
tags: [pietscarlet, projekt]
sources: [sources/pietscarlet/persona.md, sources/pietscarlet/email-check-workflow.md, sources/pietscarlet/known-scam-patterns.md]
---

# PietScarlet Kft.

Építőipari cég, Tomi (Petki Tamás Csaba) ügyvezetésével. Cég-szintű hub: email, könyvelés, általános admin és cross-project ügyek. A konkrét építési projektek külön oldalakon (Görgey 32, Csobánka, Felső Törökhegy).

## Cégadatok
- **Székhely:** 1034 Budapest, Bécsi út 58. I. em. 2. (Tomi 2026-05-06 megerősítette — minden hatósági/szolgáltatói levelezéshez ez. A Drive-ban szereplő Pünkösdfürdő u. 52-54. és Királyok útja 293. **régi**.)
- **Adószám:** 14208861-2-41 · **Cégjegyzék:** 01-09-180620
- **Email:** hello@pietscarlet.hu (általános), penzugy@pietscarlet.hu (könyvelés/Erika)
- Részletes cégadatok: `/workspace/global/references/cegadatok.md`

## Aktív projekt-portfólió

| Projekt | Fázis | Wiki |
|---------|-------|------|
| Görgey u. 32 (Vác) | Aktív kivitelezés | [gorgey32](../gorgey32/summary.md) |
| Felső Törökhegy (Vác) | Telekalakítás-előkészítés | [torokhegyi](../torokhegyi/summary.md) |
| Csobánka, Kilátó utca | Korai előkészítés | [csobanka](../csobanka/summary.md) |

## Kulcs-szereplők
- **Tomi** — ügyvezető, döntéshozó
- **Erika** ([könyvelő](../../entities/erika-konyvelo.md)) — penzugy@pietscarlet.hu, számlák célállomása
- **Tóth Róbert** ([Quadrat Consulting](../../entities/toth-robert-quadrat.md)) — tervező (Csobánka, Felső Törökhegy)

## Email kezelés (kötelező workflow)

Hétköznap **9 / 13 / 17 CET** asszisztens-trigger → új levelek lehúzása az átadott UID óta (saját email MCP, body-fetch default; header-only elemzés TILOS). Levelenként:

- **számla** → továbbítás Erikának, draft előkészítve
- **válaszra vár** → válasz-draft, kontextusgyűjtés (múltbeli email, Drive INDEX/CATALOG, Todoist, projekt-memória) ELŐBB
- **tájékoztató** → archive vagy Todoist task
- **egyéb** → kérdés Tomihoz

**Tilos partnernek kiküldeni Tomi jóváhagyása nélkül.** Preferált: card UX (`mcp__nanoclaw__ask_user_question`). Akció után konkrét evidencia (Message-ID, timestamp), nem csak ✅. UID state: `email-check-last-uid.txt`.

MCP-disconnect esetén 1× retry → utána strukturált failover-kérés asszisztenshez (host IMAP-pal lehúz). Hitelesítési hiba / IMAP-szerver le → nem failover, jelezz Tomira.

## Drive scope

- **Olvasás:** `/workspace/extra/pietscarlet-drive/` (rclone, napi 3:00 CET sync). Lookup: `pietscarlet-kontextus` skill INDEX/CATALOG-gal.
- **Írás:** `google-drive` MCP-vel a cég-szintű mappákba (Pénzügyek, Szerződések, Számlák stb.). Konkrét projekt-mappák módosítását inkább a projekt-agentre bízni.

## Ismert scam-minták (auto-archive + report)

- **FB Business Manager partner request** `noreply@business.facebook.com`-ról, ahol a kérelmező domain `member<NNN>.meta-agency-center.com` vagy `*.ai.agency.connect.center`. Közös jegy: **„agency"** + **„center"** valahol a domainben.
- Megfigyelt: 2026-05-02 (UID 2410), 05-04 (2418), 05-05 (2419 — variant subdomain).
- A feladó cím legitim Meta noreply, **a partner identifier a scam.** Tomi ne fogadja el a Business Suite-ban. Nem kell külön kérdezni; ha új domain mintázat jön, frissítsd ezt a listát.

## Kommunikáció
Magyar, tegezés. Projektvezető-szerű hozzáállás: ütemezés, határidő-emlékeztetés, proaktív flag-elés (engedélyek, anyagrendelés, alvállalkozói egyeztetés). Tömör.

## 2026-05-13 updates

**Forrás**: Tomi 05-13 11:04 + 11:09 chat (recovered 05-14).

- **Pilates számlák ellenőrzés**: csak a végén, kb 2 hét múlva. Várj a folyamatos érkezésre, addig ne nyit prio.
- **Espár Zsolt szerződés**: emailekből letölthető, Drive-ra a helyére kell tenni (`Szerződések/` alá vagy a projekt-mappába). **TEENDŐ pending**.
