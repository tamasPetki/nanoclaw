---
name: self-improvement
description: >
  Heti reflection workflow — a hub vasárnaponként 11:00 lefut és kihámozza az
  elmúlt 7 nap tanulságait, finding-okat generál, card-on Tomi-jóváhagyással
  alkalmazza őket. MINDIG használd ha trigger jön: "self-improvement",
  "reflektálj", "heti riport", "mit tanultál", "findingok", "tanulság",
  "javítsd magad", "fejlődés". A `task-hub-self-improvement` cron triggereli
  hetente. Aggregálja a worker-finding üzeneteket is.
---

# Self-improvement — heti reflection

A hub minden vasárnap 11:00-kor lefut és kihámozza a tanulságokat az elmúlt 7 napból. **4-féle finding-osztály**, card-os approve-flow-val Tomi felé, auto-execute approve esetén.

## Workflow (kötelezően sorban)

### 1. Evidence-gyűjtés

Hét napos ablak (vasárnaptól vasárnapig). Forrásjegyzék:

```bash
# Wiki log
WEEK_START=$(date -d '7 days ago' '+%Y-%m-%d')
TODAY=$(date '+%Y-%m-%d')

# Wiki napló utolsó hete
awk -v start="$WEEK_START" '/^## \[/ { in_block = ($0 ~ start) || in_block } in_block' /workspace/group/wiki/log.md

# Worker activity
awk -v start="$WEEK_START" '/^## / { in_block = ($0 ~ start) || in_block } in_block' /workspace/group/wiki/worker-activity.md 2>/dev/null

# Hub session inbound — failed tasks
sqlite3 /workspace/.session/inbound.db "SELECT id, datetime(timestamp), substr(content, 1, 200) FROM messages_in WHERE status IN ('failed','paused') AND timestamp > '$WEEK_START'"
```

A `/workspace/group/` a hub mappa (`groups/hub/`). A session inbound.db-t a host mountolja `/workspace/.session/`-ba (verifikáld: `ls /workspace/.session/`; ha nincs, `find / -name inbound.db 2>/dev/null | grep ag-hub` és onnan).

**Plus** Tomi-pull "javítások" — utóbbi heti user-üzenetekben a frusztrációs minták:
- "ne X" / "STOP" / "rosszul" / "javítsd" / "ezt nem így"
- "miért nem X" / "elromlott" / "elfelejtette" / "ne küldj"
- ugyanaz a kérés többször ("kértem hogy...", "már mondtam...")

### 2. Kategorizálás (4-féle scope)

Minden detektált pattern-t sorold be:

| Class | Trigger | Példa | Action |
|---|---|---|---|
| `skill-update` | visszatérő hibás output, hiányzó trigger-szó, rossz példa egy skillben | "az X skill nem aktiválódott amikor `próba-Y` jött" | `Edit container/skills/<név>/SKILL.md` |
| `wiki-gap` | Tomi kérdez X-ről, wiki nem tudja vagy hiányos | "Tomi 3× kérdezte hogyan dolgozik Erika, de nincs entity-page" | új `wiki/entities/<slug>.md` ingestelve sources-ből |
| `mcp-install` | visszatérő manuális workaround (curl-pattern, terminal scrape, fájl-read amit MCP elintézhetne) | "minden héten 4× curl-elek X API-t" | `mcp__nanoclaw__install_packages` request új MCP-szerverrel vagy package-szel |
| `voice-calibration` | Tomi többször ugyanazt javítja a stílusban | "3 héten át mondtam: ne em-dash" | `Edit groups/global/CLAUDE.md` "Anti-AI tells" szekció |

### 3. Top 3-5 finding kihámozása

Súlyozás: **gyakoriság × Tomi-impact**.
- 3+ ismétlődés = magas
- Tomi explicit panaszkodott = +2 prio
- Worker jelzett (cross-agent finding-üzenet) = +1
- Egyetlen alkalom = csak ha kritikus (pl. adat-veszteség, security)

Deduplikáció: ha két finding ugyanazt a skill-t érinti, vond össze.

### 4. `wiki/findings/2026-W<NN>.md` generálás

ISO-hét formátum: `date -u '+%Y-W%V'`.

```markdown
---
title: "Heti finding — 2026-W19"
created: 2026-05-10
updated: 2026-05-10
type: finding
tags: [meta]
---

# Heti finding — 2026-W19 (2026-05-04 → 2026-05-10)

## Top findings

### 1. [skill-update] inline-ui — `próba-X` típusú trigger nem matchel
- **Bizonyíték**: 2× történt (2026-05-08, 2026-05-10), Tomi panaszkodott, hub sima text-szel válaszolt approval helyzetben
- **Hipotézis**: a substring-trigger-lista nem fedi le a magyar agglutinációt minden esetben
- **Javaslat**: bővítsd `container/skills/inline-ui/SKILL.md` vagy `claude.ts:APPROVAL_TRIGGERS` listát új mintákkal
- **Action**: `skill-update` (auto-edit)

### 2. [wiki-gap] ...
...
```

### 5. `wiki/log.md` append

```
## [YYYY-MM-DD HH:MM] self-improvement | week-W<NN> | <N> finding | high=<n>, med=<m>, low=<k>
```

### 6. Card Tomi-nak Telegramra (kötelező)

