'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';

export interface DeepfakeScan {
  id: string;
  case_id?: string;
  file_name: string;
  file_type: string;
  authenticity_score: number;
  gan_artifact_score: number;
  temporal_coherence: number;
  manipulation_probability: number;
  confidence: number;
  verdict: 'authentic' | 'manipulated' | 'inconclusive';
  analysis_details: Record<string, unknown>;
  created_at: string;
}

export function useDeepfakeScans(limit = 20) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<DeepfakeScan[]>({
    queryKey: ['deepfake-scans', limit],
    enabled: isLoaded && !!isSignedIn,
    refetchInterval: 30000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.get('/api/engines/deepfake', { params: { limit } });
      return res.data.data ?? [];
    },
  });
}

export function useAnalyzeDeepfake() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { case_id?: string; file_name: string; file_type: string; content?: string }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.post('/api/analysis/deepfake', payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deepfake-scans'] });
    },
  });
}
