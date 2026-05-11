'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import type { Insight } from '@/types/insight';

export function useInsights(caseId: string | null) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<Insight[]>({
    queryKey: ['insights', caseId],
    enabled: isLoaded && !!isSignedIn && !!caseId,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.get(`/api/insights/case/${caseId}`);
      return res.data.data;
    },
  });
}
