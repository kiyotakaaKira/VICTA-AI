import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({ title, description, icon, className }: { title: string; description?: string; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5", className)}>
      {icon && <div className="mb-4 text-slate-500">{icon}</div>}
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      {description && <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>}
    </div>
  );
}
