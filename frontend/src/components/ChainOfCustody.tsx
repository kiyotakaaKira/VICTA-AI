'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { useEvidence } from '@/hooks/useEvidence';

export default function ChainOfCustody({ caseId }: { caseId: string }) {
  const { data: rows = [], isLoading } = useEvidence(caseId);

  return (
    <GlassCard className="p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white tracking-wide">Chain of custody</h3>
      {isLoading ? (
        <p className="text-xs text-slate-500">Loading evidence custody ledger…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-slate-600">No evidence rows linked — ingest artifacts to populate custody nodes.</p>
      ) : (
        <ul className="space-y-3 text-xs text-slate-400">
          {rows.map((ev: any) => {
            const meta = ev.metadata_json || ev.metadata || {};
            const hash = ev.hash_sha256 || meta.sha256 || ev.analysis?.hash;
            return (
              <li key={ev.id} className="border border-white/5 rounded-lg p-3">
                <div className="text-slate-200 font-medium">{ev.title || ev.name}</div>
                <div className="hash-text mt-1">{hash ? hash : 'hash pending ingest'}</div>
                <div className="mt-2 text-slate-500">
                  {meta.custodian && <span>Custodian {meta.custodian} · </span>}
                  {meta.chain_step && <span>Stage {meta.chain_step}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
