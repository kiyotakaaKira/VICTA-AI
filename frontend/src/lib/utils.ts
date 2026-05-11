import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RISK_THRESHOLDS } from './constants';

// ─────────────────────────────────────────
// CLASS MERGING
// ─────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────
// RISK UTILITIES
// ─────────────────────────────────────────

export function getRiskColor(score: number): string {
  if (score >= RISK_THRESHOLDS.critical) return '#ef4444';
  if (score >= RISK_THRESHOLDS.high)     return '#f97316';
  if (score >= RISK_THRESHOLDS.medium)   return '#eab308';
  return '#22c55e';
}

export function getRiskLabel(score: number): string {
  if (score >= RISK_THRESHOLDS.critical) return 'critical';
  if (score >= RISK_THRESHOLDS.high)     return 'high';
  if (score >= RISK_THRESHOLDS.medium)   return 'medium';
  return 'low';
}

export function getBadgeVariant(value: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const v = value.toLowerCase();
  if (['critical', 'high', 'alert', 'error', 'urgent', 'flagged'].includes(v)) return 'destructive';
  if (['medium', 'warning', 'pending', 'active'].includes(v)) return 'secondary';
  if (['low', 'info', 'success', 'complete', 'closed', 'archived'].includes(v)) return 'outline';
  return 'default';
}

// ─────────────────────────────────────────
// DATE FORMATTING
// ─────────────────────────────────────────

export function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24)   return `${hours}h ago`;
  if (days < 7)     return `${days}d ago`;
  return formatDate(isoString);
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDateShort(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─────────────────────────────────────────
// FILE SIZE
// ─────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1_048_576)    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}

// ─────────────────────────────────────────
// TRUNCATION
// ─────────────────────────────────────────

export function truncate(str: string, len: number): string {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}
