'use client';

import { useCase } from '@/hooks/useCase';
import { GlassCard } from '@/components/ui/GlassCard';
import { RiskGauge } from './RiskGauge';
import { CaseMetaGrid } from './CaseMetaGrid';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export function CaseOverview({ caseId }: { caseId: string }) {
  const { data: caseData, isLoading } = useCase(caseId);

  if (isLoading) return <LoadingSkeleton className="h-64 w-full" />;
  if (!caseData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <GlassCard className="p-5">
          <CaseMetaGrid caseData={caseData} />
        </GlassCard>
      </div>
      <div>
        <GlassCard className="p-5 flex flex-col items-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Risk Score</p>
          <RiskGauge score={caseData.risk_score} />
        </GlassCard>
      </div>
    </div>
  );
}
