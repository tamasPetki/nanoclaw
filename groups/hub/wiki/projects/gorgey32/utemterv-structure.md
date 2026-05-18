---
title: Görgey32 Ütemterv xlsx — strukturális referencia
created: 2026-05-11
type: reference
sources: [summary.md]
---

# Görgey32 - Ütemterv.xlsx — strukturális referencia

Drive file_id: **`1O1KbuUIICgMppyG3jwSm1JIRL6Mkxxzi`**
Path: `04 - Ingatlanok/Vác - Görgey utca 32/03 - Költségvetés/Aktuális állapot/Görgey32 - Ütemterv.xlsx`

A hub agent ezt a fájlt vezeti — minden frissítésnek **a meglévő xlsx-be** kell mennie, NEM új doc/file létrehozással. Olvasáshoz a Drive MCP `readSpreadsheet` / Sheets API `values.get`; íráshoz `updateSpreadsheet` / `values.update`.

## 5 sheet — gyors áttekintés

| Sheet | Rows × Cols | Cél |
|---|---|---|
| **Ütemterv** | 52 × 39 | Master feladat-lista + Gantt-sávok |
| **Mennyiségek** | 33 × 6 | Munkanem × mennyiség × idő × kivitelező |
| **Saját csapat** | 30 × 6 | Heti terhelés saját csapatra |
| **Alvállalkozók** | 22 × 5 | Alvállalkozó × feladat × határidő |
| **Összefoglaló** | 22 × 2 | Projekt-meta + fázis-mérföldkövek |

## Sheet: Ütemterv (master)

### Header
- Row 1: cím (`GÖRGEY32 - ÜTEMTERV v3b`)
- Row 2: meta (`2026.02.20. | B stratégia`)
- Row 3: oszlop-csoport-fejlécek a Gantt-területre: `H1, H2, …, H22` (I-AD oszlopok)
- Row 4: **valódi oszlop-fejlécek**:
  - **A** = sorszám (`#`)
  - **B** = Feladat
  - **C** = Kategória (Föld / Szerkezet / Szigetelés / Villany / Víz / Gépészet / Lakatos / Belső / Külső / Befejezés)
  - **D** = Kivitelező (`Saját` / `Alvállalkozó` / `Vegyes` / `Saját csapat`)
  - **E** = Kezdés (date)
  - **F** = Befejezés (date)
  - **G** = Hét (időtartam hetekben, float)
  - **H** = Megjegyzés
  - **I..AD** = Gantt-sávok (H1=02.24, H2=03.03, …, H22=07.21) — minden oszlop egy heti slot
  - Lehet hogy AE..AI továbbiakat tartalmaz (extra heti slot vagy meta)

### Heti oszlopok teljes mapping (cell I:I = H1)

```
H1=02.24  H2=03.03  H3=03.10  H4=03.17  H5=03.24  H6=03.31
H7=04.07  H8=04.14  H9=04.21  H10=04.28 H11=05.05 H12=05.12
H13=05.19 H14=05.26 H15=06.02 H16=06.09 H17=06.16 H18=06.23
H19=06.30 H20=07.07 H21=07.14 H22=07.21
```

### Gantt-szín-kódok (cell fill)
- **`FF27AE60`** (zöld) — Saját csapat
- **`FF2980B9`** (kék) — Alvállalkozó
- Üres cella (nincs fill) — nincs feladat azon a héten

Mikor egy feladat csúszik, a Gantt-sávot **eltolod**: töröld a régi színt az érintett heteken, add hozzá az új helyen. NE törölj feladat-sort (A-H oszlop megmarad), NE törölj egész oszlopot.

### Soreloszlás Kivitelező szerint (jelenlegi snapshot)
- Alvállalkozó: 24
- Saját: 14
- Vegyes: 1
- Saját csapat: 1
- Total: 40 feladat

## Sheet: Saját csapat

### Header
- Row 1: cím
- Row 3: oszlopok: **A**=Hét (`H1`, `H2`, ...) | **B**=Dátum | **C**=Feladat (saját) | **D**=Terület | **E**=Státusz

### Státusz oszlop (E) értékkészlete
- `KÉSZ`
- `DOLGOZIK`
- `VÁRHATÓ`

**KRITIKUS — soha ne legyen párhuzamos saját feladat egy héten!** Ezen a sheeten 1 hét = 1 sor = 1 saját feladat. Ha az Ütemterv-sheeten 2 saját feladat fut egyidejűleg, akkor a tervezés rossz, jelezd Tomi-nak.

## Sheet: Alvállalkozók

- Row 3: oszlopok: **A**=Alvállalkozó | **B**=Feladat | **C**=Kezdés | **D**=Befejezés | **E**=Megjegyzés
- Egy alvállalkozó több sorban szerepelhet (több feladattal).

