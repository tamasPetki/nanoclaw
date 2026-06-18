# AKTUÁLIS PROJEKT — építőipari KKV projekt-/cégmenedzsment app (AI-asszisztált)

> Ez a PROJEKT-réteg (cserélhető). A CORE szereped a `CLAUDE.local.md`-ben, a módszertan a `METHODOLOGY.md`-ben. A teljes termék-brief: `product/brief.md` — OLVASD ELŐSZÖR. Projekt-váltáskor ez a fájl + a `product/` cserélődik, a CORE marad.

## A termék

Egy építőipari KKV **„operating system"-e**: ahol egy projekt (vagy az egész cég) költsége (terv-vs-tény), embere, döntései, fájljai, beszerzése és megfelelősége **egy helyen** van, és **az AI segít minden részletében**. Közepes, **<1 mrd Ft projektekhez**. HU piac/szabályozás. Tomi építőipari cég tulajdonosa, ma **semmilyen szoftvert nem használnak**.

> **⚠️ Tomi engagement-modellje (2026-06-18, ADR-030):** Tomi **folyamat-megfigyelő + domain-orákulum**, NEM közeli hands-on pilot-user. Saját szavaival: nem akar most valós adatot rögzíteni, az appot „akkor használja, ha már nagyon fejlett", most a *folyamatra* kíváncsi („mit hozol ki belőle"). **Következmény:** NE sürgesd a használatra, NE blokkolj az ő confirm-rate/valós-adat inputjára a közeljövőben. A közeli érték = a build-in-public folyamat-narratíva + autonóm haladás egy érett termék felé; Tomit fókuszált domain-kérdésekkel kérdezd (gazdagon válaszol). A fázis siker-jele: „építs valami tényleg fejlettet + tedd láthatóvá a folyamatot", nem „a pilot használja". (A termék-irány változatlan.)

A 9 fájdalompont + a ⭐ hang-jegyzőkönyv killer feature a `product/brief.md`-ben. A legfontosabbak: NAV-számla auto-import + terv-vs-tény költségkövetés; jelenlét (ki/mikor/hányan); helyszíni döntés-rögzítés (hang→AI-leirat, az egymásra mutogatás ellen); szétszórt fájlok/kommunikáció egy helyen; beszerzés/alvállalkozó (iBuild-szerű); munkavédelem/e-napló/jog.

## Phase 0 — INTERJÚ ELŐSZÖR (Tomi a user + domain-expert)

NE ess neki a mély tervezésnek, amíg nem érted a valóságot:
1. **Interjúzd Tomit a boton** (3-4 fókuszált kérdés, várd a választ, aztán mélyíts): milyen építőipart csinál (lakó/ipari/felújítás)? hány projekt + ember egyszerre? mit használ MA és mi a legrosszabb? hogy néz ki egy projekt elejétől a végéig? melyik fájdalom a legégetőbb?
2. **Elemezd a valós Drive-projektet** (lásd lent) — ez az adatmodell alapja a `DISCOVERY.md`-hez.
3. Delegálj Driftnek a versenytárs-/beszerzés-reconra (párhuzamosan).
4. CSAK ezután a mély tervezés.

## A design-sprint deliverable-jei (a `product/`-ban)

| Deliverable | Tartalom |
|-------------|----------|
| `DISCOVERY.md` | a Tomi-interjú + Drive-elemzés összegzése |
| `PAIN.md` | a 9 fájdalom rangsorolva + piac |
| `VISION.md` ← gate | a „KKV operating system" magja + wedge (mit nem tud a Procore/iBuild ÉS a „semmi szoftver") |
| `FEATURES.md` + `INTERACTION.md` | feature-szett + a mobil (helyszín) / web (iroda) flow + a hang-jegyzőkönyv |
| `ARCHITECTURE.md` ← gate | platform/stack; **NAV-integráció**; adatmodell (a Drive-ból); offline; HU-megfelelőség |
| `DESIGN-DECISIONS.md` | append-only ADR-napló (no re-litigate) |
| `MARKET.md` (Drift) | versenytárs, disztribúció, monetizáció, GTM |
| `RISKS.md` + `ROADMAP.md` ← gate | pre-mortem + a legszűkebb MVP. A `ROADMAP.md` a **MVP-narratíva** (prózai terv); a **task-szintű követés a `work` DB-ben** (`bun work/work.ts`, METHODOLOGY §13), nem md-listában. A `sprint-log.md` marad a napi Csináltam/Gondoltam/Holnap **próza**. |

## A Drive — valós projekt (READ-ONLY)

A **Görgey 32** (a legrendezettebb projekt) a `/workspace/extra/gorgey32`-n elérhető, **READ-ONLY** (a céges adat szent, NE módosítsd, NE szivárogtasd). Struktúra: `01 - Szerződések`, `02 - Engedélyeztetés`, `03 - Költségvetés`, `04 - Kivitelezés`, `05 - Grafika`, `06 - Értékesítés`, `07 - Társasház`, `12 - EON ügyintézés`, … + `Görgey kivitelezési tervezet.xlsx`. Ez mutatja, hogyan néz ki egy valós projekt → az adatmodell alapja. (A teljes céges Drive a host-on `/root/data/gdrive-pietscarlet` — kérd Tomitól/operátortól, ha több projekt kell.)

## Domain-invariánsok (a build-pipeline ezekre vigyáz)

- **Pénzügyi integritás:** költség terv-vs-tény pontos és auditálható; NAV/ÁFA-helyes; számla → kategória → projekt-költségsor hiánytalan.
- **Döntés/audit-napló:** minden helyszíni döntés/változás rögzített, visszakereshető (a „egy hét múlva máshogy értelmezik" drift ellen).
- **Adat-bizalom:** Tomi valós cégadatai BIZALMASAK — sosem szivárognak, sosem publikus példa.
- **Mobil-first a helyszínnek + web az irodának**, gyenge-net-tűrés (offline → sync).
- **HU-megfelelőség:** e-építési napló, munkavédelem, NAV.

## A termék és az AI

A termék NEM AI-first — a magja kétoldalú workflow/adat (költség, ember, döntés, fájl, beszerzés). AI-elem *lehet* (számla-auto-kategorizálás, hang→leirat, terv-vs-tény elemzés, jogi/műszaki tanács, alapanyag-keresés) — de tervezési döntés, ne öncélúan told bele. A fájdalmat oldd meg a legegyszerűbb eszközzel.

## Vakfolt — versenytárs korán

A tér zsúfolt (Procore, Buildertrend, Fieldwire, Autodesk; HU: iBuild, LiLBuild). A wedge: HU-lokalizált (NAV/ÁFA/e-napló/munkavédelem) + AI-natív + a valós workflow-ra szabott + Tomi mint design-partner. Drift méri fel (ne feltételezd).
