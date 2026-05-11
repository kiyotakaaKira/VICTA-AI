import type { Priority, Status } from '@/lib/constants';

export interface Case {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  risk_score: number;
  tags: string[];
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Joined relations (optional, returned by getCaseById)
  evidence?: import('./evidence').Evidence[];
  insights?: import('./insight').Insight[];
  timeline_events?: import('./timeline').TimelineEvent[];
}

export interface CreateCasePayload {
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string[];
}

export interface UpdateCasePayload extends Partial<CreateCasePayload> {
  risk_score?: number;
  assigned_to?: string;
}