```ts
mcp__nanoclaw__ask_user_question({
  title: "🪞 Heti self-improvement (W<NN>)",
  question: [
    `${N} finding az elmúlt hétből, prio sorrendben:`,
    "",
    "1. [skill-update] inline-ui — `próba-X` trigger | freq=2 | impact=high",
    "2. [wiki-gap] Erika kontaktok — nincs entity-page | freq=3 | impact=med",
    "3. [voice-cal] Tomi 2× kérte: 'ne em-dash' | impact=high",
    "",
    "Mit alkalmazzunk?"
  ].join("\n"),
  options: [
    { label: "Mind",     selectedLabel: "✅ Mind alkalmazva",  value: "apply_all" },
    { label: "Top 3",    selectedLabel: "✅ Top 3 alkalmazva", value: "apply_top3" },
    { label: "Csak 1",   selectedLabel: "✅ 1 alkalmazva",      value: "apply_one" },
    { label: "Skip",     selectedLabel: "⏭️ Halasztva",         value: "skip" },
  ],
  timeout: 86400  // 24h, mert Tomi nem mindig néz Telegramot vasárnap 11:00-kor
});
```

Ha `apply_one`: külön `ask_user_question` melyiket (a finding-listából `option`-ok).

### 7. Approve esetén — kategória-szerinti végrehajtás

A finding-ban specifikált konkrét diff szerint:

**`skill-update`**:
- Olvasd a target SKILL.md-t (`Read`)
- Kérdezd meg magadtól: új trigger-szó hozzáadás? példa-fix? doku-bővítés?
- `Edit` tool-lal a konkrét diff (használd a `skill-authoring` skillt: frontmatter validation, méret-limit, trigger-broadening best-practice)
- Ha tooling kód-szintű (pl. `claude.ts:APPROVAL_TRIGGERS` lista): NEM tudod direkten editelni a containerből — `mcp__nanoclaw__request_self_modification` paddingben jelezd Tominak host-szintű feladatként

**`wiki-gap`**:
- A finding-ban nevezett source-ból (`sources/.../...`) ingest a Karpathy disciplina szerint (egyenként!)
- Új entity/concept/projekt page → frontmatter, kereszthivatkozások
- `wiki/index.md` update

**`mcp-install`**:
- `mcp__nanoclaw__install_packages({ apt: [...], npm: [...], pip: [...], reason: "<finding-leírás>" })`
- Ez OneCLI-szinten Tomi külön approval-t kér. Mondd meg neki: "Plus admin-approval kért az `install_packages`-ben."

**`voice-calibration`**:
- `Edit groups/global/CLAUDE.md` "Anti-AI tells" vagy "Emoji-szabály" szekcióba
- Új tiltott szó / új specifikus szabály a Tomi-feedback alapján

### 8. Visszaigazolás Tomi-nak

Card formátumban:
```
title: "✅ Self-improvement alkalmazva (W<NN>)"
description: "<N> változás"
children:
  - "**skill-update** inline-ui SKILL.md — 4 új trigger-szó"
  - "**wiki-gap** új entity: erika-szabo.md"
  - "**voice-cal** global CLAUDE.md — em-dash hangsúlyozva"
actions:
  - { label: "Részletek", value: "open_findings" }  // Tomi rákattint → wiki/findings/2026-W19.md megnyit
fallbackText: "Heti finding-okat alkalmaztam (3 db). Részletek: wiki/findings/2026-W19.md"
```

Plusz `wiki/log.md` append: `## [YYYY-MM-DD HH:MM] self-improvement-applied | week-W<NN> | <N> change`.

## Worker-finding aggregálás

A worker minden run-végén küldhet plusz cross-agent message-t a hubnak ezzel a formátummal:

```
[worker:<projekt>] finding | kind=<tool-failure|insight|gap> | <leírás> | freq=<N/runs> | hypothesis=<opcionális>
```

A hub minden ilyen üzenetet:
1. Beleappend-eli a `wiki/worker-activity.md` aznapi blokkba (`### Findings` alszakasz)
2. A heti reflection ezt is olvassa (4. lépés evidence-gyűjtésnek)

A worker-finding ugyanúgy súlyozódik mint a hub-saját finding (3+ ismétlődés = magas prio).

## Rate-limit (anti-spam)

- Egy adott skill-frissítést max **havonta egyszer** ajánlj — különben Tomi belefárad. Ha ugyanaz a skill már szerepelt 2 héten belül, jelöld lent a card-ban "(ismétlés)" markerrel és csak akkor commitold, ha Tomi explicit `apply_all`-t választott.
- Ha az elmúlt héten **0 érdemi finding** van, NE küldj card-ot. Csak `wiki/log.md` append: `## [...] self-improvement | week-W<NN> | 0 finding | nothing-to-report`. Tomi nem kap Telegramra zaj-üzenetet.

## Anti-pattern (NE)

- Találgass finding-ot ami nincs a forrásokban. Csak konkrét bizonyítékkal.
- Generikus ("javítsd a hibakezelést") — mindig konkrét file-path + sor + diff-javaslat.
- 5+ finding egy hétben — túl sok, Tomi belefárad. Top 3-5 mindig.
- Meta-finding ("túl sok finding") — ne reflektálj a reflektion folyamatára magában.
