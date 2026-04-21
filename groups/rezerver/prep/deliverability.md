# Email Deliverability Prep — rezerver.com

> Cél: mire az outreach aktiválódik, a dani@rezerver.com domain reputation és technikai setup 100%-ban készen álljon, és az első batch NE landoljon spamben.

## 1. Technikai alapok — SPF / DKIM / DMARC

### SPF (Sender Policy Framework)
- **Mi ez:** DNS TXT rekord, ami megmondja melyik szerverek küldhetnek emailt a rezerver.com nevében.
- **Zoho EU SPF:** `v=spf1 include:zoho.eu ~all` (vagy `include:zeptomail.net` ha ZeptoMail is megy).
- **Fontos:** Domain-enként CSAK 1 SPF rekord lehet. Ha már van, `include:`-dal bővítsd, NE hozz létre másikat.
- **Ellenőrzés:** Zoho Admin Console → Email Authentication → SPF → Verify. Vagy: `dig TXT rezerver.com` + mxtoolbox.com/spf.aspx
- **Status:** [ ] OK [ ] Hiányzik [ ] Hibás

### DKIM (DomainKeys Identified Mail)
- **Mi ez:** Kriptográfiai aláírás az email fejlécében, ami bizonyítja hogy a feladó domain valódi.
- **Setup:** Zoho Admin Console → Email Authentication → DKIM → Generate → DNS-be CNAME vagy TXT rekord.
- **Selector:** (Zoho admin-ban generálandó)
- **Ellenőrzés:** Zoho Admin Console → DKIM → Verify. Vagy mail-tester.com-on teszt email küldés.
- **Status:** [ ] OK [ ] Hiányzik [ ] Hibás

### DMARC (Domain-based Message Authentication, Reporting and Conformance)
- **Mi ez:** Policy, ami összeköti az SPF-et és DKIM-et, és megmondja mit csináljon a fogadó szerver ha valamelyik fail.
- **Record:** `_dmarc.rezerver.com` TXT
- **Javasolt kezdő policy:** `v=DMARC1; p=none; rua=mailto:dmarc@rezerver.com; pct=100`
  - `p=none` = monitoring mód (nem utasít el semmit, csak reportot küld)
  - 2-4 hét monitoring után: `p=quarantine`, majd `p=reject`
- **Fontos:** SPF + DKIM ELŐBB legyen verify, UTÁNA DMARC.
- **Status:** [ ] OK [ ] Hiányzik

### MX
- **Mail Exchanger:** Zoho EU
- **Konfiguráció confirm:** [ ] OK [ ] Hibás

### TODO — Tomi akció szükséges:
- [ ] SPF rekord ellenőrzés/hozzáadás a rezerver.com DNS-ben
- [ ] DKIM kulcs generálás Zoho Admin Console-ban + DNS-be
- [ ] DMARC rekord hozzáadása DNS-ben (p=none-nal indulunk)
- [ ] Google Postmaster Tools regisztráció rezerver.com-ra (domain reputation monitoring)
- [ ] Microsoft SNDS regisztráció (Outlook/Hotmail deliverability monitoring)

## 2. Domain warmup stratégia

### Miért kell?
A rezerver.com új domain (nincs korábbi email history). Gmail, Outlook és más providerek az ismeretlen domaineket alacsony reputációval kezelik. Ha rögtön 50 cold emailt küldünk, spam.

### Warmup terv (4 hét, az outreach előtt):

**Hét 1 — belső / megbízható címekre:**
- Napi 2-3 email, CSAK ismert címekre (Tomi saját emailjei, barátok, teszt accountok)
- Válaszokat kérj vissza (reply = erős pozitív signal)
- Gmail + Outlook + Yahoo mix

**Hét 2 — bővítés:**
- Napi 5-8 email, bevonni 1-2 valódi ismerőst/partnert
- Reply rate legyen 30%+
- Beta waitlist signup confirmation email (aki feliratkozik)

**Hét 3 — első cold batch:**
- Napi 10-15 email (10 warmup + 5 cold)
- Figyelni bounce rate-et
- Google Postmaster reputation check

**Hét 4 — ramp up:**
- Napi 15-20 email, cold email arány növelhető
- Ha reputation "High" a Postmaster-ben, zöld a ramp-up

### Warmup eszközök (opcionális, fizetős):

| Tool | Ár | Megjegyzés |
|------|----|-----------|
| Mailreach (mailreach.co) | ~$25/hó | Automatikus warmup, mesterséges reply network. Jó reviewek. |
| Warmbox (warmbox.ai) | ~$15/hó | Hasonló, olcsóbb. |
| Instantly (instantly.ai) | ~$30/hó | Cold email platform beépített warmup-pal. Ha tool-t is akarunk, ez a legjobb all-in-one. |
| Mailwarm | ~$79/hó | Drágább, de stable. |
| **Manuális** | Ingyenes | Tomi + ismerősök, lassabb de kockázatmentes. |

