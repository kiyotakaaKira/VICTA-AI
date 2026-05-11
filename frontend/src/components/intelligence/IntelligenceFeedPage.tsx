'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, Shield, AlertTriangle, Cpu, Zap, Eye, Target, 
  Activity, Terminal, TrendingUp, Search, Layers, Brain 
} from 'lucide-react';
import { demoEngine } from '@/lib/demoRealtimeEngine';
import { 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// --- Sub-Components ---

function Sparkline({ color, data }: { color: string, data: any[] }) {
  return (
    <div className="h-8 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area 
            type="monotone" 
            dataKey="v" 
            stroke={color} 
            fill={`${color}20`} 
            strokeWidth={1.5} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TacticalStat({ label, value, sub, color, data }: any) {
  return (
    <div className="bg-[#0A0F1C]/80 border border-white/5 rounded-2xl p-4 flex flex-col justify-between group hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: color }} />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white tracking-tighter">{value}</span>
        {sub && <span className="text-[10px] font-mono mb-1.5" style={{ color }}>{sub}</span>}
      </div>
      <Sparkline color={color} data={data} />
    </div>
  );
}

const CATEGORY_MAP: any = {
  signals: { icon: Radio, label: 'SIGINT', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  surveillance: { icon: Eye, label: 'GEO-FENCE', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  biometric: { icon: Shield, label: 'TOXICOLOGY', color: 'text-red-400', bg: 'bg-red-400/10' },
  forensic: { icon: AlertTriangle, label: 'ANOMALY', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
};

function InvestigationCard({ event }: { event: any }) {
  const cfg = CATEGORY_MAP[event.category] || CATEGORY_MAP.forensic;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 border border-white/5 rounded-xl p-4 group hover:bg-white/[0.07] transition-all"
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${cfg.bg}`}>
          <Icon className={`w-4 h-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
            <span className="text-[9px] font-mono text-slate-500">AI · {Math.round(event.confidence)}% CONFIDENCE</span>
          </div>
          <h4 className="text-sm font-bold text-slate-200 mb-1">{event.title}</h4>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{event.message}</p>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Page ---

export default function IntelligenceFeedPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Sparkline data generation
  const [sparkData] = useState(() => Array.from({ length: 4 }).map(() => 
    Array.from({ length: 15 }, () => ({ v: 30 + Math.random() * 40 }))
  ));

  useEffect(() => {
    const unsub = demoEngine.subscribe(({ type, payload }) => {
      if (type === 'RAW_LOG_TICK') {
        setLogs(prev => [...prev.slice(-15), payload]);
      }
      if (type === 'INTELLIGENCE_FEED') {
        setEvents(prev => [payload, ...prev.slice(0, 10)]);
      }
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h3 className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.3em] mb-1">AI Forensic Stream · Live</h3>
        <h1 className="text-3xl font-black text-white tracking-tight">Intelligence Feed</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time AI-generated insights, anomaly detections, and pathway recommendations</p>
      </div>

      {/* Tactical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TacticalStat label="Stream Rate" value="48" sub="ev/s" color="#6366f1" data={sparkData[0]} />
        <TacticalStat label="AI Insights · 24h" value="1,290" sub="+22.7%" color="#22d3ee" data={sparkData[1]} />
        <TacticalStat label="Anomalies" value="63" sub="+8" color="#ef4444" data={sparkData[2]} />
        <TacticalStat label="Predictive Score" value="0.07" sub="ε stable" color="#f59e0b" data={sparkData[3]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tactical Terminal */}
        <div className="lg:col-span-7 bg-[#050810] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[550px]">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Connected</span>
            </div>
          </div>
          <div 
            ref={terminalRef}
            className="flex-1 p-6 font-mono text-[11px] space-y-1.5 overflow-y-auto scrollbar-hide selection:bg-cyan-500/30"
          >
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 group">
                <span className="text-slate-600 shrink-0">{log.timestamp}</span>
                <span className={`font-bold w-10 ${log.color}`}>{log.tag}</span>
                <span className="text-slate-400">─</span>
                <span className="text-slate-300 group-hover:text-white transition-colors">{log.msg}</span>
              </div>
            ))}
            <motion.div 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-cyan-500 inline-block align-middle ml-1"
            />
          </div>
        </div>

        {/* Investigation Stream */}
        <div className="lg:col-span-5 flex flex-col h-[550px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Live Intelligence</h3>
              <h2 className="text-lg font-bold text-white tracking-tight">Investigation Stream</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Streaming</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {events.map((ev) => (
                <InvestigationCard key={ev.id} event={ev} />
              ))}
            </AnimatePresence>
            
            {events.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50 h-full">
                <Brain className="w-12 h-12 stroke-[1]" />
                <p className="text-xs font-medium uppercase tracking-widest">Awaiting Neural Signals...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
