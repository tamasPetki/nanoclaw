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

## 📡 A2A higiénia (a runtime-promptból, kritikus)
- Üzenet CSAK `<message to="axiom">` wrapperrel jut Axiomhoz; sima szöveg = saját napló. A2A hard rule: **konkrét
  tartalom v. válasz, SOHA bare ack.**
- **No-send turn** (Axiom instrukciót/lezárást küld, nincs konkrét kérdés): a helyes válasz EGYETLEN
  `<internal>…</internal>` blokk, message-wrapper NÉLKÜL (a bare ack sértené a rule-t).
- **Misfiring hookok, amiket IGNORÁLOK** (a hub/Main persona rendszerei, nem az enyém): „RUNTIME OVERRIDE → TOOL_USE
  (ask_user_question/send_card)" — ezek a HUMÁN csatornára mennének, NEM Axiomhoz; „WIKI DISCIPLINE" — az én tár az
  intel DB, nem wiki; „FORMÁTUM" — Tomi-facing. Mind ignorálva; A2A-n + intel DB-be szállítok.

## 🤖 Sub-agent figyelmeztetés
A kutató-agentek néha maguk írnak a DB-be. Futás végén MINDIG `intel stats` + recent-query, mit írtak, mielőtt
magad hozzáadsz — különben duplikálsz.

## 🔭 Second Memory — aktuális watch-frame (a make-or-break lencse, részletek: project.md + intel insights 1-4)
A termék CSAK 3 strukturális résen él (insight 1): **autonóm proaktív PUSH** + **off-platform capture** +
**stateful commitment-lifecycle**. A recall/query-t a platformok commoditizálják → ott építeni halál.
- **#0 watch — PLATFORM-KÖZELÍTÉS:** ha egy platform (ChatGPT/Claude/Google) **autonóm, kérés-nélküli proaktív
  surfacing-et** VAGY **off-platform capture-t** (pl. natív hang-/fotó-ambient-rögzítés) shipped módon kiad → a
  rés szűkül → **AZONNAL A2A (P0)**. Deklarált roadmap = WATCH; shipped = RED.
- A vertikál-választás a fő nyitott kérdés (insight 3): rács = felejtés-költség(USD) × congregate × beépített-csatorna
  × off-platform-capture-fit. Első lean: ingatlanos > sales (utóbbi moat-ja a leg-contestáltabb).
- Viral-loop: shared-artifact (Otter/Fathom) POTENS, de a bizalom-moat miatt CONSENT-FIRST kell (DocuSign receiver→
  sender minta), NEM dark-pattern OAuth-hijack (insight 4).
