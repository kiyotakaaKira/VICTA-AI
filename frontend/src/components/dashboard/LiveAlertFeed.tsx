'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SeverityIcon } from '@/components/ui/SeverityIcon';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useIntelligenceFeed } from '@/hooks/useIntelligenceFeed';
import { formatTimeAgo } from '@/lib/utils';
import type { Severity } from '@/lib/constants';

export function LiveAlertFeed() {
  const { data: feed = [], isLoading } = useIntelligenceFeed(24);

  const alerts = useMemo(
    () =>
      feed.map((a) => ({
        id: a.id,
        title: a.title,
        case: a.case_id ? `Case ${String(a.case_id).slice(0, 8)}` : 'Operations Center',
        severity: (a.severity as Severity) || 'medium',
        timestamp: a.timestamp,
        message: a.message,
      })),
    [feed]
  );

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  if (isLoading) {
    return (
      <GlassCard className="p-4 flex flex-col">
        <CardSkeleton className="h-48" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative w-2 h-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-ping absolute" />
            <div className="w-2 h-2 rounded-full bg-red-400 relative" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Alerts</span>
        </div>
        <Badge variant="destructive">{criticalCount} critical</Badge>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-72 pr-1">
        <AnimatePresence initial={false}>
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -16, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className={`p-3 rounded-lg border transition-all border-forensic-border bg-white/2 hover:bg-white/4 ${
                  i === 0 ? 'border-forensic-cyan/25' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <SeverityIcon severity={alert.severity} size={13} className="mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-200 leading-snug">{alert.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-forensic-cyan/60">{alert.case}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-slate-600">{formatTimeAgo(alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {alerts.length === 0 && (
          <p className="text-xs text-slate-600 text-center py-6">Awaiting intelligence feed from operational bus…</p>
        )}
      </div>
    </GlassCard>
  );
}
