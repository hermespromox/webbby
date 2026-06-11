-- Webbby: searches table
CREATE TABLE IF NOT EXISTS public.searches (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  criteria JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON public.searches (created_at DESC);

-- Enable RLS
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;

-- Allow service_role to do everything
CREATE POLICY "service_role full access"
  ON public.searches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
