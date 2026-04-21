# Email Drafts — HU templates (Rezerver)

> **Mindig olvasd el a `voice.md`-t mielőtt használod ezeket a draftokat.** Minden email-t testre kell szabni a konkrét targetre — a template csak váz, nem copy-paste.

## Tartalom

1. [Venue cold outreach — lazább éttermes (HTML)](#1-venue-cold-outreach--lazább-éttermes-html)
2. [Venue cold outreach — fine dining / rendezvényközpont (HTML)](#2-venue-cold-outreach--fine-dining--rendezvényközpont-html)
3. [Venue follow-up (5 nap no-reply)](#3-venue-follow-up-5-nap-no-reply)
4. [HU media pitch — HoReCa szakmai (HTML)](#4-hu-media-pitch--horeca-szakmai-html)
5. [HU media pitch — startup sajtó (HTML)](#5-hu-media-pitch--startup-sajtó-html)
6. [Reply pozitív venue érdeklődéshez (demo)](#6-reply-pozitív-venue-érdeklődéshez)
7. [Signature (minden email végére)](#signature-minden-email-végére)

---

## 1. Venue cold outreach — lazább éttermes (HTML)

**Subject opciók:**
- "Gyorsabb foglaláskezelés a {{venue_name}}-nak"
- "{{venue_name}} × Rezerver — béta ajánlat"
- "2 perc olvasás a {{venue_name}} rendezvény-foglalásairól"

**Body:**
```html
<p>Szia,</p>

<p>Dani vagyok a Rezerver.hu-tól. {{personal_observation_max_30_words — pl: "Ma reggel néztem a {{venue_name}} oldalát a Wedding.hu-n, pont olyan hely amit sokan keresnek szülinapra vagy céges event-re."}}</p>

<p>A Rezerver egy foglalási rendszer rendezvényhelyszíneknek. Tomival (az alapító) építjük, béta fázisban vagyunk. Beállítjátok egyszer az árakat, férőhelyeket, csomagokat, utána a vendég maga foglal online, előleggel is. 1% tranzakciós fee, semmi más.</p>

<p>Az első 30 helyszín 3 hónapig fizetés-mentes. A beállításban is segítünk (fotók, árstruktúra).</p>

<p>Ha érdekel, küldök 2-3 screenshot-ot vagy videódemót. https://www.rezerver.com/demo</p>

{{SIGNATURE}}

{{GDPR_OPT_OUT}}
```

---

## 2. Venue cold outreach — fine dining / rendezvényközpont (HTML)

**Subject opciók:**
- "Kérdés a {{venue_name}} rendezvény-foglalásához"
- "{{venue_name}} — béta partnerség-ajánlat"

**Body:**
```html
<p>Tisztelt {{contact_name_ha_van}},</p>

<p>Dani vagyok a Rezerver.hu-tól. Tomival (az alapító) most építjük fel a rendszert, és pontosan olyan rendezvényhelyszíneket keresünk mint a {{venue_name}}, ahol sok egyéni ajánlatkérés fut be naponta és sok idő elmegy a válaszolgatással.</p>

<p>A Rezerver egy self-service foglalási rendszer: beállítjátok egyszer az árakat, csomagokat, férőhelyet, és a vendég maga tudja lefoglalni online, előleg-fizetéssel. A mi oldalunkon 1% Stripe tranzakciós fee, ez minden.</p>

<p>Béta fázisban vagyunk, az első 30 helyszín 3 hónapig nem fizet semmit. A beállításban is segítünk (fotók, árstruktúra, csomagok).</p>

<p>Ha érdekel, küldök screenshotokat vagy rövid videódemót. A https://www.rezerver.com/demo oldalon is lehet nézelődni.</p>

{{SIGNATURE}}

{{GDPR_OPT_OUT}}
```

---

## 3. Venue follow-up (5 nap no-reply)

**Subject:** `Re: {{original_subject}}`  (vagy ha SMTP nem engedi, akkor: "Follow-up: {{original_subject}}")

**Body (plain text OK, nem kell HTML):**
```
Szia,

Előző emailemre gondolom nem tudtál reagálni a napi hullámban. Ha ráérnél 2 percre, csatolok 2 screenshotot hogy néz ki a rendszer.

{{SCREENSHOT_1_URL}}
{{SCREENSHOT_2_URL}}

Az első 30 helyszín 3 hónapig fizetés-mentes, a béta ajánlat még nyitott.

Üdv,
Dani

Ha nem kívánsz több levelet, válaszolj vissza hogy "kivenni".
```

---

## 4. HU media pitch — HoReCa szakmai (HTML)

**Subject:** "Új HU SaaS rendezvény-foglaláshoz — lenne témája?"

**Body:**
```html
<p>Szia {{editor_first_name}},</p>

<p>{{publication_name}}-on legutóbb {{reference_to_specific_article_title_from_last_90_days}} témát olvastam. Rezerver néven most építünk egy foglalási rendszert pontosan erre a problémára.</p>

<p>Dani vagyok, a Rezerver growth kollégája. Tomi (Petki Tamás) az alapító, 3 hónapja fejlesztik. A vendég valós időben látja az árakat, le tudja foglalni a helyszínt, és online előleget is tud fizetni. A helyszínek 1% Stripe tranzakciós fee-t fizetnek, ennyi.</p>

<p>Béta fázisban tartunk, az első 30 helyszín 3 hónapig fizetés-mentes. Ha érdekel a téma, szívesen küldök:</p>

<ul>
  <li>HU HoReCa benchmark adatokat (hány helyszín használ foglalási rendszert, átlag ajánlat-reakcióidő, stb.)</li>
  <li>Screenshotokat a rendszerről</li>
  <li>Tomi (alapító) interjú-anyagát email-ben</li>
</ul>

<p>Nincs nálunk PR ügynökség, ez közvetlen megkeresés.</p>

{{SIGNATURE}}

{{GDPR_OPT_OUT}}
```

---

## 5. HU media pitch — startup sajtó (HTML)

**Subject:** "Új HU startup a HoReCa foglaláshoz — Rezerver"

**Body:**
```html
<p>Szia {{editor_first_name}},</p>

<p>Új HU SaaS-t építünk Rezerver néven. Röviden: rendezvény-foglalási platform éttermeknek, bároknak, rendezvényközpontoknak, 1% Stripe tranzakciós fee-vel, HU-lokalizálva.</p>

<p>Dani vagyok, a Rezerver-nél a growth kolléga. Tomi (Petki Tamás) az alapító, 3 hónapja dolgozik rajta. Core 95% kész, béta launch 2-4 hét múlva. USP: real-time árkalkuláció, a konkurencia "kérjen ajánlatot" modellt használ, a Rezerver-nél a vendég azonnal lát árat és tud foglalni online fizetéssel.</p>

<p>Ha érdekel a HU startup szcéna-szempontú story, szívesen küldök:</p>

<ul>
  <li>Piaci méret-elemzést (HU HoReCa rendezvény-foglalási piac)</li>
  <li>Tech stack és architektúra bemutatást</li>
  <li>Tomi alapítói interjú-anyagát email-ben</li>
  <li>Embargo-os launch-infót ha kamera-nyitásra kíváncsi vagytok</li>
</ul>

<p>Ha ez beleillik a rovatotokba, szívesen adnék anyagot.</p>

{{SIGNATURE}}

{{GDPR_OPT_OUT}}
```

---

## 6. Reply pozitív venue érdeklődéshez (demo)

**Subject:** `Re: {{original_subject}}`

**Body (HTML):**
```html
<p>Szia {{venue_contact}},</p>

<p>Jó hogy visszaírtál, köszönöm! Csatolok {{2-3_screenshot_of_the_product}}:</p>

<ol>
  <li>Dashboard — hogyan állítod be a helyszínt, az árakat, a csomagokat</li>
  <li>Publikus foglalási oldal — ezt látja a vendég, real-time árkalkulációval</li>
  <li>Online fizetés + email értesítések</li>
</ol>

<p>Ha videós formában jobban emészthető, itt egy 2 perces demó: {{DEMO_VIDEO_URL_IF_AVAILABLE}}</p>

<p>Ha úgy látod hogy passzol, Tomival holnap össze tudunk rakni egy onboarding-link-et, és beállítjuk együtt emailben a fotókat és az árakat. 3 hónapig nem fizetsz semmit, utána 1% Stripe fee.</p>

<p>Ha kérdésed van, írd, válaszolok 24 órán belül.</p>

{{SIGNATURE}}
```

*(Ide NEM kell GDPR opt-out — már reply-t kaptunk.)*

---

## Signature (minden email végére)

```html
<p>Üdv,<br>
Dani<br>
<strong>Rezerver.hu · growth</strong><br>
dani@rezerver.com</p>
```

## GDPR opt-out (minden COLD emailbe — NEM reply-ba)

```
<p style="font-size: 11px; color: #888;">Ha nem kívánsz további ilyen levelet, válaszolj vissza hogy "kivenni" és törllek a listáról.</p>
```

## Placeholder-ek (használat előtt mindet cseréld!)

- `{{venue_name}}` — a helyszín neve
- `{{contact_name_ha_van}}` — konkrét személy neve ha találtad, különben hagyd ki
- `{{personal_observation_max_30_words}}` — konkrét dolog amit láttál a venue-ról (IG, Wedding.hu, TripAdvisor)
- `https://www.rezerver.com/demo` — Tomi adja meg a `.secrets`-ben vagy Discord-on
- `{{SCREENSHOT_1_URL}}`, `{{SCREENSHOT_2_URL}}` — Tomi előre feltölti vagy agent generál
- `{{DEMO_VIDEO_URL_IF_AVAILABLE}}` — ha van videó link, ide, különben hagyd ki az egész bekezdést
- `{{publication_name}}`, `{{editor_first_name}}`, `{{reference_to_specific_article_title_from_last_90_days}}` — media pitch-nél pontosan kitöltendő
- `{{SIGNATURE}}` — fenti szignatúra blokk
- `{{GDPR_OPT_OUT}}` — fenti GDPR blokk
- `{{original_subject}}` — follow-up-hoz az eredeti email subject
