'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { RiskBar } from '@/components/ui/RiskBar';
import { formatTimeAgo } from '@/lib/utils';
import { FileText, ExternalLink } from 'lucide-react';
import type { Evidence } from '@/types/evidence';

interface EvidenceCardProps {
  evidence: Evidence;
  index?: number;
}

export function EvidenceCard({ evidence, index = 0 }: EvidenceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-forensic-surface flex items-center justify-center flex-shrink-0 border border-forensic-border">
            <FileText size={16} className="text-slate-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{evidence.name}</p>
            <p className="text-xs text-slate-500 capitalize">{evidence.type || 'unknown'}</p>
          </div>
          {evidence.url && (
            <a
              href={evidence.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forensic-cyan hover:text-forensic-cyan-dark"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Risk */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Risk</span>
            <span className="text-slate-300">{evidence.risk_score}</span>
          </div>
          <RiskBar score={evidence.risk_score} height={4} />
        </div>

        {/* Authenticity */}
        <div className="flex justify-between text-xs text-slate-500">
          <span>Authenticity Score</span>
          <span className="text-slate-300 font-medium">{evidence.authenticity_score}%</span>
        </div>

        {/* Analysis summary */}
        {evidence.analysis?.summary && (
          <p className="text-xs text-slate-500 line-clamp-2 border-t border-forensic-border pt-2">
            {evidence.analysis.summary}
          </p>
        )}

        <p className="text-xs text-slate-600">{formatTimeAgo(evidence.created_at)}</p>
      </GlassCard>
    </motion.div>
  );
}
