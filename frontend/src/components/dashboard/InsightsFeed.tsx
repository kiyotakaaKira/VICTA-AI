'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { SeverityIcon } from '@/components/ui/SeverityIcon';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useRecentInsights } from '@/hooks/useRecentInsights';
import { formatTimeAgo } from '@/lib/utils';
import { SEVERITY_COLORS } from '@/lib/constants';
import type { Severity } from '@/lib/constants';
import { Brain, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function InsightsFeed() {
  const { data: sorted = [], isLoading } = useRecentInsights(14);

  if (isLoading) {
    return (
      <GlassCard className="p-4 flex flex-col h-full">
        <CardSkeleton className="h-40" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-forensic-purple" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            AI Insights
          </span>
        </div>
        <span className="text-xs text-slate-600">{sorted.length} active</span>
      </div>

      <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5">
        {sorted.length === 0 && (
          <p className="text-xs text-slate-600 py-6 text-center">No AI insights ingested yet.</p>
        )}
        {sorted.map((insight, i) => {
          const colors = SEVERITY_COLORS[insight.severity as Severity] || SEVERITY_COLORS.info;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg hover:bg-white/3 transition-colors cursor-pointer group"
              style={{ borderLeft: `2px solid ${colors.text}` }}
            >
              <div className="flex gap-2.5">
                <SeverityIcon severity={insight.severity as Severity} size={13} className="mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 leading-snug group-hover:text-white transition-colors">
                    {insight.title}
                  </p>
                  {insight.description && (
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{insight.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="text-xs font-mono"
                      style={{ color: `${colors.text}80`, fontSize: 10 }}
                    >
                      {insight.source}
                    </span>
                    <span className="text-slate-700">·</span>
                    <span className="text-xs text-slate-600" style={{ fontSize: 10 }}>
                      {formatTimeAgo(insight.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
