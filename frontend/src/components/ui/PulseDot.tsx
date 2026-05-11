import { cn } from '@/lib/utils';

export function PulseDot({ color = '#ef4444', size = 8, className }: { color?: string; size?: number; className?: string }) {
  return (
    <div className={cn("relative flex", className)} style={{ width: size, height: size }}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }}></span>
      <span className="relative inline-flex rounded-full" style={{ width: size, height: size, backgroundColor: color }}></span>
    </div>
  );
}
