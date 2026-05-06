# Outreach Email Templates

Max 8 email/nap. Minden target és státusza: `/workspace/agent/email_pipeline.json`

## Hogyan használd

1. Olvasd be `email_pipeline.json`-t — válassz egy `NOT_CONTACTED` + `HIGH` priority targetet
2. Keresd meg a tényleges email címet (ha `email` null, nézd meg a `contact_page`-et agent-browser-rel)
3. Perszonalizáld az alábbi template-ek EGYIKÉT a target site-ra (hivatkozz konkrét cikkükre/listájukra)
4. Küld el az mcp__email tool-lal `html: true` paraméterrel
5. Frissítsd `email_pipeline.json`-t: status → `CONTACTED`, sent → dátum, email → tényleges cím

## ⚠ EMAIL CÍM VERIFIKÁCIÓ — KÖTELEZŐ

**SOHA ne küldj emailt olyan címre amit nem láttál a site contact page-én vagy about page-én.**
- Ha subagent keres email címet, KÖTELEZŐ utasítás: "Csak olyan email címet adj vissza amit ténylegesen látsz a weboldalon. Ha nem találsz publikus emailt, mondd hogy 'nem találtam' — NE találj ki/tippelj email címet."
- Ha nincs publikus email → használj contact formot (stealth-browse) VAGY hagyd ki a targetet
- Tippelt/logikus email címek (blog@, mike@, harsh@) NEM ELFOGADHATÓK
- Minden email cím mellé írd a forrást: "Forrás: [URL ahol láttad]"

## ⚠ FORMÁZÁS — KÖTELEZŐ

- **HTML email** — MINDIG `html: true` paraméterrel küldj. Kattintható linkek kötelezőek.
- **BEKEZDÉSEK: `<p>` tag KÖTELEZŐ** — Minden bekezdést `<p>...</p>` tagbe csomagolj! Sima sortörés (`\n`) HTML-ben NEM jelenik meg. Ez a leggyakoribb hiba — ha nincs `<p>` tag, az egész email egyetlen tömb szöveg lesz.
- **Normális mondatkezdet** — Nagybetűvel kezdődő mondatok. Nem corporate, de nem is lusta lowercase.
- **Hangnem** — Közvetlen, barátságos, de nem sloppy. Egy startup growth ember aki normálisan ír, nem egy dev aki chatben van.
- **Signature** — Minden email végén az alábbi HTML signature KÖTELEZŐ.

### Helyes HTML body példa:
```html
<p>Hey,</p>
<p>Just went through your portfolio tracker comparison. Solid breakdown.</p>
<p>I work on <a href="https://bulltrapp.com">BullTrapp</a>. We built a portfolio tracker that does crypto, stocks, and Polymarket in one dashboard.</p>
<p>Happy to chat more. Our <a href="https://discord.gg/ENXY4c3U">Discord</a> is where the community hangs out.</p>
[SIGNATURE]
```

## EMAIL SIGNATURE (kötelező minden emailbe)

```html
<br><br><br>
<table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
  <tr>
    <td style="padding-right: 15px; vertical-align: top;">
      <img src="https://bulltrapp.com/logo/bulltrapp_logo_square_dark.svg" alt="BullTrapp" width="40" height="40" style="border-radius: 8px;">
    </td>
    <td style="vertical-align: top;">
      <strong style="font-size: 15px;">Lloyd</strong><br>
      <span style="color: #666;">Growth &amp; Partnerships</span><br>
      <a href="https://bulltrapp.com" style="color: #2563eb; text-decoration: none;">bulltrapp.com</a>
      &nbsp;·&nbsp;
      <a href="https://discord.gg/ENXY4c3U" style="color: #5865F2; text-decoration: none;">Discord</a>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding-top: 8px; font-size: 12px; color: #999;">
      Crypto · Stocks · Prediction Markets — one dashboard, free beta
    </td>
  </tr>
</table>
```

## ALAPELV: Community-first, partnership-friendly

SOHA ne legyen "add us to your list please" email. A hangnem: baráti meghívó, de normálisan írva. A lényeg:

1. **Crypto + stocks + prediction markets** — mind a három, nem csak Polymarket
2. **AI-powered roadmap** — ami most van az az alap, a jövő az AI portfolio intelligence
3. **Community-driven** — akik most csatlakoznak, azokkal EGYÜTT építjük
4. **Discord meghívó** — kattintható link minden emailben
5. **Partnership** — nem szívesség, hanem kölcsönös együttműködés (backlink, tartalom, feature)
6. **Barátok is jók** — nem kell azonnal feature, ha csak csatlakoznak a communityhez, az is siker

## Follow-up stratégia

Ha 5 napon belül nincs válasz, küldj rövid follow-up (HTML, signature-rel):
```
Subject: Re: [eredeti subject]

Hey, just bumping this. I know inboxes are wild.

We just shipped [legutóbbi feature] and the Discord community is starting to take shape. Would be great to have you around — even if you just want to lurk and see what we're building.

[SIGNATURE]
```

---

## Template A — Listicle site (tracker comparison cikk)

