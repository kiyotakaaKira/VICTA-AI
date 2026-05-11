'use client';

interface ToxStatsProps {
  lethalProbability: number;
  ingestionHours: number | null;
  dosageMg: number | null;
  chartPeak: number | null;
}

export function ToxStats({ lethalProbability, ingestionHours, dosageMg, chartPeak }: ToxStatsProps) {
  const stats = [
    { label: 'Lethality probability', value: `${Math.round(lethalProbability)}`, unit: '%' },
    {
      label: 'Est. ingestion lead',
      value: ingestionHours != null ? ingestionHours.toFixed(1) : '—',
      unit: ingestionHours != null ? 'h pre-endpoint' : '',
    },
    {
      label: 'Dosage estimate',
      value: dosageMg != null ? dosageMg.toFixed(0) : '—',
      unit: dosageMg != null ? 'mg (model)' : '',
    },
    {
      label: 'Curve maximum',
      value: chartPeak != null ? chartPeak.toFixed(1) : '—',
      unit: chartPeak != null ? 'arb. units' : '',
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operational estimates</p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, unit }) => (
          <div key={label} className="p-2.5 rounded-lg bg-forensic-bg border border-forensic-border">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-forensic-cyan">
              {value} <span className="text-xs text-slate-500 font-normal">{unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
