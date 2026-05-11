'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { RiskGauge } from '@/components/cases/RiskGauge';
import { useCase } from '@/hooks/useCase';
import { useEvidence } from '@/hooks/useEvidence';

export default function LiveThreatScore({ caseId }: { caseId: string }) {
  const { data: caseRow, isLoading: loadingCase } = useCase(caseId);
  const { data: evidence = [], isLoading: loadingEv } = useEvidence(caseId);

  const avgRisk =
    evidence.length > 0
      ? Math.round(evidence.reduce((s: number, e: any) => s + (e.risk_score || 0), 0) / evidence.length)
      : caseRow?.risk_score ?? 0;

  const composite = Math.min(100, Math.round(((caseRow?.risk_score || 0) + avgRisk) / 2));

  return (
    <GlassCard className="p-6 flex flex-col md:flex-row gap-8 items-center">
      <div className="flex-1 space-y-3">
        <h3 className="text-sm font-semibold text-white tracking-wide">Composite threat posture</h3>
        <p className="text-xs text-slate-500">
          Derived from case baseline risk and mean artifact risk ({loadingEv || loadingCase ? '…' : `${evidence.length} artifacts`}).
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
          <div>
            <div className="text-slate-600">Case risk</div>
            <div className="text-lg text-slate-200">{caseRow?.risk_score ?? '—'}</div>
          </div>
          <div>
            <div className="text-slate-600">Evidence avg</div>
            <div className="text-lg text-slate-200">{evidence.length ? avgRisk : '—'}</div>
          </div>
        </div>
      </div>
      <RiskGauge score={composite} />
    </GlassCard>
  );
}