### Döntés szükséges:
- [ ] Warmup tool-t használunk-e? (Mailreach / Warmbox / Instantly / manuális)
- [ ] Mikor indítjuk a warmup-ot? (Ideális: 4 héttel az első outreach batch előtt)

## 3. Cold email szabályok 2026

### Compliance (Gmail + Outlook + Yahoo, 2026 — kötelező):
- **SPF + DKIM + DMARC** — domain alignment szükséges, nincs kivétel
- **One-click unsubscribe** — RFC 8058 header (List-Unsubscribe + List-Unsubscribe-Post)
- **Spam complaint rate < 0.3%** — Google Postmaster-ben monitorozható
- **Bounce rate < 2%** — email cím validálás küldés előtt kötelező
- **Custom tracking domain** — ha open/click tracking-et használunk, saját subdomain kell (pl. track.rezerver.com), NE a tool default domainje

### Küldési korlátok:
- **Zoho EU limit:** 50 email/óra (fizetős tier-ben), ellenőrizendő
- **Ajánlott cold email napi limit:** max 20-25 / mailbox / nap
- **Ha több kell:** több mailbox (pl. tomi@rezerver.com + dani@rezerver.com), mindegyik warmolva
- **Skálázás:** mailboxonként max 25/nap, NE volume/mailbox növeléssel

### Subdomain stratégia:
- **Opció A:** dani@rezerver.com-ról küldünk — egyszerű, de ha spam complaint jön, a fő domain szenved
- **Opció B:** dani@mail.rezerver.com (cold email subdomain) — izolált reputation, fő domain védve
- **Ajánlás:** Opció B, különösen ha 50+ cold email/hét tervben van. De a mi volumenünknél (30 helyszín) Opció A is OK.

### Döntés szükséges:
- [ ] Subdomain strategy: fő domain vagy mail.rezerver.com?
- [ ] Email validálási tool: ZeroBounce / NeverBounce / Reoon?

## 4. Email tartalom — deliverability szempontok

- **Rövid subject line** (< 50 karakter), ne legyen ALL CAPS, ne legyen "INGYENES!!!"
- **Plain text > HTML** — első cold emailnél plain text jobb deliverability
- **Nincs kép az első emailben** — képek spam-triggert okozhatnak
- **Max 1 link** az emailben (+ unsubscribe link)
- **Személyre szabott nyitás** — {{venue_name}}, {{hook}} mezők a pipeline-ból
- **GDPR opt-out láb:** "Ha nem akarsz több ilyen levelet, válaszolj vissza hogy 'kivenni' és töröllek."
- **Ne használj spam-trigger szavakat:** "ingyen", "akció", "kattints ide", "korlátozott idejű"

## 5. Monitoring és mérés

| Tool | Mire jó | Ár |
|------|---------|-----|
| Google Postmaster Tools | Gmail deliverability + domain reputation | Ingyenes |
| Microsoft SNDS | Outlook/Hotmail deliverability | Ingyenes |
| mail-tester.com | SPF/DKIM/DMARC + spam score ellenőrzés | Ingyenes (3/nap) |
| MXToolbox | DNS rekord validálás + blacklist check | Ingyenes |
| ZeroBounce / NeverBounce | Email cím validálás (bounce prevention) | ~$0.008/email |

### Benchmark-ok (HU cold B2B):
- Open rate: 20-30% jó
- Reply rate: 3-5% jó
- Bounce rate: cél < 2%
- Spam complaint: cél < 0.1%

## 6. Összefoglaló checklist — aktiválás előtt MIND KÉSZ kell legyen

- [ ] SPF rekord live + verified Zoho-ban
- [ ] DKIM rekord live + verified Zoho-ban
- [ ] DMARC rekord live (p=none → p=quarantine transition plan)
- [ ] MX rekord OK
- [ ] Google Postmaster Tools aktív
- [ ] Microsoft SNDS aktív
- [ ] MXToolbox blacklist check: clean
- [ ] mail-tester.com score: 9+/10
- [ ] Domain warmup 4 hét KÉSZ
- [ ] Custom tracking domain setup (ha tracking kell)
- [ ] Email cím validálási tool kiválasztva
- [ ] Subdomain döntés meghozva
- [ ] Zoho küldési limit ellenőrizve
- [ ] Első batch email tartalom review (plain text, 1 link, rövid subject)
- [ ] One-click unsubscribe header beállítva

## 7. Nyitott kérdések Tomi-nak

1. SPF/DKIM/DMARC már be van állítva? Ha igen, mutat-e Zoho admin "verified"-et?
2. Fizetős warmup tool-t akarunk vagy manuális? (Instantly all-in-one lenne a legjobb ha tool is kell)
3. Subdomain (mail.rezerver.com) vagy fő domain?
4. Mikor kezdjük a warmup-ot? 4 héttel az outreach előtt kéne indulni.
5. DMARC policy `p=none`-ról `p=quarantine`-ra váltani 1 hónap után — OK?

---

*Utolsó frissítés: 2026-04-19 — Session 3. Státusz: kutatás kész, Tomi döntésekre vár.*
