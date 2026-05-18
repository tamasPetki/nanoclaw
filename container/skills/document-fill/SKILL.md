---
name: document-fill
description: >
  Word/OpenDocument űrlap-kitöltés .doc / .docx / .odt fájlokon LAYOUT-MEGŐRZÉSSEL.
  Trigger: "töltsd ki ezt a dokumentumot", "töltsd ki a nyilatkozatot" (ha .doc/.docx),
  "töltsd ki az űrlapot", "fill out the form", "nyilatkozat kitöltése",
  "szerződés-kitöltés", "űrlap kitöltése Word-ben", "Word-dokumentum kitöltése",
  "domain-nyilatkozat", "cégadatos nyomtatvány", "form fill .doc/.docx".
  PDF-űrlaphoz NE ezt — használd a `pdf-filler` skillt. Szkennelt PDF-hez `ocr-and-documents`.
version: 1.0.0 (NanoClaw — 14:15-incident-megelőző)
author: NanoClaw (saját tapasztalat 2026-05-18)
license: MIT
allowed-tools: Bash, Read
---

# Document fill — `.doc` / `.docx` / `.odt` űrlap-kitöltés

## TL;DR az agentnek

Ez a skill arról szól, hogy a felhasználó küld egy **kitöltendő űrlapot Word-formátumban** (nem PDF — arra van a `pdf-filler`), és te visszaküldöd **ugyanazt a layoutot, csak a mezők kitöltve**.

A leggyakoribb hiba: **a forrás-dokumentum megnyitása helyett új Document-et generálsz python-docx-szel, és új layoutot építesz fel**. Ez **átírja a teljes nyomtatványt** → a felhasználó dühös. Soha. Ne. Csináld. Ezt.

## VAS-SZABÁLY (NE szegd meg)

1. **NYISD MEG A FORRÁS-FÁJLT.** `Document(input_path)` — nem `Document()` no-arg.
2. **CSAK A PLACEHOLDER-CELLÁKAT/SOROKAT MÓDOSÍTSD.** Az eredeti paragraphok, táblák, képek, header/footer érintetlen marad.
3. **MENTSD ÚJ NÉVVEL.** `doc.save(output_path)` — ahol `output_path != input_path`.
4. Ha nem .docx a forrás: **soffice-szal konvertáld előbb .docx-re**, utána python-docx. Az eredeti .doc/.odt-t soha ne nyúld közvetlenül python-docx-szel.
5. **Soha ne generálj új Document-et "kitöltött verzió"-ként.** `docx.Document()` no-arg = TILOS.

A 2026-05-18 PietScarlet incident pont ez volt: az agent a 14:15-ös .docx-et új Document-ként generálta, így "teljesen átírta a nyomtatványt".

## Workflow

### Step 1: Detect input formátum

```bash
file "$INPUT_FILE"
# Composite Document File V2  → .doc (Word97 OLE binary)
# Microsoft Word 2007+        → .docx (XML zip)
# OpenDocument Text           → .odt
```

### Step 2: Konvertálj .docx-re ha kell

`.docx` → kihagy. `.doc` vagy `.odt` → konvertálj:

```bash
soffice --headless --convert-to docx "$INPUT_FILE" --outdir /tmp/
# várj 5-10s, az output: /tmp/<basename>.docx
INPUT_DOCX="/tmp/$(basename "${INPUT_FILE%.*}").docx"
```

### Step 3: Nézd meg mi van benne (DO NOT SKIP)

```python
from docx import Document
doc = Document(INPUT_DOCX)

# Paragraphok listája — keresd a placeholder-mezőket
for i, para in enumerate(doc.paragraphs):
    if para.text.strip():
        print(f"P{i}: {para.text!r}")

# Táblák cellái — gyakran itt vannak a kitöltendő mezők
for ti, table in enumerate(doc.tables):
    for ri, row in enumerate(table.rows):
        for ci, cell in enumerate(row.cells):
            if cell.text.strip():
                print(f"T{ti}.R{ri}.C{ci}: {cell.text!r}")
```

**Keresendő minták** (placeholder-jelölések):
- Üres cellák egy táblában (`""` vagy csak whitespace) — sokszor itt kell a kitöltendő érték
- `"Név:"`, `"Cím:"`, `"Cégjegyzékszám:"`, `"Dátum:"` — utánuk üres rész vagy aláhúzás
- `"....................."`, `"_______"` — vizuális kitöltő-vonalak
- `"[Név]"`, `"<<NAME>>"`, `"{{name}}"` — explicit placeholder

