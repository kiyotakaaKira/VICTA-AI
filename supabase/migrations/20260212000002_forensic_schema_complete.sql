-- Complete forensic schema repair: cases KPI columns, telemetry_events operational fields,
-- evidence aliases, intelligence/graph views. Idempotent (IF NOT EXISTS + guarded updates).

-- ═══════════════════════════════════════════════════════════════════
-- CASES — threat KPIs, agent, geo, counts (compatible with existing risk_score / category / location)
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS threat_score INTEGER;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS anomaly_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS assigned_agent TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS geo_location JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS investigation_type TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS evidence_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS telemetry_count INTEGER NOT NULL DEFAULT 0;

UPDATE public.cases SET threat_score = COALESCE(threat_score, risk_score) WHERE threat_score IS NULL;
UPDATE public.cases SET investigation_type = COALESCE(investigation_type, category) WHERE investigation_type IS NULL AND category IS NOT NULL;
UPDATE public.cases SET assigned_agent = COALESCE(assigned_agent, assigned_to) WHERE assigned_agent IS NULL AND assigned_to IS NOT NULL;

UPDATE public.cases c
SET geo_location = COALESCE(
  NULLIF(c.geo_location, '{}'::jsonb),
  CASE WHEN c.location IS NOT NULL AND c.location <> ''
    THEN jsonb_build_object('label', c.location)
    ELSE '{}'::jsonb END
)
WHERE geo_location IS NULL OR geo_location = '{}'::jsonb;

-- ═══════════════════════════════════════════════════════════════════
-- TELEMETRY_EVENTS — full operational column set + sync with legacy cols
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  event_type TEXT NOT NULL DEFAULT 'operational',
  source TEXT,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.telemetry_events ADD COLUMN IF NOT EXISTS signal_type TEXT;
ALTER TABLE public.telemetry_events ADD COLUMN IF NOT EXISTS anomaly_score DOUBLE PRECISION;
ALTER TABLE public.telemetry_events ADD COLUMN IF NOT EXISTS ai_confidence DOUBLE PRECISION;
ALTER TABLE public.telemetry_events ADD COLUMN IF NOT EXISTS event_time TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.telemetry_events ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

UPDATE public.telemetry_events SET signal_type = COALESCE(signal_type, event_type) WHERE signal_type IS NULL;
UPDATE public.telemetry_events SET event_time = COALESCE(event_time, "timestamp", created_at) WHERE event_time IS NULL;
UPDATE public.telemetry_events SET metadata = COALESCE(metadata, '{}'::jsonb) WHERE metadata IS NULL;

CREATE INDEX IF NOT EXISTS idx_telemetry_events_signal ON public.telemetry_events (signal_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_event_time ON public.telemetry_events (event_time DESC);

-- ═══════════════════════════════════════════════════════════════════
-- EVIDENCE — canonical names used by APIs / extraction pipelines
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS hash TEXT;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;

UPDATE public.evidence e SET file_name = COALESCE(file_name, e.name, e.title) WHERE file_name IS NULL;
UPDATE public.evidence e SET file_type = COALESCE(file_type, e.type) WHERE file_type IS NULL;
UPDATE public.evidence e SET hash = COALESCE(hash, hash_sha256) WHERE hash IS NULL AND hash_sha256 IS NOT NULL;
UPDATE public.evidence e SET metadata = COALESCE(metadata, metadata_json, '{}'::jsonb) WHERE metadata IS NULL OR metadata = '{}'::jsonb;
UPDATE public.evidence e SET uploaded_at = COALESCE(uploaded_at, created_at) WHERE uploaded_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- TIMELINE — metadata JSON (alongside metadata_json if present)
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'timeline_events' AND column_name = 'metadata_json'
  ) THEN
    EXECUTE $u$
      UPDATE public.timeline_events
      SET metadata = COALESCE(metadata, metadata_json, '{}'::jsonb)
    $u$;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- READ MODELS
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.ai_intelligence_feed AS
SELECT * FROM public.intelligence_events;

CREATE OR REPLACE VIEW public.graph_relationships AS
SELECT
  id,
  case_id,
  source AS source_id,
  target AS target_id,
  label AS relationship_type,
  data AS metadata,
  created_at
FROM public.graph_edges;

-- Refresh realtime_feeds union (telemetry payload column compatibility)
CREATE OR REPLACE VIEW public.realtime_feeds AS
SELECT
  id,
  created_at AS ts,
  'intelligence'::text AS channel,
  severity::text,
  COALESCE(title, event_type) AS headline,
  message AS body,
  case_id,
  COALESCE(evidence_id, NULL::uuid) AS evidence_id,
  payload AS payload
FROM public.intelligence_events
UNION ALL
SELECT
  te.id,
  COALESCE(te.event_time, te."timestamp", te.created_at) AS ts,
  'telemetry'::text AS channel,
  te.severity::text,
  COALESCE(te.signal_type, te.event_type) AS headline,
  COALESCE(te.event_type, te.signal_type) AS body,
  te.case_id,
  NULL::uuid AS evidence_id,
  jsonb_build_object(
    'payload', te.payload_json,
    'metadata', te.metadata,
    'anomaly_score', te.anomaly_score,
    'ai_confidence', te.ai_confidence
  ) AS payload
FROM public.telemetry_events te;
