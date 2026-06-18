# intel/ — a hírszerzési tár ADATBÁZIS (nem md/json)

A piac-/versenytárs-/fájdalom-/outreach-/GTM-tudás **mind az `intel.db`-ben** él. Ez Tomi szabálya
(2026-06-15): a növekvő, strukturált adat adatbázisba megy, NEM md/json fájlba — azok pár hét alatt
kezelhetetlenek, és az agentek mégis reflexből oda nyúlnak. Elv: `../METHODOLOGY.md` §13–14.

## Használat (a container cwd-je `/workspace/agent`)

```
bun intel/intel.ts help        # összes verb + flag
bun intel/intel.ts stats       # táblák + sorszám + séma-verzió
bun intel/intel.ts <noun> add --<field> value …
bun intel/intel.ts <noun> list [--<field> value] [--limit N]
bun intel/intel.ts query "SELECT … "    # csak SELECT
bun intel/intel.ts maintain    # dedup/smell + karbantartás (heti)
```

Nounok → táblák: `competitor`→competitors · `pain`→pain_signals (dedup `--dedup_key`, frequency++) ·
`target`→outreach_targets · `channel`→channels · `gtm`→gtm_notes · `insight`→insights · `source`→sources.

## Fájlok

| Fájl | Mi | Élettartam |
|------|----|-----------|
| `intel.ts` | a CLI | CORE tool (projektek közt marad) |
| `migrations.ts` | verziózott séma | CORE tool |
| `intel.db` | az adat | PROJEKT-adat (switch-project archiválja) |
| `README.md` | ez | CORE |

Séma-fejlesztés: új migrációt **appendelj** a `migrations.ts`-be (sosem szerkeszd a kiadottat); a CLI és a
host (`scripts/init-intel-db.ts`) is alkalmazza induláskor. **Ne hozz létre itt md/json adat-fájlt.**
