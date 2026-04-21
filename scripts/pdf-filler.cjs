#!/usr/bin/env node
// PDF form filler CLI tool using pdf-lib
// Usage: pdf-filler <command> [options]

const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const [,, command, ...args] = process.argv;

// Parse --key value flags from args
function parseFlags(args) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true';
      flags[key] = val;
    } else {
      positional.push(args[i]);
    }
  }
  return { flags, positional };
}

// Try to embed a system font for full Unicode support
async function embedFont(pdfDoc) {
  const fontPaths = [
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
  ];
  for (const fp of fontPaths) {
    try {
      const fontBytes = fs.readFileSync(fp);
      return await pdfDoc.embedFont(fontBytes);
    } catch {}
  }
  // Fallback to standard font (limited charset)
  return await pdfDoc.embedFont(StandardFonts.Helvetica);
}

// ── fields: list all form fields ──
async function listFields() {
  const { positional } = parseFlags(args);
  const inputPath = positional[0];
  if (!inputPath) {
    console.error('Usage: pdf-filler fields <input.pdf>');
    process.exit(1);
  }

  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  if (fields.length === 0) {
    console.log('No form fields found in this PDF.');
    console.log('Use "pdf-filler overlay" to add text at specific coordinates.');
    return;
  }

  console.log(`Found ${fields.length} form field(s):\n`);
  for (const field of fields) {
    const type = field.constructor.name.replace('PDF', '');
    const name = field.getName();
    let value = '';
    let options = '';

    try {
      if (typeof field.getText === 'function') {
        value = field.getText() || '';
      } else if (typeof field.isChecked === 'function') {
        value = field.isChecked() ? 'checked' : 'unchecked';
      } else if (typeof field.getSelected === 'function') {
        const sel = field.getSelected();
        value = Array.isArray(sel) ? sel.join(', ') : (sel || '');
        if (typeof field.getOptions === 'function') {
          options = ` [options: ${field.getOptions().join(', ')}]`;
        }
      }
    } catch {}

    console.log(`  ${name}`);
    console.log(`    type: ${type}`);
    if (value) console.log(`    current value: ${value}`);
    if (options) console.log(`    ${options}`);
    console.log();
  }
}

// ── fill: fill form fields from JSON ──
async function fillForm() {
  const { flags, positional } = parseFlags(args);
  const inputPath = positional[0];
  const outputPath = positional[1];

  if (!inputPath || !outputPath) {
    console.error('Usage: pdf-filler fill <input.pdf> <output.pdf> --data \'{"field":"value"}\' [--flatten]');
    console.error('       pdf-filler fill <input.pdf> <output.pdf> --data-file data.json [--flatten]');
    process.exit(1);
  }

  let data;
  if (flags['data-file']) {
    data = JSON.parse(fs.readFileSync(flags['data-file'], 'utf8'));
  } else if (flags.data) {
    data = JSON.parse(flags.data);
  } else {
    console.error('Error: provide --data or --data-file');
    process.exit(1);
  }

  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const font = await embedFont(pdfDoc);

  let filled = 0;
  const errors = [];

  for (const [fieldName, value] of Object.entries(data)) {
    try {
      const field = form.getField(fieldName);
      const type = field.constructor.name;

      if (type === 'PDFTextField') {
        field.setText(String(value));
        field.updateAppearances(font);
        filled++;
      } else if (type === 'PDFCheckBox') {
        if (value === true || value === 'true' || value === 'checked' || value === 1) {
          field.check();
        } else {
          field.uncheck();
        }
        filled++;
      } else if (type === 'PDFRadioGroup') {
        field.select(String(value));
        filled++;
      } else if (type === 'PDFDropdown') {
        field.select(String(value));
        filled++;
      } else if (type === 'PDFOptionList') {
        if (Array.isArray(value)) {
          field.select(value.map(String));
        } else {
          field.select(String(value));
        }
        filled++;
      } else {
        errors.push(`${fieldName}: unsupported field type ${type}`);
      }
    } catch (e) {
      errors.push(`${fieldName}: ${e.message}`);
    }
  }

  if (flags.flatten === 'true') {
    form.flatten();
  }

  const filledBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, filledBytes);

  console.log(`Filled ${filled}/${Object.keys(data).length} field(s) → ${outputPath}`);
  if (flags.flatten === 'true') console.log('Form flattened (fields are now static).');
  if (errors.length > 0) {
    console.error('\nErrors:');
    errors.forEach(e => console.error(`  - ${e}`));
  }
}

