'use client';

import { SeverityIcon } from '@/components/ui/SeverityIcon';
import { formatTimeAgo } from '@/lib/utils';
import type { Insight } from '@/types/insight';
import type { Severity } from '@/lib/constants';
import { SEVERITY_COLORS } from '@/lib/constants';

interface InsightItemProps {
  insight: Insight;
}

export function InsightItem({ insight }: InsightItemProps) {
  const colors = SEVERITY_COLORS[insight.severity as Severity] || SEVERITY_COLORS.info;

  return (
    <div
      className="flex gap-3 p-3 rounded-lg hover:bg-white/3 transition-colors"
      style={{ borderLeft: `3px solid ${colors.text}` }}
    >
      <SeverityIcon severity={insight.severity as Severity} size={15} className="mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-200 font-medium line-clamp-1">{insight.title}</p>
        {insight.description && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{insight.description}</p>
        )}
        <p className="text-xs text-slate-600 mt-1">{formatTimeAgo(insight.created_at)}</p>
      </div>
    </div>
  );
}
