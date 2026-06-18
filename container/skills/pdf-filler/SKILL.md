---
name: pdf-filler
description: >
  Fill out PDF forms, add text overlays to PDFs, inspect form fields, and produce
  visually-verified filled PDF outputs. Use when the user sends a PDF to fill,
  asks to complete a form, attaches a "nyilatkozat" or "űrlap" to fill, or
  needs text placed on a PDF document. Works with interactive AcroForm PDFs
  (text fields, checkboxes, dropdowns) AND non-interactive PDFs (coordinate-based
  text overlay with VISUAL VERIFICATION loop).
  Magyarul: űrlap kitöltése, nyilatkozat kitöltése, PDF kitöltése, dokumentum
  kitöltése, formanyomtatvány kitöltése, "töltsd ki a nyilatkozatot",
  "töltsd ki ezt a PDF-et", "csináld meg az űrlapot", "olvasd át a doksikat
  és töltsd ki", "töltsd ki és küldd vissza".
allowed-tools: Bash, Read
---

# PDF Form Filler — Claude Desktop-grade workflow

## TL;DR for the agent

PDF-fill is a **multi-step visual loop**, NOT a one-shot operation. Skipping the visual-verify step produces wrong-coordinate placements (data lands in the wrong cells). The right workflow:

1. **Detect** — AcroForm fields? (cheap, one bash call)
2. **If AcroForm** → use `pdf-filler fill` with `--data` JSON, done.
3. **If non-AcroForm** → **extract label coordinates from the PDF** (DO NOT guess), **render pages as images**, **inspect images with Read tool**, build a `fields.json` with positions, fill with PyMuPDF using a Unicode-capable font (DejaVu Sans), **render the FILLED PDF as images**, **inspect again with Read tool**, iterate until correct.

The most common failure mode: the agent guesses coordinates from "typical form layouts" and skips visual verification. **DO NOT DO THIS.** The labels live at known positions in the PDF — extract them. Then visually verify both before and after fill.

## Decision tree

```
User sends PDF + "fill it out"
        ↓
[Step 1] pdf-filler fields form.pdf
        ↓
   has fields? ─── YES ──→ pdf-filler fill ... --data {...} ──→ done
        │
        NO (non-interactive PDF — most government / school forms)
        ↓
[Step 2] Render pages as images (PyMuPDF, preinstalled)
        ↓
[Step 3] Read tool on each page_<N>.png — VISUALLY inspect layout
        ↓
[Step 4] Extract label coordinates (PyMuPDF dict-mode text extract)
        ↓
[Step 5] Build fields.json — entry per cell
        ↓
[Step 6] Fill with PyMuPDF + DejaVu Sans (Unicode/Hungarian-safe)
        ↓
[Step 7] Render FILLED PDF as images
        ↓
[Step 8] Read tool on filled_page_<N>.png — verify positions, encoding
        ↓
   correct? ─── NO ──→ adjust fields.json, GOTO 6
        ↓
   YES → save to /workspace/agent/ + <attachment> in response
```

## Workflow A: Interactive AcroForm PDF

```bash
pdf-filler fields form.pdf              # List fillable fields
pdf-filler info form.pdf                # Show page dimensions
pdf-filler fill form.pdf out.pdf --data '{"Name":"John","Date":"2025-01-01"}' --flatten
```

Field value formats:
- Text: `"fieldName": "text value"`
- Checkbox: `"fieldName": true` or `false`
- Radio: `"fieldName": "optionValue"`
- Dropdown: `"fieldName": "selectedOption"`

Use `--data-file data.json` for many fields. `--flatten` makes them non-editable.

## Workflow B: Non-AcroForm PDF (image-based / scanned forms) — DETAILED

This is the path that **MOST commonly goes wrong**. Hungarian/EU government and school forms typically lack AcroForm fields. Follow these steps **literally** — visual verification is non-negotiable.

PyMuPDF (`fitz`), pdfplumber, and Pillow are **preinstalled** in `/opt/pyenv` — accessible as plain `python3`. DejaVu Sans font is at `/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`. **DO NOT `pip install` anything** — wasted time + fails on next turn.

### Step A: Render pages as images

```bash
python3 - <<'PY'
import fitz
doc = fitz.open("/workspace/agent/form.pdf")
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    pix.save(f"/workspace/agent/page_{i+1}.png")
print(f"Rendered {len(doc)} pages")
PY
```

Then use **Read tool** on each `page_<N>.png` to visually inspect the form layout. You MUST see the form before placing any text.

### Step B: Extract label coordinates

```bash
python3 - <<'PY'
import fitz
doc = fitz.open("/workspace/agent/form.pdf")
for page_num, page in enumerate(doc, 1):
    td = page.get_text("dict")
    for block in td.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                x0, y0, x1, y1 = span["bbox"]
                txt = span["text"].strip()
                if txt:
                    print(f"page={page_num} top={y0:.1f} x0={x0:.1f} x1={x1:.1f} bottom={y1:.1f} text={txt!r}")
PY
```

You now have every label's coordinates. **DO NOT GUESS** positions — find each label you need (e.g. "Név:", "Lakcím:", "Dátum:") and pick coordinates **next to it** (typically `x0 = label_x1 + 5..15`, `y0 = label_y0`).

