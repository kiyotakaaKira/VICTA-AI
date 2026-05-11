-- Operational alignment: evidence/timeline/telemetry columns, intelligence_events extras,
-- compatibility views. Safe to re-run (IF NOT EXISTS / guarded DO blocks).

-- ─────────────────────────────────────────
-- CASES — optional investigator fields used by seed/API
-- ─────────────────────────────────────────
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS suspects TEXT[];
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS ai_confidence INTEGER;

-- ─────────────────────────────────────────
-- EVIDENCE — hash + metadata_json + scan pipeline
-- ─────────────────────────────────────────
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS hash_sha256 TEXT;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS scan_status TEXT DEFAULT 'pending';
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS tags TEXT[];

UPDATE public.evidence e
SET title = COALESCE(title, name)
WHERE title IS NULL AND name IS NOT NULL;

UPDATE public.evidence e
SET name = COALESCE(name, title)
WHERE name IS NULL AND title IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'evidence' AND column_name = 'hash'
  ) THEN
    EXECUTE $u$
      UPDATE public.evidence SET hash_sha256 = COALESCE(hash_sha256, regexp_replace(hash, '^sha256:', '', 'i'))
      WHERE hash_sha256 IS NULL AND hash IS NOT NULL
    $u$;
  END IF;
END $$;

UPDATE public.evidence SET metadata_json = COALESCE(metadata_json, '{}'::jsonb) WHERE metadata_json IS NULL;

-- ─────────────────────────────────────────
-- TIMELINE — event_type, metadata_json, confidence_score, source_type
-- ─────────────────────────────────────────
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium';
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 50;
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'digital';

UPDATE public.timeline_events
SET event_type = COALESCE(event_type, type)
WHERE event_type IS NULL;

UPDATE public.timeline_events
SET confidence_score = COALESCE(confidence_score, confidence)
WHERE confidence IS NOT NULL;

ALTER TABLE public.timeline_events DROP CONSTRAINT IF EXISTS timeline_events_type_check;

-- ─────────────────────────────────────────
-- TELEMETRY_EVENTS — row-level feed (mandatory columns)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  event_type TEXT NOT NULL,
  source TEXT,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.telemetry_events ADD COLUMN IF NOT EXISTS payload_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.telemetry_events ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'telemetry_events' AND column_name = 'payload'
  ) THEN
    EXECUTE $u$
      UPDATE public.telemetry_events SET payload_json = COALESCE(payload_json, payload, '{}'::jsonb)
    $u$;
  END IF;
END $$;

UPDATE public.telemetry_events SET "timestamp" = COALESCE("timestamp", created_at) WHERE "timestamp" IS NULL;

CREATE INDEX IF NOT EXISTS idx_telemetry_events_ts ON public.telemetry_events ("timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_case ON public.telemetry_events (case_id);

-- ─────────────────────────────────────────
-- INTELLIGENCE_EVENTS — columns referenced by backend inserts
-- ─────────────────────────────────────────
ALTER TABLE public.intelligence_events ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.intelligence_events ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.intelligence_events ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.intelligence_events ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC;
ALTER TABLE public.intelligence_events ADD COLUMN IF NOT EXISTS source TEXT;

-- ─────────────────────────────────────────
-- ANOMALIES — link evidence when present
-- ─────────────────────────────────────────
ALTER TABLE public.anomalies ADD COLUMN IF NOT EXISTS evidence_id UUID;

ALTER TABLE public.behavioral_patterns ADD COLUMN IF NOT EXISTS similarity_score double precision;

-- ─────────────────────────────────────────
-- READ MODELS / ALIASES
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW public.ai_insights AS
SELECT * FROM public.insights;

CREATE OR REPLACE VIEW public.behavioral_profiles AS
SELECT * FROM public.behavioral_patterns;

CREATE OR REPLACE VIEW public.knowledge_graph_nodes AS
SELECT * FROM public.graph_nodes;

CREATE OR REPLACE VIEW public.knowledge_graph_edges AS
SELECT * FROM public.graph_edges;

CREATE OR REPLACE VIEW public.threat_analytics AS
SELECT
  status,
  COUNT(*)::bigint AS case_count,
  AVG(risk_score)::numeric AS avg_risk,
  MAX(risk_score) AS max_risk
FROM public.cases
WHERE deleted_at IS NULL
GROUP BY status;

CREATE OR REPLACE VIEW public.realtime_feeds AS
SELECT
  id,
  created_at AS ts,
  'intelligence'::text AS channel,
  severity::text,
  COALESCE(title, event_type) AS headline,
  message AS body,
  case_id,
  evidence_id,
  payload AS payload
FROM public.intelligence_events
UNION ALL
SELECT
  id,
  COALESCE("timestamp", created_at) AS ts,
  'telemetry'::text AS channel,
  severity::text,
  event_type AS headline,
  event_type AS body,
  case_id,
  NULL::uuid AS evidence_id,
  payload_json AS payload
FROM public.telemetry_events;
