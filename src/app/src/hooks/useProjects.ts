import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Project } from '../types';

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiFetch('/api/projects'),
  });
}

export function useProject(id: string | null) {
  return useQuery<Project>({
    queryKey: ['projects', id],
    queryFn: () => apiFetch(`/api/projects/${id}`),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name, filters: { product: null, area: null, subArea: null } }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<Project, 'name' | 'filters' | 'progress'>> }) =>
      apiFetch<Project>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ['projects', id] });
      const prev = qc.getQueryData<Project>(['projects', id]);
      if (prev) qc.setQueryData(['projects', id], { ...prev, ...patch, updatedAt: new Date().toISOString() });
      return { prev };
    },
    onError: (_err, { id }, ctx) => {
      if (ctx?.prev) qc.setQueryData(['projects', id], ctx.prev);
    },
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: ['projects', id] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/projects/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}