Használd ha a site-nak van "Best Crypto Portfolio Tracker" vagy hasonló listicle-je.

```
Subject: Your [cikk neve] + something your readers haven't seen yet

Hey,

[1 mondat ami mutatja hogy olvastad a cikküket, konkrét cím/szám/pick].

I work on BullTrapp — we built a portfolio tracker that does crypto, stocks, and prediction markets in one dashboard. 14+ exchange integrations, 15 blockchains, stock tracking, and we're the first to pull in Polymarket positions with real P&L. Free open beta.

The bigger picture: we're turning this into an AI-powered portfolio intelligence tool. Smart alerts, cross-asset analysis, pattern recognition. And we're building it with our community, not in a vacuum. The people who join now are literally shaping what gets built next.

For you specifically: we'd love to be included in your [cikk neve]. Happy to write the section for you with screenshots, zero work on your end. And we'll feature your article on our Resources page.

Even if a listing isn't the right fit, we'd love to have you in our [Discord link]. We're looking for partners, friends, and anyone who cares about making portfolio tracking actually good.

[SIGNATURE]
```

## Template B — Polymarket/prediction market site

Használd ha a site-nak van Polymarket tools/analytics oldala.

```
Subject: Tracking Polymarket P&L alongside crypto — thought of your [oldal neve]

Hey,

[1 mondat a konkrét oldalukról]. Been recommending it to people in our community.

I work on BullTrapp. We're a portfolio tracker for people who have stuff everywhere — crypto on exchanges, tokens in wallets, stocks in a brokerage, and Polymarket positions on the side. One dashboard for all of it, and we're the only tracker that actually pulls in prediction market P&L.

We're also building this into something bigger. AI-powered portfolio intelligence, smart alerts, the kind of tools that used to be institutional-only. And we're doing it with our community, not for them.

Would love to get BullTrapp on your page. Happy to write the section and send screenshots. We'll feature your site on our [Resources page link] too.

Either way, come say hi on our [Discord link]. We welcome prediction market people, crypto traders, devs, AI enthusiasts — anyone who wants to help build better tools.

[SIGNATURE]
```

## Template C — Newsletter/media/YouTuber

Használd ha a target newsletter, híroldal, vagy content creator.

```
Subject: [Konkrét utalás a tartalmukra] + a collab idea

Hey,

[1 mondat ami mutatja hogy ismered a tartalmukat, konkrét hivatkozás].

I work on BullTrapp. We built a portfolio tracker that handles crypto exchanges, stocks, and prediction markets in one dashboard. Nobody else does all three. Free open beta, and we're building it into an AI-powered portfolio intelligence tool with our community.

A few things I can offer:
- Early access for you or your audience to walk through (unique content nobody else is covering)
- Screenshots and data you can use however you want
- We'll feature you on our [Resources page link]
- Happy to answer questions, do a walkthrough, write a draft — whatever helps

We're not just looking for coverage. We genuinely want partners and friends who want to build something together. The people in our [Discord link] right now are shaping what gets built next.

Interested? Or just come hang out.

[SIGNATURE]
```

## Template D — Cold outreach (indie blog/small site)

Használd ha kisebb indie blognak vagy személyes site-nak írsz.

```
Subject: Found your [cikk/site] + building something you might dig

Hey,

[1 mondat a konkrét cikkükről/site-ukról].

I work on BullTrapp. It's a portfolio tracker for crypto, stocks, and Polymarket prediction markets. All in one dashboard, free, open beta. We're turning it into an AI-powered portfolio tool and building it with our community.

Honestly just wanted to reach out because your [tartalom] lines up with what we're doing. Would love to partner up somehow — could be a mention, a backlink swap, or just joining our [Discord link] and seeing what we're building.

We welcome crypto people, stock traders, prediction market degens, AI nerds, devs, community leaders. Basically anyone who thinks portfolio tracking should be way better than it is.

[SIGNATURE]
```

## Template variáció tippek

- MINDIG olvasd el a voice.md-t mielőtt írsz (de az email stílus formálisabb mint social!)
- Cseréld ki a nyitó mondatot site-specifikusra (hivatkozz konkrét cikkre, számra, pick-re)
- NE copy-paste-elj — az agent maga fogalmazza meg az adott site-hoz illő verziót
- Rövid > hosszú. A template max hossz, nem min.
- **MINDEN linket `<a href>` tagbe tegyél** — discord, bulltrapp.com, resources page
- **HTML email kötelező** — `html: true` paraméter a send_email-nél
- **Signature kötelező** — a fenti HTML signature minden email végén
- AI roadmap mention MINDIG legyen benne (ez tesz minket mássá mint a többi tracker)
- Community szög: "we're building it WITH our community" — ez a kulcs üzenet
- Mondatkezdő NAGYBETŰ, normális központozás. Nem corporate, de nem sloppy.
- NE legyen salesy. Inkább "come hang out" mint "sign up now"
- [Discord link] = `<a href="https://discord.gg/ENXY4c3U">Discord</a>`
- [Resources page link] = `<a href="https://bulltrapp.com/resources">Resources page</a>`
