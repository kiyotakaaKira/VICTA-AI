'use client';

import { useState } from 'react';
import { TimelineEvent } from './TimelineEvent';
import { TimelineFilters } from './TimelineFilters';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { GitBranch } from 'lucide-react';
import type { TimelineEvent as TEvent } from '@/types/timeline';
import type { EventType } from '@/lib/constants';

interface TimelineViewProps {
  caseId?: string;
  events?: TEvent[];
  isLoading?: boolean;
}

export function TimelineView({ caseId, events: externalEvents, isLoading = false }: TimelineViewProps) {
  const [filter, setFilter] = useState<EventType | 'all'>('all');

  const allEvents = externalEvents ?? [];

  const filtered = filter === 'all'
    ? allEvents
    : allEvents.filter((e) => e.type === filter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TimelineFilters active={filter} onChange={setFilter} />
      {sorted.length === 0 ? (
        <EmptyState
          icon={<GitBranch size={24} className="text-slate-500" />}
          title="No timeline events"
          description={
            filter !== 'all'
              ? `No ${filter} events found.`
              : caseId
              ? 'Generate a timeline using AI analysis.'
              : 'Select a case to view its timeline.'
          }
        />
      ) : (
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[17px] top-4 bottom-4 w-px bg-forensic-border" />
          <div className="space-y-0">
            {sorted.map((event, i) => (
              <TimelineEvent key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
