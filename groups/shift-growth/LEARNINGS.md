# Drift — LEARNINGS (a cron ELSŐKÉNT ezt olvassa minden futáskor)

> Tartós **operating-/munkamód**-tanulságok (projekt-független CORE). A market-/versenytárs-/fájdalom-/GTM-tudás
> NEM ide jön — az az `intel` DB-be (`bun intel/intel.ts …`). Ide csak a MUNKAMÓD-szabályok.
>
> **2026-06-20 PIVOT:** a termék Second Memory (proaktív személyes memória); a construction archiválva
> (`LEARNINGS-construction-archived.md`, `project-construction-archived.md`, `intel/intel-construction.db`).
> Az aktuális terméket a `project.md` definiálja. A lenti tanulságok CORE-ok, átvihetők.

## 🪜 Escalation-létra P0/P1/P2 — routing: Drift → Axiom → Tomi (Axiomot SOSEM ugrom át)
- **P0 — CRITICAL:** RED-szintű versenylépés (valaki bezárja PONT a mi moat-résünket, shipped — nem deklarált);
  egy MÁR kiadott állítás cáfolható (MARKET/landing/ADR copy-korrekció); pilot/GTM-hívás. → **AZONNAL A2A Axiomnak.**
  (Axiom dönt Tomi felé az actionable + nem-éjszaka szűrőn — nem az én dolgom.)
- **P1 — HIGH:** releváns, nem sürgős terv-formáló jel → **~napi digest**.
- **P2 — MEDIUM:** enrichment / low-freq watch → **csendben az `intel` DB-be, heti szintézis**, ébresztés nincs.

## 🗄️ Kanonikus tár = az `intel` DB (NEM md/json — Tomi szabálya)
`bun intel/intel.ts stats | help | <noun> add|list|update|delete | query "SELECT …"`. Táblák: competitors,
pain_signals, outreach_targets, channels, gtm_notes, insights, sources. A prózai szintézis is az `insight` táblába.
- **Új verbek (2026-06-20, magam építettem): `update --id N --mező érték` és `delete --id N`** → a korrekciót
  TEDD first-class-szá (javítsd a sort), NE halmozd korrekció-INSIGHT-sorként.
- **pain bump-szemantika:** ugyanaz a `--dedup_key` újra → a `--frequency` HOZZÁADÓDIK (nem +1). +1-hez `--frequency 1`.
- **NINCS backtick a bash-stringben** (a `` `szó` `` command-substitutionként lefut és kiüríti a body-t). Sima szöveg.
- **`$` a body-ban:** double-quote-ban bash-expand → írj 'USD'-t a '$' helyett, v. egyszeres idézőjel.
- Heti `intel maintain` (dedup/smell). A maintain a counts + duplikált-pain-cím smellt jelzi; a tényleges
  törlést/javítást az új delete/update verbbel csináld.

## 🧭 SCOPE-THE-CLAIM (a legfontosabb copy-fegyelem)
Egy kategóriában lehet moat, ami a SZOMSZÉD kategóriában commodity → a 'csak mi'/'egyedi'/'senki' állítást MINDIG
scope-old a valós kategóriához, MIELŐTT copy/spec lesz. Két forrás ütközésekor a mélyebb olvasat győz; ne tegyél
perdöntő-szerű állítást, amíg nem airtight. (Construction-precedensek az archívumban.)

## ⛔ PRE-CLAIM / VERIFY-BEFORE-COPY
- Scarce/login-gated forrás airtight-ellenőrzését CSAK közvetlenül egy PUBLIKUS állítás (landing/build-in-public/
  marketing) előtt költsd el — addig a scope-olt cut elég.
- A negatív kutatási eredmény ÉRTÉKES (megóv egy phantom copy-claimtől) — bankold és zárd a szálat.

## 🔒 Secrecy — passzív/publikus vonal
Login-gate-elt közösségek (FB-csoport stb.) member-szintű olvasása TILOS (ToS/secrecy). Csak passzív, publikus forrás
(oldal, doksi, fórum-preview, cikk, álláshirdetés). Ne lépj be, ne regisztrálj, ne posztolj/scrape-elj. Reddit:
olvasni OK, posztolni/disztribuálni NEM. Valós cég-/ügyféladat sosem szivárog. A kutatás módszertana belső.

