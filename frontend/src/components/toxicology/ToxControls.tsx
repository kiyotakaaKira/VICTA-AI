'use client';

interface Substance {
  id: string;
  label: string;
  halfLife: number;
  peakTime: number;
  peakConc: number;
}

interface ToxControlsProps {
  substances: Substance[];
  selected: Substance;
  onSelectSubstance: (s: Substance) => void;
  dose: number;
  onDoseChange: (v: number) => void;
  weight: number;
  onWeightChange: (v: number) => void;
}

export function ToxControls({
  substances, selected, onSelectSubstance,
  dose, onDoseChange, weight, onWeightChange,
}: ToxControlsProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parameters</p>

      <div>
        <label className="text-xs text-slate-500 block mb-1">Substance</label>
        <select
          value={selected.id}
          onChange={(e) => {
            const s = substances.find((sub) => sub.id === e.target.value);
            if (s) onSelectSubstance(s);
          }}
          className="w-full bg-forensic-bg border border-forensic-border rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-forensic-cyan"
        >
          {substances.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-slate-500 block mb-1">Dose multiplier: {dose}x</label>
        <input
          type="range" min="0.1" max="5" step="0.1"
          value={dose} onChange={(e) => onDoseChange(parseFloat(e.target.value))}
          className="w-full accent-forensic-cyan"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 block mb-1">Body weight: {weight} kg</label>
        <input
          type="range" min="40" max="150" step="1"
          value={weight} onChange={(e) => onWeightChange(parseInt(e.target.value))}
          className="w-full accent-forensic-cyan"
        />
      </div>
    </div>
  );
}
