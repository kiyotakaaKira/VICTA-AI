'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import type { AnalyticsOverview } from '@/types/analytics';

import { DEMO_ANALYTICS } from '@/lib/demoData';

export function useAnalyticsOverview() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    placeholderData: DEMO_ANALYTICS,
    queryFn: async () => {
      // If not signed in or still loading, just give demo data
      if (!isLoaded || !isSignedIn) {
        return DEMO_ANALYTICS;
      }

      try {
        const token = await getToken();
        if (!token) return DEMO_ANALYTICS;
        const api = createAuthenticatedApi(token);
        const res = await api.get('/api/analytics/overview');
        return res.data.data || DEMO_ANALYTICS;
      } catch (e) {
        return DEMO_ANALYTICS;
      }
    },
  });
}
