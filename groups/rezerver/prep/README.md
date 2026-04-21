# prep/ — Launch-felkészítő anyagok

> Ebben a mappában a `state.json.prep_backlog` item-eihez tartozó dokumentumok gyűlnek. Minden file egy prep-item outputja — playbook, analízis, draft, vagy audit-jegyzet.

## Fájlok

| Fájl | prep_backlog id | Mi van benne |
|------|-----------------|--------------|
| `objections.md` | `objection_playbook` | Top 15 venue-kifogás + Dani-válasz sablon |
| `competitors.md` | `competitor_weakness_matrix` | 5-10 HU foglalási rendszer gyenge-pont mapping + exploit-mondatok |
| `seasonality.md` | `seasonality_map` | HU HoReCa havi naptár + launch timing javaslat |
| `trigger-events.md` | `trigger_event_monitor` | Napló: új venue nyitás, menedzser-váltás, konkurens-churn |
| `landing-audit.md` | `landing_e2e_audit` | Dani ügyfél-szemmel végigjárja a rezerver.com/demo-t |
| `deliverability.md` | `email_deliverability` | SPF/DKIM/DMARC + warmup terv |
| `launch-content.md` | `launch_content_battery` | LinkedIn poszt, FB komment, press release draft (email NEM itt) |

## Nincs külön file (meglévő helyre megy):

| prep_backlog id | Hova |
|-----------------|------|
| `venue_tiering` | `venue_pipeline.json` (tier/segment/estimated_event_volume mezők) |
| `personalization_hooks` | `venue_pipeline.json` (hook mező per target) |
| `referral_partner_list` | `referral_pipeline.json` (CRM-szerű adat, nem doc) |

## Workflow

Minden session-ben: `state.json.prep_backlog` → legalacsonyabb `priority` + legrégebbi `last_touched` → 1 item előrelépés. `last_touched` frissítés + `status` váltás (`not_started` → `in_progress` → `done`).

Ha done: `status: "done"`, `last_touched: mai dátum`. A file megmarad és launch-kor referencia lesz.
