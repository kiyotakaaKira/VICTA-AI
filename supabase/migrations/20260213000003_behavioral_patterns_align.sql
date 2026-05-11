-- Align behavioral_patterns with backend inserts + seed (subject_id, confidence, data).
-- Safe if table came from sentinel9 (metadata) or backend/schema.sql (data).

ALTER TABLE public.behavioral_patterns ADD COLUMN IF NOT EXISTS subject_id TEXT;
ALTER TABLE public.behavioral_patterns ADD COLUMN IF NOT EXISTS confidence INTEGER DEFAULT 50;
ALTER TABLE public.behavioral_patterns ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'behavioral_patterns' AND column_name = 'metadata'
  ) THEN
    EXECUTE $u$
      UPDATE public.behavioral_patterns bp
      SET data = COALESCE(
        NULLIF(bp.data, '{}'::jsonb),
        bp.metadata,
        '{}'::jsonb
      )
      WHERE (bp.data IS NULL OR bp.data = '{}'::jsonb)
        AND bp.metadata IS NOT NULL
        AND bp.metadata <> '{}'::jsonb
    $u$;
  END IF;
END $$;
