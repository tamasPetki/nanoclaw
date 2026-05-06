// Extract unique invoice numbers from Feri xlsx, save to JSON
const xlsx = require('xlsx');
const fs = require('fs');
const wb = xlsx.readFile('/workspace/inbox/1501304993880346857:ag-asszisztens/Feri_szallitasok_valaszok.xlsx');
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });

// Extract a clean invoice number from the cell (first token usually)
function cleanNum(s) {
  s = String(s || '').trim();
  if (!s) return '';
  // Take the first whitespace-separated token if it looks like an invoice number
  const m = s.match(/^[A-Za-z0-9\-\/]+/);
  return m ? m[0] : '';
}

const seen = new Set();
const list = [];
for (const r of rows) {
  const raw = String(r['Számlaszám'] || '').trim();
  const cleaned = cleanNum(raw);
  if (cleaned && !seen.has(cleaned)) {
    seen.add(cleaned);
    list.push({ raw, cleaned });
  }
}
fs.writeFileSync('/workspace/agent/feri-invoices.json', JSON.stringify(list, null, 2));
console.log('Unique invoices:', list.length);
console.log('Total rows:', rows.length);