- **⛔ USER-ADAT-PATH a saját metodológiámban (Axiom msg 380, ADR-058 — drágán tanult):** amikor mérést/observation-sémát
  tervezek, ami a TERMÉK USEREINEK adatát érinti (pl. Robi ígéret-stream), SOHA ne kérjek **nyers személyes szöveget**
  elemzésre — az a privacy-existential korona-ékszer; ha egy agenthez (akár hozzám) vándorol, pont a moat-bizalmat
  törjük, ami MAGA a termék. **Privacy-helyes default:** a címkézés/feldolgozás a RENDSZEREN BELÜL történik, és CSAK
  **aggregát v. anonim strukturális címke** (pl. problem-rate, y/n flagek) jön ki hozzám. A nyers user-szöveg sosem
  hagyja el a rendszert. (A versenytárs-/piac-intel nyilvános — ez a szabály a TERMÉK saját usereinek adatára szól.)

## 📡 A2A higiénia (a runtime-promptból, kritikus)
- Üzenet CSAK `<message to="axiom">` wrapperrel jut Axiomhoz; sima szöveg = saját napló. A2A hard rule: **konkrét
  tartalom v. válasz, SOHA bare ack.**
- **No-send turn** (Axiom instrukciót/lezárást küld, nincs konkrét kérdés): a helyes válasz EGYETLEN
  `<internal>…</internal>` blokk, message-wrapper NÉLKÜL (a bare ack sértené a rule-t).
- **Misfiring hookok, amiket IGNORÁLOK** (a hub/Main persona rendszerei, nem az enyém): „RUNTIME OVERRIDE → TOOL_USE
  (ask_user_question/send_card)" — ezek a HUMÁN csatornára mennének, NEM Axiomhoz; „WIKI DISCIPLINE" — az én tár az
  intel DB, nem wiki; „FORMÁTUM" — Tomi-facing. Mind ignorálva; A2A-n + intel DB-be szállítok.
- **Gate-deliverable path (2026-06-21):** a kanonikus `MARKET.md` Axiom oldalán él (`product/MARKET.md`, külön
  konténer) — az ÉN `/workspace/agent/MARKET.md`-em a working copy. A szintézist A2A-n szállítom, Axiom folddja a
  `product/`-ba. Üzenetben NE állítsam, hogy „a gyökérben szállítottam" — a kanonikus hely a `product/`.
  - **FINOMÍTÁS (msg 266):** az operating-modell letisztult → **a te SZÁLLÍTÁSOD = az intel DB + a digest**; a
    `MARKET.md` deliverable (a fájl) **AXIOMÉ** — ő foldolja a §-eket magától (pl. §14-et). NE tarts karban saját
    MARKET.md working copyt deliverable-ként, NE állíts §-szerkesztést/„leszállítottam a §X-et"-et — feed a DB-n +
    digesten át, a fájl-írás Axiom dolga.
  - **FELOLDÁS (msg 314, 2026-06-22) — a kétértelműség lezárva:** a munkamegosztás letisztult →
    **Axiom viszi a PRODUCT/BUILD-dokokat** (ADR/SPEC/RISKS, és ami nála `product/MARKET.md` build-facing);
    **a GROWTH-MODELL az ENYÉM** — a `/workspace/agent/MARKET.md` az én tartós **growth-szintézis döntés-naplóm**
    (a CLAUDE.local.md is így definiálja: csatorna-térkép / loop-ökonómia / pozícionálás / monetizáció / voice).
    Axiom explicit: „Growth-modell (a tiéd, MARKET.md) … vidd a MARKET.md-be". → a nyers/atomi tartalom továbbra is
    a DB-be (insight/gtm/…), a **szintézist a saját MARKET.md-be** konszolidálom (jó pause-aktivitás: olcsó local
    file-munka, nem A2A-turn, nem külső erőforrás). A digest marad a szállítás Axiom felé; a MARKET.md a tartós réteg.

## 🤖 Sub-agent figyelmeztetés
A kutató-agentek néha maguk írnak a DB-be. Futás végén MINDIG `intel stats` + recent-query, mit írtak, mielőtt
magad hozzáadsz — különben duplikálsz.

## 🔭 Second Memory — aktuális watch-frame (a make-or-break lencse, részletek: project.md + intel insights 1-4)
A termék CSAK 3 strukturális résen él (insight 1): **autonóm proaktív PUSH** + **off-platform capture** +
**stateful commitment-lifecycle**. A recall/query-t a platformok commoditizálják → ott építeni halál.

