---
description: A build-fázis pipeline-ja egy feature-re, explicit DAG-ként, work.db-állapotkövetéssel. Használat /build-feature <task-key>. A METHODOLOGY §4 (architect→dev→test→review→ship) + §5 (spec-first) + a build-review rutin (dogfood + red-team) kodifikálva. Minden stage a work CLI-vel flippeli a task státuszát és wip_note-ot ír crash-resume-hoz. CSAK a Tomi-gate UTÁN futtasd.
---

# /build-feature `<task-key>` -- egy feature végigvitele a build-pipeline-on

Ez a `METHODOLOGY.md` §4 (build-pipeline) + §5 (spec-first) + a „Build-review rutin" **kodifikálva** (§16): determinisztikus, állapotkövetett DAG egyetlen feature-re. **CSAK a 🔵 Tomi-gate UTÁN** futtatható (a kemény fal -- egyetlen sor termék-kód sem előtte). A `<task-key>` egy stabil slug a `work.db`-ben (pl. `crew-runway-mvp`, `decision-capture-voice`).

**A munka-állapot a `work.db`-ben él, NEM md/json-ban** (§13). Minden stage **flippeli a task státuszát** a work CLI-vel, és **wip_note-ot ír** -- így ha a futás megszakad (container-kill, cron-vég), a következő futás a `work.ts query`-ből pontosan tudja, hol tartottál, és **onnan folytatja, nem elölről** (§12: SOHA ne kezdd elölről).

## A work CLI (a cwd `/workspace/agent`)

```
bun work/work.ts task list --status <status>          # mi van melyik stage-ben
bun work/work.ts task update --key <key> --status <status> [--wip_note "..."]
bun work/work.ts task update --key <key> --wip_note "..."   # checkpoint státusz-váltás nélkül
bun work/work.ts task done --key <key> --health_score <N>   # ship-gate: status=shipped + closed_at
bun work/work.ts query "SELECT key,status,wip_note,health_score FROM tasks WHERE key='<key>'"
```

A `task update --status` **automatikusan** beír egy `task_events` sort (`from→to`) ugyanabban a tranzakcióban; a `task done` beállítja a `closed_at`-ot. A státusz-szótár: `todo · spec · architect · dev · test · review · shipped · blocked`. **Pozicionális `?` paraméterek** (bun:sqlite) -- ezt a CLI kezeli, te csak flageket adsz.

**⚠️ HARD GATE (2026-07-03):** a `work.ts` `kind=feature` taskoknál technikailag KIKÉNYSZERÍTI ezt a DAG-ot -- egy stage-skip (pl. `spec→dev` vagy `todo→shipped`) `error`-ral elutasítva, a parancs nem fut le. A `task done` health_score < 8 vagy hiányzó health_score esetén szintén elutasítja. Ha ezt kapod: NE kerülgesd -- spawnold a hiányzó stage subagentjét és menj végig rajta, vagy ha a task tényleg nem igényli a teljes DAG-ot, `--kind chore|bug|spec`-re jelöld át (ezekre a gate nem vonatkozik). Ez korábban puszta konvenció volt; agent-audit találta, hogy a taskok többsége simán átugrotta -- innentől ez nem lehetséges.

---

## 0. lépés -- RESUME (mindig ezzel kezdd)

Mielőtt bármit teszel, nézd meg, hol tart a task (lehet, hogy egy korábbi futás félbeszakadt):

```
bun work/work.ts query "SELECT key,title,status,priority,feature,spec_ref,health_score,wip_note,blocked_reason FROM tasks WHERE key='<task-key>'"
```

- **Ha nincs ilyen task:** hozd létre -- `bun work/work.ts task add --key <task-key> --title "<rövid cím>" --kind feature --status todo --priority <P1|P2|P3> --feature <pillér>`. (A `task add` is loggol egy kezdő eventet.)
- **Ha létezik:** a `status` + `wip_note` megmondja, melyik stage-nél vagy. **Ugorj arra a stage-re és onnan folytasd** -- ne ismételd a kész stage-eket. (pl. `status=dev`, `wip_note="cost-import parser kész, NAV-mapping hátra"` → a Developer-stage közepén folytatod.)
- **Ha `status=blocked`:** olvasd a `blocked_reason`-t. Ha a blokkoló valódi Tomi-input (éjszaka nem elérhető, §Éjszakai ablak) → ne ülj rá, válts másik szálra; ha feloldódott → `task update --status <az előző stage>` és folytasd.
- Ellenőrizd a függőségeket: `bun work/work.ts query "SELECT depends_on_key FROM task_deps WHERE task_key='<task-key>'"` -- ha egy `depends_on_key` még nem `shipped`, ELŐBB azt vidd végig (vagy állítsd `blocked`-ra ezt, `--blocked_reason "vár: <dep>"`).

A DAG **szigorúan szekvenciális** stage-enként (spec → architect → dev → test → review → ship → dogfood → red-team), de a fix-loop visszacsatol. Minden stage izolált **SDK-subagentet** spawn-ol (`Task`/`Agent` tool); **a `product/` deliverable-öket TE írod**, a subagent beszállít (§10).

