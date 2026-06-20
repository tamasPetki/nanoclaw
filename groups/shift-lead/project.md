# AKTUÁLIS PROJEKT — "Second Memory" (proaktív személyes memória, ami tényleg működik)

> Ez a PROJEKT-réteg (cserélhető). A CORE szereped a `CLAUDE.local.md`-ben, a módszertan a `METHODOLOGY.md`-ben, a cross-project tanulságok a `LEARNINGS.md`-ben. A teljes termék-brief: `product/brief.md` — OLVASD ELŐSZÖR. Az ötlet magja az `IDEAS-BACKLOG.md` #1 + a 2026-06-19 design-riff.
>
> **PIVOT 2026-06-20:** az építőipari KKV-app (Pallér) ARCHIVÁLVA (`archive/construction-2026-06/`) — Tomi döntése (unalmas neki; a process-érték elfogyott, mert nem user). A CORE (én + Drift + METHODOLOGY + LEARNINGS + build-pipeline + work/intel infra + a working rapport) változatlanul ÉL és újrahasznosul. A PietScarlet/Görgey valós cégadat + a `company-pietscarlet.md` + a construction `.secrets` BIZALMAS marad, az archívban; soha nem szivárog, nem publikus, nem keveredik az új termékbe.

## A termék (egy mondat)

Egy **proaktív személyes memória**: zéró rögzítési-erőfeszítéssel beszív abból, amit úgyis termelsz (üzenetek, hangposta, fotók, email, naptár), kinyeri belőle ami SZÁMÍT (emberek, dátumok, ígéretek, döntések), és **magától felszínre hozza a megfelelő EGY dolgot a megfelelő pillanatban** ("megígérted Péternek a múlt héten, hogy X"; "ez a számla kedden jár le"). NEM egy jegyzetelő, amit etetni kell.

## ⭐ A make-or-break tézis (ez vezérel MINDENT — backlog #1 / a moat-vs-platform kapu)

A RECALL/lekérdező réteget a platformok (Claude/ChatGPT desktop + connectors) gyorsan commoditizálják, ÉS náluk a disztribúció → ott építeni = halál. A termék CSAK akkor él, ha arra fókuszál, amit a nagyok strukturálisan NEM csinálnak meg:
1. **Proaktív, alacsony-zajú, jól időzített felszínre hozás** — az asszisztensek PULL-ok (kérdezni kell); egy memória, ami megvárja a kérdést, az csak keresés. A meg-nem-kérdezett "holnap ígértél Kovácsnak árajánlatot" a LÉLEK.
2. **Off-platform capture** — szóbeli ígéret hívásban, fotó egy névjegyről, helyszíni döntés. Nincs benne email/naptárban, egyetlen connector sem látja.
3. **Perzisztens, strukturált commitment-gráf + életciklus** — ígéret→teljesítetlen→nudge→kész mint STATEFUL termék-viselkedés, nem chat-session.

→ **Survives ONLY as: proaktív + VERTIKÁLIS + birtokol egy capture/bizalom-loopot, amivel a nagyok nem bajlódnak.** A "Claude desktop mindenre rákötve" verzió PONT az, amit NEM építünk. Ez a make-or-break kapu — minden tervezési döntés ezen méretik.

> ⚠️ **ÉLESÍTÉS (2026-06-20, Drift digest 2/4/10 — három független megerősítés):** a fenti #2 (off-platform capture mint "amivel a nagyok nem bajlódnak") **CÁFOLT** — a nagyok PONT ezzel bajlódnak (Meta←Limitless/Rewind, Amazon←Bee, OpenAI-device), és RE-ben is commoditizálódik (Rechat). A #1 (proaktív push) is ZÁRT a platformon (Pulse/Spark/Google "commitments"). Mind a három versenytárs-réteg (platform / ambient-wearable / horizontális AI-chief-of-staff) capture+digest+action-item — **EGYIK SEM modellez stateful commitment-LIFECYCLE objektumot.** → A defendálható tézis: **NEM "azt capture-öljük, amit ők nem", hanem "a capture-ből stateful commitment-LIFECYCLE-t csinálunk (követett ígéret → felhozva a pillanatban → lezárva), amit ők NEM".** A capture/push a commoditizálódó FEED; a #3 (a lifecycle) az EGYETLEN tartós differenciátor. A moat keskenyebb, de háromszor megerősített. Részletek: `product/MOAT.md` §8-10, `RISKS.md` §10, `DESIGN-DECISIONS.md` ADR-008.

## ⚠️ A megfordított design-sprint sorrend (a kulcs-módszertani adaptáció)

Az építőiparnál interjú-először mentünk. ITT fordítva: **ELŐBB a wedge + DISZTRIBÚCIÓ (a moat-kapu), AZUTÁN a feature-ök.** Mert (a) a backlog maga jelölte make-or-break-nek; (b) Tomi #1 tézise: "a disztribúció a legnehezebb, pláne az AI-világban" → minden ötletet a *beépített csatornája*, nem a build-nehézsége szerint ítélünk; (c) a tér platform-dominált → ha a wedge nincs meg, minden más hiábavaló.

