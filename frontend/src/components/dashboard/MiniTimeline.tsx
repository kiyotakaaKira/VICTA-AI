'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { EVENT_TYPES } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/utils';
import type { TimelineEvent } from '@/types/timeline';
import { useCases } from '@/hooks/useCases';

export function MiniTimeline() {
  const { data: cases = [] } = useCases();

  // Placeholder events derived from case timestamps
  const events: Pick<TimelineEvent, 'id' | 'title' | 'type' | 'timestamp'>[] = cases
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      title: `Case opened: ${c.title}`,
      type: 'legal' as const,
      timestamp: c.created_at,
    }));

  return (
    <GlassCard className="p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Recent Activity
      </h3>
      <div className="space-y-0">
        {events.map((event, i) => {
          const typeConfig = EVENT_TYPES[event.type] || EVENT_TYPES.digital;
          return (
            <div key={event.id} className="flex gap-3 py-2 relative">
              {/* Line */}
              {i < events.length - 1 && (
                <div className="absolute left-[7px] top-5 bottom-0 w-px bg-white/5" />
              )}
              {/* Dot */}
              <div
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 ring-2 ring-forensic-bg"
                style={{ backgroundColor: typeConfig.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-300 line-clamp-1">{event.title}</p>
                <p className="text-xs text-slate-600">{formatTimeAgo(event.timestamp)}</p>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <p className="text-slate-600 text-xs py-4 text-center">No recent activity.</p>
        )}
      </div>
    </GlassCard>
  );
}
