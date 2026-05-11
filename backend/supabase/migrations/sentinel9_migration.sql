-- Deepfake scan results
CREATE TABLE IF NOT EXISTS deepfake_scans (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  evidence_id           uuid REFERENCES evidence(id) ON DELETE CASCADE,
  case_id               uuid REFERENCES cases(id) ON DELETE CASCADE,
  file_type             text NOT NULL,
  authenticity_score    integer DEFAULT 0,
  risk_level            text DEFAULT 'unknown',
  gan_artifacts_detected boolean DEFAULT false,
  metadata_anomalies    jsonb,
  manipulation_regions  jsonb,
  frame_analysis        jsonb,
  ai_explanation        text,
  confidence            integer DEFAULT 0,
  processing_status     text DEFAULT 'pending',
  created_at            timestamp DEFAULT now()
);

-- Knowledge graph nodes
CREATE TABLE IF NOT EXISTS graph_nodes (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id    uuid REFERENCES cases(id) ON DELETE CASCADE,
  node_type  text NOT NULL,
  label      text NOT NULL,
  metadata   jsonb,
  created_at timestamp DEFAULT now()
);

-- Knowledge graph edges
CREATE TABLE IF NOT EXISTS graph_edges (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id           uuid REFERENCES cases(id) ON DELETE CASCADE,
  source_node_id    uuid REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target_node_id    uuid REFERENCES graph_nodes(id) ON DELETE CASCADE,
  relationship_type text NOT NULL,
  weight            float DEFAULT 1.0,
  metadata          jsonb,
  created_at        timestamp DEFAULT now()
);

-- Telemetry / live events
CREATE TABLE IF NOT EXISTS telemetry_events (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id    uuid REFERENCES cases(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  severity   text DEFAULT 'info',
  payload    jsonb,
  source     text,
  created_at timestamp DEFAULT now()
);

-- Anomaly detection events
CREATE TABLE IF NOT EXISTS anomaly_events (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id      uuid REFERENCES cases(id) ON DELETE CASCADE,
  anomaly_type text NOT NULL,
  description  text,
  confidence   integer DEFAULT 0,
  severity     text DEFAULT 'medium',
  evidence_ids jsonb,
  resolved     boolean DEFAULT false,
  created_at   timestamp DEFAULT now()
);

-- Behavioral patterns
CREATE TABLE IF NOT EXISTS behavioral_patterns (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id          uuid REFERENCES cases(id) ON DELETE CASCADE,
  pattern_type     text NOT NULL,
  description      text,
  similarity_score float,
  linked_cases     jsonb,
  metadata         jsonb,
  created_at       timestamp DEFAULT now()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     text NOT NULL,
  action      text NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb,
  ip_address  text,
  created_at  timestamp DEFAULT now()
);

-- Forensic reports
CREATE TABLE IF NOT EXISTS forensic_reports (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id      uuid REFERENCES cases(id) ON DELETE CASCADE,
  report_type  text NOT NULL,
  generated_by text,
  content      jsonb,
  export_url   text,
  created_at   timestamp DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE deepfake_scans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_nodes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE forensic_reports   ENABLE ROW LEVEL SECURITY;

-- RLS policies (case-owner access)
CREATE POLICY IF NOT EXISTS "owner_deepfake"   ON deepfake_scans     FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()::text));
CREATE POLICY IF NOT EXISTS "owner_nodes"      ON graph_nodes        FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()::text));
CREATE POLICY IF NOT EXISTS "owner_edges"      ON graph_edges        FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()::text));
CREATE POLICY IF NOT EXISTS "owner_telemetry"  ON telemetry_events   FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()::text));
CREATE POLICY IF NOT EXISTS "owner_anomaly"    ON anomaly_events     FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()::text));
CREATE POLICY IF NOT EXISTS "owner_behavioral" ON behavioral_patterns FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()::text));
CREATE POLICY IF NOT EXISTS "owner_audit"      ON audit_logs         FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY IF NOT EXISTS "owner_reports"    ON forensic_reports   FOR ALL USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()::text));
