# Landing Page E2E Audit — rezerver.com/demo

> Cél: Dani ügyfélként végigmegy a `rezerver.com/demo` flow-n, mintha egy éttermes / rendezvényközpontos vezető kattintott volna rá egy cold email-ből. Minden akadást, kérdést, zavart dokumentálunk. Launch napon legyen súrlódásmentes.

## Audit session-ek

### Session 1: First impression (venue-tulajdonos szemmel)
- **Dátum:** 
- **Böngésző / eszköz:** (desktop Chrome / mobil Safari — 2 külön session!)
- **Hol landoltam:** (`rezerver.com/demo`)
- **Első 5 másodperc:** mi ragadta meg a figyelmet? Mit NEM értek?
- **Első 30 másodperc:** értem-e mit csinál a termék? Látom-e az értékajánlatot?
- **Melyik CTA-ra katintanék természetesen:**
- **Pain pont / súrlódás:**

### Session 2: Demo-flow végigjárás
- Végigjárok minden demo-oldalt mint egy rendezvény-foglaló
- Árkalkuláció működik?
- Mobil-reszponzív?
- Mennyi idő míg egy komplett foglalást végig tudok csinálni?
- Lag / broken link / nyelvi hiba?

### Session 3: Signup / waitlist flow (ha van)
- Beta signup gomb hol van? Látszik-e venue-tulajdonosnak?
- Mit kér az űrlap? Túl sok-e / túl kevés-e?
- Köszönő-oldal: mi a következő lépés? Emailben érdemben visszajön?

### Session 4: Email deliverability follow-up
- Beta signup → melyik email jön vissza? Milyen feladóval?
- Spam-folderbe kerül? (gmail, gmail-rezerver-különböző)

## Súrlódás-lista (launch-kor fix-elendő)

*Ide minden sort Dani mint audit-findings, prioritizáltan:*

### Blocking (launch előtt javítandó)

### High (érdemes javítani)

### Low (nice-to-have)

## Mobil vs desktop különbségek

## SEO / indexálhatóság — csak observation

- Title tag:
- Meta description:
- OG image (social preview):
- Van-e `/hu` vagy csak `/demo`?

## Nyitott kérdések Tomi-nak

- [ ] Ki fejleszti a landing-ot, ha hibát találok mehet Slack/Discord, vagy kimeneti file?
- [ ] A beta signup form hová postázza a lead-et (Airtable, Notion, email)?
- [ ] Van-e analytics rajta (Posthog, Plausible, GA)?
