'use client';

import { getRiskColor } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface AuthenticityScoreProps {
  score: number;
}

export function AuthenticityScore({ score }: AuthenticityScoreProps) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  const label = score >= 80 ? 'Authentic' : score >= 60 ? 'Suspicious' : 'Likely Tampered';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-forensic-border bg-forensic-surface/50">
      <Shield size={20} style={{ color }} />
      <div>
        <p className="text-xs text-slate-500">Authenticity</p>
        <p className="text-sm font-semibold" style={{ color }}>{score}% — {label}</p>
      </div>
    </div>
  );
}
