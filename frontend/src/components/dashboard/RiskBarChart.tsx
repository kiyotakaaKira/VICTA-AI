'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCases } from '@/hooks/useCases';
import { getRiskColor } from '@/lib/utils';

export function RiskBarChart() {
  const { data: cases = [] } = useCases();

  const chartData = cases
    .filter((c) => c.status === 'active')
    .slice(0, 6)
    .map((c) => ({
      name: c.title.slice(0, 15) + (c.title.length > 15 ? '…' : ''),
      score: c.risk_score,
    }));

  return (
    <GlassCard className="p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Risk Scores
      </h3>
      {chartData.length === 0 ? (
        <p className="text-slate-600 text-xs py-8 text-center">No active cases to display.</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: '#0f1629',
                border: '1px solid rgba(6,182,212,0.2)',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 12,
              }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getRiskColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}