## Sheet: Összefoglaló

- 2 oszlop: kulcs–érték.
- Tartalmaz: Helyszín, Épület, Indulás, ... és **fázis-mérföldköveket** (pl. "Tetőszerkezet befejezése: H4", "Vakolás befejezése: H8").
- Frissítés: ha egy mérföldkő-feladat csúszik, a megfelelő sor érték-oszlopát frissítsd a friss heti-számra.

## Sheet: Mennyiségek

- Row 3: **A**=Munkanem | **B**=Mennyiség | **C**=Egys. | **D**=Termelékenység | **E**=Becsült idő | **F**=Kivitelező
- A=BELSŐ FALFELÜLETEK típusú header-sorok elválasztanak munkanem-csoportokat.
- Nincs Gantt itt, csak méretkalkuláció.

## Műveletek workflow-ja Tomi-i utasításra

### "Frissítsd az ütemtervet — csúszás" / "X feladat csúszott Y héttel"
1. **Ütemterv sheet**: érintett feladat-sor — **E (Kezdés)**, **F (Befejezés)** datesz módosítása + **G (Hét)** újraszámolása. Plus a Gantt-cellák (I..AD-on) — törlés-régi-szín + új-szín-új-helyen.
2. **Függőségi lánc**: ha az érintett feladat előzménye más feladatoknak (`Befejezés` < későbbi feladat `Kezdés`), MIND a láncolatban szereplő feladatokat csúsztasd ugyanannyi héttel. Az xlsx-ben **nincs explicit függőség-oszlop** — a chain-t a kategória + projekt-tudás alapján kell levezetni (pl. szerkezet → szigetelés → vakolás → festés). Tomi-i tudás kell ehhez.
3. **Saját csapat sheet**: ha érintett saját-feladat csúszik, az ottani heti sorokat is csúsztasd. ELLENŐRIZD nincs-e párhuzamos saját-feladat.
4. **Alvállalkozók sheet**: ha alvállalkozói-feladat csúszik, ott is dátum-update.
5. **Összefoglaló sheet**: ha mérföldkő-érintett, fázis-sor érték-frissítés.
6. **Válasz Tomi-nak**: mi változott + mely feladatok érintettek a láncban + új várható befejezési dátum (utolsó F cella + 1 hét). Discord/Telegram-ra rövid summary.

### "Feladat elkészült" / "X kész"
1. **Saját csapat sheet** (ha saját feladat): érintett sor **E (Státusz)** = `KÉSZ`.
2. **Ütemterv sheet** Gantt-sáv: a kész részre opcionálisan más szín vagy bejegyzés a **H (Megjegyzés)** oszlopba (pl. `"KÉSZ 2026-05-08"`).

### "Új feladat / új alvállalkozó / új munkanem"
1. Új sor az Ütemterv sheet végére (vagy logikailag a megfelelő helyre — Tomi mondja).
2. Plus Saját csapat / Alvállalkozók / Mennyiségek sheet-re ha érintett.
3. Gantt-sávot rajzold a megfelelő H-oszlopokban a Kezdés-Befejezés alapján, megfelelő színnel.

### "Hol tartunk?" / státusz-kérdés
1. **Először** a `wiki/projects/gorgey32/summary.md` "Aktuális fázis" szekcióját nézd — ez Tomi-naprakész narratíva (a helyszíni szemlékből).
2. Másodszor az xlsx Saját csapat **Státusz** oszlopa (`KÉSZ`/`DOLGOZIK`/`VÁRHATÓ`).
3. Adj kontextusos választ: aktuális hét feladatai (current `H<n>` oszlop fenti dátumából), mi jön következőnek, van-e csúszás az eredeti dátumokhoz képest.

## Tooling notes

- **Olvasás konzisztens módon**: a rclone-mountolt drive (`/workspace/extra/pietscarlet-drive/`) read-only — preview-hez itt megnézheted; *de a frissítéshez a Drive API-n (Sheets API) megy*. A két forrás ütközhet (rclone sync 3:00-kor, az API frissítés azonnal) — ha kéred a friss állapotot, az API-elérés (file_id-vel) a forrás.
- **Backup-strategy**: a `vac_gorgey32_koltsegvetes_backup_*` fájlok automatikus history-pontok. Soha ne overwriteld őket, és új backup nincs ezen az ütemterv-fájlon (Tomi explicit kérésre csinálhatunk timestamp-suffixos copy-t a Drive-on).
- **Konkurrens-edit védelem**: ha az xlsx-et Tomi vagy más éppen szerkeszti, a Sheets API write-okat conflict-on `revisionId` mismatch-szel utasítja. Ha ez jön, STOP, várj 30s, próbáld újra. NE pusholj fel rá overwrite-ot ha a revisionId nem stimmel.