---

## 1. SPEC -- `status=spec`

```
bun work/work.ts task update --key <task-key> --status spec --wip_note "spec: interrogate+research"
```

Spec-first (§5), öt mozzanat -- **soha nem „kódolj, aztán dokumentálj"**:
1. **Interrogate** -- forcing-kérdések: mit NEM mondott ki a `project.md`/`brief.md`? Mi a rejtett feltevés? Ha valódi domain-bizonytalanság van, és Tomi elérhető → kérdezd a boton (fókuszáltan); ha éjszaka → gyűjtsd a reggeli digestbe, ne blokkolj.
2. **Research** -- search-before-building 3 réteg (§ETHOS-2): L1 bevált megoldás (NAV-API, auth, UI-lib -- ne reinventáld), L2 trendy (kritikusan), L3 first-principles (hol téved a konvenció a HU-építőiparban). `WebSearch`/`WebFetch`/`/deep-research`. Kérd Drift `intel`-jét, ha piac/integráció-feasibility kell.
3. **Spec** -- acceptance criteria + API/adatmodell-vázlat (a Görgey-32 Drive-struktúrából, ha releváns) + edge-case-ek + perf-feltevések + a **domain-invariánsok** (pénz-integritás, audit-napló, adat-bizalom, mobil-first/offline, HU-megfelelőség -- `project.md`).
4. Írd ki: `product/SPEC-<task-key>.md`, és kösd a taskhoz: `bun work/work.ts task update --key <task-key> --spec_ref product/SPEC-<task-key>.md --wip_note "spec kész"`.
5. **Close** -- a spec a „kész" definíciója. Ezután NEM band-aid-elsz a specen kívül.

---

## 2. ARCHITECT -- `status=architect`

```
bun work/work.ts task update --key <task-key> --status architect --wip_note "architect: rendszerterv"
```

Spawn egy **Architect** SDK-subagentet (erős modell, opus). Inputja: a `SPEC-<task-key>.md` + a `product/ARCHITECTURE.md` releváns része. Feladata a §2 eng-dimenziók: rendszer, blast-radius, implicit közös feltevések, edge, teszt-terv, perf. **Rejtett feltevés tilos.** „10 sor nyilvánvaló > 200 sor okos" -- flageld az over-engineeringet. Output: komponens-bontás + adatmodell-delta + integrációs pontok (NAV/e-napló) + a teszt-terv váza.
- Integráld a választ a `product/ARCHITECTURE.md`-be (a `product/` fájlokat TE írod) + ADR a `DESIGN-DECISIONS.md`-be, ha tartós döntés (no re-litigate, §7).
- Checkpoint: `bun work/work.ts task update --key <task-key> --wip_note "architektúra kész: <1 mondatos állapot>"`.

---

## 3. DEVELOPER -- `status=dev`

```
bun work/work.ts task update --key <task-key> --status dev --wip_note "dev: <mit építesz most>"
```

Build-fázis, session elején egyszer: `git config --global http.sslCAInfo "$NODE_EXTRA_CA_CERTS"`. Spawn egy **Developer** SDK-subagentet. Elvek (§4 + ETHOS):
- **Boil the Ocean** -- a TELJES dolgot: funkció + error-handling + edge-case + üres állapotok + naplózás. NEM „a UI működik, a többi később".
- **DRY + explicit > okos**, no `any` / no skip / no bypass.
- Full CI-mátrix (build + typecheck + lint) ZÖLD a handoff előtt.
- **Gyakori wip_note-checkpoint** (ez a crash-resume lényege): minden értelmes mérföldkőnél `bun work/work.ts task update --key <task-key> --wip_note "<konkrét állapot, pl. 'NAV-import + kategorizálás kész, terv-vs-tény nézet hátra'>"`. Ha a futás itt szakad meg, a 0. lépés ebből folytat.

---

## 4. TESTER -- `status=test`

```
bun work/work.ts task update --key <task-key> --status test --wip_note "test: <tier>"
```

Spawn egy **Tester** SDK-subagentet (gyorsabb modell OK). Tier-választás (Quick/Standard/Exhaustive a feature kockázatától). Edge + abuse-case + before/after (regresszió-szám). A domain-invariánsokat explicit teszteld (pénz-integritás: terv-vs-tény pontos és auditálható; audit-napló teljes). Ha bug → **fix-loop** (lásd lent), ne menj tovább törött teszttel.

---

## 5. REVIEWER -- `status=review`

```
bun work/work.ts task update --key <task-key> --status review --wip_note "review: kód + invariánsok"
```

