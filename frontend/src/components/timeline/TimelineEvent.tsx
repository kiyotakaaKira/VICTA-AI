'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { TimelineDot } from './TimelineDot';
import { formatDate, formatTimeAgo } from '@/lib/utils';
import { EVENT_TYPES } from '@/lib/constants';
import type { TimelineEvent as TEvent } from '@/types/timeline';

interface TimelineEventProps {
  event: TEvent;
  index: number;
}

export function TimelineEvent({ event, index }: TimelineEventProps) {
  const typeConfig = EVENT_TYPES[event.type] || EVENT_TYPES.digital;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-4 pb-4 pl-0"
    >
      <TimelineDot color={typeConfig.color} />
      <GlassCard className="flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-white">{event.title}</p>
            {event.description && (
              <p className="text-xs text-slate-500 mt-1">{event.description}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ color: typeConfig.color, backgroundColor: `${typeConfig.color}18` }}
            >
              {typeConfig.label}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-slate-600">
          <span>{formatDate(event.timestamp)}</span>
          <span>{formatTimeAgo(event.timestamp)}</span>
          <span>Confidence: {event.confidence}%</span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
