-- Quote Requests table
-- Run this migration against your Supabase project:
--   psql $DATABASE_URL -f supabase/migrations/001_create_quote_requests.sql

-- Create enum if not exists
DO $$ BEGIN
  CREATE TYPE quote_status AS ENUM ('new', 'reviewed', 'quoted', 'accepted', 'rejected', 'converted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_company TEXT,
  customer_phone TEXT,
  -- Product reference (optional — may reference an existing style)
  style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  product_name TEXT,
  -- Customization preferences
  customization_preferences JSONB DEFAULT '{}',
  logo_file_url TEXT,
  -- Quantity and variant breakdown
  quantity INTEGER NOT NULL DEFAULT 1,
  variant_preferences JSONB DEFAULT '[]',
  -- Customer message
  message TEXT,
  -- Status workflow
  status quote_status NOT NULL DEFAULT 'new',
  -- Quote response
  quoted_price DECIMAL(10,2),
  customization_fee DECIMAL(10,2),
  quoted_at TIMESTAMP WITH TIME ZONE,
  -- Internal
  internal_notes TEXT,
  -- Conversion tracking
  converted_style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  converted_at TIMESTAMP WITH TIME ZONE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON quote_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_quote_requests_style ON quote_requests(style_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created ON quote_requests(created_at DESC);

-- Reuse existing trigger function
CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
