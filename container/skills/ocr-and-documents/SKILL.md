---
name: ocr-and-documents
description: >
  Komplex PDF / szkennelt dokumentum feldolgozás — OCR szkennelt számlákhoz / képekhez,
  táblázat-kinyerés, batch-konvertálás. Trigger: "szkennelt PDF", "kép-PDF", "OCR",
  "rosszul olvas a PDF", "üres output a PDF-ből", "képből szöveg", "számla-szkenn audit",
  "fotózott számla", "iPhone-fotó", ".heic", "scan". Akkor használd, ha a `pdf-reader`
  skill üres output-ot vagy hibás szöveget ad — ez azt jelenti hogy a PDF kép-alapú és
  OCR kell.
version: 3.0.0 (NanoClaw — tesseract-first)
author: Hermes Agent → NanoClaw (átszabva: tesseract-first 2026-05-18)
license: MIT
---

# OCR & komplex dokumentum-feldolgozás

A `pdf-reader` skill (CLI wrapper) text-alapú PDF-ekre **gyors és elég**. Ez a skill akkor jön elő, amikor az **nem elég**:

- Szkennelt PDF (csak kép-rétege van) → `pdf-reader` üres outputot ad
- Fotózott számla / lefotózott dokumentum / képernyőfotó
- Magyar + angol vegyes szöveg OCR-rel
- Táblázat-kinyerés magas pontossággal
- Batch-feldolgozás (10+ dokumentum)

## Döntésfa

```
Szöveges, jól kinyerhető PDF? ─→ /pdf-reader (gyors, kis footprint)
Szkennelt / kép-alapú PDF? ───→ tesseract pipeline (lent)
Egy kép (PNG/JPG/HEIC)? ──────→ tesseract direkt
DOCX struktúra-kinyerés? ─────→ python-docx vagy mammoth
DOCX→Markdown a wikibe? ──────→ pandoc vagy mammoth
PDF táblázatok? ──────────────→ pdfplumber vagy tabula-py
URL-en elérhető PDF? ─────────→ próbáld előbb WebFetch
Tényleg komplex layout (OCR
+ tábla + ábra egyben)? ──────→ marker-pdf (3-5GB, csak ha tesseract gyenge)
```

## Tesseract pipeline (FIRST CHOICE)

**Preinstalled** a containerben: `tesseract-ocr` + `tesseract-ocr-hun` + `tesseract-ocr-eng` + `pytesseract` + `opencv-python` + `Pillow` + `pillow-heif`. **Ne `pip install`-elj semmit** — a OneCLI MITM-proxy gond, és úgyis fent van.

### Kép → szöveg (PNG/JPG/HEIC)

```bash
# Egyszerű (HU+EN):
tesseract -l hun+eng input.png stdout

# HEIC iPhone-fotó esetén előbb konvertálj:
python3 -c "from PIL import Image; import pillow_heif; pillow_heif.register_heif_opener(); Image.open('photo.heic').save('photo.png')"
tesseract -l hun+eng photo.png stdout
```

### Szkennelt PDF → szöveg (oldalankénti OCR)

```python
import fitz  # pymupdf
import pytesseract
from PIL import Image
import io

doc = fitz.open("szken-szamla.pdf")
all_text = []
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=300)              # 300 dpi optimum OCR-re
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    text = pytesseract.image_to_string(img, lang='hun+eng')
    all_text.append(f"--- Oldal {i+1} ---\n{text}")
print("\n".join(all_text))
```

### Preprocess opencv-szel (ha az OCR gyenge)

Ha a tesseract output zajos / kihagyott betűk: deskew + threshold a kép-bemenetre.

```python
import cv2
import numpy as np

img = cv2.imread("scan.png", cv2.IMREAD_GRAYSCALE)
# Adaptive threshold (világosság-invariáns):
img = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 11)
# Deskew (ha ferdén szkennelt):
coords = np.column_stack(np.where(img < 255))
angle = cv2.minAreaRect(coords)[-1]
if angle < -45: angle = -(90 + angle)
else: angle = -angle
(h, w) = img.shape[:2]
M = cv2.getRotationMatrix2D((w//2, h//2), angle, 1.0)
img = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
cv2.imwrite("scan-clean.png", img)
```

Aztán tesseract-szel ugyanúgy.

### pymupdf4llm (markdown convert PDF-ből)

