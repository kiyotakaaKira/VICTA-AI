-- ═══════════════════════════════════════════════════════════════════
-- FORENSIC AI PLATFORM — SUPABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- CASES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','closed','archived')),
  priority      TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  risk_score    INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  tags          TEXT[] DEFAULT '{}',
  assigned_to   TEXT,
  created_by    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────
-- EVIDENCE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id             UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  type                TEXT,
  url                 TEXT,
  size                BIGINT DEFAULT 0,
  analysis            JSONB,
  risk_score          INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  authenticity_score  INTEGER DEFAULT 100 CHECK (authenticity_score >= 0 AND authenticity_score <= 100),
  uploaded_by         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_risk_score ON evidence(risk_score);

-- ─────────────────────────────────────────
-- INSIGHTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insights (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  severity    TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('critical','high','medium','low','info')),
  source      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_case_id ON insights(case_id);
CREATE INDEX IF NOT EXISTS idx_insights_severity ON insights(severity);

-- ─────────────────────────────────────────
-- TIMELINE EVENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timeline_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  type        TEXT NOT NULL DEFAULT 'digital' CHECK (type IN ('digital','physical','financial','legal','movement','communication')),
  timestamp   TIMESTAMPTZ NOT NULL,
  confidence  INTEGER DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_case_id ON timeline_events(case_id);
CREATE INDEX IF NOT EXISTS idx_timeline_timestamp ON timeline_events(timestamp);

-- ─────────────────────────────────────────
-- GRAPH NODES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS graph_nodes (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id   UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type      TEXT NOT NULL CHECK (type IN ('case','person','location','evidence','device','organization','insight')),
  label     TEXT NOT NULL,
  data      JSONB DEFAULT '{}',
  pos_x     FLOAT DEFAULT 0,
  pos_y     FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_graph_nodes_case_id ON graph_nodes(case_id);

-- ─────────────────────────────────────────
-- GRAPH EDGES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS graph_edges (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id   UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  source    TEXT NOT NULL,
  target    TEXT NOT NULL,
  label     TEXT,
  data      JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_graph_edges_case_id ON graph_edges(case_id);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE cases         ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence      ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights      ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_nodes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges   ENABLE ROW LEVEL SECURITY;

-- Service role bypass (backend uses service key, bypasses RLS)
-- Frontend clients should use anon key + Clerk JWT policy

-- ─────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- PREDICTIVE SUGGESTIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS predictive_suggestions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  suggestion  TEXT NOT NULL,
  confidence  INTEGER DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  context     JSONB DEFAULT '{}',
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'actioned', 'dismissed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- BEHAVIORAL PATTERNS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS behavioral_patterns (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  subject_id  TEXT,
  pattern_type TEXT,
  description TEXT NOT NULL,
  confidence  INTEGER DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  data        JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- DEEPFAKE ANALYSIS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deepfake_analysis (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  authenticity_score INTEGER DEFAULT 100 CHECK (authenticity_score >= 0 AND authenticity_score <= 100),
  manipulation_type TEXT,
  details     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TOXICOLOGY REPORTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS toxicology_reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  subject_id  TEXT,
  findings    JSONB DEFAULT '{}',
  lethal_probability INTEGER DEFAULT 0 CHECK (lethal_probability >= 0 AND lethal_probability <= 100),
  analysis_summary TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INTELLIGENCE ALERTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS intelligence_alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  level       TEXT DEFAULT 'info' CHECK (level IN ('critical', 'high', 'medium', 'low', 'info')),
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ANOMALY DETECTIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS anomaly_detections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type TEXT NOT NULL,
  source_id   UUID,
  anomaly_type TEXT NOT NULL,
  description TEXT,
  severity    TEXT DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
