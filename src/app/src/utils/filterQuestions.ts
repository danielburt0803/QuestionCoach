import type { Question, ProjectFilters, QuestionProgress, QuestionStatus } from '../types';

export function filterQuestions(
  questions: Question[],
  filters: ProjectFilters,
  progress: Record<string, QuestionProgress>,
): Question[] {
  return questions.filter(q => {
    if (filters.products.length > 0 && !filters.products.includes(q.product)) return false;
    if (filters.areas.length > 0 && !filters.areas.includes(q.area)) return false;
    if (filters.subAreas.length > 0 && !filters.subAreas.includes(q.subArea)) return false;
    if (filters.statuses.length > 0) {
      const status: QuestionStatus = progress[q.id]?.status ?? 'not-started';
      if (!filters.statuses.includes(status)) return false;
    }
    return true;
  });
}

export function getFilterOptions(questions: Question[], filters: ProjectFilters) {
  const byProduct = filters.products.length > 0
    ? questions.filter(q => filters.products.includes(q.product))
    : questions;

  const byArea = filters.areas.length > 0
    ? byProduct.filter(q => filters.areas.includes(q.area))
    : byProduct;

  const products = [...new Set(questions.map(q => q.product))].filter(Boolean).sort();
  const areas = [...new Set(byProduct.map(q => q.area))].filter(Boolean).sort();
  const subAreas = [...new Set(byArea.map(q => q.subArea))].filter(Boolean).sort();

  return { products, areas, subAreas };
}
