'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import type { Case } from '@/types/case';

import { DEMO_CASES } from '@/lib/demoCases';

export function useCases(status?: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const demoList = Object.values(DEMO_CASES);

  return useQuery<Case[]>({
    queryKey: ['cases', status],
    placeholderData: demoList,
    queryFn: async () => {
      if (!isLoaded || !isSignedIn) return demoList;

      try {
        const token = await getToken();
        if (!token) return demoList;
        const api = createAuthenticatedApi(token);
        const params = status ? { status } : {};
        const res = await api.get('/api/cases', { params });
        return res.data.data && res.data.data.length > 0 ? res.data.data : demoList;
      } catch (e) {
        return demoList;
      }
    },
  });
}
