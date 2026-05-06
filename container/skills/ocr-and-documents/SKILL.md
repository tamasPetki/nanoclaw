---
name: ocr-and-documents
description: >
  Komplex PDF / szkennelt dokumentum feldolgozás — OCR szkennelt számlákhoz / képekhez,
  táblázat-kinyerés, egyenlet-felismerés, batch-konvertálás. Trigger: "szkennelt PDF",
  "kép-PDF", "OCR", "rosszul olvas a PDF", "üres output a PDF-ből", "képből szöveg",
  "számla-szkenn audit". Akkor használd, ha a meglévő `pdf-reader` skill üres output-ot
  vagy hibás szöveget ad — ez azt jelenti hogy a PDF kép-alapú és OCR kell.
version: 2.3.0 (NanoClaw port)
author: Hermes Agent → NanoClaw
license: MIT
---

# OCR & komplex dokumentum-feldolgozás

A `pdf-reader` skill (CLI wrapper) text-alapú PDF-ekre **gyors és elég**. Ez a skill arra való, amikor az **nem elég**:

- Szkennelt PDF (csak kép-rétege van) → `pdf-reader` üres outputot ad
- Táblázat-kinyerés magas pontossággal
- Egyenlet / képlet felismerés
- Batch-feldolgozás (10+ dokumentum)
- Word DOCX, PowerPoint PPTX

## Döntésfa

```
Szöveges, jól kinyerhető PDF? → /pdf-reader (gyors, kis footprint)
Szkennelt / kép-alapú? → marker-pdf (OCR)
DOCX? → python-docx (struktúra-alapú)
URL-en elérhető PDF? → próbáld előbb WebFetch
```

## marker-pdf telepítés (~3-5GB PyTorch + modellek)

A NanoClaw container default-ban NEM tartalmazza marker-pdf-et (~3-5GB). Ha tényleg kell:

```ts
mcp__nanoclaw__install_packages({
  npm: [],
  apt: [],
  pip: ["marker-pdf"],
  reason: "OCR szkennelt számlák feldolgozásához (Pintér Tüzép, Pinger stb.)"
})
```

Tomi approval után rebuild + restart automatikus. Az első használat ~2.5GB modelleket tölt le `~/.cache/huggingface/`-ba.

## marker-pdf használat

```bash
# Egy fájl → markdown (alapértelmezett, jó számláknak)
marker_single dokumentum.pdf --output_dir ./out

# Batch
marker /path/to/szamlak/ --workers 4 --output_dir ./out
```

LLM-boost (még jobb pontosság, de lassabb):

```bash
marker_single nehez-szkenn.pdf --output_dir ./out --use_llm
```

Az output `out/dokumentum/dokumentum.md` — markdown, képek külön mentve `out/dokumentum/images/`-be.

## pymupdf (lightweight alternatíva)

Ha NINCS OCR-szükség, csak a `pdf-reader` CLI-nek nem elég pontos a táblázat-kinyerés:

```bash
pip install pymupdf pymupdf4llm  # ~25MB, gyors
```

```python
import pymupdf
doc = pymupdf.open("szamla.pdf")
for page in doc:
    print(page.get_text())             # plain text
    # vagy
    print(page.get_text("dict"))       # struktúra (bbox, font, size)
```

**Markdown convert** táblákkal:

```python
import pymupdf4llm
md_text = pymupdf4llm.to_markdown("szamla.pdf")
```

## Arkivált számla-feldolgozás (Tomi-konkrét)

A `groups/asszisztens/attachments/pietscarlet_*` és `groups/hub/sources/...` alatti PDF-ek
zöme **számla**. Tipikus sorrend:

1. `pdf-reader extract` próba → ha üres / fragmentált, **szkennelt**.
2. `marker-pdf` (ha telepítve) — markdown output, könnyebb a struktúrált adatok kiolvasása.
3. Tételsorok kinyerése (regex) → összeg + dátum + szállító azonosítás → match QuiCK-számlákkal (lásd `quick-integration` skill).

## Word DOCX (NEM PDF, NEM OCR)

```bash
pip install python-docx
```

```python
from docx import Document
doc = Document("szerzodes.docx")
for para in doc.paragraphs:
    print(para.text)
for table in doc.tables:
    for row in table.rows:
        print([cell.text for cell in row.cells])
```

A `python-docx` az actual document-struktúrát parse-olja, NEM OCR-rel — sokkal pontosabb.

## PDF split/merge/search (pymupdf-vel)

```python
# Split: oldalak 1-5 új PDF-be
import pymupdf
doc = pymupdf.open("riport.pdf")
new = pymupdf.open()
for i in range(5):
    new.insert_pdf(doc, from_page=i, to_page=i)
new.save("oldalak_1-5.pdf")

# Merge
result = pymupdf.open()
for path in ["a.pdf", "b.pdf", "c.pdf"]:
    result.insert_pdf(pymupdf.open(path))
result.save("merged.pdf")

# Search
doc = pymupdf.open("riport.pdf")
for i, page in enumerate(doc):
    if page.search_for("kőzetgyapot"):
        print(f"Oldal {i+1}: találat")
```

## Notes

- `pdf-reader` (NanoClaw CLI) az alapértelmezett — gyors, kis footprint
- `pymupdf` finomabb kontrollra (struktúra, táblázat, képkinyerés)
- `marker-pdf` csak ha tényleg OCR vagy komplex layout kell — drága (3-5GB)
- DOCX-hez `python-docx`, NE OCR-rel
- URL-en elérhető PDF-hez WebFetch / `bash curl -O` előbb, csak utána feldolgozás
