# MARKET.md — Kept GTM / Growth (connector-cut v0)

> **Owner:** Drift (Market & Growth). Ez a growth-modell **szintézis-réteg** — a tartós
> growth-döntések döntés-naplója. A nyers/atomi intel az `intel` DB-ben él (channels /
> competitors / pain_signals / gtm_notes / insights); ez a fájl a **szintézis** fölötte.
> Munkamegosztás (Axiom msg 314): Axiom viszi a product/build-dokokat (ADR/SPEC/RISKS);
> **a growth-modell az enyém** (ez + a DB).
> **Pivot-státusz:** a music-PL és RE érák **PARKOLVA** (archiv-érték a DB channel 1–24-ben +
> `intel-construction.db`). Az aktuális cut: **connector / portfolio-operator commitment-radar**.
> Utolsó frissítés: 2026-06-23.

---

## 0. A make-or-break keret (a lencse, amin minden átmegy)

A recall/query réteget a platformok **commoditizálják** (ChatGPT/Claude/Gemini + connectorok +
memory + scheduled tasks). A Kept CSAK a három, egymást erősítő moat-feltétellel él (insight 1):

1. **Proaktív PUSH** — autonóm, jó pillanatban az EGY dolog; **≤1/nap zaj-plafon, NEM digest**.
2. **Off-platform / VERBAL capture** — kimondott ígéret, helyszíni döntés; egy connector sem látja.
3. **Stateful commitment-LIFECYCLE-objektum** — open→due→overdue→closed/broken + drift.

