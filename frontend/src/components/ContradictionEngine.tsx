'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { useEvidence } from '@/hooks/useEvidence';
import { useTimeline } from '@/hooks/useTimeline';

export default function ContradictionEngine({ caseId }: { caseId: string }) {
  const { data: evidence = [] } = useEvidence(caseId);
  const { data: timeline = [] } = useTimeline(caseId);

  const pairs: { msg: string; severity: string }[] = [];
  evidence.forEach((ev: any) => {
    timeline.forEach((tl: any) => {
      const evRisk = ev.risk_score || 0;
      const tlSev = tl.severity;
      if (evRisk > 75 && (tlSev === 'low' || tlSev === 'medium')) {
        pairs.push({
          severity: 'high',
          msg: `High-risk artifact "${ev.name}" vs downstream timeline marked ${tlSev} (${tl.title}).`,
        });
      }
    });
  });

  return (
    <GlassCard className="p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white tracking-wide">Contradiction scan</h3>
      {pairs.length === 0 ? (
        <p className="text-xs text-slate-600">No statistical contradictions detected between evidence risk and timeline posture.</p>
      ) : (
        <ul className="space-y-2 text-xs">
          {pairs.slice(0, 12).map((p, i) => (
            <li key={i} className={`contradiction-card contradiction-${p.severity === 'high' ? 'high' : 'medium'} rounded-lg p-3 text-slate-300`}>
              {p.msg}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
