'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { EVENT_TYPES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { EventType } from '@/lib/constants';
import { useCases } from '@/hooks/useCases';
import { useTimeline } from '@/hooks/useTimeline';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export function TimelinePreview() {
  const { data: cases = [] } = useCases();
  const firstId = cases[0]?.id ?? null;
  const { data: events = [], isLoading } = useTimeline(firstId);

  const recent = [...events]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  if (isLoading && firstId) {
    return (
      <GlassCard className="p-4">
        <CardSkeleton className="h-36" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Timeline Activity
        </span>
        <Link
          href="/timeline"
          className="text-xs text-forensic-cyan hover:text-forensic-cyan-dark transition-colors flex items-center gap-1"
        >
          Full timeline <ArrowRight size={11} />
        </Link>
      </div>

      {!firstId && (
        <p className="text-xs text-slate-600 py-4 text-center">No cases available for timeline preview.</p>
      )}

      <div className="relative">
        <div className="absolute left-[13px] top-3 bottom-3 w-px bg-forensic-border" />

        <div className="space-y-0">
          {recent.map((event, i) => {
            const typeConfig = EVENT_TYPES[event.type as EventType] || EVENT_TYPES.digital;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-3 py-2 group"
              >
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-forensic-bg"
                    style={{
                      backgroundColor: `${typeConfig.color}18`,
                      border: `1.5px solid ${typeConfig.color}60`,
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: typeConfig.color }}
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1 pb-2 border-b border-forensic-border last:border-0">
                  <p className="text-xs text-slate-200 font-medium leading-snug group-hover:text-white transition-colors">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs font-mono"
                      style={{ color: typeConfig.color, fontSize: 10 }}
                    >
                      {typeConfig.label}
                    </span>
                    <span className="text-slate-700">·</span>
                    <span className="text-xs text-slate-600" style={{ fontSize: 10 }}>
                      {formatDate(event.timestamp)}
                    </span>
                    <span className="text-slate-700">·</span>
                    <span className="text-xs text-slate-600" style={{ fontSize: 10 }}>
                      {event.confidence ?? 0}% conf.
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
