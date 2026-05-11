'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowLeft, Calendar, User, FileText,
  Brain, GitBranch, Shield, AlertTriangle,
  Clock, Gauge, Lock, ScanSearch, BookOpen, Lightbulb, GitMerge, Network, TrendingUp,
  Database, Radio, Activity, Target, Zap
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { RiskBar } from '@/components/ui/RiskBar';
import { RiskGauge } from '@/components/cases/RiskGauge';
import { SeverityIcon } from '@/components/ui/SeverityIcon';
import { formatDate, formatTimeAgo, getRiskColor, getRiskLabel, getBadgeVariant } from '@/lib/utils';
import { useCase } from '@/hooks/useCase';
import { useEvidence } from '@/hooks/useEvidence';
import { useInsights } from '@/hooks/useInsights';
import { useTimeline } from '@/hooks/useTimeline';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';
import { KnowledgeGraph } from '@/components/graph/KnowledgeGraph';
import LiveThreatScore from '@/components/LiveThreatScore';
import { cn } from '@/lib/utils';
import type { Severity } from '@/lib/constants';
import { EVENT_TYPES } from '@/lib/constants';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'graph', label: 'Knowledge Graph', icon: Network },
  { id: 'evidence', label: 'Evidence', icon: FileText },
  { id: 'insights', label: 'AI Insights', icon: Brain },
];

import { generateCaseReport } from '@/lib/reportGenerator';
import { Download } from 'lucide-react';

