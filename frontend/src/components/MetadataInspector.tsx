'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { useEvidence } from '@/hooks/useEvidence';

export default function MetadataInspector({ caseId }: { caseId: string }) {
  const { data: rows = [], isLoading } = useEvidence(caseId);

  return (
    <GlassCard className="p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white tracking-wide">Aggregate metadata</h3>
      {isLoading ? (
        <p className="text-xs text-slate-500">Pulling structured envelopes…</p>
      ) : (
        <pre className="text-[11px] leading-relaxed text-slate-400 overflow-auto max-h-[420px] p-3 rounded-lg bg-black/40 border border-white/5">
          {JSON.stringify(
            rows.map((ev: any) => ({
              id: ev.id,
              type: ev.type,
              metadata_json: ev.metadata_json || ev.metadata || {},
              analysis_meta: ev.analysis?.pipeline_metadata || ev.analysis,
            })),
            null,
            2
          )}
        </pre>
      )}
    </GlassCard>
  );
}
