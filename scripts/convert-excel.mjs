import xlsx from 'xlsx';
import { randomUUID } from 'crypto';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const wb = xlsx.readFile(join(root, 'OOTB Requirements Checklist .xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });

// Build a map of row index → hyperlink URL for the REFERENCE column (col E = index 4)
const range = xlsx.utils.decode_range(ws['!ref']);
const refColIndex = 4; // REFERENCE is the 5th column
const hyperlinkByRow = {};
for (let r = range.s.r + 1; r <= range.e.r; r++) {
  const cell = ws[xlsx.utils.encode_cell({ r, c: refColIndex })];
  if (cell?.l?.Target) hyperlinkByRow[r] = cell.l.Target;
}

const questions = rows
  .filter(r => r['QUESTION'] && String(r['QUESTION']).trim())
  .map((r, i) => ({
    id: randomUUID(),
    product: String(r['PRODUCT'] ?? '').trim(),
    area: String(r['AREA'] ?? '').trim(),
    subArea: String(r['SUB-AREA'] ?? '').trim(),
    question: String(r['QUESTION'] ?? '').trim(),
    // row index in sheet = i + 1 (header is row 0)
    reference: hyperlinkByRow[i + 1] ?? String(r['REFERENCE'] ?? '').trim(),
  }));

mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(join(root, 'data', 'questions.json'), JSON.stringify(questions, null, 2));

console.log(`Converted ${questions.length} questions to data/questions.json`);
console.log('Products:', [...new Set(questions.map(q => q.product))]);
console.log('Areas:', [...new Set(questions.map(q => q.area))]);
