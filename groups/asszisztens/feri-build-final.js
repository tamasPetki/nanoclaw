const xlsx = require('xlsx');

const wb = xlsx.readFile('/workspace/inbox/1501304993880346857:ag-asszisztens/Feri_szallitasok_valaszok.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

const matchesData = require('/workspace/agent/feri-all-matches.json');
const matches = matchesData.all || matchesData;
const details = require('/workspace/agent/feri-details.json');

function num(v) {
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return isFinite(n) ? n : 0;
}

function excelDateToISO(serial) {
  if (!serial || typeof serial !== 'number') return '';
  const ms = (serial - 25569) * 86400 * 1000;
  return new Date(ms).toISOString().slice(0, 10);
}

function clean(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9/-]/g, '');
}

// Build a lookup map: cleaned invoice number -> match
const matchByClean = {};
const matchByRaw = {};
for (const m of matches) {
  matchByClean[clean(m.cleaned)] = m;
  matchByClean[clean(m.inv)] = m;
  matchByRaw[m.raw] = m;
}

// MOL date+amount lookup
const molByDateAmt = {
  '2026-01-20|7740': matches.find(m => m.id === 13543449),
  '2026-01-20|7690': matches.find(m => m.id === 13542816),
  '2026-01-27|15480': matches.find(m => m.id === 13625266),
  '2026-01-05|7740': matches.find(m => m.id === 13342444),
};

function findMatch(row) {
  const inv = String(row['Számlaszám'] || '').trim();
  const sup = String(row['Cég neve (beszállító)'] || '').toLowerCase();
  const date = excelDateToISO(row['Dátum']);
  const cash = num(row['Készpénzes számla kifizetés']);

  // Try raw match
  if (matchByRaw[inv]) return matchByRaw[inv];

  // Try cleaned variants
  const cleanedInv = clean(inv.split(/\s+/)[0]);
  if (matchByClean[cleanedInv]) return matchByClean[cleanedInv];

  // MOL handling
  if (sup.includes('mol') || inv.toLowerCase().includes('mol')) {
    const key = `${date}|${cash}`;
    if (molByDateAmt[key]) return molByDateAmt[key];
  }
  return null;
}

