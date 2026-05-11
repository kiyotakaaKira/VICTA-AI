'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';

export interface IntelligenceEvent {
  id: string;
  event_type: string;
  type: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source: string;
  category: string;
  ai_confidence: number;
  payload: Record<string, unknown>;
  created_at: string;
}

export function useIntelligence(limit = 50) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<IntelligenceEvent[]>({
    queryKey: ['intelligence-events', limit],
    enabled: isLoaded && !!isSignedIn,
    refetchInterval: 12000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.get('/api/engines/intelligence', { params: { limit } });
      return res.data.data ?? [];
    },
  });
}
