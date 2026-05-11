'use client';

import { notFound, useParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { RiskBar } from '@/components/ui/RiskBar';
import { RiskGauge } from '@/components/cases/RiskGauge';
import { SeverityIcon } from '@/components/ui/SeverityIcon';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatDate, formatTimeAgo, getRiskColor, getRiskLabel, getBadgeVariant } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ArrowLeft, Calendar, User, FileText,
  Brain, GitBranch, Shield, AlertTriangle,
  Clock, Gauge, Lock, ScanSearch, BookOpen, Lightbulb, GitMerge, Network, TrendingUp,
  Database, Radio, Activity, Target
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Severity } from '@/lib/constants';
import { EVENT_TYPES } from '@/lib/constants';
import { useCase } from '@/hooks/useCase';
import { useEvidence } from '@/hooks/useEvidence';
import { useInsights } from '@/hooks/useInsights';
import { useTimeline } from '@/hooks/useTimeline';
import AnomalyDetector from '@/components/AnomalyDetector';
import ForensicReportGenerator from '@/components/ForensicReportGenerator';
import BehavioralAnalysis from '@/components/BehavioralAnalysis';
import DeepfakeDetector from '@/components/DeepfakeDetector';
import ChainOfCustody from '@/components/ChainOfCustody';
import DocumentIntelligence from '@/components/DocumentIntelligence';
import HypothesisEngine from '@/components/HypothesisEngine';
import ContradictionEngine from '@/components/ContradictionEngine';
import CausalCascade from '@/components/CausalCascade';
import EvidenceCorrelationMatrix from '@/components/EvidenceCorrelationMatrix';
import MetadataInspector from '@/components/MetadataInspector';
import LiveThreatScore from '@/components/LiveThreatScore';
import { KnowledgeGraph } from '@/components/graph/KnowledgeGraph';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';
const TABS = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'graph', label: 'Knowledge Graph', icon: Network },
  { id: 'evidence', label: 'Evidence', icon: FileText },
  { id: 'insights', label: 'AI Insights', icon: Brain },
  { id: 'timeline', label: 'Timeline', icon: GitBranch },
  { id: 'deepfake', label: 'Deepfake', icon: AlertTriangle },
  { id: 'behavioral', label: 'Behavioral', icon: User },
  { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'threat', label: 'Threat Score', icon: Gauge },
  { id: 'chain', label: 'Chain of Custody', icon: Lock },
  { id: 'metadata', label: 'Metadata', icon: ScanSearch },
  { id: 'documents', label: 'Doc Intelligence', icon: BookOpen },
  { id: 'hypotheses', label: 'Hypotheses', icon: Lightbulb },
  { id: 'contradictions', label: 'Contradictions', icon: GitMerge },
  { id: 'cascade', label: 'Causal Cascade', icon: TrendingUp },
  { id: 'correlations', label: 'Correlations', icon: Network },
];

