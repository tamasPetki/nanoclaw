# AKTUÁLIS PROJEKT — építőipari KKV menedzsment-app (growth-kontextus)

> Ez a PROJEKT-réteg (cserélhető). A CORE szereped a `CLAUDE.local.md`-ben. Projekt-váltáskor ez + a kutatási fájljaid cserélődnek/archiválódnak, a CORE marad.

## A termék (röviden)

Építőipari KKV projekt-/cégmenedzsment app (AI-asszisztált), <1 mrd Ft projektekhez, HU piac. Tomi a pilot-user + domain-expert (építőipari cég, ma semmi szoftver). A teljes brief Axiomnál: `product/brief.md` — kérd A2A-n, ha kell.

## Versenytársak (a te terepеd)

- **Nemzetközi:** Procore, Buildertrend, Fieldwire, Autodesk Construction Cloud, CoConstruct — drágák, túl-komplexek egy HU-KKV-nak, nem lokalizáltak.
- **HU/régió:** **iBuild** (Tomi említette — főleg az alvállalkozó-keresés), **LiLBuild** (~300k/év), + derítsd ki: Innobau, myPlan, CoCrafter, Almetra, és bármi más HU építőipari KKV-tool.
- **A rés (wedge-hipotézis, igazold/cáfold):** HU-lokalizált (NAV/ÁFA/e-napló/munkavédelem) + AI-natív + a valós workflow-ra szabott. Hol alászolgált a <1 mrd-os HU-építőipari szegmens?

## Beszerzés / alvállalkozó-ökoszisztéma

Hogyan működik ma a **tervből-árajánlatkérés** és az **alvállalkozó-keresés** (iBuild-szerű)? Milyen modellek, milyen reális MVP-szelet? Olcsó-alapanyag-keresés: van-e adatforrás/minta.

## A hírszerzési tár = ADATBÁZIS (nem fájl)

A teljes piac-/versenytárs-/fájdalom-/outreach-/GTM-tudás az **`intel` adatbázisban** él, a CLI-n át
(`bun intel/intel.ts …` — a verbek + táblák a `CLAUDE.local.md` „Folyamatos hírszerzés" szekciójában). Növekvő
adatot SOSEM md/json fájlba (`METHODOLOGY.md` §13). Táblák: competitors, pain_signals, outreach_targets,
channels, gtm_notes, insights, sources.

> A korábbi md-recon (competitor-tracker / pain-catalog / outreach-targets / gtm-playbook / market-notes /
> localization-feasibility / design-partner-profile) tartalma **migrálva az `intel` DB-be** — `intel stats` /
> `intel <noun> list` / `intel query "SELECT …"` a forrás. Kulcs-tények ott: NAV Online Számla = van M2M API
> (a #1 költség-fájdalom magja); e-napló = nincs nyílt API (workflow-moat); pilot = Tomi (kis társasház-építő).
