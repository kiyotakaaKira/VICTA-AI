'use client';

import { useEvidence } from '@/hooks/useEvidence';
import { EvidenceCard } from './EvidenceCard';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';

export function EvidenceList({ caseId }: { caseId: string }) {
  const { data: evidence, isLoading, error } = useEvidence(caseId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-sm p-4">Failed to load evidence.</div>;
  }

  if (!evidence?.length) {
    return (
      <EmptyState
        icon={<Package size={24} className="text-slate-500" />}
        title="No evidence uploaded"
        description="Upload files above to start building your evidence chain."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {evidence.map((ev, i) => (
        <EvidenceCard key={ev.id} evidence={ev} index={i} />
      ))}
    </div>
  );
}
