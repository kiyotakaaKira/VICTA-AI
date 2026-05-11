'use client';

import { EVENT_TYPES } from '@/lib/constants';
import type { EventType } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TimelineFiltersProps {
  active: EventType | 'all';
  onChange: (f: EventType | 'all') => void;
}

export function TimelineFilters({ active, onChange }: TimelineFiltersProps) {
  const filters: { id: EventType | 'all'; label: string; color?: string }[] = [
    { id: 'all', label: 'All' },
    ...Object.entries(EVENT_TYPES).map(([id, cfg]) => ({
      id: id as EventType,
      label: cfg.label,
      color: cfg.color,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ id, label, color }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
            active === id
              ? 'text-forensic-bg'
              : 'bg-transparent text-slate-400 border-forensic-border hover:border-forensic-border-hover'
          )}
          style={
            active === id
              ? { backgroundColor: color || '#06b6d4', borderColor: color || '#06b6d4' }
              : {}
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