// ── overlay: add text at specific coordinates ──
async function overlayText() {
  const { flags, positional } = parseFlags(args);
  const inputPath = positional[0];
  const outputPath = positional[1];

  if (!inputPath || !outputPath) {
    console.error('Usage: pdf-filler overlay <input.pdf> <output.pdf> --text "text" --page 1 --x 100 --y 200 [--size 12] [--color "0,0,0"]');
    console.error('       pdf-filler overlay <input.pdf> <output.pdf> --items-file items.json');
    console.error('\nitems.json format: [{"text":"value", "page":1, "x":100, "y":200, "size":12}]');
    process.exit(1);
  }

  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await embedFont(pdfDoc);
  const pages = pdfDoc.getPages();

  let items = [];
  if (flags['items-file']) {
    items = JSON.parse(fs.readFileSync(flags['items-file'], 'utf8'));
  } else if (flags.text) {
    const colorParts = (flags.color || '0,0,0').split(',').map(Number);
    items = [{
      text: flags.text,
      page: parseInt(flags.page || '1', 10),
      x: parseFloat(flags.x || '0'),
      y: parseFloat(flags.y || '0'),
      size: parseFloat(flags.size || '12'),
      color: colorParts,
    }];
  } else {
    console.error('Error: provide --text or --items-file');
    process.exit(1);
  }

  let placed = 0;
  for (const item of items) {
    const pageIdx = (item.page || 1) - 1;
    if (pageIdx < 0 || pageIdx >= pages.length) {
      console.error(`Warning: page ${item.page} does not exist (PDF has ${pages.length} pages), skipping.`);
      continue;
    }
    const page = pages[pageIdx];
    const c = item.color || [0, 0, 0];
    page.drawText(String(item.text), {
      x: item.x || 0,
      y: item.y || 0,
      size: item.size || 12,
      font,
      color: rgb(c[0] / 255, c[1] / 255, c[2] / 255),
    });
    placed++;
  }

  const resultBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, resultBytes);
  console.log(`Placed ${placed} text item(s) → ${outputPath}`);
}

// ── flatten: flatten form fields ──
async function flattenForm() {
  const { positional } = parseFlags(args);
  const inputPath = positional[0];
  const outputPath = positional[1] || inputPath;

  if (!inputPath) {
    console.error('Usage: pdf-filler flatten <input.pdf> [output.pdf]');
    process.exit(1);
  }

  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  form.flatten();

  const flatBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, flatBytes);
  console.log(`Flattened → ${outputPath}`);
}

// ── info: show PDF page dimensions ──
async function pageInfo() {
  const { positional } = parseFlags(args);
  const inputPath = positional[0];

  if (!inputPath) {
    console.error('Usage: pdf-filler info <input.pdf>');
    process.exit(1);
  }

  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  console.log(`Pages: ${pages.length}\n`);
  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    console.log(`  Page ${i + 1}: ${width} x ${height} pt (${(width / 72 * 25.4).toFixed(0)} x ${(height / 72 * 25.4).toFixed(0)} mm)`);
  });
}

// ── usage ──
function printUsage() {
  console.log(`pdf-filler — PDF form filler CLI

Commands:
  fields <input.pdf>                                 List all form fields
  info <input.pdf>                                   Show page dimensions
  fill <in.pdf> <out.pdf> --data '{...}' [--flatten] Fill form fields from JSON
  fill <in.pdf> <out.pdf> --data-file f.json         Fill form fields from file
  overlay <in.pdf> <out.pdf> --text "..." --page 1 --x 100 --y 200  Add text at coordinates
  overlay <in.pdf> <out.pdf> --items-file items.json                 Batch overlay from file
  flatten <input.pdf> [output.pdf]                   Flatten form fields to static

Coordinate system:
  Origin (0,0) is bottom-left corner of the page.
  Units are PDF points (1 pt = 1/72 inch = 0.353 mm).
  A4 page: 595 x 842 pt. Letter page: 612 x 792 pt.
`);
}

async function main() {
  try {
    switch (command) {
      case 'fields': return await listFields();
      case 'info': return await pageInfo();
      case 'fill': return await fillForm();
      case 'overlay': return await overlayText();
      case 'flatten': return await flattenForm();
      default: printUsage(); process.exit(command ? 1 : 0);
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

main();
