export interface Question {
  id: string;
  product: string;
  area: string;
  subArea: string;
  question: string;
  reference: string;
}

export type QuestionStatus = 'not-started' | 'asked' | 'answered' | 'skipped';

export interface QuestionProgress {
  status: QuestionStatus;
  notes: string;
}

export interface ProjectFilters {
  product: string | null;
  area: string | null;
  subArea: string | null;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  filters: ProjectFilters;
  progress: Record<string, QuestionProgress>;
  createdAt: string;
  updatedAt: string;
}

export interface SwaUser {
  userId: string;
  userDetails: string;
  identityProvider: string;
  userRoles: string[];
}

export interface SwaClientPrincipal {
  clientPrincipal: SwaUser | null;
}
