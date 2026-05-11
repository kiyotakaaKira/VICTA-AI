import type { Severity } from '@/lib/constants';

export interface Insight {
  id: string;
  case_id: string;
  title: string;
  description: string | null;
  severity: Severity;
  source: string | null;
  created_at: string;
}
