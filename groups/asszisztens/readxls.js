const XLSX = require('xlsx');
const wb = XLSX.readFile(process.argv[2]);
for (const name of wb.SheetNames) {
  const sh = wb.Sheets[name];
  const csv = XLSX.utils.sheet_to_csv(sh);
  console.log(`=== ${name} ===`);
  console.log(csv);
}
