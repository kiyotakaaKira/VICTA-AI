'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip 
} from 'recharts';
import { AlertTriangle, Activity, Database, FlaskConical, ShieldAlert, Zap, Brain } from 'lucide-react';
import { TOX_CHART_DATA, DETECTED_COMPOUNDS } from '@/lib/demoToxData';

export function ToxicologyModeler() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em] mb-1">Neural Toxicology Suite</h3>
        <h1 className="text-3xl font-black text-white tracking-tight">Toxicology Modeler</h1>
        <p className="text-sm text-slate-500 mt-1">AI-driven metabolic reconstruction and pharmacokinetic clearance modeling</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pharmacokinetic Profile (Chart) */}
        <div className="lg:col-span-7">
          <GlassCard className="p-8 h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pharmacokinetic Profile</p>
                <h2 className="text-xl font-bold text-white tracking-tight">Substance Clearance · Multi-Compartment</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alpha</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Beta</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gamma</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TOX_CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 80]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0F1C', border: '1px solid #ffffff10', fontSize: '10px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="c1" 
                    stroke="#22d3ee" 
                    strokeWidth={2} 
                    dot={false}
                    animationDuration={2000}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="c2" 
                    stroke="#6366f1" 
                    strokeWidth={2} 
                    dot={false}
                    animationDuration={2500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="c3" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    dot={false}
                    animationDuration={3000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Substance Reconstruction (List) */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-8 h-full flex flex-col">
            <div className="mb-8">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Substance Reconstruction</p>
              <h2 className="text-xl font-bold text-white tracking-tight">Detected Compounds</h2>
            </div>

            <div className="flex-1 space-y-6">
              {DETECTED_COMPOUNDS.map((item, idx) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-300">{item.name}</span>
                    <span className="text-xs font-black" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Lethal Alert */}
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-4 items-center">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Lethality Alert</p>
                <p className="text-xs text-slate-300 leading-snug">
                  Ethylene glycol concentration projected to exceed lethal threshold at T+4h. Immediate medical intervention required.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Analysis Section (Restored Previous Functionality) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-8 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="w-4 h-4 text-cyan-500" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Laboratory Report Ingest</p>
          </div>
          <textarea
            placeholder="Paste toxicology narrative, lab values, or ME summary here (min. 20 characters)..."
            rows={6}
            className="w-full bg-[#050810] border border-white/5 rounded-2xl px-4 py-4 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none font-mono selection:bg-cyan-500/30 transition-all"
          />
          <button className="w-full py-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 text-xs font-black uppercase tracking-[0.2em] hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            Run Neural Forensic Analysis
          </button>
        </GlassCard>

        <GlassCard className="p-8 space-y-4 border-l-4 border-l-cyan-500">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-cyan-500" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Reasoning & Interpretation</p>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed italic">
              "Metabolic reconstruction suggests acute ingestion approximately 3.5 hours prior to sample collection. 
              Substance S-93 matches the signature of ethylene glycol, currently peaking in the hepatic compartment. 
              Confidence rating: 98.2%."
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-slate-500">TAG: ACUTE_TOX</span>
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-slate-500">TAG: ETHYLENE_GLYCOL</span>
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-slate-500">TAG: LETHAL_PROJECTION</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Lab Ingest Footer */}
      <GlassCard className="p-6 bg-white/[0.02]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <Database className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Laboratory Ingest Protocol</p>
              <p className="text-xs text-slate-500">Awaiting raw spectral data or ME report excerpt for refinement.</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
            Initiate Forensic Sweep
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

