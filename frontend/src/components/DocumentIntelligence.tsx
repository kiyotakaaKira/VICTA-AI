'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { useEvidence } from '@/hooks/useEvidence';

export default function DocumentIntelligence({ caseId }: { caseId: string }) {
  const { data: rows = [], isLoading } = useEvidence(caseId);
  const docs = rows.filter((ev: any) =>
    /pdf|document|text|csv|json/i.test(ev.type || '') || /\.(pdf|docx|csv|json|txt)$/i.test(ev.name || '')
  );

  return (
    <GlassCard className="p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white tracking-wide">Document intelligence</h3>
      {isLoading ? (
        <p className="text-xs text-slate-500">Indexing documentary corpus…</p>
      ) : docs.length === 0 ? (
        <p className="text-xs text-slate-600">No document-class artifacts on this case.</p>
      ) : (
        <ul className="space-y-3 text-xs text-slate-400">
          {docs.map((ev: any) => (
            <li key={ev.id} className="border border-white/5 rounded-lg p-3">
              <div className="text-slate-200">{ev.name}</div>
              <p className="mt-2 text-slate-500 line-clamp-4">{ev.analysis?.summary || 'Awaiting NLP extraction.'}</p>
              <div className="mt-2 flex gap-3 text-slate-600">
                <span>Risk {ev.risk_score ?? '—'}</span>
                <span>Authenticity {ev.authenticity_score ?? '—'}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