## Phase 0 — A WEDGE + DISZTRIBÚCIÓ kapu (NEM feature-tervezés)

1. **Drift: vertikális/törzs-kutatás (a moat gerince).** Melyik szűk törzsnek kerül a felejtés a LEGTÖBBE + hol gyűlnek össze + van-e BEÉPÍTETT csatorna hozzájuk? (értékesítők / alapítók / tanácsadók / ügyvédek / ingatlanosok / recruiterek …). Drift OWNER, design-fázis: a KERETET adom (a make-or-break tézis + a moat-vs-platform kapu), NEM query-listát; hagyom szabadon, várom az off-frame meglepetést.
2. **Én: a moat-kapu framing + a vertikál-választás kritériumai** (whose-forgetting-costs-money × congregate × built-in-channel × off-platform-capture-fit), majd a `DISCOVERY.md` + `MOAT.md`.
3. **Tomi mint candidate-user + domain-input** (ADR-030 szelleme átöröklődik: ne pörgesd túl, de itt Tomi MAGA is user lehet — mit felejt el, ami pénzbe kerül, használná-e). Fókuszált kérdések, ne blokkolj rá.
4. CSAK ezután a feature/engine/architektúra terv.

## A design-sprint deliverable-jei (a `product/`-ban) — moat-first sorrend

| Deliverable | Tartalom |
|-------------|----------|
| `DISCOVERY.md` | a Drift-kutatás + Tomi-input + a vertikál-shortlist összegzése |
| `MOAT.md` ← gate-kritikus | a make-or-break kapu: proaktív + vertikális + capture/bizalom-loop; mit NEM tud a platform; a választott törzs + a beépített csatorna |
| `VISION.md` ← gate | a lélek: zéró capture + proaktív surfacing; a wedge kikristályosítva |
| `FEATURES.md` + `INTERACTION.md` | az engine (ingest→extract→gráf+proaktív reasoner) + a nudge + az "ask anything" felület; a form-factor (a notification A termék) |
| `ARCHITECTURE.md` ← gate | 3-réteg engine; tiered modellek (olcsó extract / frontier surfacing); KG + vektor + idő-index; **privacy existential** (user owns/exports/deletes, never trained-on); stack/hosting |
| `DESIGN-DECISIONS.md` | append-only ADR-napló (friss kezdés) |
| `MARKET.md` (Drift) | törzs, versenytárs (platform + niche), disztribúció (a viral/shared-artifact loop), monetizáció (prosumer-lead), GTM |
| `RISKS.md` + `ROADMAP.md` ← gate | pre-mortem (a make-or-break kapu mint #1 kockázat) + a legszűkebb MVP (egy törzs, egy capture-csatorna, egy proaktív nudge, ami működik) |

## Domain-invariánsok (a build-pipeline ezekre vigyáz)

- **Privacy existential:** ez a legszemélyesebb adat. A user birtokolja, exportálja, törli; SOHA nem eladva/tréningelve. A bizalom MAGA a termék. (On-device opció a legérzékenyebbre.)
- **Proaktív, de alacsony-zaj:** túl sok nudge = uninstall; a tökéletes EGY = mágia. A jól-időzített, ritka, releváns felszínre hozás a MOAT, nem a RAG-keresés.
- **Zéró capture-effort:** a body láthatatlan (share-target / email-forward / hang / fotó / naptár auto-ingest). "Az app, amit megnyitsz" = a memória-appok halála. A notification + az "ask anything" az EGYETLEN rendszeres UI.
- **Help, not admin (átöröklött észak-csillag, `product/PREFERENCES.md`):** a gép DOLGOZIK helyetted (auto + tanul), nem ad több kattintást.

## A termék és az AI

Itt az AI a MAG (a construction-nal ellentétben): az extract (LLM) + a proaktív reasoner (mit hozzon fel MOST) a termék lelke. DE a moat NEM "AI rákötve az adatra" (azt a platform eszi) — a moat a proaktív+vertikális+capture-loop. Tiered modell-routing: olcsó/gyors (Haiku-class v. on-device) a folyamatos extractra; frontier (Opus/Sonnet-class) a surfacing-döntésre + nehéz recallra. Model-agnostic.

## Unfair advantage (miért MI)

Fél Tomi-ötlet MINKET ír le (backlog meta): a second-memory PONT az, amit én magamon futtatok (a memória/LEARNINGS rendszerem). **Élő instance vagyok a koncepcióból.** És Tomi MÁR éli a UX-et: ahogy velem beszél Telegramon — "ez, csak az egész életedről, nem egy projektről". A demó = megmutatni, ahogy már most dolgozik velünk.

## Vakfolt — a platform korán (a #1 versenytárs NEM egy startup)

A fő fenyegetés a platform (Claude/ChatGPT/Gemini + connectors + memory), nem egy niche-app. Drift méri: mit tudnak MA proaktívan (vs pull), mit látnak off-platform, van-e stateful commitment-lifecycle-jük. A wedge folyamatos nyomás-tesztet igényel (a kapu nem egyszeri, hanem álló).
