'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';

interface ThreatMeterProps {
  level?: number;
}

export function ThreatMeter({ level: levelProp }: ThreatMeterProps) {
  const { data: stats } = useDashboardStats();
  const { data: charts } = useDashboardCharts();
  const level = levelProp ?? stats?.threatLevel ?? 50;
  const weekBars = charts?.threatLevels?.length
    ? charts.threatLevels
    : [
        { day: 'M', level: 55 },
        { day: 'T', level: 58 },
        { day: 'W', level: 52 },
        { day: 'T', level: 61 },
        { day: 'F', level: 64 },
        { day: 'S', level: 59 },
        { day: 'S', level: 62 },
      ];

  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const getColor = (v: number) =>
    v >= 80 ? '#ef4444' : v >= 60 ? '#f97316' : v >= 40 ? '#eab308' : '#22c55e';

  const getLabel = (v: number) =>
    v >= 80 ? 'CRITICAL' : v >= 60 ? 'HIGH' : v >= 40 ? 'ELEVATED' : 'NORMAL';

  const color = getColor(level);
  const label = getLabel(level);

  // SVG arc math
  const radius = 56;
  const cx = 80;
  const cy = 80;
  const startAngle = -210;
  const sweepAngle = 240;
  const endAngle = startAngle + (sweepAngle * level) / 100;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, end: number) => {
    const s = { x: cx + radius * Math.cos(toRad(start)), y: cy + radius * Math.sin(toRad(start)) };
    const e = { x: cx + radius * Math.cos(toRad(end)), y: cy + radius * Math.sin(toRad(end)) };
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const totalArc = arcPath(startAngle, startAngle + sweepAngle);
  const valueArc = arcPath(startAngle, endAngle);

  return (
    <GlassCard className={`p-5 ${level >= 80 ? 'glass-card-red animate-threat-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} style={{ color }} />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Threat Level
          </span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>
          {label}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center">
        <svg width={160} height={100} viewBox="0 0 160 100">
          {/* Track */}
          <path d={totalArc} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} strokeLinecap="round" />
          {/* Value arc */}
          <motion.path
            d={valueArc}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: animated ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
          {/* Needle dot */}
          <motion.circle
            cx={cx + radius * Math.cos(toRad(animated ? endAngle : startAngle))}
            cy={cy + radius * Math.sin(toRad(animated ? endAngle : startAngle))}
            r={5}
            fill={color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
          {/* Center text */}
          <text x={cx} y={cy + 10} textAnchor="middle" fill="white" fontSize={28} fontWeight={900} fontFamily="Inter">
            {level}
          </text>
          <text x={cx} y={cy + 26} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="Inter">
            /100
          </text>
        </svg>
      </div>

      {/* Weekly trend mini bars */}
      <div className="mt-3">
        <p className="text-xs text-slate-600 mb-2 text-center">7-day trend</p>
        <div className="flex items-end justify-between gap-1 h-8">
          {weekBars.map(({ day, level: lvl }, i) => (
            <div key={`${day}-${i}`} className="flex flex-col items-center gap-1 flex-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${lvl}%` }}
                transition={{ delay: 0.1 * i, duration: 0.6, ease: 'easeOut' }}
                className="w-full rounded-sm max-h-8"
                style={{
                  backgroundColor: getColor(lvl),
                  minHeight: 2,
                  opacity: i === weekBars.length - 1 ? 1 : 0.4,
                }}
              />
              <span className="text-[9px] text-slate-600">{String(day)[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
