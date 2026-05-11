'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export type ToxChartPoint = {
  time: number;
  concentration: number;
  therapeutic_max?: number;
  lethal_threshold?: number;
};

interface ToxChartProps {
  data: ToxChartPoint[];
  substance: string;
  therapeuticBand?: { min: number; max: number };
  lethalThreshold?: number;
}

export function ToxChart({ data, substance, therapeuticBand, lethalThreshold }: ToxChartProps) {
  const tMax = therapeuticBand?.max;
  const lethal = lethalThreshold ?? data[0]?.lethal_threshold;

  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        {substance} — metabolic projection
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="time"
            label={{
              value: 'Time (hours)',
              position: 'insideBottom',
              offset: -4,
              fill: '#64748b',
              fontSize: 11,
            }}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#0f1629',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 8,
              color: '#e2e8f0',
              fontSize: 11,
            }}
            formatter={(v: number) => [v.toFixed(2), 'Concentration']}
            labelFormatter={(l) => `t = ${l}h`}
          />
          {typeof tMax === 'number' && tMax > 0 ? (
            <ReferenceLine
              y={tMax}
              stroke="rgba(34,197,94,0.5)"
              strokeDasharray="4 4"
              label={{ value: 'Therapeutic ceiling', fill: '#22c55e', fontSize: 10 }}
            />
          ) : null}
          {typeof lethal === 'number' && lethal > 0 ? (
            <ReferenceLine
              y={lethal}
              stroke="rgba(239,68,68,0.55)"
              strokeDasharray="4 4"
              label={{ value: 'Lethality corridor', fill: '#ef4444', fontSize: 10 }}
            />
          ) : null}
          <Line
            type="monotone"
            dataKey="concentration"
            stroke="#06b6d4"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#06b6d4' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
