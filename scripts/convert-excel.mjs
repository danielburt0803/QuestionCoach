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

const questions = rows
  .filter(r => r['QUESTION'] && String(r['QUESTION']).trim())
  .map(r => ({
    id: randomUUID(),
    product: String(r['PRODUCT'] ?? '').trim(),
    area: String(r['AREA'] ?? '').trim(),
    subArea: String(r['SUB-AREA'] ?? '').trim(),
    question: String(r['QUESTION'] ?? '').trim(),
    reference: String(r['REFERENCE'] ?? '').trim(),
  }));

mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(join(root, 'data', 'questions.json'), JSON.stringify(questions, null, 2));

console.log(`Converted ${questions.length} questions to data/questions.json`);
console.log('Products:', [...new Set(questions.map(q => q.product))]);
console.log('Areas:', [...new Set(questions.map(q => q.area))]);
