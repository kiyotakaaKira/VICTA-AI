import { getRiskColor } from '@/lib/utils';

export function RiskBar({ score, height = 6 }: { score: number; height?: number }) {
  const color = getRiskColor(score);
  return (
    <div className="w-full rounded-full bg-white/5 overflow-hidden" style={{ height }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
    </div>
  );
}
