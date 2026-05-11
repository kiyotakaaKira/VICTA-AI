'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

const HEAT_DATA = Array.from({ length: 168 }).map(() => {
  const rand = Math.random();
  if (rand > 0.9) return 'critical';
  if (rand > 0.7) return 'elevated';
  if (rand > 0.4) return 'low';
  return 'none';
});

const COLOR_MAP = {
  critical: '#EF4444',
  elevated: '#F59E0B',
  low: '#6366F1',
  none: '#1E293B', // Darker empty state
};

export function ThreatHeatmap() {
  return (
    <GlassCard className="p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">THREAT DENSITY · 7x24</p>
          <h2 className="text-sm font-bold text-white tracking-tight">Hourly Heatmap</h2>
        </div>
        <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">UTC · 168 cells</div>
      </div>

      <div className="grid grid-cols-24 gap-1">
        {HEAT_DATA.map((level, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.001 }}
            className="aspect-square rounded-[2px]"
            style={{ backgroundColor: COLOR_MAP[level as keyof typeof COLOR_MAP] }}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center gap-4">
        {['low', 'elevated', 'critical'].map(level => (
          <div key={level} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLOR_MAP[level as keyof typeof COLOR_MAP] }} />
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{level}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