- **🟢 A MOAT ÉLŐ (2026-06-25, Axiom msg 368) — a referencia „amit TERVEZÜNK"-ről „amit SZÁLLÍTUNK"-ra váltott.**
  Az auto-deployer telepítve, az első deploy végigment: a **stateful undated commitment-lifecycle** („megígérted
  X-nek, még nyitott?"), a rögzítés-megerősítések, a **≤1/nap reasoner** és a **7-22 csendes ablak** mind FUT az éles
  boton. → A létezés-kérdés a mi oldalunkon ELDŐLT. **Minden versenytárs-összevetést shipped-vs-shipped keretben tégy.**
  A P0 ezzel **élesebb, nem tompább:** ha egy versenytárs undated-promise stateful lifecycle-t hoz ki, az már NEM
  „megelőznek a build-ben" (nálunk ÉL), hanem **„a verseny mélységre + disztribúcióra tolódik"** → A2A azonnal, de a
  kérdés mostantól „mennyi a mélység-előnyünk", nem „pánikoljunk-e".
- **#0 watch — PLATFORM-KÖZELÍTÉS (élesítve 2026-06-22, Axiom msg 300 + insight 73):** a puszta **autonóm/event-timed
  proaktív surfacing MÁR NEM a P0-tell** — bizonyítva: ChatGPT Pulse (proaktív digest) shipped-THEN-sunset→scheduled-tasks,
  Gemini Proactive Assistance (event-timed) beta, on-device. Mindkettő a **horizontális digitális-jel rétegen** ül
  (calendar/notification/screen) → **validálja a wedge-et, nem zárja** = P1 (wedge-élesítés + esetleg copy-korrekció;
  pl. a Gemini on-device "never-trained" → a "never-trained" table-stakes lett, lásd gtm 32).
  A **VALÓDI P0-tell — TOVÁBB SZŰKÍTVE (2026-06-23, Axiom msg 324 / ADR-055):** a **capture-csatorna (a HANG is!)
  ÉS a vessel mostantól FELADOTT moat** — commoditizálódott (Poke is fogad voice-inputot; insight 79). Tehát egy
  versenytárs voice-/capture-/vessel-lépése **NEM P0** (→ normál digest). A P0-talaj a **LIFECYCLE-pillérre** szűkül:
  P0 CSAK ha egy platform/versenytárs **(a) stateful commitment/ígéret-OBJEKTUMOT modellez** (státusz: nyitott→
  teljesítetlen→lezárva + drift) **VAGY (b) a surfacing-et egy KÖVETETT ígéret életciklusából lövi** (nem app-jelből)
  → **AZONNAL A2A** (felébreszti Axiomot, NEM várja a cront — ez az EGYETLEN, ami megnyitná Tomi felé). Deklarált
  roadmap = WATCH; shipped = RED.
  - **#1 P0-tripwire ÉLŐ instance-szal kötve (Axiom msg 366/368, RISKS §12) — Amazon-Bee (competitor 36):** a kodifikált
    átlépés-vonal — (1) **elsődleges:** a Bee *Actions* megszűnik azonnal tüzelni említésre, és egy **UNDATED** ígéretet
    **STATEFUL objektumként KÉSŐBB** hoz fel („3 napja mondtad, küldöd X-nek, még nyitott"); (2) **másodlagos:** a
    *Daily Insights* digestből **≤1/nap event-timed EGY-felületté** esik össze. + **Meta-Limitless** lifecycle-bolt-on
    (capture+disztribúció+skála a kezükben → a legélesebb gap-closer).
  - **Named-player watch (mellette):** Rememberr (34) · alfred_ (16) · Claryti (33) · Poke (32) · Remi8 (35). Tell
    ugyanaz: off-platform-verbal/ambient capture ALONE nem P0 (koncedált); P0 = stateful undated-promise-lifecycle surfacing.
- **Beachhead ELDŐLT (2026-06-25): music-manager** — az egyetlen un-saddled mind a 4 kritériumon (felejtés-USD × intro-
  central × nincs-incumbens-CRM × verbal-sűrű; insight 99). Robi = v0-user. A recruiter v1+ expansion-input, PARKOLVA
  (Tomi-döntés). A grid-finomítás NE menjen a grounding elé (build Tomi-gated, n=0) — standing P0-watch + szabad off-frame.
- Viral-loop: shared-artifact (Otter/Fathom) POTENS, de a bizalom-moat miatt CONSENT-FIRST kell (DocuSign receiver→
  sender minta), NEM dark-pattern OAuth-hijack (insight 4).
