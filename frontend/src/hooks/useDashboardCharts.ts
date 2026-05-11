'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import { QK } from '@/lib/queryKeys';

export type DashboardCharts = {
  riskTrend: { month: string; critical: number; high: number; medium: number }[];
  evidenceTypes: { name: string; value: number; color: string }[];
  threatLevels: { day: string; level: number }[];
};

export function useDashboardCharts() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<DashboardCharts>({
    queryKey: QK.dashboardCharts,
    enabled: Boolean(isLoaded && isSignedIn),
    staleTime: 8000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.get('/api/dashboard/charts');
      return res.data.data;
    },
  });
}
