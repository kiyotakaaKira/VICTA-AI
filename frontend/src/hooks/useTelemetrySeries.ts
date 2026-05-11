'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import { QK } from '@/lib/queryKeys';

export type TelemetryPoint = {
  time: string;
  signals: number;
  anomalies: number;
  baseline: number;
};

import { DEMO_TELEMETRY } from '@/lib/demoData';

export function useTelemetrySeries(limit = 48) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<TelemetryPoint[]>({
    queryKey: [...QK.telemetry, limit],
    placeholderData: DEMO_TELEMETRY,
    staleTime: 3000,
    queryFn: async () => {
      // If not signed in or still loading, just give demo data
      if (!isLoaded || !isSignedIn) {
        return DEMO_TELEMETRY;
      }

      try {
        const token = await getToken();
        if (!token) return DEMO_TELEMETRY;
        const api = createAuthenticatedApi(token);
        const res = await api.get('/api/dashboard/telemetry', { params: { limit } });
        return res.data.data || DEMO_TELEMETRY;
      } catch (e) {
        return DEMO_TELEMETRY;
      }
    },
  });
}
