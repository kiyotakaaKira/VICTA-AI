'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { useEvidence } from '@/hooks/useEvidence';

export default function EvidenceCorrelationMatrix({ caseId }: { caseId: string }) {
  const { data: rows = [], isLoading } = useEvidence(caseId);
  const types = Array.from(new Set(rows.map((r: any) => (r.type || 'unknown').split('/')[0])));

  const matrix: Record<string, Record<string, number>> = {};
  types.forEach((a) => {
    matrix[a] = {};
    types.forEach((b) => {
      matrix[a][b] = a === b ? rows.filter((r: any) => (r.type || '').startsWith(a)).length : Math.min(
        rows.filter((r: any) => (r.type || '').startsWith(a)).length,
        rows.filter((r: any) => (r.type || '').startsWith(b)).length
      );
    });
  });

  return (
    <GlassCard className="p-6 space-y-4 overflow-x-auto">
      <h3 className="text-sm font-semibold text-white tracking-wide">Evidence-type correlation</h3>
      {isLoading ? (
        <p className="text-xs text-slate-500">Computing co-occurrence…</p>
      ) : types.length === 0 ? (
        <p className="text-xs text-slate-600">No evidence rows to correlate.</p>
      ) : (
        <table className="text-xs text-slate-400 border-collapse">
          <thead>
            <tr>
              <th className="p-2" />
              {types.map((t) => (
                <th key={t} className="p-2 text-left text-slate-500">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {types.map((row) => (
              <tr key={row}>
                <td className="p-2 text-slate-500 font-medium">{row}</td>
                {types.map((col) => (
                  <td key={col} className="correlation-cell p-2 text-center text-slate-300">
                    {matrix[row][col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </GlassCard>
  );
}