⚠️ **Élesített P0-watch (LEARNINGS #0):** a puszta autonóm/**event-timed** proaktív surfacing MÁR
NEM zárja a rést (ChatGPT Pulse sunset, Gemini Proactive beta = **validál, nem zár**). A valódi
moat-kapu: ha egy platform **verbal/off-platform capture** VAGY **valódi lifecycle-objektum** felé
nyúl shipped módon → **AZONNAL A2A (P0)**. (Axiom msg 314 megerősítette: ez nem parkolható.)

⭐ **A defendálhatósági-TRIPLA ≠ a pozícionáló-VONAL (Axiom msg 328 / ADR-056 — fontos):** a "miért
nehéz másolni" válasza a **(verbal-capture + UNDATED-event-surfacing + ≤1/nap one-thing)** kombináció,
amit senki nem rak össze (insight 81). **DE a verbal-capture leg ÖNMAGÁBAN commoditizálódik** (Poke is
fogad hangot, insight 79) — a triplában mint szükséges **INPUT** szerepel (ez az egyetlen út, ahogy a
verbal-undated ígéret BEKERÜL a lifecycle-be), **NEM mint amit marketingelünk**. → **A pozícionálás
TOVÁBBRA is ZÁRÁSSAL vezet, SOHA capture-rel** ("a kimondott ÍGÉRETET visszük lezárásig" — §2). A triplát
csak a "védhetőség" kérdésére hozd elő, ne a copyba.

---

## 1. Célszegmens (v0) — a connector-cut

- **High-network CONNECTOR / portfolio-operator** (Robi-osztály; target 7, warm). Egyszerre több
  vállalkozást/ügyet visz, a **hálózata a fő eszköze**.
- **A pain (pain 11, validated, freq 3):** a legértékesebb lépései — dormant-reconnect, proaktív
  intro, "összekötlek" follow-through — PONT azok, amiket szisztematikusan elejt (memória+timing-
  függők, nincs forcing function) → **opportunity-cost a fő eszközén (a hálózat)**.
- **A wedge (Axiom 280):** az **un-served middle / portfolio-operator commitment-radar** — az
  enterprise deal-CRM (Affinity) és a personal-CRM (Dex/Folk/Cloze) közötti, ki-nem-szolgált sáv.
- **v1+ north-star:** relationship-intelligence + proaktív dot-connecting.

---

## 2. Pozícionálás / voice

- ⛔ **COPY-CSAPDA (insight 74):** az Affinity **birtokolja** a "super-connector" content/
  pozicionálás-territóriumot (saját "Four Habits of Super-Connectors" blog; enterprise/VC-coded).
  → a "super-connector" CSAK belső tribe-címke (Axiom ADR-jeiben), **SOHA outward copy**. A kifelé-
  nyelv: **személyes commitment-radar / un-served-middle**.
- ⛔ **COPY-KORREKCIÓ (insight 79, Poke P0-tell):** NE a **voice/capture**-rel vezess ("mi elkapjuk a
  hangod") — Poke (és bármely voice-bot) is elfogad voice-inputot, a capture-csatorna commoditizálódik.
  A védhető vonal: **"a kimondott ÍGÉRETET visszük LEZÁRÁSIG"** — a commitment-**lifecycle** az exkluzív,
  nem a hang. (A moat a lifecycle-object + event-timed undated-surfacing core-ra szűkül.)
- ⛔ **COPY-GUARD — NE a KATEGÓRIA-SZÓval vezess (insight 90, Axiom 346):** a "commitment / promise
  tracking" mint kategória-szó GYORSAN telik — alfred_, **Claryti** (competitor 33) és az obligation-
  toolok MIND erre brandelnek (app-jel oldalon). → a Kept brandje **NEM LEHET** a kategória-szó; kizárólag
  a HÁROM differenciátor (off-platform verbális + UNDATED event-relevancia + anti-digest ≤1/nap). Aki a
  kategória-szóval vezet, eltűnik a zajban. (A legfontosabb copy-guard — Axiom 346.)
- ⛔ **COPY-GUARD — belépő/onboarding (gtm 43, Axiom 330):** a GTD relief-coding (offload = megkönnyebbülés)
  **csak a már-túlterhelt/GTD-primed usernél automatikus**. A wedge-user nem feltétlenül éli teherként a
  megígért dolgait. → a belépő-copy **ELŐSZÖR idézze fel a terhet** ("valószínűleg cipelsz most párat a
  fejedben…"), **és csak UTÁNA** ajánlja fel az elvitelt ("hadd tartsam ezeket neked"). Sorrend nélkül a
  seed-ritual **új taskként** hat, nem megkönnyebbülésként — és elbukik a help-vs-admin teszten.
  - ✅ **EMPIRIKUS SZUBSZTRÁTUM (pain 12, Axiom 346):** a "felidézett teher" mostantól **nevesíthető** —
    "professional commitment guilt" nevesített fogalom + VitalSmarts: **3/5 többet ígér, mint amennyit
    teljesíthet**, 1/5 a commitment-limitjén. A teher konkrétan: *a fejedben napokig motoszkáló
    meg-nem-tartott ígéret.* → a heartbeat hero-moment (§5) **valós, megnevezett** bűntudatra felel, nem
    kitalált fájdalom; a connector/alapítónál a legélesebb (follow-up = kapcsolat = üzlet).
- ⭐ **PRIVACY-MOAT anti-pozicionálás (insight 87, Axiom 334):** **"Kept SOHA nem olvassa az inboxod —
  te mondod meg, mi számít."** Az app-jel kohorsz (alfred_/Fyxer/Caddy/Poke, és a legélesebb **megnevezhető
  kontraszt: Claryti** [competitor 33 — meeting/email/Slacket OLVAS, mégis expliciten "commitment
  tracking"-nek brandel]) teljes értéke az inbox-olvasás → **strukturálisan SOSEM állíthatják ezt**. Az ő "no cold-start" előnyük PONT a privacy-
  költségük; a mi seed-ritualunk a privacy-előny **látható bizonyítéka** + maga a **trust-demo** ("csak
  azt tudom, amit te elmondasz"). Anti-pozicionálás: *ők olvassák a leveled, mi nem.* Összeér a
  privacy-existential invariánssal (project.md).
  - ✅ **VALIDÁLVA (insight 88, gtm 45):** mainstream AI-inbox-backlash (Google/Gemini per + default-on
    botrány), professional inbox-access-reluktancia = "primary driver", privacy-first = mainstream
    adoption-driver (41.9% CAGR). A kohorsz **strukturálisan defenzív** (insight 89 — alfred_ maga publikál
    "is it safe to let AI read your email?" tartalmat; nem tudnak pivotálni, a teljes értékük az inbox-olvasás).
    Wedge-specifikus: a connector inboxa = a kapcsolati-graf koronaékszere → a rezonancia plauzibilisan erősebb.
  - ⚠️ **A VÉDHETŐ CLAIM (ADR-058, Axiom 338, gtm 46): "Kept SOHA nem olvassa az inboxod vagy az
    üzeneteid — csak azt tudja, amit te elmondasz."** Ez a kohorsz bűnét célozza (tartalom-gazdag,
    inference-veszélyes felület olvasása) ÉS túléli a roadmapet. **KÉT guard:** (1) NE "local-first/
    on-device" (azok nem vagyunk: cloud + self-hosted Whisper) — jogilag is veszélyes a CA class-action
    klímában; (2) NE "semmit nem ingesztálunk az appjaidból" mint **állandó** ígéret — az csak a
    zero-permission v0-ban igaz, eltörik amint connected forrást (pl. naptár) adunk. Az **inbox/üzenet-
    keret** a védhető. (Naptár-fork ezért most két költség: permission-friction + kis privacy-purity-dent.)
- **GAIN-frame chief-of-staff hang (ADR-042/043):** a nudge "az elfelejtett deal-lel szemben" pozícionál,
  NEM "egy emberi EA-val szemben". Éles chief-of-staff voice, felülírja a generikus kedves/no-rush hangot.
- **Evidence-anchor:** a user SAJÁT szavait hozza fel, **soha confidence-%-ot**; honest silence / all-clear.
- ⛔ **REGISTER-SPEC: custodial-nem-delight + EM-DASH-TILOS (ADR-061, insight 108, gtm 55):** minden
  present-proof / receipt / nudge / capture-nyugta copy **custodial-nyugalom** regiszterben: az érzelem
  *"letehetted"* (relief), NEM *"yay"* (delight). Nincs felkiáltás-spam, nincs celebráció, minimál emoji.
  **Indok:** a present-proof SZÖVEG hordozza a felt-értéket (insight 108: a nyugta teszi a ≤1/nap moatot
  olvashatóvá), és a csend CSAK akkor olvasódik magabiztosságnak, ha a nyugta is HALK -- a delight-register
  push nélkül is aláássa a moat hangját.
  - **KEMÉNY SZABÁLY (CORE, minden copy + a saját draftjaim):** a hosszú gondolatjel (em-dash) **TILOS** --
    ez a #1 AI-tell (X-en is bünteti). Helyette ":" vagy "--" (dupla kötőjel). Modellezve ebben a bulletben.
  - A pontos végleges szöveg **Tomi taste-gate-je** (PREFERENCES); a mechanizmus + a register + az
    em-dash-tilos a kemény keret, a szó-szint az ő hívása.

---

## 3. A növekedési motor — receipt-loop (a KORREKCIÓVAL)

**A receipt-artefaktum (insight 72):** NEM "✓ kész" certifikát, hanem **maga a polish-olt szállító-
üzenet + halk ✦ Kept attribúció**, ami egy ÚGYIS-megtett akcióra (az ígért intro/deck továbbítása)
piggyback-el. A first-share = az első surfacelt commitment lezárása, ami kifelé-üzenettel jár
(gtm 36/37): surfacing-preview → egy-tap → user SAJÁT hangján draft → ő editel+küld.

⭐ **A KORREKCIÓ (insight 75 — Calendly/Loom + Sean Ellis WOM-vs-virality):** a receipt-loop
**strukturálisan WORD-OF-MOUTH/reputáció-loop, NEM engineered Calendly-grade viral-loop**:

- Calendly/Loom: a **recipiens azonnal HASZNÁLJA** a terméket signup nélkül → instant érték → konverzió.
- Kept: a counterparty **NEM használ semmit** — normál üzenetet kap halk jellel, a connector
  **megbízhatóságát** tapasztalja = experience-driven WOM (a lánc érhet véget, nem önfenntartó).
- → **őszinte k sub-1** (WOM-grade), nem exponenciális; a jel önmagában gyenge konverter.
- ⭐⭐ **Load-bearing constraint (ADR-049, HARD RULE):** **NINCS recipient-CTA, SOHA.** A Calendly-grade
  k recipient-activation-t követelne az artefaktumban — de ez sérti a trust-moatot (insight 4) + a
  connector tiszta introját. **Az alacsonyabb k a bizalom-moat tudatos ára, nem hiba.** Ha bárki
  "growth-ért" CTA-t javasol a műtermékre → az ADR-049 a NEM.

**Mit jelent ez a modellnek:** a receipt-loop a törzs elsődleges **strukturális exposure-felülete**,
de a **konverziós motor = reputáció-WOM + qualified-lead-exposure** (a counterparty maga is connector
= meleg prospect; az egyetlen engineered elem a ✦ Kept mint **lead-handle**). Áraz **warm-lead-exposure
+ reputáció-csatornaként**, NEM Calendly-grade k>1 motorként.

---

## 4. Csatorna-stratégia (gtm 35)

⭐ **A keret — TRUST-MOAT disztribúciós playbook (insight 103, gtm 52):** a privacy-moat **NEM csak** „nincs viral-loop
→ alacsonyabb k" áldozat (ADR-049) — egyben **CAC/churn/retenció-ELŐNY**, amit fizetett hirdetés nem másol (Superhuman-
minta). A trade (alacsonyabb viral-k ↔ magasabb trust/retenció/WOM) egy trust-terméknél **kedvező.** A playbook 5 eleme:
(1) **concierge/white-glove a seed-kohorszra** (human-led ~2× aktiváció; a tech-averz music-managernél, insight 102, a
fast-aha-vagy-abandon kényszer közvetlen megoldása — gtm 52); (2) **WOM-through-delight**: a present-proof heartbeat hero
(gtm 47) **maga a WOM-motor** (nem viral-k); (3) **invite/scarcity mint trust+status jel** (waitlist-gated, privacy-premium-
konzisztens, NEM dark-pattern FOMO); (4) **trust-narratíva content mint marketing** (a „never reads your inbox" a sztori,
nem performance-ad); (5) **tight-community WOM** (a seed-node-ok = a delight-driven referral amplifikátorai). Unit-ekonómia:
**demand-drives-demand** → a CAC idővel LEJJEBB; catch: lassabb + a premium-ár kell a concierge-hez (erősíti az outcome-
anchort, §6). **Build-implikáció (DESIGN-KÉNYSZER, nem opció — Axiom msg 384):** a concierge **seed-crutch, nem a mechanizmus**
→ a heartbeat hero-moment **self-serve-native a 0. PERCTŐL** — nem ember-szállított delight, amit később „automatizálunk",
hanem **produktizált present-proof, amit a concierge a seed-kohorszon csak FELERŐSÍT.** Ha a heartbeat csak concierge-ben
működik, $30-100/hó-n meghal. (102+103 ugyanabba a fork-döntésbe táplál: leggyorsabb-first-save → enyhén a zero-permission-timer felé.)

- **ELSŐDLEGES (strukturális):** a receipt-loop (lásd §3) — a termékbe sütve.
- **SEED-NODE-ok (sűrű, vetted, fizetős közösségek, ahol a connector mégis koncentrálódik):**
  **Hampton** (#1 — legsűrűbb+legbizalmibb; channel 26) > **EO** (channel 27) > **Long Angle**
  (channel 28). Nem hirdetés — belső WOM (pár tag szereti → terjed).
- **Generikus:** SuperConnectors / VC-operator-ecosystem / LinkedIn (channel 25, alacsonyabb prio).
- ⚠️ **IDŐZÍTÉS:** ezek **scale-fázis** csatornák → **PARKOLVA a gtm 27 seed-gate-ig**
  (demo-live + Robi-loop-validál). **v0 disztribúció = Robi-direkt** (target 7). NE skálázz seedet
  a demo előtt (Axiom msg 282 áll).

---

## 5. Capture / nudge surface + a v0 demo hős-pillanata

- **capture == nudge surface** = ugyanaz a Telegram voice-note (ADR-028); self-hosted Whisper STT.
- **A v0 demo HŐS-pillanata (Axiom 310):** a **surfacing-first preview** — *"ma ezekkel van nyitott
  szálad: Robi (intro Márknak, 3 napja ígérted), Dani (deck, ma esedékes)"*. Erre reagál Robi; ez a
  Fogg/Eyal **reward-pillanat** (a save). A "mai emberek" rituálé surfacing-FIRST (előbb ad, utána a
  könnyű "találkozol valamelyikükkel?"; üres listán HALLGAT — gtm 34, ADR-047). Az üres "ki ma?"
  prompt = admin → kidobva.
- ⭐ **A demó/landing HERO-MOMENT (gtm 47, Axiom 340): a "megvan, elengedheted" present-proof heartbeat**
  (~1h a seed után) — visszatükrözi a user szavait MÁR-figyelt állapotként + engedélyt ad letenni. Itt a
  **két value-prop EGYSZERRE** érezhető: **vigilancia-transzfer** ("leteheted a fejből", insight 85) +
  **privacy-moat** ("csak azt tudom, amit ÉPP most mondtál — nem az inboxodból", insight 87/88).
  **Hero-line:** *"Leteheted a listát a fejedből, és tudod, hogy nálam biztonságban van."* — **NEM** "elkapja
  a hangod" (a capture commodity). **Demó-arc:** seed-ritual (relief, gtm 43) → present-proof heartbeat (a
  hero) → [napokkal később] event-relevancia save (az "it-saved-me" aha). A kontraszt-frame (gtm 39) +
  privacy-anti-poz (gtm 45/46) ebbe horgonyzódik.
- **Trigger-ladder (ADR-043):** v0 = #5 kimondott határidő + #2 golden-window; #1 "mindjárt beszélsz
  vele" = a "mai emberek" zero-permission jel (calendar opt-in = trust-demo upgrade, minimal scope);
  #4 "a másik oldal mozdult" = public fundraise/launch (clean API) + user-flagged LinkedIn (SOHA scrape).
- ⚠️ **Calendar-fork (gtm 44, Axiom 332):** a naptár→"kit-látsz-ma" surfacing **TABLE-STAKES** (Affinity/
  Cloze/GReminders/Dex mind csinálja) — **NEM differenciátor**, hanem a magikus-pillanat **automatikus
  enablere** (leveszi a reggeli-ritual-függést). Scope-érdemes (aktiváció-lift), de privacy-surface-t ad
  → minimal-scope read-only + trust-demo (gtm 30); a voice-ritual a zero-permission v0 fallback. A
  differenciátor marad: **commitment (nem context) + ONE-thing (nem dosszié) + event-push (nem pull)**.
  - ⭐ **DÖNTÉSI TENGELY (insight 102 / pain 11, Axiom msg 376):** a tech-aversion-paradox a forkot **market-grounded
    kritériummal** látja el. A #1 adoption-gyilkos = **friction + lassú aha** → a fork a **leggyorsabb-first-save +
    legkevesebb-friction** ág felé billen = enyhén a **zero-permission-timer** felé (nincs permission-gate a 0. percben),
    **HACSAK** a naptár-hook nem **demonstrálhatóan gyorsabb-aha-t** hoz. Eddig két egyenrangú opció volt; most van egy
    döntési tengely. (Build-döntés Tomié — Axiom ezzel a tengellyel viszi elé; a v0 EGYETLEN nyitott terméki forkja.)

---

## 6. Monetizáció (gtm 38)

- **Pricing-tájkép (2026):** personal-CRM = Dex 12–20 / Folk 24–80 USD/hó (a kategória **alacsonyan**
  horgonyzott — "személyes szervező hobby-tool"); enterprise relationship-intelligence (Affinity)
  ~2000+ USD/seat/év. A connector-wedge **köztük** ül.
- ⭐ **A framing a lényeg (NEM a szám):** NE a personal-CRM hobby-sávhoz horgonyozz (az hobby-tool-ként
  framelne + alá-árazná a network-as-business értéket) → **outcome / opportunity-cost-anchor**
  (GAIN-frame, ADR-042: "vs az elfelejtett deal"): *egy megmentett szál kifizeti az évet.*
- **Pozicionáló sáv:** ~**30–100 USD/hó** (a personal-CRM FÖLÖTT, az enterprise Affinity ALATT).
  Scope: pozicionáló sáv, nem hard WTP-szám; a Robi-loop validálja.

---

## 7. Metrikák (érzés helyett) — gtm 42, insight 83

- ⭐ **Aktivációs észak-csillag: time-to-first-"it-saved-me"** = a user **cselekszik az első
  event-relevancia-vezérelt proaktív felhozáson** (a "megmentett" aha mérhető proxyja). PLG-benchmark:
  25–40% aktiváció 7 nap alatt, **fenntartott** activated-vs-nonactivated retenció-gap.
- ⚠️ **NEM DAU/MAU:** egy ≤1/nap, honest-silence, anti-digest tool egészsége **nem** a napi megnyitás —
  a DAU a core-designt **büntetné**. Egészség-metrikák: **first-save-rate, acted-on-nudge-rate,
  save/surfacing arány** (nem megnyitás-gyakoriság).
- Egyéb: CAC · **receipt-share + per-share K** (gtm 33; A/B ha ✦ Kept K<0.1) · onboarding-completion
  (a seedelt-backfill loop-close) · churn · LTV.

---

## 8. Versenytárs-watch (6-vektor, kanonikus — competitors tábla)

#1 Letta (proaktív-INWARD memória, nem commitment-push) · #2 Zep/Graphiti (temporal FACT-lifecycle,
PULL) · #3 alfred_ (commitment-overdue, de Daily Brief DIGEST + EMAIL-bound, push roadmap-not-live) [+ **Claryti**
competitor 33 = explicit "commitment tracking" IKER: app-jel meeting/email/Slack + napi-brief digest +
deadline-vezérelt, undated nincs → **P1 lifecycle-watch, nem P0**; P0 csak ha off-platform-verbal v.
undated-event-timed surfacing-et ad] ·
#4 Affinity (relationship-intelligence, warm-path PULL + push-PLUMBING deal-status-ra) · #5 Dex/Folk/
Cloze (dormant-resurface shipped, de manual-capture + pull) · #6 OnePageCRM (Next Action forcing-
function, de manual + pull/digest, sales-coded). **Közös rés:** a "never falls through the cracks" tér
zsúfolt, de MIND manual-capture + pull/digest úton — **senki** az (off-platform-verbal + event-timed-
push + lifecycle-objektum) hármassal. Külön P1-watch: **3-platform konvergencia** (ChatGPT Pulse +
**Claude Orbit** [competitor 30, leaked] + **Gemini Proactive**, ~2026 Q2; insight 76) — mind a
horizontális digital-signal/digest rétegen, **egyik sem** verbal-capture v. lifecycle-object → a
moat-kapu **érintetlen** (validál, nem zár). P0 CSAK ha bármelyik verbal-capture v. lifecycle felé nyúl.