### Step 4: Mező-csere SZIGORÚAN

```python
from docx import Document
doc = Document(INPUT_DOCX)

# Példa: táblázat-cellában a placeholder-vonal cseréje
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            if cell.text.strip() == "":
                # Ha a kontextus alapján tudod hogy ide a cégnév kell:
                # (használj label-mező-párosítást, ne találgass!)
                pass
            if "Cégnév:" in cell.text:
                # A "Cégnév:" cella után jön a place
                pass

# Példa: paragraph cseréje (ha pl. "[Aláírás dátuma]" szöveg van)
for para in doc.paragraphs:
    if "[Aláírás dátuma]" in para.text:
        # Run-szintű csere fontos, hogy a format megmaradjon:
        for run in para.runs:
            if "[Aláírás dátuma]" in run.text:
                run.text = run.text.replace("[Aláírás dátuma]", "2026-05-18")

# Mentés ÚJ névvel
output_path = INPUT_DOCX.replace(".docx", "_kitöltve.docx")
doc.save(output_path)
```

**Run-szintű cserénél óvatosan**: ha egy placeholder több run-on át nyúlik (Word-féle formázás-átmenetek), előbb merge-elni kell. Egyszerű megoldás: `para.text = új_szöveg` — DE ez minden run-formázást elveszít. Csak ha tudod hogy a paragraph homogén formátumú.

### Step 5: Verifikálj (gyorsan)

```python
# Nyisd meg újra az outputot, és nézd meg hogy az eredeti struktúra megvan-e:
doc2 = Document(output_path)
assert len(doc2.tables) == len(doc.tables), "Tábla-szám változott — az layout sérült!"
assert len(doc2.paragraphs) == len(doc.paragraphs), "Paragraph-szám változott!"
```

Ha bármelyik assert pukkad: **NE KÜLDD EL** Tominak. Indulj újra a Step 3-tól.

### Step 6: Küldd vissza Tominak

```
<message to="user">
Kitöltve — ellenőrizd. Forrás-layout megőrizve, csak a mezőket írtam.
<attachment>/path/to/output.docx</attachment>
</message>
```

EGY rövid üzenet, a melléklettel. Ne magyarázz, Tomi azonnal a fájlt akarja látni.

## Anti-patternek (ne csináld)

❌ `Document()` no-arg konstruktor — új üres Document-et generál
❌ Az eredeti paragraphok újraírása `doc.add_paragraph(...)` ciklusban
❌ `python-docx` direkt egy `.doc`-on (Word97 binary) — csak `.docx`-re működik
❌ `pip install python-docx` mid-task — már fent van; a OneCLI MITM proxy úgyis fail-elne
❌ "Részleges" kitöltés és visszaküldés ("a többi mezőt majd te töltöd ki") — vagy mindent vagy ask_question card a hiányzó mezőkre

## Hiányzó mezők kezelése

Ha kell valami amit a felhasználó nem adott meg (pl. telefonszám, dátum, aláírás), **NE TALÁLJ KI ÉRTÉKET**. Küldj `ask_question` cardot:

```
mcp__nanoclaw__ask_user_question({
  title: "📱 Telefonszám a nyilatkozathoz",
  question: "Mi legyen a faktoros telefonszám a formban?",
  options: [...]   // ha vannak nyilvánvaló jelöltek (pl. memóriában elraktározott szám)
  ...
})
```

A megadott értéket utána mentsd a `/workspace/agent/sources/<projekt>/state.md`-be, hogy legközelebb ne kelljen újra kérdezni.

## Notes

- A skill **csak Word/ODF** űrlapokra való. PDF-re a `pdf-filler` skill (visual-verify loop).
- Layout-megőrzés a sarokpont. Forrás-megnyitás. Mező-csere. Új név. Ennyi.
- Ha a forrás-fájl egy bonyolult formázású (header/footer logókkal, page-break-ekkel), pandoc round-trip (`docx → md → docx`) **NEM** jó út — formázás veszik. Maradj python-docx-nél.
- A pdf-be-konvertálás (pdf-filler "save as PDF") nem ide tartozik — ez Word-output. Ha Tomi PDF-et kér, a kitöltött docx-et utána `soffice --convert-to pdf` egy lépésben.
