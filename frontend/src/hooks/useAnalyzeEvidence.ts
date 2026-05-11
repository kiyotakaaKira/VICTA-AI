'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import type { EvidenceAnalysis } from '@/types/evidence';

interface AnalyzePayload {
  text: string;
  type?: string;
  evidenceId?: string;
}

export function useAnalyzeEvidence() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<EvidenceAnalysis, Error, AnalyzePayload>({
    mutationFn: async (payload) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.post('/api/analysis/analyze-evidence', payload);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate evidence cache to refresh with new analysis
      if (variables.evidenceId) {
        queryClient.invalidateQueries({ queryKey: ['evidence'] });
      }
    },
  });
}
