'use client';

import { useState, useCallback } from 'react';
import { DropZone } from './DropZone';
import { EvidenceList } from './EvidenceList';
import { GlassCard } from '@/components/ui/GlassCard';

export function EvidenceUploader() {
  const [caseId, setCaseId] = useState('');
  const [refresh, setRefresh] = useState(0);

  const handleUploadComplete = useCallback(() => {
    setRefresh((r) => r + 1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Case selector */}
      <GlassCard className="p-4">
        <label className="text-sm font-medium text-slate-300 block mb-2">
          Case ID
        </label>
        <input
          id="evidence-case-id"
          type="text"
          placeholder="Enter case UUID to upload evidence..."
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
          className="w-full bg-forensic-bg border border-forensic-border rounded-lg px-4 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-forensic-cyan transition-colors"
        />
      </GlassCard>

      {/* Drop zone */}
      {caseId && (
        <DropZone caseId={caseId} onUploadComplete={handleUploadComplete} />
      )}

      {/* Evidence list */}
      {caseId && <EvidenceList key={refresh} caseId={caseId} />}

      {!caseId && (
        <GlassCard className="p-12 text-center">
          <p className="text-slate-500 text-sm">Enter a Case ID above to upload and manage evidence.</p>
        </GlassCard>
      )}
    </div>
  );
}
