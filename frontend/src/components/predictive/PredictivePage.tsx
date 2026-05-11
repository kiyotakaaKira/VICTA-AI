'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ChevronRight, Cpu, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { usePredictive } from '@/hooks/usePredictive';
import { ThreatHeatmap } from './ThreatHeatmap';
import { GlassCard } from '@/components/ui/GlassCard';

const PRIORITY_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.18)', label: 'CRITICAL', icon: AlertTriangle },
  high:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.18)', label: 'HIGH', icon: AlertTriangle },
  medium:   { color: '#6366f1', bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.18)', label: 'MEDIUM', icon: Clock },
  low:      { color: '#22d3ee', bg: 'rgba(34,211,238,0.07)', border: 'rgba(34,211,238,0.18)', label: 'LOW', icon: CheckCircle },
};

function PredictiveCard({ rec, index }: { rec: any; index: number }) {
  const prio = rec.priority as keyof typeof PRIORITY_CONFIG;
  const cfg = PRIORITY_CONFIG[prio] ?? PRIORITY_CONFIG.medium;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -2, scale: 1.005 }}
      className="rounded-xl border p-5 space-y-3 cursor-default"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}>
          <Icon size={14} style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded"
              style={{ background: `${cfg.color}18`, color: cfg.color }}>
              {cfg.label}
            </span>
            {rec.case_id && (
              <span className="text-xs text-slate-600 font-mono truncate">CASE:{rec.case_id.slice(0, 8)}</span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-200 leading-snug">{rec.action}</p>
        </div>
      </div>

      {rec.reasoning && (
        <p className="text-xs text-slate-500 leading-relaxed pl-11">{rec.reasoning}</p>
      )}

      <div className="pl-11 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600">AI Confidence</span>
          <span className="text-xs font-mono" style={{ color: cfg.color }}>{rec.confidence ?? 0}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: cfg.color }}
            initial={{ width: 0 }}
            animate={{ width: `${rec.confidence ?? 0}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: index * 0.06 + 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

import { PredictivePageEnhanced } from './PredictivePageEnhanced';

export default function PredictivePage() {
  const { data: recs = [], isLoading } = usePredictive();

  return (
    <div className="p-6">
      <PredictivePageEnhanced />
    </div>
  );
}
