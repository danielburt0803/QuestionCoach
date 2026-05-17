import { useQuery } from '@tanstack/react-query';
import type { Question } from '../types';

async function fetchQuestions(): Promise<Question[]> {
  const res = await fetch('/api/questions');
  if (!res.ok) throw new Error('Failed to load questions');
  return res.json();
}

export function useQuestions() {
  return useQuery<Question[]>({
    queryKey: ['questions'],
    queryFn: fetchQuestions,
    staleTime: 10 * 60 * 1000,
  });
}
