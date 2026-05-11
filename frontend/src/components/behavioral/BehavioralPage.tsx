'use client';

import { motion } from 'framer-motion';
import { Brain, Activity, AlertTriangle, Target, Map } from 'lucide-react';
import { useBehavioralPatterns } from '@/hooks/useBehavioral';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

function AnomalyBar({ score, label }: { score: number; label: string }) {
  const color = score > 75 ? '#ef4444' : score > 50 ? '#f59e0b' : '#22d3ee';
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-mono" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function PatternCard({ pattern, index }: { pattern: any; index: number }) {
  const radarData = [
    { subject: 'Comm Freq', A: pattern.communication_frequency ?? 0 },
    { subject: 'Movement', A: Math.min(100, (pattern.movement_radius_km ?? 0) * 2) },
    { subject: 'Anomaly', A: pattern.anomaly_score ?? 0 },
    { subject: 'Risk', A: pattern.confidence ?? 0 },
    { subject: 'Linguistic', A: (pattern.linguistic_markers?.length ?? 0) * 20 },
  ];

  const clusterColors: Record<string, string> = {
    'high-risk': '#ef4444', 'medium-risk': '#f59e0b', 'low-risk': '#22d3ee',
    'surveillance': '#a855f7', 'unknown': '#64748b',
  };
  const clusterColor = clusterColors[pattern.behavioral_cluster] ?? '#22d3ee';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -2 }}
      className="rounded-xl border p-5 space-y-4"
      style={{ background: 'rgba(15,22,41,0.7)', borderColor: 'rgba(6,182,212,0.1)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{pattern.subject_id || 'Unknown Subject'}</p>
          <p className="text-xs font-mono text-slate-600 mt-0.5">{pattern.pattern_type?.replace(/_/g, ' ').toUpperCase() ?? 'BEHAVIORAL'}</p>
        </div>
        <div className="px-2 py-0.5 rounded-lg text-xs font-bold font-mono border"
          style={{ color: clusterColor, background: `${clusterColor}15`, borderColor: `${clusterColor}30` }}>
          {(pattern.behavioral_cluster ?? 'unknown').toUpperCase()}
        </div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
            <Radar dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.15} dot={false} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <AnomalyBar score={pattern.anomaly_score ?? 0} label="Anomaly Score" />
        <AnomalyBar score={pattern.confidence ?? 0} label="AI Confidence" />
      </div>

      {pattern.ai_summary && (
        <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-800 pt-3">
          {pattern.ai_summary}
        </p>
      )}

      {pattern.risk_indicators?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {pattern.risk_indicators.slice(0, 3).map((ri: string) => (
            <span key={ri} className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
              {ri}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function BehavioralPage() {
  const { data: patterns = [], isLoading } = useBehavioralPatterns();

  const highRisk = patterns.filter(p => p.anomaly_score > 70).length;
  const avgAnomaly = patterns.length > 0
    ? Math.round(patterns.reduce((s, p) => s + p.anomaly_score, 0) / patterns.length)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Brain size={18} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Behavioral Patterns</h1>
          <p className="text-xs text-slate-500 font-mono">AI BEHAVIORAL INTELLIGENCE ANALYSIS ENGINE · {patterns.length} SUBJECTS PROFILED</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Subjects Profiled', value: patterns.length, color: '#22d3ee', Icon: Brain },
          { label: 'High Risk', value: highRisk, color: '#ef4444', Icon: AlertTriangle },
          { label: 'Avg Anomaly Score', value: avgAnomaly, color: '#f59e0b', Icon: Activity },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="rounded-xl border p-4" style={{ background: `${color}06`, borderColor: `${color}18` }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} style={{ color }} />
              <span className="text-xs font-mono font-bold uppercase" style={{ color }}>{label}</span>
            </div>
            <p className="text-3xl font-bold font-mono" style={{ color }}>
              {isLoading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Patterns grid */}
      {isLoading && (
        <div className="h-48 flex items-center justify-center text-slate-600 font-mono text-sm">
          Analyzing behavioral datasets…
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patterns.length === 0 ? (
           // DEMO MODE SYNTHETIC PROFILES
           [1,2,3,4,5,6].map((i) => (
             <PatternCard key={i} index={i} pattern={{
               id: i,
               subject_id: `SUBJECT_DELTA_${i*124}`,
               pattern_type: i % 2 === 0 ? 'deceptive_comm' : 'anomaly_movement',
               behavioral_cluster: i % 3 === 0 ? 'high-risk' : i % 2 === 0 ? 'surveillance' : 'low-risk',
               anomaly_score: i % 3 === 0 ? 82 + i : 12 + i * 5,
               confidence: 91,
               communication_frequency: 70 - i * 5,
               movement_radius_km: i * 1.5,
               linguistic_markers: ['suspicious', 'avoidant', 'coded'],
               ai_summary: `Subject exhibits ${i % 3 === 0 ? 'significant' : 'minor'} deviation from baseline behavioral cluster. Signal analysis suggests ${i % 2 === 0 ? 'obfuscated' : 'direct'} interaction patterns.`,
               risk_indicators: i % 3 === 0 ? ['GEO_JUMP', 'STRESS_SPIKE', 'VPN_HOP'] : ['CONSISTENT']
             }} />
           ))
        ) : (
          patterns.map((p, i) => <PatternCard key={p.id} pattern={p} index={i} />)
        )}
      </div>
    </div>
  );
}
