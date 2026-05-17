import type { Question, ProjectFilters } from '../types';

export function filterQuestions(questions: Question[], filters: ProjectFilters): Question[] {
  return questions.filter(q => {
    if (filters.product && q.product !== filters.product) return false;
    if (filters.area && q.area !== filters.area) return false;
    if (filters.subArea && q.subArea !== filters.subArea) return false;
    return true;
  });
}

export function getFilterOptions(questions: Question[], filters: ProjectFilters) {
  const products = [...new Set(questions.map(q => q.product))].sort();
  const areas = [...new Set(
    questions
      .filter(q => !filters.product || q.product === filters.product)
      .map(q => q.area)
  )].sort();
  const subAreas = [...new Set(
    questions
      .filter(q => !filters.product || q.product === filters.product)
      .filter(q => !filters.area || q.area === filters.area)
      .map(q => q.subArea)
      .filter(Boolean)
  )].sort();
  return { products, areas, subAreas };
}
