import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn(
      '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — realtime DB panels will stay empty until configured.'
    );
  }
}

/** Valid placeholder URL so createClient never throws at import time (SSR-safe). */
const resolvedUrl = supabaseUrl || 'https://invalid.localhost.supabase';
const resolvedKey = supabaseAnonKey || 'invalid-anon-key';

export const supabase: SupabaseClient = createClient(resolvedUrl, resolvedKey, {
  auth: { persistSession: typeof window !== 'undefined' },
});

export default supabase;

export type DeepfakeScan = {
  id: string
  evidence_id: string
  case_id: string
  file_type: string
  authenticity_score: number
  risk_level: string
  gan_artifacts_detected: boolean
  metadata_anomalies: Record<string, any>
  manipulation_regions: Array<{ x: number; y: number; w: number; h: number; confidence: number }>
  frame_analysis: Array<{ frame: number; score: number; anomaly: boolean }>
  ai_explanation: string
  confidence: number
  processing_status: string
  created_at: string
}

export type GraphNode = {
  id: string
  case_id: string
  node_type: 'suspect' | 'victim' | 'device' | 'evidence' | 'location' |
             'vehicle' | 'account' | 'communication' | 'transaction'
  label: string
  metadata: Record<string, any>
  created_at: string
}

export type GraphEdge = {
  id: string
  case_id: string
  source_node_id: string
  target_node_id: string
  relationship_type: string
  weight: number
  metadata: Record<string, any>
  created_at: string
}

export type TelemetryEvent = {
  id: string
  case_id: string | null
  event_type: string
  severity: string
  payload: Record<string, any>
  source: string
  created_at: string
}

export type AnomalyEvent = {
  id: string
  case_id: string
  anomaly_type: string
  description: string
  confidence: number
  severity: string
  evidence_ids: string[]
  resolved: boolean
  created_at: string
}

// Helper: call pipeline API from client
export async function triggerEvidencePipeline(payload: { evidence_id: string; case_id: string; file_name: string; file_type: string; file_size: number; content_text: string; user_id: string; }) { return fetch('/api/pipeline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json()); }
