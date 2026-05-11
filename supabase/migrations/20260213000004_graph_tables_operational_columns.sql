-- Align graph_nodes / graph_edges with bulkInsertGraphData + dashboard views when the DB
-- was bootstrapped from sentinel9 (node_type/metadata, UUID edge FKs).

-- ─── graph_nodes ───────────────────────────────────────────────────────────
ALTER TABLE public.graph_nodes ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.graph_nodes ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.graph_nodes ADD COLUMN IF NOT EXISTS pos_x DOUBLE PRECISION DEFAULT 0;
ALTER TABLE public.graph_nodes ADD COLUMN IF NOT EXISTS pos_y DOUBLE PRECISION DEFAULT 0;

UPDATE public.graph_nodes gn
SET type = COALESCE(NULLIF(TRIM(gn.type), ''), gn.node_type, 'person')
WHERE gn.node_type IS NOT NULL
  AND (gn.type IS NULL OR TRIM(gn.type) = '');

UPDATE public.graph_nodes gn
SET data = COALESCE(NULLIF(gn.data, '{}'::jsonb), gn.metadata, '{}'::jsonb)
WHERE gn.metadata IS NOT NULL
  AND gn.metadata <> '{}'::jsonb
  AND (gn.data IS NULL OR gn.data = '{}'::jsonb);

-- ─── graph_edges ───────────────────────────────────────────────────────────
ALTER TABLE public.graph_edges ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.graph_edges ADD COLUMN IF NOT EXISTS target TEXT;
ALTER TABLE public.graph_edges ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE public.graph_edges ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

UPDATE public.graph_edges ge
SET
  source = COALESCE(NULLIF(ge.source, ''), ge.source_node_id::text),
  target = COALESCE(NULLIF(ge.target, ''), ge.target_node_id::text),
  label = COALESCE(NULLIF(ge.label, ''), ge.relationship_type),
  data = COALESCE(NULLIF(ge.data, '{}'::jsonb), ge.metadata, '{}'::jsonb)
WHERE ge.source_node_id IS NOT NULL
  AND (ge.source IS NULL OR ge.source = '');
