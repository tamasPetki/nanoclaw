# work/ — a munka-követő ADATBÁZIS (nem md/json)

A design-sprint → BUILD munkakövetés (taskok, függőségek, állapot-átmenetek) **mind a `work.db`-ben** él.
Ez a Drift `intel/` tárának Axiom-megfelelője. Tomi szabálya (2026-06-15): a növekvő, strukturált adat
adatbázisba megy, NEM md/json fájlba — azok pár hét alatt kezelhetetlenek, és az agentek mégis reflexből
oda nyúlnak. Elv: `../METHODOLOGY.md` §13–14.

## Használat (a container cwd-je `/workspace/agent`)

```
bun work/work.ts help          # összes verb + flag
bun work/work.ts stats         # állapotonkénti darabszám + összesen + séma-verzió
bun work/work.ts task add --key K --title T [--kind .. --status .. --priority .. --feature .. --spec_ref .. --owner ..]
bun work/work.ts task update --key K [--status .. vagy bármely oszlop]
bun work/work.ts task done --key K [--health_score N]
bun work/work.ts task list [--status S] [--priority P] [--feature F] [--limit N]
bun work/work.ts dep add --task_key K --depends_on_key D
bun work/work.ts event add --task_key K --to_status S [--from_status F] [--note ..]
bun work/work.ts query "SELECT … "    # csak SELECT
bun work/work.ts maintain      # struktúra-smell + karbantartás
```

A `key` egy stabil slug (a bead-id megfelelője) — `task add`/`task update` erre **upsert**-el. Ha az
`add`/`update` **státusz-változást** hoz a meglévő sorhoz képest, automatikusan beír egy `task_events`
sort ({from,to}) ugyanabban a tranzakcióban; ha az új státusz `shipped`, beállítja a `closed_at`-ot.

## Fájlok

| Fájl | Mi | Élettartam |
|------|----|-----------|
| `work.ts` | a CLI | CORE tool (projektek közt marad) |
| `migrations.ts` | verziózott séma | CORE tool |
| `work.db` | az adat | PROJEKT-adat (switch-project archiválja) |
| `README.md` | ez | CORE |

**Táblák:** `tasks` (key=stabil slug, status, priority, feature, spec_ref, health_score, wip_note, owner, …) ·
`task_deps` (task_key → depends_on_key, UNIQUE) · `task_events` (from_status → to_status állapot-napló).

Séma-fejlesztés: új migrációt **appendelj** a `migrations.ts`-be (sosem szerkeszd a kiadottat); a CLI és a
host (`scripts/init-work-db.ts`) is alkalmazza induláskor. **Ne hozz létre itt md/json adat-fájlt.**
