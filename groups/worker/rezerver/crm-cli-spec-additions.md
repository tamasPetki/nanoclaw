# Rezerver CRM CLI — feature request: `venue-add`, `partner-add`, `country` field

**Context (HU):** A `ncl rezerver` CLI most csak meglévő sort tud update-elni (`venue-set --id`, `partner-set --id`), ÚJ venue/partnert nem tud felvenni, és nincs `country` mező. A growth agent mostantól UK venue-ket és rendezvény-alvállalkozókat gyűjt (új sorok), amik egyelőre workspace-fájlokban állnak (`rezerver/uk_venues.json`, `rezerver/subcontractors.json`), amíg a CLI be nem tudja venni őket. Az alábbi 3 bővítés kell. Tartsd a meglévő CLI-konvenciókat: `--hyphen-case` flag → `underscore_case` oszlop; ismeretlen flag → `extra` JSON; az első agent-írás `ingest_mode='frozen'`-re állít (tulajdonba vesz, hogy a legacy JSON-mirror ne írja felül); a set/add a művelet után a teljes sort JSON-ként visszaadja.

Backing store: host `data/rezerver-crm.db`, read-mirror: `rezerver/.crm-export/*.json`.

---

## 1. `venue-add` (új venue létrehozása)

- **Verb:** `ncl rezerver venue-add --name <name> [--city ...] [--country ...] [bármely venue-mező]`
- **Viselkedés:** INSERT új venue sor. `id` automatikus (`max(id)+1`). `ingest_mode='frozen'`, `created_at`/`updated_at`=now. Ismeretlen flag → `extra` JSON (ugyanúgy mint venue-set).
- **Kötelező:** `--name`.
- **Dedupe-guard:** ha létezik nem-archivált venue azonos `(lower(name), lower(city))`-vel → hibával álljon le, hivatkozva a meglévő id-re, KIVÉVE ha `--allow-dup` van megadva. (Így az agent idempotens marad újrafuttatáskor.)
- **Visszatérés:** a létrehozott sor JSON-ként (az új `id`-vel), pontosan ahogy a `venue-set` visszaad.

## 2. `partner-add` (új partner/alvállalkozó létrehozása)

- **Verb:** `ncl rezerver partner-add --name <name> [--type ...] [--specialization ...] [bármely partner-mező]`
- Ugyanaz a szemantika mint venue-add: auto id, `frozen`, extra-overflow, dedupe `lower(name)`-re + opcionális `--allow-dup`, JSON-echo.
- **Kötelező:** `--name`.
- Megjegyzés: az alvállalkozók ide jönnek `type='subcontractor'` + `specialization=<kategória>` (fodrász, vőfély, DJ, dekoros, catering, fotós, zenekar, stb.).

## 3. `country` mező a `venue` táblán

- Adj egy first-class `country` oszlopot a venue táblához (TEXT, konvenció: 2-betűs nagybetűs, pl. `"HU"`, `"UK"`).
- **Backfill:** a meglévő 67 venue kapjon `country='HU'`-t.
- Legyen állítható venue-set/venue-add-on át (most extra-ként megy, promote-old valódi oszloppá).
- `venue-list` kapjon `--country` szűrőt.
- (Opcionális, de hasznos: ugyanez a `country` oszlop a `partner` táblán is.)

## 4. Opcionális / nice-to-have (alacsony prioritás)

- `media-add`, `fbgroup-add` a konzisztenciáért (ugyanaz a minta).
- Soft-delete / archive: ha a `status` szabad szöveg, akkor `venue-set --id N --status archived` már működik; ha nem, adj módot archiválásra, hogy a teszt/rossz sorok elrejthetők legyenek (most nincs delete verb).

---

## Implementálás után

1. Erősítsd meg, hogy az új verb-ek megjelennek a `ncl rezerver help`-ben.
2. Az agent ezután a meglévő workspace-fájlokat (`uk_venues.json`, `subcontractors.json`) bemigrálja a DB-be az új add-verb-ekkel (név/város dedupe-pal), és átállítja a napi cron-task-okat, hogy közvetlenül a DB-be írjanak.

---

## Séma-referencia (jelenlegi, mező-igazításhoz)

**venue settable fields:** name, city, segment, tier, hook, trigger_event, status, legitimacy_check, notes, contact_email, contact_phone, website_url, instagram, owner_name, price_range, contact_name, contact_role, booking_email, facebook, venue_type, event_types, capacity_seated, capacity_standing, est_events_per_year, prestige, current_booking_tool, pain_points, price_tier, fit_score, fit_reason, stage, source, next_action, next_action_date, owner, needs_verification, confidence, extra. **(+ javasolt: country)**

**partner settable fields:** name, company, type, city, website, instagram, email, contact_known, tier, segment, note, contact_name, phone, coverage_area, preferred_channel, years_active, est_events_per_year, prestige, price_segment, specialization, referral_potential, warm_intro, reciprocity, stage, next_action, next_action_date, extra. **(+ javasolt: country opcionális)**
