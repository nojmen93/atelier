-- Views table
-- Run this migration in the Supabase SQL Editor or via CLI:
--   psql $DATABASE_URL -f supabase/migrations/002_create_views.sql

CREATE TABLE IF NOT EXISTS views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'gallery' CHECK (type IN ('grid', 'gallery')),
  entity TEXT NOT NULL DEFAULT 'styles',
  selected_attributes TEXT[] NOT NULL DEFAULT '{}',
  filters JSONB DEFAULT '[]',
  sort JSONB DEFAULT '[]',
  group_by TEXT[] DEFAULT '{}',
  display_options JSONB DEFAULT '{}',
  export_options JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_views_entity ON views(entity);
CREATE INDEX IF NOT EXISTS idx_views_is_default ON views(is_default);
CREATE INDEX IF NOT EXISTS idx_views_created_by ON views(created_by);
CREATE INDEX IF NOT EXISTS idx_views_created_at ON views(created_at DESC);

-- Reuse existing trigger function
DROP TRIGGER IF EXISTS update_views_updated_at ON views;
CREATE TRIGGER update_views_updated_at BEFORE UPDATE ON views
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
