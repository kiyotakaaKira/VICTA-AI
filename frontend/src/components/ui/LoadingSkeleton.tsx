import { cn } from '@/lib/utils';

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-white/5 rounded-md", className)} />;
}

export function CardSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-white/5 rounded-xl h-32 w-full", className)} />;
}
