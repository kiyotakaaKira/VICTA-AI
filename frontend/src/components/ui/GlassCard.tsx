import { ReactNode, CSSProperties, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function GlassCard({ children, className, style, ...props }: GlassCardProps) {
  return (
    <div className={cn("glass-card", className)} style={style} {...props}>
      {children}
    </div>
  );
}
