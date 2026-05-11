'use client';

import { formatDate } from '@/lib/utils';
import type { Case } from '@/types/case';

interface CaseMetaGridProps {
  caseData: Case;
}

export function CaseMetaGrid({ caseData }: CaseMetaGridProps) {
  const fields = [
    { label: 'Case ID', value: caseData.id.slice(0, 8).toUpperCase() },
    { label: 'Status', value: caseData.status },
    { label: 'Priority', value: caseData.priority },
    { label: 'Created', value: formatDate(caseData.created_at) },
    { label: 'Last Updated', value: formatDate(caseData.updated_at) },
    { label: 'Assigned To', value: caseData.assigned_to || 'Unassigned' },
    {
      label: 'Tags',
      value: caseData.tags?.join(', ') || 'None',
    },
    { label: 'Evidence Count', value: caseData.evidence?.length ?? 0 },
  ];

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Case Metadata
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm text-slate-200 font-medium capitalize">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
