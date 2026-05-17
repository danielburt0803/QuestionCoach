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
// Try header option
const rows2 = xlsx.utils.sheet_to_json(ws, { header: 1 });
console.log('\nWith header:1, first 3 rows:');
rows2.slice(0, 3).forEach(r => console.log(r));
