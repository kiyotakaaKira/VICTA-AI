-- ═══════════════════════════════════════════════════════════════════
-- FORENSIC AI PLATFORM — TELEMETRY & INTELLIGENCE MIGRATIONS
-- Run this in the Supabase SQL Editor to fix missing tables
-- ═══════════════════════════════════════════════════════════════════

-- 1. TELEMETRY SNAPSHOTS
CREATE TABLE IF NOT EXISTS telemetry_snapshots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signals     INTEGER DEFAULT 0,
  anomalies   INTEGER DEFAULT 0,
  baseline    INTEGER DEFAULT 50,
  sector      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INTELLIGENCE EVENTS (Live Intelligence Feed)
CREATE TABLE IF NOT EXISTS intelligence_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID REFERENCES cases(id) ON DELETE SET NULL,
  evidence_id UUID REFERENCES evidence(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL,
  type        TEXT,
  title       TEXT NOT NULL,
  message     TEXT,
  severity    TEXT DEFAULT 'info' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  source      TEXT DEFAULT 'system',
  category    TEXT DEFAULT 'intelligence',
  payload     JSONB DEFAULT '{}',
  metadata    JSONB DEFAULT '{}',
  ai_confidence FLOAT DEFAULT 0.8,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ANOMALIES (Detected Forensic Irregularities)
CREATE TABLE IF NOT EXISTS anomalies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id       UUID REFERENCES cases(id) ON DELETE CASCADE,
  evidence_id   UUID REFERENCES evidence(id) ON DELETE CASCADE,
  anomaly_type  TEXT NOT NULL,
  score         INTEGER DEFAULT 0,
  details       JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. COLD CASE LINKS
CREATE TABLE IF NOT EXISTS cold_case_links (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id_a         UUID REFERENCES cases(id) ON DELETE CASCADE,
  case_id_b         UUID REFERENCES cases(id) ON DELETE CASCADE,
  similarity_score  INTEGER DEFAULT 0,
  link_rationale    TEXT,
  revival_priority  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PREDICTIVE RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS predictive_recommendations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  priority    TEXT,
  reasoning   TEXT,
  confidence  INTEGER DEFAULT 50,
  payload     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CITY THREAT REGIONS
CREATE TABLE IF NOT EXISTS city_threat_regions (
  region_code         TEXT PRIMARY KEY,
  region_label        TEXT NOT NULL,
  threat_score        INTEGER DEFAULT 0,
  anomaly_cluster     INTEGER DEFAULT 0,
  hotspot_prediction  INTEGER DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FEDERATION EXCHANGE
CREATE TABLE IF NOT EXISTS federation_exchange (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_code   TEXT,
  agency_label  TEXT,
  alert_class   TEXT,
  message       TEXT,
  severity      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. EXTENDED TOXICOLOGY REPORTS (Fixing missing columns in schema.sql)
DO $$ 
BEGIN 
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'toxicology_reports') THEN
    ALTER TABLE toxicology_reports ADD COLUMN IF NOT EXISTS raw_report TEXT;
    ALTER TABLE toxicology_reports ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}';
    ALTER TABLE toxicology_reports ADD COLUMN IF NOT EXISTS chart_series JSONB DEFAULT '[]';
  ELSE
    CREATE TABLE toxicology_reports (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
      subject_id  TEXT,
      raw_report  TEXT,
      ai_analysis JSONB DEFAULT '{}',
      lethal_probability INTEGER DEFAULT 0,
      chart_series JSONB DEFAULT '[]',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- ─────────────────────────────────────────
-- INDEXES FOR PERFORMANCE
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON telemetry_snapshots(created_at);
CREATE INDEX IF NOT EXISTS idx_intel_events_case_id ON intelligence_events(case_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_case_id ON anomalies(case_id);
CREATE INDEX IF NOT EXISTS idx_cold_links_a ON cold_case_links(case_id_a);
CREATE INDEX IF NOT EXISTS idx_cold_links_b ON cold_case_links(case_id_b);
CREATE INDEX IF NOT EXISTS idx_predictions_case_id ON predictive_recommendations(case_id);

-- ─────────────────────────────────────────
-- RLS CONFIGURATION
-- ─────────────────────────────────────────
ALTER TABLE telemetry_snapshots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cold_case_links           ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_threat_regions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE federation_exchange       ENABLE ROW LEVEL SECURITY;

-- Note: The backend uses SUPABASE_SERVICE_KEY which automatically bypasses RLS.