### Step C: Identify checkbox / radio positions

Checkboxes often render as a special font glyph (e.g. `` from a Wingdings-like icon font). Find them by listing every glyph near "igen / nem / yes / no" labels:

```bash
python3 - <<'PY'
import fitz, re
doc = fitz.open("/workspace/agent/form.pdf")
for page_num, page in enumerate(doc, 1):
    td = page.get_text("dict")
    for block in td.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                t = span["text"]
                # Non-Latin glyphs or yes/no labels
                if re.search(r"[-]", t) or t.strip().lower() in {"igen", "nem", "yes", "no"}:
                    x0, y0, x1, y1 = span["bbox"]
                    print(f"page={page_num} top={y0:.1f} x0={x0:.1f} text={t!r}")
PY
```

The checkbox marker positions are where you'll place an "X" (or U+2713 ✓).

### Step D: Build fields.json

Create `/workspace/agent/fields.json` listing every entry to write:

```json
[
  {"page": 1, "x": 150, "y": 175, "text": "Petki Tamás", "size": 10},
  {"page": 1, "x": 150, "y": 200, "text": "2120 Dunakeszi, Rozmaring u. 16.", "size": 10},
  {"page": 1, "x": 478.7, "y": 467, "text": "X", "size": 12}
]
```

Coordinates are PDF points (1 pt ≈ 0.353 mm). For **PyMuPDF `insert_text`** the y-coordinate matches what you extracted in Step B (top-left origin convention — the same numbers you see in `bbox`).

### Step E: Fill with PyMuPDF + DejaVu Sans (Unicode-safe)

```bash
python3 - <<'PY'
import fitz, json
doc = fitz.open("/workspace/agent/form.pdf")
fields = json.load(open("/workspace/agent/fields.json"))
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
for f in fields:
    page = doc[f["page"] - 1]
    page.insert_text(
        (f["x"], f["y"]),
        f["text"],
        fontname="dejavu",
        fontfile=FONT,
        fontsize=f.get("size", 10),
        color=(0, 0, 0),
    )
doc.save("/workspace/agent/form_filled.pdf")
print("saved /workspace/agent/form_filled.pdf")
PY
```

**Why DejaVu Sans?** Default PDF fonts (Helvetica, Times) only support Latin-1. Hungarian "ő" (U+0151) and "ű" (U+0171) live in Latin Extended-A and **silently drop or mangle** with the default font (you get "belőle" → "belle"). DejaVu Sans covers full Unicode. The font file is preinstalled.

### Step F: Render filled PDF as images

```bash
python3 - <<'PY'
import fitz
doc = fitz.open("/workspace/agent/form_filled.pdf")
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    pix.save(f"/workspace/agent/filled_page_{i+1}.png")
print(f"Rendered {len(doc)} filled pages")
PY
```

### Step G: VISUAL VERIFY — Read tool on each filled_page_<N>.png

**MANDATORY.** Read every filled page image. Check:
- Each value is in the correct cell (NOT spilling left/right/above/below)
- Hungarian characters render correctly (ő, ű, í, á, é, ó, ö, ü)
- Checkboxes are next to the right "igen/nem" label, not the wrong row
- Font size is readable (not too small, not overflowing)

If anything is wrong: **adjust fields.json coordinates**, GOTO Step E. Don't ship a wrong-position PDF.

### Step H: Send back to user

Save the final PDF to `/workspace/agent/` (already done in Step E). Attach in the response:

```
A kitöltött nyilatkozat:
<attachment>/workspace/agent/form_filled.pdf</attachment>
```

## Estimating coordinates when extraction is impossible

If the form is a raw scanned image (true image PDF, no embedded text layer), you must:

1. Render at high DPI (300+): `pix = page.get_pixmap(dpi=300)`
2. Read tool on the image
3. Estimate coordinates visually (top: y≈800, middle: y≈420, bottom: y≈50 for A4)
4. **Test with a single value first** — fill one field, re-render, verify, then proceed

For OCR fallback: `pdftotext -layout form.pdf -` (poppler-utils preinstalled) or the `ocr-and-documents` skill.

## What NOT to do

❌ Guess coordinates from "typical form layout" without extracting label positions.
❌ Skip the image-verify step and ship a "should be correct" PDF.
❌ Use default Helvetica font for Hungarian text — `ő` and `ű` will mangle silently.
❌ `pip install pymupdf` mid-task — it's preinstalled.
❌ Use `pdf-filler overlay` with vague coordinates as a one-shot — same wrong-cell problem.

## Quick reference

```bash
# Inspect
pdf-filler fields form.pdf                # AcroForm fields
pdf-filler info form.pdf                  # Page dimensions

# Simple AcroForm fill
pdf-filler fill form.pdf out.pdf --data '{...}' --flatten

# Image render (visual verify) — one-liner
python3 -c "import fitz; [p.get_pixmap(dpi=150).save(f'/workspace/agent/p{i+1}.png') for i,p in enumerate(fitz.open('/workspace/agent/form.pdf'))]"

# Multi-field overlay with DejaVu Sans (Unicode/HU safe)
# See Step E template above.
```

**Save outputs to `/workspace/agent/`** — files outside there don't reach the user as attachments.
