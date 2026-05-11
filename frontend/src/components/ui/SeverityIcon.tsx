import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import type { Severity } from '@/lib/constants';

export function SeverityIcon({ severity, size = 16, className = '' }: { severity: Severity | string; size?: number; className?: string }) {
  if (severity === 'critical') return <AlertCircle size={size} className={`text-red-500 ${className}`} />;
  if (severity === 'high') return <AlertTriangle size={size} className={`text-orange-500 ${className}`} />;
  if (severity === 'medium') return <AlertTriangle size={size} className={`text-yellow-500 ${className}`} />;
  if (severity === 'low') return <CheckCircle size={size} className={`text-green-500 ${className}`} />;
  return <Info size={size} className={`text-cyan-500 ${className}`} />;
}
