'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import type { Evidence } from '@/types/evidence';

export function useEvidence(caseId: string | null) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<Evidence[]>({
    queryKey: ['evidence', caseId],
    enabled: isLoaded && !!isSignedIn && !!caseId,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.get(`/api/evidence/case/${caseId}`);
      return res.data.data;
    },
  });
}
