---
name: pdf-filler
description: >
  Fill out PDF forms, add text overlays to PDFs, and inspect PDF form fields.
  Use when the user sends a PDF to fill, asks to complete a form, or needs text placed on a PDF document.
  Works with interactive AcroForm PDFs (text fields, checkboxes, dropdowns) and non-interactive PDFs (coordinate-based text overlay).
allowed-tools: Bash(pdf-filler:*), Bash(node:*)
---

# PDF Form Filler

## Quick start

```bash
pdf-filler fields form.pdf              # List fillable fields
pdf-filler info form.pdf                # Show page dimensions
pdf-filler fill form.pdf out.pdf --data '{"Name":"John","Date":"2025-01-01"}' --flatten
pdf-filler overlay doc.pdf out.pdf --text "Approved" --page 1 --x 400 --y 750 --size 16
```

## Workflow: Interactive PDF (has form fields)

1. **Inspect fields**: `pdf-filler fields <file.pdf>` — lists every field name, type, and current value
2. **Fill fields**: `pdf-filler fill <file.pdf> <output.pdf> --data '{"fieldName":"value"}'`
3. **Flatten** (optional): add `--flatten` to make fields non-editable

Field value formats in JSON:
- Text fields: `"fieldName": "text value"`
- Checkboxes: `"fieldName": true` or `"fieldName": false`
- Radio buttons: `"fieldName": "optionValue"`
- Dropdowns: `"fieldName": "selectedOption"`

For many fields, use `--data-file data.json` instead of inline `--data`.

## Workflow: Non-interactive PDF (no form fields)

When `pdf-filler fields` reports no fields, use overlay mode:

1. **Get page dimensions**: `pdf-filler info <file.pdf>`
2. **Determine coordinates**: The coordinate origin (0,0) is at the **bottom-left** corner. Y increases upward. Units are PDF points (1 pt = 0.353 mm). Common page sizes:
   - A4: 595 x 842 pt
   - Letter: 612 x 792 pt
3. **Place text**: `pdf-filler overlay <file.pdf> <output.pdf> --text "value" --page 1 --x 150 --y 700 --size 12`

For multiple text items, create a JSON file and use `--items-file`:

```json
[
  {"text": "John Smith", "page": 1, "x": 150, "y": 700, "size": 12},
  {"text": "2025-03-15", "page": 1, "x": 400, "y": 700, "size": 12},
  {"text": "Budapest", "page": 1, "x": 150, "y": 650, "size": 12}
]
```

```bash
pdf-filler overlay form.pdf filled.pdf --items-file items.json
```

### Estimating coordinates

If you're unsure where to place text, use the PDF page dimensions and logical reasoning:
- Top of an A4 page: y ≈ 800
- Middle: y ≈ 420
- Bottom: y ≈ 50
- Left margin: x ≈ 50-70
- Center: x ≈ 297 (A4)

For precise placement on complex forms, convert the PDF to an image to visually inspect layout:
```bash
agent-browser open file:///path/to/form.pdf
agent-browser screenshot form-page.png --full
```
Then use the screenshot to estimate coordinates relative to page dimensions.

## Sending the filled PDF back

**IMPORTANT**: Always save output files to `/workspace/agent/` so they can be sent as attachments.

After filling, include an `<attachment>` tag in your response to send the file back to the user:

```
Here is the filled form:
<attachment>/workspace/agent/filled-form.pdf</attachment>
```

The `<attachment>` tag is stripped from the visible message and the file is sent as a downloadable attachment in the chat (Discord, WhatsApp, Telegram, etc.).

You can include multiple attachment tags and mix them with text. Never use `/tmp/` for output files — only `/workspace/agent/` paths work as attachments.

## Commands reference

| Command | Description |
|---------|-------------|
| `pdf-filler fields <in.pdf>` | List all form fields with types and values |
| `pdf-filler info <in.pdf>` | Show page count and dimensions |
| `pdf-filler fill <in> <out> --data '{...}'` | Fill form fields from inline JSON |
| `pdf-filler fill <in> <out> --data-file f.json` | Fill form fields from JSON file |
| `pdf-filler fill ... --flatten` | Fill and flatten (make non-editable) |
| `pdf-filler overlay <in> <out> --text "..." --page N --x X --y Y` | Place text at coordinates |
| `pdf-filler overlay <in> <out> --items-file items.json` | Batch place multiple texts |
| `pdf-filler flatten <in> [out]` | Flatten existing form fields |
