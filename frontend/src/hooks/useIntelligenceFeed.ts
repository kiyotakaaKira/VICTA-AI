'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import { QK } from '@/lib/queryKeys';
import type { Severity } from '@/lib/constants';

export type IntelligenceAlert = {
  id: string;
  type: string;
  severity: Severity | string;
  title: string;
  message: string;
  timestamp: string;
  case_id?: string;
};

export function useIntelligenceFeed(limit = 40) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<IntelligenceAlert[]>({
    queryKey: [...QK.intelligenceFeed, limit],
    enabled: Boolean(isLoaded && isSignedIn),
    staleTime: 4000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.get('/api/dashboard/intelligence-feed', { params: { limit } });
      return res.data.data;
    },
  });
}
