const xlsx = require('xlsx');
const wb = xlsx.readFile('/workspace/inbox/1501304993880346857:ag-asszisztens/Feri_szallitasok_valaszok.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

function num(v) {
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return isFinite(n) ? n : 0;
}

function guessItem(r) {
  const said = String(r['Mit szállítottál?'] || '').trim();
  if (said) return said;
  const sup = String(r['Cég neve (beszállító)'] || '').toLowerCase();
  const inv = String(r['Számlaszám'] || '').toLowerCase();
  const dest = String(r['Hova kellett?'] || '').toLowerCase();
  const note = String(r['Megjegyzés'] || '').trim();
  if (note) return note;
  const map = [
    ['mol', 'Gázpalack'],
    ['pintér', 'Tüzépáru (építőanyag)'],
    ['káplár', 'Faanyag / deszka'],
    ['homo piktusz', 'Apróáru / szerszám / szemeteszsák'],
    ['póth', 'Vasanyag / idomvas (becsült)'],
    ['építőmester', 'Általános építőanyag'],
    ['lan-co', 'Víz-szennyvíz idomok'],
    ['letfusz', 'Építőanyag'],
    ['duna épker', 'Építőanyag'],
    ['bio bo-na', 'Betonáru / tégla / cement'],
    ['joker', 'Festék / kiegészítő'],
    ['diego', 'Padló / szőnyeg'],
    ['fókusz', 'Építőanyag'],
    ['naszály', 'Festék'],
    ['piramis', 'Építőanyag'],
    ['szegner', 'Zúzott kő / sóder / bazalt'],
    ['bádog', 'Bádogos anyag'],
    ['kalapács', 'Vas / kötőelem'],
    ['már-team', 'Vegyes építőanyag'],
    ['már team', 'Vegyes építőanyag'],
    ['palatinus', 'Vas / szerszám'],
    ['profi', 'Csavar / építőanyag'],
    ['lavina', 'Autószerviz (motorolaj/szűrő)'],
    ['hencz', 'Gépbérlés'],
    ['zsemberi', 'Építőanyag'],
    ['kisgép', 'Gépkölcsönzés'],
  ];
  for (const [k, v] of map) {
    if (sup.includes(k) || inv.includes(k)) return v + ' (becsült)';
  }
  if (inv) return 'Ismeretlen — ❓ QB-ben ellenőrizni';
  return 'Ismeretlen';
}

function verdict(r, item) {
  const fuvar = num(r['Szállítási költség']);
  const cash = num(r['Készpénzes számla kifizetés']);
  const itemL = item.toLowerCase();
  const note = String(r['Megjegyzés'] || '').toLowerCase();

  // Special services / non-pure-delivery
  if (fuvar >= 30000 && (itemL.includes('szemét') || itemL.includes('sitt') || note.includes('szemét') || note.includes('sitt'))) {
    return '✅ Szemét/sitt elszállítás — szakmunka, OK';
  }
  if (fuvar >= 30000 && (itemL.includes('földmunka') || itemL.includes('rakodás') || itemL.includes('szétterítés') || note.includes('földmunka') || note.includes('rakodás'))) {
    return '✅ Munkadíj/szolgáltatás, nem fuvar';
  }
  if (itemL.includes('tőlem') || itemL.includes('saját')) {
    return '✅ Saját készletből — fuvar indokolt';
  }
  if (itemL.includes('vissza') && itemL.includes('szemét')) {
    return '✅ Visszaúti szemét — kombinált fuvar, OK';
  }
  if (itemL.includes('gázpalack')) {
    return '❌ Gázpalack — heti/havi ÖSSZEVONT csere, ne ad-hoc';
  }
  if (fuvar === 9000 && cash > 0 && cash < 5000) {
    return '❌ NEM érte meg — kis vásárlás, bundle-elni kell';
  }
  if (fuvar === 9000 && cash > 0 && cash < 10000) {
    return '⚠️ Határeset — bundle-elhető lenne';
  }
  if (fuvar === 9000 && cash >= 10000) {
    return '✅ OK — érdemi vásárlás';
  }
  if (fuvar === 9000 && cash === 0) {
    return '❓ Áru érték ismeretlen — QB-ben ellenőrizni';
  }
  if (fuvar > 9000 && fuvar < 30000) {
    return '✅ Speciális fuvar (nagyobb mennyiség)';
  }
  if (fuvar >= 38000) {
    return '✅ Nagyfuvar / Pilates rakodás, OK';
  }
  return '⚠️ Egyedi mérlegelés';
}

const out = rows.map(r => ({
  ...r,
  'Mit vett (becslés)': guessItem(r),
  'Megérte?': verdict(r, guessItem(r)),
}));

const newSheet = xlsx.utils.json_to_sheet(out, {
  header: ['Időbélyeg','Dátum','Számlaszám','Hova kellett?','Szállítási költség','Mit szállítottál?','Készpénzes számla kifizetés','Cég neve (beszállító)','Megjegyzés','Mit vett (becslés)','Megérte?'],
});
const newWb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(newWb, newSheet, 'Feri audit');

// Summary sheet
const counts = { '❌': 0, '⚠️': 0, '✅': 0, '❓': 0 };
const byVerdictCost = { '❌': 0, '⚠️': 0, '✅': 0, '❓': 0 };
let totalFuvar = 0, totalCash = 0;
for (const r of out) {
  const v = r['Megérte?'];
  const fuvar = num(r['Szállítási költség']);
  totalFuvar += fuvar;
  totalCash += num(r['Készpénzes számla kifizetés']);
  for (const k of Object.keys(counts)) {
    if (v.startsWith(k)) { counts[k]++; byVerdictCost[k] += fuvar; break; }
  }
}

const summary = [
  ['Összegzés', ''],
  ['Tételek száma', rows.length],
  ['Össz fuvarköltség (Ft)', totalFuvar],
  ['Össz készpénzes vásárlás (Ft)', totalCash],
  ['Fuvar / áru arány', (totalFuvar / Math.max(1, totalCash)).toFixed(2) + 'x'],
  ['', ''],
  ['Verdict', 'Darab', 'Fuvarköltség (Ft)'],
  ['❌ Nem érte meg', counts['❌'], byVerdictCost['❌']],
  ['⚠️ Határeset', counts['⚠️'], byVerdictCost['⚠️']],
  ['✅ OK', counts['✅'], byVerdictCost['✅']],
  ['❓ Ismeretlen / QB lookup kell', counts['❓'], byVerdictCost['❓']],
];
const summarySheet = xlsx.utils.aoa_to_sheet(summary);
xlsx.utils.book_append_sheet(newWb, summarySheet, 'Összegzés');

xlsx.writeFile(newWb, '/workspace/agent/Feri_szallitasok_audit.xlsx');
console.log('Written: /workspace/agent/Feri_szallitasok_audit.xlsx');
console.log('Counts:', counts);
console.log('Costs:', byVerdictCost);
console.log('Total fuvar:', totalFuvar, 'cash:', totalCash);