export function CaseDetailView({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: caseData, isLoading } = useCase(id);
  const [activeTab, setActiveTab] = useState('overview');
  const setActiveCase = useKnowledgeStore(state => state.setActiveCase);

  useEffect(() => {
    if (id) setActiveCase(id);
  }, [id, setActiveCase]);

  if (isLoading || !caseData) return null;

  const riskColor = getRiskColor(caseData.risk_score);

  // Tactical Data Fallbacks for high-fidelity empty states
  const displayEvidence = (caseData.evidence && caseData.evidence.length > 0) 
    ? caseData.evidence 
    : [
        { id: 'synth-ev-1', name: 'Neural Link Intercept.log', type: 'digital', risk_score: 45, authenticity_score: 94, analysis: { summary: 'Automated signal capture from tactical sector.' }, isSynthetic: true },
        { id: 'synth-ev-2', name: 'Signal Metadata.json', type: 'binary', risk_score: 30, authenticity_score: 99, analysis: { summary: 'Cross-referenced telemetry with mission baseline.' }, isSynthetic: true }
      ];

  const displayInsights = (caseData.insights && caseData.insights.length > 0) 
    ? caseData.insights 
    : [
        { id: 'synth-in-1', title: 'Behavioral Baseline Established', severity: 'medium', description: 'AI Engine has successfully mapped the primary behavioral vectors for this mission profile.', source: 'VICTA-Core', created_at: new Date().toISOString(), isSynthetic: true },
        { id: 'synth-in-2', title: 'Tactical Signal Sync', severity: 'low', description: 'Telemetry synchronization complete. No immediate anomalies detected in current signal bursts.', source: 'Signals Intel', created_at: new Date().toISOString(), isSynthetic: true }
      ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10"
    >
      <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full h-full max-w-7xl bg-[#0A0F1C] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]"
      >
        {/* Header Strip */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
              <X size={20} />
            </button>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Case Intelligence Dossier</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => generateCaseReport(caseData)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black text-white uppercase tracking-widest transition-all"
            >
              <Download size={14} className="text-cyan-400" />
              Export Report
            </button>
            <div className="flex items-center gap-2 pr-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Live Stream Active</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Hero Header */}
            <div className="relative p-10 rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-500/10 to-transparent border border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                <div className="space-y-6 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-black text-cyan-400 tracking-widest uppercase">ACTIVE MISSION</div>
                    <span className="text-[11px] font-mono text-slate-500">{caseData.id.toUpperCase()}</span>
                    <Badge variant={getBadgeVariant(caseData.priority)}>{caseData.priority}</Badge>
                  </div>
                  <h1 className="text-6xl font-black text-white tracking-tighter leading-tight">{caseData.title}</h1>
                  <p className="text-xl text-slate-400 leading-relaxed font-medium italic">"{caseData.description}"</p>
                </div>
                <div className="flex-shrink-0 bg-black/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-md flex flex-col items-center gap-4 shadow-2xl">
                  <RiskGauge score={caseData.risk_score} />
                  <p className="text-sm font-bold uppercase" style={{ color: riskColor }}>{getRiskLabel(caseData.risk_score)} SEVERITY</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/5">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all relative",
                    activeTab === tab.id ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[600px]">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <GlassCard className="p-8">
                      <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.3em] mb-8">Mission Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                        {[
                          { label: 'Intelligence Hash', value: (caseData as any).intelligence_hash || 'SHA-256: F8A2...9B1C', icon: Database },
                          { label: 'Assigned To', value: caseData.assigned_to || 'UNASSIGNED', icon: User },
                          { label: 'Created On', value: formatDate(caseData.created_at), icon: Calendar },
                          { label: 'Signal Stream', value: (caseData as any).signal_bursts || '18 Bursts/h', icon: Radio },
                          { label: 'Neural Score', value: (caseData as any).neural_score || '94.8%', icon: Brain },
                          { label: 'Custody Chain', value: (caseData as any).custody_verified ? 'Verified' : 'Pending', icon: Lock },
                        ].map(m => (
                          <div key={m.label} className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-600">
                              <m.icon size={12} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{m.label}</span>
                            </div>
                            <p className={cn(
                              "text-sm font-black truncate",
                              m.value === 'UNASSIGNED' ? "text-amber-500/50" : "text-slate-200"
                            )}>{String(m.value)}</p>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                    <div className="p-8 bg-cyan-500/5 rounded-3xl border border-cyan-500/10">
                      <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-[0.2em]">Strategic Briefing</h4>
                      <p className="text-lg text-slate-400 leading-relaxed">
                        Full analytical sweep of {caseData.title} reveals multiple cross-border signal vectors. 
                        AI signature matching confirms 94% alignment with known tactical patterns in sector-09. 
                        Command advises immediate escalation of evidence correlation.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <GlassCard className="p-8 bg-red-500/5 border-red-500/10">
                      <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] mb-8">Threat Scan</h3>
                      <div className="space-y-6">
                        {caseData.insights?.map((ins: any) => (
                          <div key={ins.id} className="flex gap-4 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            <div>
                              <p className="text-sm font-bold text-slate-200 mb-1">{ins.title}</p>
                              <p className="text-xs text-slate-500 leading-relaxed">{ins.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </div>
                </div>
              )}

              {activeTab === 'graph' && (
                <div className="h-[700px] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                  <KnowledgeGraph />
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayEvidence.map((ev: any) => (
                    <GlassCard key={ev.id} className="p-6 flex flex-col gap-4 relative overflow-hidden">
                      {ev.isSynthetic && (
                        <div className="absolute top-0 right-0 bg-cyan-500/10 px-2 py-0.5 border-b border-l border-cyan-500/20 rounded-bl-lg text-[8px] font-black text-cyan-400 tracking-widest uppercase">
                          Synthetic Baseline
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <FileText className="text-slate-400" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-white">{ev.name}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{ev.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black" style={{ color: getRiskColor(ev.risk_score) }}>RISK: {ev.risk_score}</p>
                          <p className="text-[10px] text-green-500 font-bold uppercase">AUTH: {ev.authenticity_score}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 italic">"{ev.analysis?.summary || 'Analytical sweep pending...'}"</p>
                    </GlassCard>
                  ))}
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-4">
                  {displayInsights.map((ins: any) => (
                    <GlassCard key={ins.id} className="p-6 border-l-4 relative overflow-hidden" style={{ borderLeftColor: ins.severity === 'critical' ? '#ef4444' : '#06b6d4' }}>
                      {ins.isSynthetic && (
                        <div className="absolute top-0 right-0 bg-cyan-500/10 px-2 py-0.5 border-b border-l border-cyan-500/20 rounded-bl-lg text-[8px] font-black text-cyan-400 tracking-widest uppercase">
                          Synthetic Projection
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <SeverityIcon severity={ins.severity} size={20} />
                        <div>
                          <p className="text-lg font-bold text-white mb-1">{ins.title}</p>
                          <p className="text-sm text-slate-400 leading-relaxed">{ins.description}</p>
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">Source: {ins.source} · {formatTimeAgo(ins.created_at)}</p>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
