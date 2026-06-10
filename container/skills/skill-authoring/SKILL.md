---
name: skill-authoring
description: >
  Konvenciók és validátor új container-skill írásához vagy meglévő bővítéséhez.
  MINDIG használd ha a hub `skill-update` finding alapján skill-t szerkeszt vagy
  ír, vagy ha Tomi azt mondja "csinálj egy skillt". Trigger: "skill-frissítés",
  "új skill", "skill-edit", "frontmatter", "trigger bővítés", "csinálj skillt".
---

# Skill-authoring konvenciók (NanoClaw)

A NanoClaw container-skillek path-konvenciója: `container/skills/<name>/SKILL.md`. Ezeken kívül semmi sem regisztrálódik. A skill-rendszer a Claude Agent SDK trigger-mechanizmusát használja: a frontmatter `description` mező szövegére matchel.

## Frontmatter validator (kötelező)

```yaml
---
name: <kebab-case>          # lowercase + hyphens, max 64 char
description: >              # YAML multi-line OK
  <Mikor használja, milyen trigger-szavakra. Max 1024 char.>
---
```

**Validation szabályok:**
1. Az `---` MARKER az első byte (no leading blank line).
2. A záró `---` saját sorban, előtte `\n` (`\n---\n`).
3. A frontmatter parse-able YAML mapping.
4. `name` field present, lowercase + hyphens, ≤64 char.
5. `description` field present, ≤1024 char.
6. Non-empty body a záró `---` után.

A NanoClaw skill-loader (`container-config.ts:50-98`) ezt erősíti: érvénytelen frontmatter = skill skip-elve.

## Méret-limit

- **Description**: ≤1024 char (hard limit, validator).
- **Teljes SKILL.md**: ≤30k char NanoClaw-ban (Hermes 100k-os, mi szigorúbbak vagyunk a token-cost miatt — minden trigger-aktív skill bekerül a system promptba).

Ha a tartalom hosszabb, oszd fel külön `references/<topic>.md`-be a skill mappáján belül, és a SKILL.md hivatkozzon rájuk Read-tel ("ha kell, olvasd be").

## Trigger-szó best practice

A `description` mező a Claude SDK trigger-mechanizmusát futja. Best practice:

### Magyar agglutináció — substring-match

A magyar nyelvben szó-prefixek és -suffixek miatt a pontos szóhatár-match elbukik. **Mindig substring-match-elhető szótöveket** sorolj fel:

✅ Helyes: `email` (matchel: email-t, emailre, email-jét, próba-email)
❌ Rossz: `írj emailt` (NEM matchel: "írj próba-emailt")

✅ Helyes: `tervezet`, `draft`, `küldjem`, `mehet`
❌ Rossz: `mehet?` (kérdőjel csak akkor matchel, ha ott is van)

### Description-szerkezet

```yaml
description: >
  MINDIG használd ezt a skillt amikor <konkrét helyzet>.
  Trigger szavak: "x", "y", "z", "valami-elő-tag", "más-szó".
  Akkor is, ha <határeset>.
```

Az "MINDIG használd" / "MUST" jellegű parancs erősíti a triggert. A "Trigger szavak:" lista expliciten megadja a substring-match keresési mezőt.

## Edit vs Write döntés

**`Edit` tool** — meglévő skill kis változás:
- 1-3 új trigger-szó hozzáadás a description-be
- 1-2 sornyi pontosítás a body-ban
- Példa-blokk update

**`Write` tool** — teljes újraírás vagy új skill:
- Skill-struktúra refactor
- Új SKILL.md új mappában
- Komplex bővítés (>30% szöveg-változás)

Edit előtt mindig `Read` a teljes file-t, hogy a meglévő pattern-eket értsd (lásd `feedback_anti_ai_writing.md` "Read before write" elve).

## Trigger-bővítés workflow (gyakori use-case)

A self-improvement reflection gyakran ezt javasolja: "X-szer matchelt rosszul a trigger Y miatt". Lépések:

1. **Read** a target SKILL.md
2. Identifikáld a `description` mezőt és a trigger-listát
3. Új substring-szótöveket adj hozzá (ne pontos szavakat)
4. **Edit** a description blokkban — egyetlen `Edit` hívással
5. Verify: `grep -n "description" container/skills/<név>/SKILL.md` és olvasd el a complete frontmattert

Példa:
```
old_string: 'Trigger: "tervezet", "draft"'
new_string: 'Trigger: "tervezet", "draft", "fogalmazz", "írj próba", "email", "levelet"'
```

## Spawn-rebuild érvényesülés

**Skill-edit csak a következő container-spawn-nál érvényes** (`feedback_v2_container_config_respawn.md`).

A hub container automatikusan újraspawnol:
- Új user-üzenetnél (Telegram-on Tomi ír)
- 30 percenként (heartbeat-ceiling kill)
- Új cron-task triggerelésekor

Tehát egy skill-edit max 30 perc múlva érvényesül, de **proactive kill** is választható: a hub `mcp__nanoclaw__request_self_modification`-t kéri a `restart_container` action-nel — Tomi külön approve-olja.

A self-improvement skill-edit után a hub Tomi-nak megjegyzi: *"Friss a SKILL.md, a következő spawn-nál (~30 perc) hatályba lép."*

## Új skill létrehozása (Write workflow)

1. Mappa: `mkdir -p container/skills/<name>` (ha nincs még).
2. `Write` a `container/skills/<name>/SKILL.md`-t.
3. Frontmatter validáció (lásd fent).
4. Body: kötelezően magyar (hub-skillek), kivéve ha nemzetközi pattern-ek (pl. humanizer, Karpathy wiki — lehet vegyes).
5. **Tomi-stílus**: lásd `groups/global/CLAUDE.md`. Hub→Tomi card-ban emoji OK, kimenő szövegekben tilos.
6. Verify: `cat container/skills/<name>/SKILL.md | head -10` → frontmatter OK.

A skill **azonnal** elérhető a hubban: a `container/skills/` shared RO mount, és minden new spawn látja.

## Védendő upstream merge után

- Az új skillek `container/skills/<új-név>/`-ben — minden upstream merge után verifikáld hogy nem ütköznek upstream skillel (pl. ha upstream is `humanizer`-t hozott létre).
- Ha ütközés: rename-eljük az ütközőt (`<név>-tomi`), vagy mergáljuk a tartalmat.

## Skill törlés

`rm -rf container/skills/<név>/`. A következő spawn-nál nem lesz elérhető. Memóriába rögzítsd a törlés okát (`feedback_v2_skill_*.md` vagy `MEMORY.md` annotáció).

## Anti-pattern (NE)

- ❌ Új skillben az `description` ANGOL-NYELVŰ csak (a hub magyarul beszél, Tomi a magyar trigger-szavakat fogja használni)
- ❌ Frontmatter-szabály megsértése (validator skip-eli)
- ❌ Több mint 30k char egy skill-ben — bontsd `references/`-be
- ❌ Pontos szóhatár-match a magyar trigger-szóra (`'írj választ'` helyett `'írj válasz'`)
- ❌ Skill létrehozása teszt nélkül — minden új skillt manuálisan teszteld a következő spawn-nal (Tomi konkrét trigger-szó-üzenet → skill-aktiválás verify a logban)