export default function CaseDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : null;

  const { data: caseRow, isLoading, isError } = useCase(id);
  const setActiveCase = useKnowledgeStore(state => state.setActiveCase);
  
  useEffect(() => {
    if (id) setActiveCase(id);
  }, [id, setActiveCase]);

  const { data: evidenceFetched } = useEvidence(caseRow?.evidence === undefined ? id : null);
  const { data: insightsFetched } = useInsights(caseRow?.insights === undefined ? id : null);
  const { data: timelineFetched } = useTimeline(
    caseRow?.timeline_events === undefined ? id : null
  );

  const caseData = caseRow ?? undefined;
  const caseEvidence = caseRow?.evidence ?? evidenceFetched ?? [];
  const caseInsights = caseRow?.insights ?? insightsFetched ?? [];
  const caseTimeline = caseRow?.timeline_events ?? timelineFetched ?? [];

  const [activeTab, setActiveTab] = useState('overview');

  if (!id) return notFound();
  if (isLoading) {
    return (
      <PageWrapper>
        <div className="relative z-10 p-6 space-y-4">
          <CardSkeleton className="h-40" />
          <CardSkeleton className="h-64" />
        </div>
      </PageWrapper>
    );
  }
  if (isError || !caseData) return notFound();

  const riskColor = getRiskColor(caseData.risk_score);

  return (
    <PageWrapper>
      <div className="relative z-10 p-6 space-y-6">

        {/* Back nav */}
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          <ArrowLeft size={14} /> Back to Cases
        </Link>

        {/* Case header - Hero Style */}
        <GlassCard className="p-8 relative overflow-hidden min-h-[300px] flex flex-col justify-center bg-gradient-to-br from-cyan-500/5 to-transparent border-white/10">
          {/* Animated Background Pulse */}
          <motion.div 
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]"
          />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-black text-cyan-400 tracking-widest uppercase">
                  ACTIVE MISSION
                </div>
                <span className="text-[11px] font-mono text-slate-500">{caseData.id.toUpperCase()}</span>
                <Badge variant={getBadgeVariant(caseData.priority)}>{caseData.priority}</Badge>
              </div>
              
              <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
                {caseData.title}
              </h1>
              
              <p className="text-lg text-slate-400 leading-relaxed font-medium italic">
                "{caseData.description}"
              </p>

              <div className="flex flex-wrap items-center gap-8 text-xs text-slate-500 border-t border-white/5 pt-6">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-cyan-500" />
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Commanding Agent</p>
                    <p className="text-slate-300 font-bold uppercase">{caseData.assigned_to || 'UNASSIGNED'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-cyan-500" />
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Deployed On</p>
                    <p className="text-slate-300 font-bold uppercase">{formatDate(caseData.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-cyan-500" />
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Last Intel Refresh</p>
                    <p className="text-slate-300 font-bold uppercase">{formatTimeAgo(caseData.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 bg-black/40 p-8 rounded-3xl border border-white/5 backdrop-blur-md flex flex-col items-center gap-4 shadow-2xl">
              <RiskGauge score={caseData.risk_score} />
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Risk Posture</p>
                <p className="text-xs font-bold uppercase" style={{ color: riskColor }}>
                  {getRiskLabel(caseData.risk_score)} SEVERITY
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Tabs */}
        <div className="border-b border-forensic-border flex gap-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative',
                activeTab === id
                  ? 'text-forensic-cyan'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon size={14} />
              {label}
              {id === 'insights' && caseInsights.length > 0 && (
                <span className="badge badge-critical" style={{ fontSize: 9, padding: '1px 5px' }}>
                  {caseInsights.length}
                </span>
              )}
              {activeTab === id && (
                <motion.div
                  layoutId="case-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-forensic-cyan rounded-t"
                  style={{ boxShadow: '0 0 8px rgba(6,182,212,0.8)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatedTabContent activeTab={activeTab} caseData={caseData} caseEvidence={caseEvidence} caseInsights={caseInsights} caseTimeline={caseTimeline} />

      </div>
    </PageWrapper>
  );
}

function AnimatedTabContent({ activeTab, caseData, caseEvidence, caseInsights, caseTimeline }: any) {
  const riskColor = getRiskColor(caseData.risk_score);

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 md:col-span-2">
            <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-6">Mission Intelligence Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { label: 'Intelligence Hash', value: 'SHA-256: F8A2...9B1C', icon: Database },
                { label: 'Active Witnesses', value: '4 Confirmed', icon: User },
                { label: 'Signal Intercepts', value: '18 Bursts', icon: Radio },
                { label: 'Priority Level', value: caseData.priority, icon: Target },
                { label: 'Forensic Status', value: caseData.status, icon: Activity },
                { label: 'Neural Confidence', value: '94.8%', icon: Brain },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Icon size={12} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
                  </div>
                  <p className="text-sm text-slate-200 font-black uppercase tracking-tight">{String(value)}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-6 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
              <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-widest">Executive Summary</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {caseData.description} This operation is currently in a critical analysis phase. 
                Initial forensic sweeps have identified multiple cross-border signal patterns matching 
                the {caseData.tags?.[0]} signature. Command is advised to monitor all real-time intercepts.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-[#EF4444]/5 border-[#EF4444]/10">
            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-6">Threat Assessment Report</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-none">{getRiskLabel(caseData.risk_score)} RISK</p>
                  <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest mt-1">High Threat Posture</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-red-500/10">
                {caseInsights.slice(0, 3).map((ins: any) => (
                  <div key={ins.id} className="flex gap-3 items-start group">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <div className="flex-1">
                      <p className="text-[11px] text-slate-300 font-bold leading-tight mb-1">{ins.title}</p>
                      <p className="text-[10px] text-slate-500 leading-snug">{ins.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* GRAPH */}
      {activeTab === 'graph' && (
        <div className="h-[800px] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <KnowledgeGraph />
        </div>
      )}

      {/* EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseEvidence.length === 0 ? (
            <GlassCard className="p-8 col-span-full text-center">
              <p className="text-slate-600 text-sm">No evidence uploaded for this case.</p>
            </GlassCard>
          ) : (
            caseEvidence.map((ev: any, i: number) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <GlassCard className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-forensic-surface flex items-center justify-center border border-forensic-border">
                      <FileText size={16} className="text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{ev.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{ev.type}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: getRiskColor(ev.risk_score) }}>
                        Risk: {ev.risk_score}
                      </p>
                      <p className="text-xs text-green-400">Auth: {ev.authenticity_score}%</p>
                    </div>
                  </div>
                  <RiskBar score={ev.risk_score} height={4} />
                  {ev.analysis?.summary && (
                    <p className="text-xs text-slate-500 line-clamp-3 border-t border-forensic-border pt-2">
                      {ev.analysis.summary}
                    </p>
                  )}
                  {ev.analysis?.suspicious_indicators?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Indicators</p>
                      <ul className="space-y-0.5">
                        {ev.analysis.suspicious_indicators.slice(0, 2).map((ind: string, j: number) => (
                          <li key={j} className="text-xs text-slate-600 flex gap-1.5">
                            <span className="text-red-400 flex-shrink-0">•</span> {ind}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="space-y-3">
          {caseInsights.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-slate-600 text-sm">No AI insights yet. Analyze evidence to generate insights.</p>
            </GlassCard>
          ) : (
            caseInsights.map((ins: any, i: number) => (
              <motion.div key={ins.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <GlassCard className="p-4" style={{ borderLeft: `3px solid ${ins.severity === 'critical' ? '#ef4444' : ins.severity === 'high' ? '#f97316' : '#06b6d4'}` }}>
                  <div className="flex items-start gap-3">
                    <SeverityIcon severity={ins.severity as Severity} size={16} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">{ins.title}</p>
                      <p className="text-xs text-slate-400">{ins.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                        <span className="font-mono text-forensic-cyan/50">{ins.source}</span>
                        <span>·</span>
                        <span>{formatTimeAgo(ins.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="relative space-y-0 pl-12">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-forensic-border" />
          {caseTimeline.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-slate-600 text-sm">No timeline events for this case.</p>
            </GlassCard>
          ) : (
            caseTimeline.map((ev: any, i: number) => {
              const cfg =
                EVENT_TYPES[(ev.type || 'digital') as keyof typeof EVENT_TYPES] || EVENT_TYPES.digital;
              return (
                <motion.div key={ev.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="pb-4">
                  <div
                    className="absolute left-[13px] w-8 h-8 rounded-full ring-4 ring-forensic-bg flex items-center justify-center"
                    style={{ backgroundColor: `${cfg.color}20`, border: `2px solid ${cfg.color}60` }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                  </div>
                  <GlassCard className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{ev.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ color: cfg.color, backgroundColor: `${cfg.color}15` }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-slate-600">
                      <span>{formatDate(ev.timestamp)}</span>
                      <span>Confidence: {ev.confidence_score ?? ev.confidence ?? '—'}%</span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* NEW SENTINEL/9 TACTICAL TABS */}
      {activeTab === 'deepfake' && (
        <GlassCard className="p-6">
          <DeepfakeDetector caseId={caseData.id} onScanComplete={() => {}} />
        </GlassCard>
      )}

      {activeTab === 'behavioral' && (
        <GlassCard className="p-6">
          <BehavioralAnalysis caseId={caseData.id} caseData={caseData} />
        </GlassCard>
      )}

      {activeTab === 'anomalies' && (
        <GlassCard className="p-6">
          <AnomalyDetector caseId={caseData.id} evidence={caseEvidence} timeline={caseTimeline} />
        </GlassCard>
      )}

      {activeTab === 'report' && (
        <ForensicReportGenerator caseId={caseData.id} caseData={caseData} evidence={caseEvidence} insights={caseInsights} timeline={caseTimeline} />
      )}

      {activeTab === 'threat' && (
        <LiveThreatScore caseId={caseData.id as string} />
      )}
      {activeTab === 'chain' && (
        <ChainOfCustody caseId={caseData.id as string} />
      )}
      {activeTab === 'metadata' && (
        <MetadataInspector caseId={caseData.id as string} />
      )}
      {activeTab === 'documents' && (
        <DocumentIntelligence caseId={caseData.id as string} />
      )}
      {activeTab === 'hypotheses' && (
        <HypothesisEngine caseId={caseData.id as string} />
      )}
      {activeTab === 'contradictions' && (
        <ContradictionEngine caseId={caseData.id as string} />
      )}
      {activeTab === 'cascade' && (
        <CausalCascade caseId={caseData.id as string} />
      )}
      {activeTab === 'correlations' && (
        <EvidenceCorrelationMatrix caseId={caseData.id as string} />
      )}
    </motion.div>
  );
}
