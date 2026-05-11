'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { useTimeline } from '@/hooks/useTimeline';
import { formatDate } from '@/lib/utils';

export default function CausalCascade({ caseId }: { caseId: string }) {
  const { data: timeline = [], isLoading } = useTimeline(caseId);
  const sorted = [...timeline].sort(
    (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <GlassCard className="p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white tracking-wide">Causal cascade</h3>
      {isLoading ? (
        <p className="text-xs text-slate-500">Ordering causal ladder…</p>
      ) : sorted.length === 0 ? (
        <p className="text-xs text-slate-600">Timeline empty — cascade waits on operational events.</p>
      ) : (
        <div className="space-y-0">
          {sorted.map((ev: any, idx: number) => (
            <div key={ev.id || idx} className={idx ? 'cascade-branch cascade-animate border-l border-white/10 pl-4 ml-2 py-2' : 'py-2'}>
              <div className="text-xs text-slate-500">{formatDate(ev.timestamp)}</div>
              <div className="text-sm text-slate-200">{ev.title}</div>
              <div className="text-xs text-slate-500 mt-1">{ev.description}</div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
