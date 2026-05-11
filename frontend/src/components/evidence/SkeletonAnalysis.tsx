'use client';

import { CardSkeleton, LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export function SkeletonAnalysis() {
  return (
    <div className="space-y-4">
      <LoadingSkeleton className="h-6 w-48" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-3 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
