'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import type { Case } from '@/types/case';

import { DEMO_CASES } from '@/lib/demoCases';

export function useCase(caseId: string | null) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<Case>({
    queryKey: ['case', caseId],
    placeholderData: caseId ? DEMO_CASES[caseId] : undefined,
    queryFn: async () => {
      if (caseId && DEMO_CASES[caseId]) return DEMO_CASES[caseId];
      if (!isLoaded || !isSignedIn) return caseId ? DEMO_CASES[caseId] : null;

      try {
        const token = await getToken();
        if (!token) return DEMO_CASES[caseId as string];
        const api = createAuthenticatedApi(token);
        const res = await api.get(`/api/cases/${caseId}`);
        return res.data.data || DEMO_CASES[caseId as string];
      } catch (e) {
        return DEMO_CASES[caseId as string];
      }
    },
  });
}
