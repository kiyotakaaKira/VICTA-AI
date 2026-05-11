-- Forensic Intelligence OS — operational telemetry, intelligence feed, novelty engines
-- Apply in Supabase SQL editor or via CLI. Safe to re-run: uses IF NOT EXISTS.

-- ─────────────────────────────────────────
-- TELEMETRY (live dashboard charts)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.telemetry_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  signals numeric NOT NULL DEFAULT 0,
  anomalies numeric NOT NULL DEFAULT 0,
  baseline numeric NOT NULL DEFAULT 50,
  sector text,
  meta jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_telemetry_created ON public.telemetry_snapshots (created_at DESC);

-- ─────────────────────────────────────────
-- INTELLIGENCE EVENTS (alert feed, activity stream)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.intelligence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  title text,
  message text,
  severity text,
  case_id uuid,
  evidence_id uuid,
  payload jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_intel_created ON public.intelligence_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intel_severity ON public.intelligence_events (severity);

-- ─────────────────────────────────────────
-- ANOMALIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  case_id uuid,
  evidence_id uuid,
  anomaly_type text NOT NULL,
  score numeric,
  details jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_anomalies_case ON public.anomalies (case_id);

-- ─────────────────────────────────────────
-- TOXICOLOGY REPORTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.toxicology_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  case_id uuid,
  subject_id text,
  raw_report text,
  ai_analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  lethal_probability int,
  chart_series jsonb DEFAULT '[]'::jsonb
);

-- ─────────────────────────────────────────
-- PREDICTIVE RECOMMENDATIONS (AI co-investigator)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.predictive_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  case_id uuid,
  action text NOT NULL,
  priority text,
  reasoning text,
  confidence int,
  payload jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_pred_case ON public.predictive_recommendations (case_id);

-- ─────────────────────────────────────────
-- COLD CASE CLUSTER (revival engine)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cold_case_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  case_id_a uuid NOT NULL,
  case_id_b uuid NOT NULL,
  similarity_score int,
  link_rationale text,
  revival_priority text,
  payload jsonb DEFAULT '{}'::jsonb
);

-- ─────────────────────────────────────────
-- CITY THREAT REGIONS (threat intelligence layer)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.city_threat_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  region_code text NOT NULL,
  region_label text,
  threat_score int NOT NULL DEFAULT 0,
  anomaly_cluster int DEFAULT 0,
  hotspot_prediction int DEFAULT 0,
  telemetry jsonb DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_city_region_code ON public.city_threat_regions (region_code);

-- ─────────────────────────────────────────
-- FEDERATION EXCHANGE (simulated multi-agency)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.federation_exchange (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  agency_code text NOT NULL,
  agency_label text,
  alert_class text,
  message text,
  severity text,
  payload jsonb DEFAULT '{}'::jsonb
);

-- RLS: enable as needed per deployment
-- ALTER TABLE public.telemetry_snapshots ENABLE ROW LEVEL SECURITY;
