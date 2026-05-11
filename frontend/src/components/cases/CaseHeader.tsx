'use client';

import { useCase } from '@/hooks/useCase';
import { Badge } from '@/components/ui/badge';
import { RiskBar } from '@/components/ui/RiskBar';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatDate, getRiskLabel } from '@/lib/utils';
import { Calendar, User } from 'lucide-react';
import type { Priority, Status } from '@/lib/constants';

export function CaseHeader({ caseId }: { caseId: string }) {
  const { data: caseData, isLoading } = useCase(caseId);

  if (isLoading) return <LoadingSkeleton className="h-24 w-full" />;
  if (!caseData) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">{caseData.status}</Badge>
        <Badge variant="outline">{caseData.priority}</Badge>
        <Badge variant="destructive">
          Risk: {caseData.risk_score}
        </Badge>
      </div>
      <h1 className="text-2xl font-bold text-white">{caseData.title}</h1>
      {caseData.description && (
        <p className="text-slate-400 text-sm">{caseData.description}</p>
      )}
      <div className="flex items-center gap-6 text-sm text-slate-500">
        {caseData.created_by && (
          <div className="flex items-center gap-1.5">
            <User size={13} />
            <span>{caseData.created_by}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar size={13} />
          <span>{formatDate(caseData.created_at)}</span>
        </div>
      </div>
      <RiskBar score={caseData.risk_score} height={6} />
    </div>
  );
}
