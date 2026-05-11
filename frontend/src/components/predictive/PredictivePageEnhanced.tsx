'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { PATHWAY_STATS, ENGINE_METRICS, DETAILED_RECOMMENDATIONS } from '@/lib/demoPredictiveData';
import { 
  Camera, Wifi, Layers, Map, Waves, ScanLine, 
  Search, ShieldCheck, Activity, Cpu, Bot, Send, X,
  ChevronDown
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

const ICON_MAP: Record<string, any> = {
  camera: Camera,
  wifi: Wifi,
  layers: Layers,
  map: Map,
  waves: Waves,
  scan: ScanLine
};

function PathwayCard({ stat }: { stat: any }) {
  const sparkData = Array.from({ length: 20 }).map((_, i) => ({
    v: 10 + Math.sin(i / 2) * 5 + Math.random() * 5
  }));

  return (
    <GlassCard className="p-6 relative overflow-hidden group">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Search size={18} style={{ color: stat.color }} />
          </div>
          {stat.change && <span className="text-[10px] font-black text-indigo-500">{stat.change}</span>}
          {stat.status && <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.status}</span>}
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
        <p className="text-4xl font-black text-white tracking-tighter mb-4">{stat.value}</p>
        <div className="mt-auto h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={`grad-${stat.label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={stat.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={stat.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={stat.color} fill={`url(#grad-${stat.label})`} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}

function EnginePosture() {
  return (
    <GlassCard className="p-8">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ENGINE POSTURE</p>
      <h3 className="text-2xl font-black text-white tracking-tight mb-8">Inference Confidence</h3>
      
      <div className="relative w-48 h-48 mx-auto mb-10">
        <svg className="w-full h-full -rotate-90">
          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-white/5" />
          <circle cx="96" cy="96" r="80" stroke="#6366F1" strokeWidth="16" fill="transparent" strokeDasharray={502.4} strokeDashoffset={502.4 * (1 - 0.94)} className="text-indigo-500" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MODEL</span>
          <span className="text-5xl font-black text-white tracking-tighter">94%</span>
        </div>
      </div>

      <div className="space-y-6">
        {ENGINE_METRICS.map(m => (
          <div key={m.label} className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-400">{m.label}</span>
              <span style={{ color: m.color }}>{m.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${m.value}%` }} className="h-full rounded-full" style={{ backgroundColor: m.color }} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function RecommendationCard({ rec, index, onExecute }: { rec: any; index: number; onExecute: (r: any) => void }) {
  const Icon = ICON_MAP[rec.icon] || Cpu;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <GlassCard className="p-6 space-y-5 group relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Icon size={18} style={{ color: rec.color }} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{rec.category}</span>
        </div>
        <div>
          <h4 className="text-lg font-bold text-white leading-snug mb-1">{rec.action}</h4>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{rec.context}</p>
        </div>
        <div className="space-y-2">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${rec.probability}%` }} className="h-full rounded-full" style={{ backgroundColor: rec.color }} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-600">P · {rec.probability}%</span>
            <button 
              onClick={() => onExecute(rec)}
              className="px-3 py-1.5 border border-indigo-500/30 rounded-lg text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-500 hover:text-black transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              EXECUTE →
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function ExecutionHUD({ rec, onClose }: { rec: any; onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8"
    >
      <GlassCard className="w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden border-indigo-500/30 shadow-[0_0_100px_rgba(99,102,241,0.2)]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">MISSION_EXECUTION_HUD // ACTIVE</p>
              <h3 className="text-2xl font-black text-white tracking-tight">{rec.action}</h3>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-12">
          <div className="col-span-8 p-8 relative border-r border-white/5">
             <div className="w-full h-full rounded-2xl bg-black border border-white/5 overflow-hidden relative shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 animate-pulse" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="w-32 h-32 rounded-full border border-indigo-500/20 flex items-center justify-center">
                     <ScanLine size={48} className="text-indigo-500/40" />
                   </motion.div>
                   <p className="text-[10px] text-indigo-500/60 font-black uppercase tracking-[0.5em] mt-6 animate-pulse">NEURAL_VIDEO_STREAM_ACTIVE</p>
                </div>
                
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                   <div className="px-3 py-1 bg-black/60 border border-indigo-500/30 rounded text-[10px] font-mono text-indigo-400 font-bold">REC ● 00:24:19:12</div>
                   <div className="px-3 py-1 bg-black/60 border border-white/10 rounded text-[10px] font-mono text-slate-400">FRAME_CONSISTENCY: 99.4%</div>
                </div>

                <div className="absolute bottom-6 right-6 w-48 space-y-2">
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Target Acquisition</p>
                   <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} className="h-full bg-indigo-500" />
                   </div>
                </div>

                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,128,0.06))] bg-[length:100%_2px,3px_100%]" />
             </div>
          </div>

          <div className="col-span-4 p-8 space-y-8 bg-white/[0.01]">
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">FORENSIC TELEMETRY</p>
                <div className="space-y-4">
                   {[
                     { label: 'Signal Density', value: '4.2 TB/s', color: '#6366F1' },
                     { label: 'Neural Latency', value: '12ms', color: '#22D3EE' },
                     { label: 'Packet Integrity', value: '99.98%', color: '#10B981' }
                   ].map(t => (
                     <div key={t.label} className="flex justify-between items-end border-b border-white/5 pb-2">
                        <span className="text-[11px] font-bold text-slate-400">{t.label}</span>
                        <span className="text-xs font-black text-white" style={{ color: t.color }}>{t.value}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">ACTION LOG</p>
                <div className="space-y-3 font-mono text-[10px]">
                   <p className="text-indigo-400">{">>"} Executing tactical subpoena...</p>
                   <p className="text-slate-500">{">>"} Bypassing node relay 4...</p>
                   <p className="text-slate-500">{">>"} Handshake verified (0x4f...)</p>
                   <p className="text-green-500">{">>"} EVIDENCE_INGEST_COMPLETE</p>
                </div>
             </div>

             <div className="mt-auto">
                <button className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                   DOWNLOAD MISSION REPORT
                </button>
             </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function AIChatBot() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', response: "Lillian AI online. Ready for mission briefing. I've identified a 14-point correlation between the Mumbai server farm and the Kiev-based Chimera group. Should I escalate banking subpoenas?" }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMsg = { role: 'user', response: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.response })
      });

      const data = await res.json();
      
      const content = data?.response || 'Simulation response active.';
      setMessages(prev => [...prev, { 
        role: 'model', 
        response: content,
        metadata: { confidence: data?.confidence || 94 }
      }]);

    } catch (err: any) {
      console.error('[Lillian AI] Interaction Failed:', err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        response: 'AI system temporarily overloaded. Simulation mode active.',
        metadata: { confidence: 72, isFallback: true }
      }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsMinimized(false)}
            className="w-14 h-14 rounded-full bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center text-white hover:bg-indigo-400 transition-all group"
          >
            <Bot size={24} className="group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#05080A] animate-pulse" />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="w-96"
          >
            <GlassCard className="p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-indigo-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Lillian AI</p>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Digital Investigator</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all"
                  >
                    <ChevronDown size={18} />
                  </button>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-2.5" />
                </div>
              </div>
              
              <div ref={scrollRef} className="h-64 overflow-y-auto mb-6 space-y-4 px-2 custom-scrollbar scroll-smooth">
                {messages.map((m, i) => (
                  <div key={i} className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-indigo-500/10 border border-indigo-500/20 rounded-tr-none text-indigo-200 ml-8' 
                      : 'bg-white/5 border border-white/5 rounded-tl-none text-slate-300'
                  }`}>
                    {m.response}
                  </div>
                ))}
                {isSending && (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none text-xs text-slate-500 animate-pulse italic">
                    Lillian is processing tactical vectors...
                  </div>
                )}
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isSending}
                  placeholder="Mission briefing query..." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 disabled:opacity-50" 
                />
                <button 
                  onClick={handleSend}
                  disabled={isSending}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-500 hover:text-indigo-400 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PredictivePageEnhanced() {
  const [executing, setExecuting] = useState<any>(null);

  return (
    <div className="space-y-10">
      {executing && <ExecutionHUD rec={executing} onClose={() => setExecuting(null)} />}
      
      {/* Header */}
      <div>
        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.4em] mb-2">PREDICTIVE ENGINE · E - 0.07</p>
        <div className="flex items-end justify-between">
          <h1 className="text-5xl font-black text-white tracking-tighter">AI-Driven Investigation Pathway</h1>
          <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-bold px-4 py-1.5">CONFIDENCE 94%</Badge>
        </div>
        <p className="text-sm text-slate-500 mt-2 font-medium">Missing-evidence detection · next-best-action recommendations · anomaly-driven guidance</p>
      </div>

      {/* Pathway Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PATHWAY_STATS.map(s => <PathwayCard key={s.label} stat={s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Posture & Heatmap */}
        <div className="lg:col-span-4 space-y-8">
          <EnginePosture />
        </div>

        {/* Right Column: Recommendations Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DETAILED_RECOMMENDATIONS.map((r, i) => <RecommendationCard key={r.id} rec={r} index={i} onExecute={setExecuting} />)}
          </div>
        </div>
      </div>

      <AIChatBot />
    </div>
  );
}
