'use client';

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const VIEWS = ['Risk Trend', 'Evidence Types'] as const;
type View = typeof VIEWS[number];

const CustomTooltipStyle = {
  background: '#0f1629',
  border: '1px solid rgba(6,182,212,0.2)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: 11,
  padding: '8px 12px',
};

export function RiskCharts() {
  const [view, setView] = useState<View>('Risk Trend');
  const { data: charts, isLoading } = useDashboardCharts();

  if (isLoading) {
    return (
      <GlassCard className="p-5">
        <CardSkeleton className="h-[220px]" />
      </GlassCard>
    );
  }

  const riskTrend = charts?.riskTrend?.length ? charts.riskTrend : [{ month: '—', critical: 0, high: 0, medium: 0 }];
  const evidenceTypes = charts?.evidenceTypes?.length
    ? charts.evidenceTypes
    : [{ name: 'No ingest', value: 1, color: '#06b6d4' }];

  return (
    <GlassCard className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Intelligence Analytics
        </h3>
        <div className="flex gap-1 p-0.5 bg-white/4 rounded-lg">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-all',
                view === v
                  ? 'bg-forensic-surface-2 text-forensic-cyan shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Trend */}
      {view === 'Risk Trend' && (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={riskTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} fill="url(#criticalGrad)" />
            <Area type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} fill="url(#highGrad)" />
            <Area type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} fill="url(#medGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Evidence Types pie */}
      {view === 'Evidence Types' && (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={evidenceTypes}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {evidenceTypes.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={0.9} />
              ))}
            </Pie>
            <Tooltip contentStyle={CustomTooltipStyle} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* Legend for Risk Trend */}
      {view === 'Risk Trend' && (
        <div className="flex gap-4 mt-3 justify-center">
          {[['Critical', '#ef4444'], ['High', '#f97316'], ['Medium', '#eab308']].map(([l, c]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
              <span className="text-xs text-slate-500">{l}</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
