import { useQuery } from '@tanstack/react-query';
import type { SwaUser } from '../types';

interface AuthMe {
  clientPrincipal: SwaUser | null;
}

async function fetchAuthMe(): Promise<AuthMe> {
  const res = await fetch('/.auth/me');
  if (!res.ok) return { clientPrincipal: null };
  return res.json();
}

export function useAuth() {
  const { data, isLoading } = useQuery<AuthMe>({
    queryKey: ['auth-me'],
    queryFn: fetchAuthMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return {
    user: data?.clientPrincipal ?? null,
    isLoading,
    isAuthenticated: !!data?.clientPrincipal,
  };
}
