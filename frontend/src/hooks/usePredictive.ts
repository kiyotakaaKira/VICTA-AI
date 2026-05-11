'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';

export interface PredictiveRecommendation {
  id: string;
  case_id?: string;
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
  confidence: number;
  payload?: Record<string, unknown>;
  created_at: string;
}

export function usePredictive(caseId?: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<PredictiveRecommendation[]>({
    queryKey: ['predictive', caseId],
    enabled: isLoaded && !!isSignedIn,
    refetchInterval: 60000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const params = caseId ? { case_id: caseId } : {};
      const res = await api.get('/api/prediction', { params });
      return res.data.data ?? [];
    },
  });
}
