'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import { QK } from '@/lib/queryKeys';

export type PlatformStats = {
  activeCases: number;
  totalEvidence: number;
  aiInsights: number;
  threatLevel: number;
  analysisToday: number;
  pendingReview: number;
  crossCaseLinks: number;
  closedCases: number;
};

export function useDashboardStats() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<PlatformStats>({
    queryKey: QK.dashboardStats,
    enabled: Boolean(isLoaded && isSignedIn),
    staleTime: 5000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.get('/api/dashboard/stats');
      return res.data.data;
    },
  });
}
