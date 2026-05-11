'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { useInsights } from '@/hooks/useInsights';

export default function HypothesisEngine({ caseId }: { caseId: string }) {
  const { data: insights = [], isLoading } = useInsights(caseId);

  return (
    <GlassCard className="p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white tracking-wide">Working hypotheses</h3>
      {isLoading ? (
        <p className="text-xs text-slate-500">Synthesizing hypotheses from insight graph…</p>
      ) : insights.length === 0 ? (
        <p className="text-xs text-slate-600">No AI insights yet — run enrichments on evidence.</p>
      ) : (
        <ul className="space-y-3">
          {insights.map((ins: any) => (
            <li key={ins.id} className="border border-cyan-500/10 rounded-lg p-3 text-xs text-slate-400">
              <div className="text-slate-200 font-medium">{ins.title}</div>
              <p className="mt-2">{ins.description}</p>
              <div className="mt-2 text-slate-600">Severity {ins.severity}</div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
