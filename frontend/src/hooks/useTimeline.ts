'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { createAuthenticatedApi } from '@/lib/api';
import type { TimelineEvent } from '@/types/timeline';

export function useTimeline(caseId: string | null) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<TimelineEvent[]>({
    queryKey: ['timeline', caseId],
    enabled: isLoaded && !!isSignedIn && !!caseId,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const api = createAuthenticatedApi(token);
      const res = await api.get(`/api/timeline/case/${caseId}`);
      return res.data.data;
    },
  });
}
