'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { RiskBar } from '@/components/ui/RiskBar';
import { getRiskLabel, formatTimeAgo, getBadgeVariant } from '@/lib/utils';
import type { Case } from '@/types/case';

interface CaseCardProps {
  caseData: Case;
  index?: number;
}

export function CaseCard({ caseData, index = 0 }: CaseCardProps) {
  const riskLabel = getRiskLabel(caseData.risk_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
    >
      <GlassCard className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{caseData.title}</h3>
            {caseData.description && (
              <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{caseData.description}</p>
            )}
          </div>
          <Badge variant={getBadgeVariant(caseData.priority)}>{caseData.priority}</Badge>
        </div>

        {/* Risk bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Risk Level</span>
            <span className={`font-medium capitalize`} style={{ color: ['critical','high'].includes(riskLabel) ? '#ef4444' : riskLabel === 'medium' ? '#eab308' : '#22c55e' }}>
              {riskLabel} ({caseData.risk_score})
            </span>
          </div>
          <RiskBar score={caseData.risk_score} height={5} />
        </div>

        {/* Tags */}
        {caseData.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {caseData.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10"
              >
                {tag}
              </span>
            ))}
            {caseData.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-500">
                +{caseData.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock size={11} />
            <span>{formatTimeAgo(caseData.updated_at)}</span>
          </div>
          <Link
            href={`/cases/${caseData.id}`}
            className="flex items-center gap-1 text-forensic-cyan text-xs font-medium hover:gap-2 transition-all"
          >
            Open <ArrowRight size={12} />
          </Link>
        </div>
      </GlassCard>
    </motion.div>
  );
}
