'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Database, Eye, Share2, 
  Fingerprint, ShieldCheck, Brain, Sparkles, X 
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const generateSparklineData = (base: number) => {
  return Array.from({ length: 20 }, (_, i) => ({
    value: base + Math.random() * (base * 0.4) - (base * 0.2)
  }));
};

const STAT_CONFIG = [
  { id: 'ai-conf', label: 'AI Confidence', value: '94.2%', trend: '+2.1%', icon: Target, color: '#4F46E5', 
    derivation: 'Σ(Inference Accuracy) / n_queries where n is total mission prompts processed via Mistral-7B.' },
  { id: 'ev-thru', label: 'Evidence Throughput', value: '2.4 TB/h', trend: '+11%', icon: Database, color: '#14B8A6', 
    derivation: 'Ingested data packets (TCP/UDP) / analysis time in seconds. Calculated at network ingress points.' },
  { id: 'sur-str', label: 'Surveillance Streams', value: '312', trend: 'LIVE', icon: Eye, color: '#F59E0B', 
    derivation: 'Active RTSP/HEVC streams with neural object detection enabled in real-time surveillance nodes.' },
  { id: 'pat-mat', label: 'Pattern Matches', value: '1,847', trend: '+18%', icon: Share2, color: '#10B981', 
    derivation: 'Matches identified using vector similarity search against global threat actor behavioral profiles.' },
  { id: 'bio-hit', label: 'Biometric Hits', value: '276', trend: '+5%', icon: Fingerprint, color: '#EF4444', 
    derivation: 'Positive identification matches from facial, iris, and fingerprint neural matching engines.' },
  { id: 'aut-avg', label: 'Authenticity Avg', value: '91.7%', trend: '↑', icon: ShieldCheck, color: '#14B8A6', 
    derivation: 'Inverse of manipulation probability across all analyzed media segments in the current mission.' },
  { id: 'pre-sco', label: 'Predictive Score', value: '0.87 ε', trend: 'stable', icon: Brain, color: '#4F46E5', 
    derivation: 'Stochastic weighted average of behavioral anomalies over time (Epsilon-decay vector).' },
  { id: 'col-rea', label: 'Cold Cases Reactivated', value: '14', trend: '+3', icon: Sparkles, color: '#F59E0B', 
    derivation: 'Historical records where new forensic correlations cross the tactical confidence threshold (T > 0.85).' },
];

function StatSparkline({ color }: { color: string }) {
  const data = generateSparklineData(50);
  return (
    <div className="h-10 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            fill={`url(#grad-${color})`} 
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}



export function StatsRow() {
  const [activeDerivation, setActiveDerivation] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STAT_CONFIG.map((stat, index) => {
        const Icon = stat.icon;
        const isShowingDerivation = activeDerivation === stat.id;

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="relative bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/5 rounded-xl p-4 overflow-hidden group"
          >
            <AnimatePresence>
              {isShowingDerivation && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-0 z-50 bg-[#0f172a] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Forensic Derivation</p>
                       <button onClick={() => setActiveDerivation(null)} className="text-slate-500 hover:text-white transition-colors">
                         <X size={14} />
                       </button>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic">
                      "{stat.derivation}"
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Engine: Neural-Baseline-v2</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Background Glow */}
            <div 
              className="absolute -top-12 -right-12 w-24 h-24 blur-[60px] opacity-20 transition-opacity group-hover:opacity-40"
              style={{ backgroundColor: stat.color }}
            />

            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setActiveDerivation(isShowingDerivation ? null : stat.id)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ backgroundColor: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
              >
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
              </button>
              <span className="text-[10px] font-bold tracking-widest" style={{ color: stat.color }}>
                {stat.trend}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                {stat.label}
              </h3>
              <p className="text-2xl font-bold text-white tracking-tighter">
                {stat.value}
              </p>
            </div>

            <StatSparkline color={stat.color} />
          </motion.div>
        );
      })}
    </div>
  );
}