Ha a PDF szöveges (NEM szken), de tabla-rich és tisztább MD kell:

```python
import pymupdf4llm
md_text = pymupdf4llm.to_markdown("riport.pdf")
```

## PDF táblázat-kinyerés

Két út: `pdfplumber` (Python-native, preinstalled), `tabula-py` (Java-based, preinstalled).

```python
# pdfplumber — egyszerűbb, gyorsabb
import pdfplumber
with pdfplumber.open("szamla.pdf") as pdf:
    for page in pdf.pages:
        for table in page.extract_tables():
            for row in table:
                print(row)

# tabula-py — komplex layout, lattice / stream modeshipping
from tabula import read_pdf
dfs = read_pdf("riport.pdf", pages="all", lattice=True)
for df in dfs:
    print(df)
```

## DOCX olvasás (NEM OCR)

Két alternatíva attól függően mit szeretnél:

```python
# Struktúra-preserving (paragraphs, tables, formátum):
from docx import Document
doc = Document("szerzodes.docx")
for para in doc.paragraphs: print(para.text)
for table in doc.tables:
    for row in table.rows:
        print([cell.text for cell in row.cells])

# DOCX → tisztított Markdown (a wikibe ingest-re ideális):
import mammoth
with open("szerzodes.docx", "rb") as f:
    result = mammoth.convert_to_markdown(f)
print(result.value)
```

## PDF split/merge/search (pymupdf-vel)

```python
import fitz  # pymupdf

# Split: oldalak 1-5 új PDF-be
doc = fitz.open("riport.pdf")
new = fitz.open()
new.insert_pdf(doc, from_page=0, to_page=4)
new.save("oldalak_1-5.pdf")

# Merge
result = fitz.open()
for path in ["a.pdf", "b.pdf", "c.pdf"]:
    result.insert_pdf(fitz.open(path))
result.save("merged.pdf")

# Search
doc = fitz.open("riport.pdf")
for i, page in enumerate(doc):
    if page.search_for("kőzetgyapot"):
        print(f"Oldal {i+1}: találat")
```

## Univerzális konverzió pandoc-kal

`pandoc` mindenirányú konverziót tud: md ↔ docx ↔ pdf ↔ html ↔ epub ↔ latex. Tipikus eset a hubban:

```bash
# DOCX → Markdown (wikibe ingest):
pandoc -f docx -t markdown szerzodes.docx -o szerzodes.md

# Markdown → szép PDF (jelentésekhez):
pandoc riport.md -o riport.pdf --pdf-engine=xelatex     # ha LaTeX kell
pandoc riport.md -o riport.pdf                          # default html→pdf

# HTML email → Markdown:
pandoc -f html -t markdown email.html -o email.md
```

A pandoc gyors, low-overhead, és sokszor jobb mint a python-docx + manuális merge.

## marker-pdf (csak fallback, 3-5GB)

A tesseract pipeline a legtöbb hub-task-hoz elég. **Csak akkor** váltsd marker-pdf-re ha:
- A tesseract zajos / gyenge eredményt ad nagyon komplex layouton (3-oszlopos újság, képletekkel teli papír)
- LLM-segítségű OCR-boost kell (`--use_llm`)

```ts
mcp__nanoclaw__install_packages({
  pip: ["marker-pdf"],
  reason: "Tesseract gyenge eredmény ezen a komplex layouton — szükség van marker-pdf LLM-boostos OCR-re"
})
```

Tomi-approval után rebuild + restart automatikus. Első használat ~2.5GB modelleket tölt `~/.cache/huggingface/`-ba.

## Notes

- `tesseract -l hun+eng` — magyar+angol vegyes szövegre kötelező nyelv-flag
- 300 dpi a pymupdf `get_pixmap` optimuma OCR-re (200 alá zajos lesz, 600 fölé lassú+nem-jobb)
- HEIC iPhone-fotó: pillow-heif konvertál → PNG, utána tesseract
- pdfplumber gyorsabb tabula-py-nál, de tabula jobb komplex (multi-page table) layouton
- `pdf-reader` (NanoClaw CLI) az alapértelmezett szöveges PDF-re — kis footprint
- DOCX-hez python-docx (struktúra-preserve) VAGY mammoth (md-convert), NE OCR-rel
- A document **kitöltéséhez** lásd a `document-fill` skillt — más szabályrendszer