Spawn egy **Reviewer** SDK-subagentet (erős modell, opus). A §2 kód-dimenziók (diff, DRY, olvashatóság -- „30 mp alatt olvasható?", bug, edge) + a **domain-invariánsok** (pénz-integritás, audit-napló, adat-bizalom). Output egy **health-score (1-10)** + a critical/high lista.

### Fix-loop (≤3 kör) -- a test és a review visszacsatol
Ha a tester vagy a reviewer critical/high-t talál:
1. `bun work/work.ts task update --key <task-key> --status dev --wip_note "fix-loop N: <mit javítasz>"` (vissza dev-re).
2. Javítsd **root-cause-ig** (§6: no fix without root cause, csak a bugot, ne szórj refaktort), regressziós teszttel.
3. Vissza test → review. **Max 3 kör.** Ha 3 után sem 8/10+ → `status=blocked --blocked_reason "review <N>/10, nyitott: <...>"` és hozd Tomi elé (taste-gate, §2) -- NE szállíts gyenge health-score-ral.

---

## 6. SHIP-GATE -- `task done`

A szállítás feltétele (§4 ship-gate, KEMÉNY): **health-score 8/10+**, **nulla regresszió**, atomic commit/fix, before/after bizonyíték. Ha bármelyik hiányzik → vissza fix-loopba, NE ship-elj.

```
bun work/work.ts task done --key <task-key> --health_score <N>   # N >= 8; status=shipped + closed_at + event
```

> A `task done` health_score nélkül elkerülendő -- a `work maintain` flageli a `shipped` + NULL health_score sorokat („ship-gate skipped"). Mindig add meg az `--health_score`-t.

**A ship-gate NEM a feature vége.** A `shipped` státusz csak azt jelenti: a kód kész és átment a kód/QA-kapun. A build-review rutin (dogfood + red-team) MÉG hátravan, és a talált súrlódást **javítod, MIELŐTT a feature Tomihoz ér** (§Build-review rutin).

---

## 7. DOGFOOD -- empirikus használhatóság (a build-review rutin 1. fele)

A `.claude/agents/dogfood.md` subagentet hívd meg (`Task`/`Agent` tool, `subagent_type: dogfood`). Adj neki: a **live app URL**-t, login-t (ha kell), és **EGY konkrét feladatot**, amit ennek a feature-nek meg kell oldania (pl. „rögzíts egy helyszíni döntést hangból és találd meg holnap"). A subagent felveszi egy valós HU-építőipari vállalkozó fejét, **TÉNYLEG végigcsinálja** a feladatot agent-browserrel, és jelenti a súrlódást a „hasznos segítség vs admin-teher" lencsén át.

- Rögzítsd a futás eredményét a taskhoz: `bun work/work.ts event add --task_key <task-key> --to_status shipped --note "dogfood: <fő találat / blocker>"`.
- A **kritikus** súrlódást (befejezetlen feladat, „ez állítana le a használatban") javítsd MOST: vissza fix-loop (`status=dev`), majd ismét ship-gate. Csak a kozmetikai súrlódás mehet külön follow-up taskba (`task add`, P3, `dep add --task_key <új> --depends_on_key <task-key>`).

---

## 8. RED-TEAM + UX-CRITIC -- kritika-lencsék (a build-review rutin 2. fele)

Futtasd **párhuzamosan** (fan-out, §10 parallel) a két projekt-független kritika-lencsét (`Task`/`Agent` tool):
- **`subagent_type: red-team`** -- adverzariális: hiányzó guardok, állapot-invariáns sértések, race condition-ök, és a **klón/túl-komplex flag** (§2). Inputja: a diff/spec + a domain-invariánsok.
- **`subagent_type: ux-critic`** -- anti-slop UI/UX (§3): üres állapotok, hierarchia, 3-mp-es scan, „hasznos segítség vs admin-teher". Inputja: a feature képernyői (vagy a live app).

- Rögzítsd: `bun work/work.ts event add --task_key <task-key> --to_status shipped --note "red-team: <legsúlyosabb>; ux: <legsúlyosabb>"`.
- A talált critical/high-t **a Tomi-gate elé érés ELŐTT** javítsd (fix-loop → ship-gate újra). A borderline/taste-döntést (red-team és ux-critic nem ért egyet, vagy a megoldás scope-kérdés) **NE auto-döntsd -- hozd Tomi elé** a tradeoff-fal (taste-gate, §2).

---

## 9. ZÁRÁS

- A task `shipped`, health_score ≥ 8, dogfood + red-team + ux-critic lefutott és a critical/high javítva.
- `bun work/work.ts maintain` -- nézd meg, nincs-e struktúra-smell (orphan dep, NULL health_score shipped sor, ragadt blocked task).
- Append a `product/sprint-log.md`-be: mit szállítottál, mi a health-score, mit tanultál. Tartós, projekt-független tanulság → `LEARNINGS.md` (§7).
- Daily digest Tominak (`<message to="tomi">`, magyarul, run végén KÖTELEZŐ): `Csináltam: … / Gondoltam: … / Holnap: …` -- benne a feature állapota + a dogfood/red-team fő találata + amit Tomitól vársz (egy helyen, fókuszáltan).

---

### A DAG egy pillantásra

```
spec → architect → dev → test → review →[fix-loop ≤3]→ SHIP-GATE(health≥8) → dogfood → {red-team ∥ ux-critic} → ZÁRÁS
         (work.db status flip + wip_note minden stage-en; resume a 0. lépésből; fix-loop visszacsatol dev-re)
```
