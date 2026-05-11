'use client';

import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

export function GraphControls() {
  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
      {[
        { Icon: ZoomIn, label: 'Zoom In' },
        { Icon: ZoomOut, label: 'Zoom Out' },
        { Icon: Maximize2, label: 'Fit View' },
        { Icon: RotateCcw, label: 'Reset' },
      ].map(({ Icon, label }) => (
        <button
          key={label}
          title={label}
          aria-label={label}
          className="w-8 h-8 rounded-lg bg-forensic-surface border border-forensic-border text-slate-400 hover:text-white hover:border-forensic-border-hover flex items-center justify-center transition-all"
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
