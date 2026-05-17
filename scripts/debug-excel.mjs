import xlsx from 'xlsx';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const wb = xlsx.readFile(join(root, 'OOTB Requirements Checklist .xlsx'));
console.log('Sheet names:', wb.SheetNames);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });
console.log('Row count:', rows.length);
if (rows.length > 0) {
  console.log('Keys:', Object.keys(rows[0]));
  console.log('First row:', rows[0]);
  console.log('Second row:', rows[1]);
}
// Check hyperlinks on REFERENCE column cells
console.log('\nHyperlinks in REFERENCE column (first 5 data rows):');
const range = xlsx.utils.decode_range(ws['!ref']);
for (let row = range.s.r + 1; row <= Math.min(range.s.r + 5, range.e.r); row++) {
  const refCell = ws[xlsx.utils.encode_cell({ r: row, c: 4 })]; // column E = index 4
  console.log(`Row ${row}: text="${refCell?.v}" url="${refCell?.l?.Target ?? '(none)'}"`);
}
