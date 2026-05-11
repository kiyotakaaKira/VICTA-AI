import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip 
} from 'recharts';
import { AlertTriangle, Plus, Minus } from 'lucide-react';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';

const DRIFT_DATA = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  v1: 40 + Math.sin(i * 0.5) * 20 + Math.random() * 5,
  v2: 30 + Math.cos(i * 0.4) * 25 + Math.random() * 5,
  v3: 50 + Math.sin(i * 0.3) * 15 + Math.random() * 5,
}));

function Node({ x, y, label, subLabel, color, type, onDrag }: { x: number; y: number; label: string; subLabel?: string; color: string; type: string, onDrag: (x: number, y: number) => void }) {
  return (
    <motion.div 
      drag
      dragMomentum={false}
      onDrag={(_, info) => {
        onDrag(x + info.delta.x, y + info.delta.y);
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, x, y }}
      className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing z-20"
      style={{ left: 0, top: 0 }}
    >
      <div className="relative group">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 blur-xl rounded-full"
          style={{ backgroundColor: color }}
        />
        <div 
          className="relative w-14 h-14 rounded-full border-2 flex items-center justify-center bg-[#0f172a] group-hover:border-white transition-colors"
          style={{ borderColor: `${color}80`, boxShadow: `0 0 20px ${color}40` }}
        >
          <span className="text-[11px] font-black text-white uppercase tracking-tighter">{type}</span>
        </div>
      </div>
      <div className="mt-3 text-center bg-[#0a0f1c]/90 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10 pointer-events-none shadow-xl">
        <p className="text-[10px] font-black text-white uppercase tracking-[0.1em] leading-none">{label}</p>
        {subLabel && <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-1">{subLabel}</p>}
      </div>
    </motion.div>
  );
}

function ConnectionLine({ x1, y1, x2, y2, type }: { x1: number; y1: number; x2: number; y2: number, type?: string }) {
  const isRadial = type === 'radial';
  const isTree = type === 'tree';

  // For radial, create a slight curve
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const controlX = isRadial ? midX + (y2 - y1) * 0.2 : midX;
  const controlY = isRadial ? midY + (x1 - x2) * 0.2 : midY;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
      <defs>
        <filter id="lineGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.path
        d={isRadial 
          ? `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`
          : isTree 
            ? `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
            : `M ${x1} ${y1} L ${x2} ${y2}`
        }
        fill="transparent"
        stroke={isRadial ? "rgba(99, 102, 241, 0.4)" : isTree ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.1)"}
        strokeWidth={isTree ? "2" : "1.5"}
        strokeDasharray={isRadial ? "4,4" : "0"}
        filter="url(#lineGlow)"
        animate={{ d: isRadial 
          ? `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`
          : isTree 
            ? `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
            : `M ${x1} ${y1} L ${x2} ${y2}`
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      
      {/* Animated Pulse along the line */}
      <motion.circle 
        r={isTree ? "3" : "2"} 
        fill={isRadial ? "#6366F1" : isTree ? "#10B981" : "#94A3B8"}
        animate={{ 
          cx: [x1, x2],
          cy: [y1, y2],
          opacity: [0, 1, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </svg>
  );
}

export function InvestigationNetwork() {
  const { cases, activeCase, setActiveCase, updateNodePos } = useKnowledgeStore();
  const currentCase = cases[activeCase];
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 2));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      {/* Relational Knowledge Graph */}
      <div className="lg:col-span-8 bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative h-[750px] overflow-hidden group">
        
        {/* Case Selector HUD */}
        <div className="flex flex-wrap items-center gap-3 mb-8 border-b border-white/5 pb-6">
          {Object.keys(cases).map(caseId => (
            <button
              key={caseId}
              onClick={() => setActiveCase(caseId)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border ${
                activeCase === caseId 
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              {caseId}
            </button>
          ))}
          
          <div className="ml-auto flex items-center gap-6">
            {[
              { label: 'CASE', color: '#4F46E5' },
              { label: 'PERSON', color: '#F59E0B' },
              { label: 'LOC', color: '#EF4444' },
              { label: 'EVIDENCE', color: '#10B981' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Graph Canvas Wrapper (Pannable) */}
        <motion.div 
          drag
          dragMomentum={false}
          onDrag={(_, info) => setPan(prev => ({ x: prev.x + info.delta.x, y: prev.y + info.delta.y }))}
          className="absolute inset-0 top-24 cursor-move active:cursor-grabbing"
        >
          <motion.div 
            style={{ x: pan.x, y: pan.y, scale: zoom }}
            className="w-[2000px] h-[2000px] relative origin-center"
          >
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1.5px,transparent_1.5px)] [background-size:32px_32px]" />

            {/* Connection Lines */}
            {currentCase.edges.map(edge => {
              const source = currentCase.nodes.find(n => n.id === edge.source);
              const target = currentCase.nodes.find(n => n.id === edge.target);
              if (!source || !target) return null;
              return (
                <ConnectionLine 
                  key={edge.id}
                  x1={source.x} y1={source.y}
                  x2={target.x} y2={target.y}
                  type={currentCase.graphType}
                />
              );
            })}

            {/* Nodes */}
            {currentCase.nodes.map(node => (
              <Node 
                key={`${activeCase}-${node.id}`}
                x={node.x} y={node.y}
                label={node.label}
                subLabel={node.subLabel}
                color={node.color}
                type={node.type.substring(0, 2)}
                onDrag={(nx, ny) => updateNodePos(node.id, nx, ny)}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Zoom Controls HUD */}
        <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-[#0A0F1C]/90 border border-white/10 rounded-2xl p-2 px-5 shadow-2xl backdrop-blur-xl z-50">
          <button 
            onClick={() => handleZoom(-0.1)}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5"
          >
            <Minus size={16}/>
          </button>
          <span className="text-[10px] font-black text-indigo-400 min-w-[50px] text-center tracking-widest">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={() => handleZoom(0.1)}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5"
          >
            <Plus size={16}/>
          </button>
        </div>
      </div>

      {/* Cross-Modal Signal Drift */}
      <div className="lg:col-span-4 bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col">
        <div>
          <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Anomaly Vectors</h3>
          <h2 className="text-xl font-bold text-white tracking-tight">Cross-Modal Signal Drift</h2>
        </div>

        <div className="flex-1 min-h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DRIFT_DATA}>
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} hide />
              <Line type="monotone" dataKey="v1" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="v2" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="v3" stroke="#4F46E5" strokeWidth={2} dot={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }}
                itemStyle={{ fontSize: '10px' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Intel Alert */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3"
        >
          <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0" />
          <p className="text-[11px] text-slate-300 leading-snug">
            <span className="font-bold text-white">Behavioral entropy spike</span> detected at <span className="font-mono text-white">19:14:02</span> - investigate stream <span className="font-mono text-white">B7-A1</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