function shorten(s, max) {
  if (!s) return s;
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

function verdict(row, item, gross) {
  const fuvar = num(row['Szállítási költség']);
  const cash = gross || num(row['Készpénzes számla kifizetés']);
  const itemL = String(item || '').toLowerCase();
  const note = String(row['Megjegyzés'] || '').toLowerCase();
  const said = String(row['Mit szállítottál?'] || '').toLowerCase();
  const allText = (itemL + ' ' + note + ' ' + said).toLowerCase();

  // Special services / non-pure-delivery
  if (fuvar >= 30000 && (allText.includes('szemét') || allText.includes('sitt') || allText.includes('szemetes'))) {
    return '✅ Szemét/sitt elszállítás';
  }
  if (fuvar >= 30000 && (allText.includes('földmunka') || allText.includes('rakodás') || allText.includes('szétterítés'))) {
    return '✅ Munkadíj/szolgáltatás';
  }
  if (allText.includes('tőlem') || allText.includes('saját készlet')) {
    return '✅ Saját készletből';
  }
  if (allText.includes('vissza') && allText.includes('szemét')) {
    return '✅ Visszaúti szemét — kombinált';
  }
  if (itemL.includes('gázpalack') || itemL.includes('pb 11') || allText.includes('pb gáz') || allText.includes('palack')) {
    return '❌ Gázpalack — heti összevont csere';
  }
  // Standard verdict by cash/áru value
  if (fuvar === 9000 && cash > 0 && cash < 5000) {
    return '❌ NEM érte meg — kis vásárlás, bundle-elni';
  }
  if (fuvar === 9000 && cash > 0 && cash < 10000) {
    return '⚠️ Határeset — bundle-elhető';
  }
  if (fuvar === 9000 && cash >= 10000) {
    return '✅ OK — érdemi vásárlás';
  }
  if (fuvar === 9000 && cash === 0) {
    return '❓ Áru érték ismeretlen';
  }
  if (fuvar > 9000 && fuvar < 30000) {
    return '✅ Speciális fuvar (nagyobb mennyiség)';
  }
  if (fuvar >= 38000) {
    return '✅ Nagyfuvar / Pilates rakodás';
  }
  if (fuvar > 0 && fuvar < 9000) {
    return '⚠️ Egyedi mérlegelés';
  }
  return '⚠️ Egyedi mérlegelés';
}

const out = [];
const stats = { total: 0, matched: 0, gqb: 0, totalFuvar: 0, totalAru: 0 };
const verdictCounts = {};
const verdictCosts = {};
const worstOffenders = [];

for (const row of rows) {
  const m = findMatch(row);
  let mitVett = '';
  let qbPartner = '';
  let qbGross = '';
  let invStr = String(row['Számlaszám'] || '').trim();
  let supLow = String(row['Cég neve (beszállító)'] || '').toLowerCase();
  const said = String(row['Mit szállítottál?'] || '').trim();

  if (m) {
    stats.matched++;
    mitVett = details[m.id] || '';
    if (!mitVett) mitVett = `[id ${m.id}]`;
    qbPartner = m.partner;
    qbGross = m.gross;
  } else {
    // Not found in QB
    if (invStr || supLow) {
      // Determine if it's a Mar–May 2026 invoice that's likely not yet uploaded
      const dateIso = excelDateToISO(row['Dátum']);
      const isLate2026 = dateIso >= '2026-03-01';
      if (said) {
        mitVett = said;
      } else if (isLate2026) {
        mitVett = '❓ Nincs QB-ban (még nem rögzített 2026-03–05)';
      } else {
        // Heuristic guess from supplier
        const map = [
          ['mol', 'Gázpalack'],
          ['pintér', 'Tüzépáru'],
          ['káplár', 'Faanyag'],
          ['homo piktusz', 'Apróáru / szerszám'],
          ['póth', 'Vasanyag / csavar'],
          ['építőmester', 'Általános építőanyag'],
          ['lan-co', 'Víz-szennyvíz idomok'],
          ['letfusz', 'Építőanyag'],
          ['duna épker', 'Építőanyag'],
          ['bio bo-na', 'Betonáru / tégla'],
          ['fókusz', 'Villamossági'],
          ['szegner', 'Zúzott kő / sóder'],
          ['kalapács', 'Vas / kötőelem'],
          ['lavina', 'Autószerviz'],
          ['kisgép', 'Gépkölcsönzés'],
        ];
        let guess = '';
        for (const [k, v] of map) {
          if (supLow.includes(k) || invStr.toLowerCase().includes(k)) { guess = v + ' (becsült)'; break; }
        }
        mitVett = guess || '❓ QB-ben nem található';
      }
    } else {
      mitVett = '(nincs számla)';
    }
  }

  mitVett = shorten(mitVett, 180);
  const v = verdict(row, mitVett, qbGross || num(row['Készpénzes számla kifizetés']));
  const fuvar = num(row['Szállítási költség']);
  const aru = qbGross || num(row['Készpénzes számla kifizetés']);
  stats.total++;
  stats.totalFuvar += fuvar;
  stats.totalAru += aru;
  const k = v.charAt(0); // ✅ ❌ ⚠️ ❓
  verdictCounts[k] = (verdictCounts[k] || 0) + 1;
  verdictCosts[k] = (verdictCosts[k] || 0) + fuvar;
  if (aru > 0 && fuvar > 0) {
    worstOffenders.push({
      date: excelDateToISO(row['Dátum']),
      partner: qbPartner || row['Cég neve (beszállító)'],
      inv: invStr,
      fuvar, aru,
      ratio: fuvar / aru,
      v,
      mit: mitVett,
    });
  }

  out.push({
    ...row,
    'Mit vett (QB)': mitVett,
    'QB partner': qbPartner,
    'QB bruttó': qbGross,
    'Megérte?': v,
  });
}

worstOffenders.sort((a, b) => b.ratio - a.ratio);
const top10 = worstOffenders.slice(0, 10);

const newSheet = xlsx.utils.json_to_sheet(out, {
  header: ['Időbélyeg','Dátum','Számlaszám','Hova kellett?','Szállítási költség','Mit szállítottál?','Készpénzes számla kifizetés','Cég neve (beszállító)','Megjegyzés','Mit vett (QB)','QB partner','QB bruttó','Megérte?'],
});
const newWb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(newWb, newSheet, 'Feri audit');

const summary = [
  ['Feri szállítások — audit összegzés', ''],
  ['Tételek száma', stats.total],
  ['QB-ban azonosítva', stats.matched],
  ['QB-ban nem található', stats.total - stats.matched],
  ['Össz fuvarköltség (Ft)', stats.totalFuvar],
  ['Össz áru érték (Ft, ahol ismert)', stats.totalAru],
  ['Fuvar / áru arány', (stats.totalFuvar / Math.max(1, stats.totalAru)).toFixed(2) + 'x'],
  ['', ''],
  ['Verdict', 'Darab', 'Fuvarköltség (Ft)'],
  ['❌ Nem érte meg', verdictCounts['❌'] || 0, verdictCosts['❌'] || 0],
  ['⚠️ Határeset', verdictCounts['⚠'] || 0, verdictCosts['⚠'] || 0],
  ['✅ OK', verdictCounts['✅'] || 0, verdictCosts['✅'] || 0],
  ['❓ Ismeretlen / QB hiány', verdictCounts['❓'] || 0, verdictCosts['❓'] || 0],
  ['', ''],
  ['TOP-10 worst offender (fuvar/áru arány)', '', '', '', ''],
  ['Dátum', 'Partner', 'Számla', 'Fuvar', 'Áru', 'Arány', 'Verdict', 'Mit'],
  ...top10.map(o => [o.date, o.partner, o.inv, o.fuvar, o.aru, o.ratio.toFixed(2) + 'x', o.v, o.mit]),
];
const summarySheet = xlsx.utils.aoa_to_sheet(summary);
xlsx.utils.book_append_sheet(newWb, summarySheet, 'Összegzés');

xlsx.writeFile(newWb, '/workspace/agent/Feri_szallitasok_audit.xlsx');

console.log('OK', JSON.stringify(stats));
console.log('Verdicts:', verdictCounts, verdictCosts);
console.log('TOP3 worst:', top10.slice(0, 3).map(o => `${o.partner} ${o.inv} f=${o.fuvar} áru=${o.aru} = ${o.ratio.toFixed(2)}x`));
