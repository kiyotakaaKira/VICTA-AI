'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { RiskBar } from '@/components/ui/RiskBar';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useCases } from '@/hooks/useCases';
import { formatTimeAgo, getRiskLabel, getRiskColor, getBadgeVariant } from '@/lib/utils';
import { ArrowRight, Clock, User, Tag, AlertTriangle } from 'lucide-react';
import type { Case } from '@/types/case';

function CaseRow({ c, index }: { c: Case; index: number }) {
  const riskColor = getRiskColor(c.risk_score);
  const riskLabel = getRiskLabel(c.risk_score);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      whileHover={{ x: 3, transition: { duration: 0.15 } }}
    >
      <GlassCard className="p-4 cursor-pointer group relative overflow-hidden">
        {/* Priority glow strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
          style={{ backgroundColor: riskColor }}
        />

        <div className="pl-3 space-y-2.5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <Badge variant={getBadgeVariant(c.priority)}>{c.priority}</Badge>
                <Badge variant={getBadgeVariant(c.status)}>{c.status}</Badge>
              </div>
              <h3 className="font-bold text-white text-sm leading-snug group-hover:text-forensic-cyan transition-colors">
                {c.title}
              </h3>
            </div>
            <Link
              href={`/cases/${c.id}`}
              className="flex-shrink-0 w-7 h-7 rounded-lg bg-forensic-surface flex items-center justify-center text-slate-500 group-hover:text-forensic-cyan group-hover:bg-forensic-cyan/10 transition-all border border-forensic-border group-hover:border-forensic-border-hover"
            >
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Description */}
          {c.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{c.description}</p>
          )}

          {/* Risk bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium uppercase tracking-wider" style={{ fontSize: 10 }}>
                Risk Score
              </span>
              <span className="font-bold capitalize" style={{ color: riskColor }}>
                {riskLabel} · {c.risk_score}
              </span>
            </div>
            <RiskBar score={c.risk_score} height={4} />
          </div>

          {/* Tags */}
          {c.tags?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag size={10} className="text-slate-600 flex-shrink-0" />
              {c.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded bg-white/4 text-slate-500 border border-white/6 font-mono"
                  style={{ fontSize: 10 }}
                >
                  {tag}
                </span>
              ))}
              {c.tags.length > 3 && (
                <span className="text-xs text-slate-600">+{c.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
            {c.assigned_to && (
              <div className="flex items-center gap-1">
                <User size={10} />
                <span>{c.assigned_to}</span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Clock size={10} />
              <span>{formatTimeAgo(c.updated_at)}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function CasesGrid() {
  const { data: all = [], isLoading } = useCases();
  const activeCases = all.filter((c) => c.status === 'active' || c.status === 'pending');

  if (isLoading) {
    return (
      <div className="space-y-3">
        <CardSkeleton className="h-24" />
        <CardSkeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Active Investigations
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">{activeCases.length} open</span>
          <Link
            href="/cases"
            className="text-xs text-forensic-cyan hover:text-forensic-cyan-dark transition-colors flex items-center gap-1"
          >
            All cases <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        {activeCases.map((c, i) => (
          <CaseRow key={c.id} c={c} index={i} />
        ))}
      </div>
    </div>
  );
}
