# Objection Playbook — HU Venue Cold Reply

> Dani hangon, voice.md-t követve. Minden válasz rövid, konkrét, nem defenzív. A cél: leszerelni az ellenérvet, NEM meggyőzni.

## Használat

Inbox reply-kor előbb nézd itt meg hogy a kérdés/kifogás klaszterbe esik-e. Ha igen, a válasz-sablon alapja az itt levő, de mindig personalizáld a küldő venue-jára (név, szegmens, hook).

## Top 15 várható kifogás

---

### 1. "Az 1% túl sok."
- Mögötte: nem az 1% fáj, hanem hogy mást is fizet (Stripe fee + 1%), összesítve sok
- Válasz csíra: "Az 1% a mi díjunk, a Stripe saját fee-je nem ide tartozik. Ha 100 ezer a foglalás, az 1000 forint nálunk. Cserébe nem kell foglalási embert fizetni."
- Jogos-e: félig. Stripe ~1.5% + fix, összesen ~2.5%. De: 3 hónapos béta alatt 0%.

### 2. "Már van saját foglalási űrlapunk / emailes folyamat."
- Mögötte: "működik ahogy van, nem akarom lecserélni"
- Válasz csíra: "Az űrlap összegyűjti a kérdést, de utána válaszolni kell. A Rezerver-nél a vendég maga választ csomagot, árat lát, foglal, fizet előleget. Az űrlap mellé tesszük, nem lecseréljük."
- Jogos-e: jogos. Kiegészítjük, nem cseréljük.

### 3. "Nincs időm most setup-ra, szezonba vagyunk."
- Mögötte: tényleg nincs ideje, szezonban nem akar kísérletezni
- Válasz csíra: "Teljesen értem. A setup-ot Tomival együtt csináljuk, 1-2 emailváltás + képek, mi beállítjuk. Szezon végi indulás is oké."
- Jogos-e: nagyon jogos. Ne nyomakodj, ajánld szezon utánra.

### 4. "A vendégeim telefonon foglalnak, nem online."
- Mögötte: célközönség telefonos (50+, fine dining)
- Válasz csíra: "A telefon maradhat a fő csatorna. De a Rezerver link a weboldalon extra bejárat az éjjeli, külföldi, időhiányos foglalóknak."
- Jogos-e: részben jogos. Online csatorna plusz bevételt hoz, nem helyettesít.

### 5. "GDPR / adatvédelem hogyan megy?"
- Mögötte: fél hogy adatszivárgás lesz és ő felel
- Válasz csíra: "EU-s Stripe kezeli a fizetést, mi kártyaadatot nem tárolunk. Vendégadatok: név, email, telefon. Adatfeldolgozói szerződést kötünk ha kéred."
- Jogos-e: nagyon jogos, jó jel. Válaszolj precízen.

### 6. "Stripe fee magas, nem szeretjük."
- Mögötte: összességében sok (Stripe ~1.5% + fix + mi 1%-unk)
- Válasz csíra: "Barion integrációt tervezzük (alacsonyabb HU fee). Béta alatt az 1% díjunkat elengedjük, most tényleg csak a Stripe költség marad."
- Jogos-e: jogos. Ha visszatérő, Tominak jelezni.

### 7. "Nem tudok Barion/OTP SimplePay-t?"
- Mögötte: vendégei magyar kártyásak, Barion olcsóbb
- Válasz csíra: "Most Stripe-pal megyünk. Barion a roadmap-en van, jelezd ha prioritás és előrehozzuk. A béta pont erre jó."
- Jogos-e: nagyon jogos. Őszintén közöld.

### 8. "Mi van ha lemondanak? Visszaadjuk a deposit-ot?"
- Mögötte: lemondási policy kezelése
- Válasz csíra: "A lemondási szabályt te állítod be. A Rezerver automatikusan kezeli a visszautalást a te policy-d szerint."
- Jogos-e: kritikus kérdés. Stripe refund fee-t ellenőrizd.

### 9. "Integrál a meglévő POS / rezerváció rendszerrel?"
- Mögötte: nem akar párhuzamos rendszert
- Válasz csíra: "Most standalone, iCal/Google Calendar szinkron van. POS integrációt béta feedback alapján priorizáljuk. Milyen rendszert használsz?"
- Jogos-e: nagyon jogos. Kérdezd meg és jelezd Tominak.

### 10. "Ki ad ügyfélszolgálatot ha elakadok?"
- Mögötte: kis cég = eltűnnek
- Válasz csíra: "Tomi (alapító) és én vagyunk, emailre 24 órán belül válaszolunk. Béta = közvetlen vonal."
- Jogos-e: béta fázisban előny.

### 11. "Mennyi idő míg élesben megy?"
- Mögötte: nem akar heteket setuppal
- Válasz csíra: "Ha megvannak az árak és fotók, 1-2 nap. Az árazási struktúrát Tomival együtt rakjuk össze, az a legrészletesebb rész."
- Jogos-e: az árazási struktúra a valódi bottleneck.

### 12. "Kipróbálom, ha nem jön be, hogy mondom le?"
- Mögötte: elköteleződés-félelem
- Válasz csíra: "Bármikor lemondod, nincs kötés, nincs díj. 3 hónap béta ingyen, utána 1%. Ha nem tetszik, kikapcsolod."
- Jogos-e: pozitív jel.

### 13. "Ki látta már? Kik a referencia partnerek?"
- Mögötte: social proof hiánya
- Válasz csíra: "Béta fázis, az első 30 helyszínt építjük. Referencia még nincs, pont ezért ingyen az első 3 hónap."
- Jogos-e: LEGKEMÉNYEBB kifogás. Csak őszinteség megy.

### 14. "Miért jobb mint a Foody / Dineout / OpenTable HU?"
- Mögötte: összehasonlítás
- Válasz csíra: "Azok asztal-foglalási rendszerek. Mi rendezvényfoglalás: 50 fős szülinap, csomag, ár, előleg. Más usecase."
- Jogos-e: más szegmens, egyszerű válasz.

### 15. "Biztosítva van a fizetés? Mi van ha hackelnek?"
- Mögötte: fizetési biztonság
- Válasz csíra: "Kártyaadatot Stripe kezeli, nálunk nem tárolódik. Stripe PCI Level 1. Mi semmilyen kártyaadathoz nem férünk hozzá."
- Jogos-e: megnyugtató, objektív.

---

## Taktika-jegyzet

Top 3 legkeményebb kifogás:
1. "Ki látta már?" (social proof) - csak őszinteség + béta kedvezmény
2. "Nincs időm" (szezon) - ne nyomakodj, ajánld később
3. "Van saját rendszerem" - kiegészítés pozícióból, ne cserélésből

Escalate Tominak:
- Jogi kérdések (szerződés, felelősség)
- Egyedi árazási kérés (fix havidíj)
- Integrációs kérés konkrét POS-szal
- Több helyszínes csoport (enterprise)

## Még gyűjtendő

- [ ] Valós bejövő kérdésekből új klaszter
- [ ] Konkurencia-review-ból kifogás-minták
- [ ] FB csoportokban olvasott panaszok/kérdések
