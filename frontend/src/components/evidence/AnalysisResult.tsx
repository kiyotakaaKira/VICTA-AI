'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import type { EvidenceAnalysis } from '@/types/evidence';
import { getRiskColor, getRiskLabel } from '@/lib/utils';
import { SeverityIcon } from '@/components/ui/SeverityIcon';
import { RiskBar } from '@/components/ui/RiskBar';

interface AnalysisResultProps {
  analysis: EvidenceAnalysis;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const riskLabel = getRiskLabel(analysis.risk_score);
  const riskColor = getRiskColor(analysis.risk_score);

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">AI Analysis Result</h3>
        <div className="flex items-center gap-1.5">
          <SeverityIcon severity={riskLabel as any} size={14} />
          <span className="text-xs font-medium capitalize" style={{ color: riskColor }}>
            {riskLabel} Risk
          </span>
        </div>
      </div>

      <p className="text-sm text-slate-300">{analysis.summary}</p>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Risk Score</span>
          <span className="text-slate-300">{analysis.risk_score}/100</span>
        </div>
        <RiskBar score={analysis.risk_score} />
      </div>

      {analysis.suspicious_indicators.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Suspicious Indicators</p>
          <ul className="space-y-1">
            {analysis.suspicious_indicators.map((indicator, i) => (
              <li key={i} className="text-xs text-slate-400 flex gap-2">
                <span className="text-red-400">•</span> {indicator}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.recommended_actions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Recommended Actions</p>
          <ul className="space-y-1">
            {analysis.recommended_actions.map((action, i) => (
              <li key={i} className="text-xs text-slate-400 flex gap-2">
                <span className="text-forensic-cyan">→</span> {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between text-xs text-slate-500 border-t border-forensic-border pt-3">
        <span>Confidence: <span className="text-slate-300">{analysis.confidence}%</span></span>
        <span>Authenticity: <span className="text-slate-300">{analysis.authenticity_score}%</span></span>
      </div>
    </GlassCard>
  );
}
