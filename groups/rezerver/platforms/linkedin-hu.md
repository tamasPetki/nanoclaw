# LinkedIn HU — Event industry networking & content

> **🛑 DORMANT — PHASE 2.** Tomi saját LinkedIn-je lesz majd a csatorna, de csak 10+ venue onboarded után aktiváljuk. Addig ne posztolj, ne connect-elj, ne kommentelj Rezerver-ügyben LinkedIn-en. **Ne olvasd tovább, tér vissza email outreach-hez.**

> A LinkedIn a HU event industry-ben (wedding planner, MICE agency, event koordinátor) **második legaktívabb csatorna az email után.** Nem volumenről szól, hanem **credibility + connection**-ről.

## Account-opciók (Tomi döntse el Phase 1 elején)

### (A) `@krip_tom` meglévő LinkedIn + Zapier hook
- Már megvan a Zapier webhook: `https://hooks.zapier.com/hooks/catch/813033/uxlw1sl/`
- **Probléma:** BullTrapp-brand keverésre = összezavarja a LinkedIn-követőket (ők AI/crypto tool-ajánlókra fizettek fel, nem HoReCa SaaS-ra)
- **Csak akkor használd ha Tomi explicit engedélyezi**

### (B) ✅ AJÁNLOTT: Dedikált Rezerver-Tomi LinkedIn profil
- A LinkedIn profil Tomi alapítóé lesz, regisztrációs email-t Tomi adja meg (NEM dani@rezerver.com, mert a LinkedIn profil Tomi személyéhez tartozik)
- Profil: "Petki Tamás | Rezerver alapító | HoReCa SaaS"
- Első 2 hét: üres profil = gyanús, ezért Tomi tölt fel pár személyes sztorit a Rezerver fejlesztéséről (non-automated warmup)
- Új Zapier webhook: `LINKEDIN_REZERVER_ZAPIER_HOOK` env var
- Posztok első személyben TOMI nevében (a LinkedIn = alapítói brand), Dani NEM posztol a Tomi profiljáról

**Status check:** `state.json` `notes` tömbben "LinkedIn option B pending" — amíg Tomi nem beállította, a LinkedIn akciók **SZÜNETELNEK**. Ne erőltesd.

## Napi quoták (ha account aktív)

| Akció | Quota | Megjegyzés |
|-------|-------|-----------|
| Poszt | 1/hét | Heti 1 HU nyelvű poszt, HoReCa insight / Rezerver fejlesztés / vendéglátós sztori |
| Connect request | 2-3/nap | Wedding planner, event koordinátor, rendezvény-szervező, MICE agency HU profilok |
| Komment HU HoReCa poszt | 2-3/nap | Thought leader posztjaira értékadó komment, NEM Rezerver-promo |
| DM | Csak connection-ök után, max 1/nap | Soft, ismerkedős |

## Poszt hangnem (heti 1×)

Lásd `voice.md`. HoReCa-barát, közvetlen, személyes sztoriból indul, **NEM thought leadership**.

### Témák (rotálj)

1. **Rezerver fejlesztés-story** — "Ma este ezt adtam hozzá..." (konkrét feature, 2-3 mondat)
2. **HoReCa observation** — "4 emailt váltottam ma egy étterem-tulajdonossal csak hogy megtudjam a férőhelyet..."
3. **Szakmai insight** — "A HU vendéglátás 80%-a még mindig manuálisan kezeli a foglalásokat — itt van miért érdekes ez..."
4. **Partnership-sztori** — amikor egy venue onboarded-re kerül, Tomi engedélyével posztolj róla (név + tapasztalat)
5. **Béta update** — milestone-ok (10 venue, első fizetett foglalás, stb.)

### Struktúra

- Nyitás 1 mondattal (hook)
- 2-3 bekezdés törzs, rövid mondatok
- Zárás CTA-val: "Ha vendéglátós ismerősödnek érdekes, tag-eld kommentben" / "A rezerver.com-on lehet jelentkezni a bétára"
- Max 200 szó, 5-7 sor
- **EGY kép** (screenshot, fotó — NEM stockphoto!)

### Zapier poszt — webhook hívás

```
curl -X POST "$LINKEDIN_REZERVER_ZAPIER_HOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "<poszt törzs>",
    "url": "<opcionális URL>",
    "image_url": "<opcionális kép URL>"
  }'
```

## Connect request stratégia

**Cél profilok (kereséshez):**
- Pozíció: "wedding planner", "event manager", "rendezvényszervező", "foglalási vezető", "MICE", "corporate event coordinator"
- Lokáció: Magyarország
- Ha céges, akkor: Visionary, MEP Events, AIM, Magyar Kongresszusi Iroda

### Connect üzenet (opcionális, DE AJÁNLOTT)

Rövid, 300 karakter maximum:

```
Szia [Keresztnév]!

Tomi vagyok, a Rezerver-től. Foglalási rendszert építünk rendezvényhelyszíneknek. Láttam hogy [konkrét dolog a profiljából], gondoltam kapcsolódjunk.
```

**NE** küldj automatikus "érdekes a profilod" üzenetet — erős LinkedIn-tell hogy bot.

## Komment stratégia

- Ha HU HoReCa thought leader poszt jön be (vendéglátós YouTuber, éttermes celeb, event industry szakember), írj 2-3 mondatos értékadó kommentet
- **NEM Rezerver-promo** → csak a kontextusra reagálsz szakmaian
- Ha véletlen relevánsba fut (valaki foglalási nehézségről posztol), 1× lehet "mi pont ezen dolgozunk" típusú említés — de ritkán, ne erőltesd

## Logging

LinkedIn akciók `state.json`-ban:
```json
"linkedin_actions_today": [
  {"type": "post", "url": "...", "time": "..."},
  {"type": "connect", "profile": "...", "sent": true, "accepted": null, "time": "..."},
  {"type": "comment", "on_post": "...", "content_summary": "...", "time": "..."}
]
```

Weekly aggregáció `weekly_stats`-ba.

## Tomi intervenciót igénylő helyzetek

- LinkedIn "Are you a real person?" check — manuális phone verify, Tomi csinálja
- Dedikált Rezerver-Tomi profil létrehozása (Phase 1 start)
- Ha connect-request rate limit → csökkents 1/nap-ra