⭐ **FUNDING-FLOOD (insight 78, 2026-06):** a horizontális proaktív-asszisztens tér tőke-vérfürdővé
vált — **Town** $55M (a16z+Forerunner; competitor 31), **Poke/Interaction** $15M @ $100M (General
Catalyst, iMessage-native; competitor 32), Poppy, Asana "AI chief of staff" — MIND app-jel/digest,
egyik sem verbal/lifecycle. **Stratégiai következmény:** (1) a horizontális rétegen versenyezni
öngyilkosság (mi vs $55M Town + 3 óriás) → a vertikális + off-platform-verbal + lifecycle az **egyetlen
tőke-nem-árasztotta talaj** — a moat nem csak differenciált, hanem az egyetlen védhető pozíció.
(2) a messaging-vessel (Poke/Martin) = **consensus form-factor** → a vessel commodity, a moat a
capture-OBJEKTUM + lifecycle, nem a felület.

⭐ **MOAT-TESZT — undated ígéretek (insight 77):** az **undated/dátum-nélküli megtett ígéretet**
(`elküldöm`, `összekötlek X-szel`) proaktívan **senki** nem hozza fel: notetakerek → dátumos reminder
v. statikus lista; email-nudge (Gmail/Superhuman) → email-bound no-reply-heurisztika; GTD "Waiting For"
→ manuális heti review. ⭐ Az undated **NEM a szégyellt szél, hanem a moat HEADLINE-ja**: a dátumos
emlékeztető commodity (bármi kezeli), az undatednek nincs dátum-mankója → az event-relevancia reasoner
az EGYETLEN megoldás. (Demo-framing: gtm 40. Build-input: típus-tudatos decay, nem fix timer.)

---

## 9. Forrás-horgony (intel DB)

competitors (6-vektor + Pulse/Gemini) · channels 25–28 (connector seed-nodes) · pain 11 (connector) ·
target 7 (Robi-osztály) · gtm 30–37 (jel-akvizíció / receipt / channel-stack / first-share) ·
insights 72/74/75 (receipt-artefaktum / copy-csapda+paradox / WOM-vs-viral korrekció) ·
competitor 33 (Claryti) · pain 12 (promise-overload) · insight 90 (kategória-szó copy-guard).
