import type { EventType } from '@/lib/constants';

export interface TimelineEvent {
  id: string;
  case_id: string;
  title: string;
  description: string | null;
  type: EventType;
  timestamp: string;
  confidence: number;
  created_at: string;
  isSynthetic?: boolean;
}
