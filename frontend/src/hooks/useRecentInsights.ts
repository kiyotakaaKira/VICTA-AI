'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import { QK } from '@/lib/queryKeys';
import type { Insight } from '@/types/insight';

export function useRecentInsights(limit = 15) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<Insight[]>({
    queryKey: [...QK.recentInsights, limit],
    enabled: Boolean(isLoaded && isSignedIn),
    staleTime: 8000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.get('/api/dashboard/insights', { params: { limit } });
      return res.data.data;
    },
  });
}
