'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';

export interface BehavioralPattern {
  id: string;
  case_id?: string;
  subject_id: string;
  pattern_type: string;
  anomaly_score: number;
  communication_frequency: number;
  movement_radius_km: number;
  behavioral_cluster: string;
  linguistic_markers: string[];
  risk_indicators: string[];
  ai_summary: string;
  confidence: number;
  created_at: string;
}

export function useBehavioralPatterns(caseId?: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<BehavioralPattern[]>({
    queryKey: ['behavioral-patterns', caseId],
    enabled: isLoaded && !!isSignedIn,
    refetchInterval: 45000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const params = caseId ? { case_id: caseId } : {};
      const res = await api.get('/api/behavioral', { params });
      return res.data.data ?? [];
    },
  });
}
