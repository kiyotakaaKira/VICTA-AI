'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import type { GraphData } from '@/types/graph';

export function useGraph(caseId: string | null) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<GraphData>({
    queryKey: ['graph', caseId],
    enabled: Boolean(isLoaded && isSignedIn && caseId),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.get(`/api/graph/case/${caseId}`);
      return res.data.data;
    },
  });
}
