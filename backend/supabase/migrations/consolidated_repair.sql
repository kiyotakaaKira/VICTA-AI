-- EMERGENCY SCHEMA REPAIR - CONSOLIDATED MIGRATION
-- Generated on 2026-05-10
-- SAFE & IDEMPOTENT

-- 1. TELEMETRY EVENTS
CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  event_type TEXT,
  signal_type TEXT,
  severity TEXT,
  anomaly_score FLOAT,
  ai_confidence FLOAT,
  source TEXT,
  payload_json JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. PREDICTIVE RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS predictive_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  recommendation TEXT,
  action TEXT,
  priority TEXT,
  reasoning TEXT,
  confidence FLOAT,
  severity TEXT,
  ai_reasoning TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. TELEMETRY SNAPSHOTS (Bonus fix for dashboard)
CREATE TABLE IF NOT EXISTS telemetry_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signals INTEGER,
  anomalies INTEGER,
  baseline INTEGER,
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. INTELLIGENCE EVENTS (Bonus fix for feed)
CREATE TABLE IF NOT EXISTS intelligence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  evidence_id UUID,
  event_type TEXT,
  type TEXT,
  severity TEXT,
  title TEXT,
  message TEXT,
  source TEXT,
  category TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  ai_confidence FLOAT DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. EVIDENCE COLUMN REPAIRS
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS hash TEXT;
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS hash_sha256 TEXT;
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS ai_confidence FLOAT;
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS scan_status TEXT DEFAULT 'pending';
ALTER TABLE evidence ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 6. TIMELINE EVENTS COLUMN REPAIRS
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS confidence_score FLOAT;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS source_type TEXT;

-- 7. CASES COLUMN REPAIRS
ALTER TABLE cases ADD COLUMN IF NOT EXISTS ai_confidence FLOAT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS threat_score FLOAT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS assigned_agent TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS investigation_type TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS geo_location JSONB DEFAULT '{}'::jsonb;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS anomaly_count INTEGER DEFAULT 0;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS evidence_count INTEGER DEFAULT 0;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS telemetry_count INTEGER DEFAULT 0;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS suspects TEXT[];
ALTER TABLE cases ADD COLUMN IF NOT EXISTS category TEXT;

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_telemetry_case_id ON telemetry_events(case_id);
CREATE INDEX IF NOT EXISTS idx_predictive_case_id ON predictive_recommendations(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_timeline_case_id ON timeline_events(case_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_case_id ON intelligence_events(case_id);

-- 9. REALTIME ENABLEMENT
-- This SQL is specific to Supabase's 'realtime' schema
-- We try to enable it for telemetry and intelligence
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'realtime' AND tablename = 'subscription') THEN
    -- This is a simplified version, usually handled via the dashboard
    -- but we can at least try to add the tables to the publication if it exists
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE telemetry_events;
      ALTER PUBLICATION supabase_realtime ADD TABLE intelligence_events;
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not enable realtime via SQL - please enable in Supabase Dashboard';
END $$;
