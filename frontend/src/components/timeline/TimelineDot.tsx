'use client';

interface TimelineDotProps {
  color?: string;
}

export function TimelineDot({ color = '#06b6d4' }: TimelineDotProps) {
  return (
    <div className="relative z-10 flex-shrink-0 mt-4">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-forensic-bg"
        style={{ backgroundColor: `${color}20`, border: `2px solid ${color}` }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
