import * as XLSX from 'xlsx';
import type { Question, Department, QuestionStatus } from '../types';

const STATUS_LABEL: Record<QuestionStatus, string> = {
  'not-started': 'Not Started',
  asked: 'Asked',
  answered: 'Answered',
  skipped: 'Skipped',
};

export function exportToExcel(
  questions: Question[],
  projectName: string,
  department: Department,
  filename?: string,
) {
  const rows = questions.map(q => {
    const prog = department.progress[q.id];
    return {
      Product: q.product,
      Area: q.area,
      'Sub-Area': q.subArea,
      Question: q.question,
      Reference: q.reference,
      Status: prog ? STATUS_LABEL[prog.status] : 'Not Started',
      Notes: prog?.notes ?? '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 32 }, { wch: 16 }, { wch: 20 }, { wch: 70 }, { wch: 50 }, { wch: 14 }, { wch: 40 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');
  const safe = (s: string) => s.replace(/[^a-z0-9]/gi, '_');
  XLSX.writeFile(wb, filename ?? `${safe(projectName)}_${safe(department.name)}_questions.xlsx`);
}
