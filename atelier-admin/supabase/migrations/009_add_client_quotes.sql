-- Client-facing quote tables for the public quote website
-- These are OUTBOUND quotes sent from Atelier TO clients,
-- distinct from quote_requests which are inbound requests FROM clients.

CREATE TABLE IF NOT EXISTS client_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  secret_id TEXT NOT NULL UNIQUE,           -- used in public URL: /quote/{secret_id}
  quote_request_id UUID REFERENCES quote_requests(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_logo_url TEXT,                     -- URL from Supabase Storage or external
  intro_message TEXT,
  delivery_timeline TEXT,
  valid_until DATE,
  terms TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'revision', 'declined', 'expired')),
  client_response_action TEXT
    CHECK (client_response_action IN ('approved', 'revision')),
  client_response_message TEXT,
  client_responded_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES client_quotes(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  mockup_image_urls TEXT[] DEFAULT '{}',
  decoration_type TEXT
    CHECK (decoration_type IN ('embroidery', 'screenprint', 'dtg', 'heattransfer')),
  colors TEXT[] DEFAULT '{}',
  sizes TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_quotes_secret_id ON client_quotes(secret_id);
CREATE INDEX IF NOT EXISTS idx_client_quotes_status ON client_quotes(status);
CREATE INDEX IF NOT EXISTS idx_client_quotes_email ON client_quotes(client_email);
CREATE INDEX IF NOT EXISTS idx_client_quotes_request ON client_quotes(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_client_quote_items_quote ON client_quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_client_quote_items_sort ON client_quote_items(quote_id, sort_order);

CREATE TRIGGER update_client_quotes_updated_at
  BEFORE UPDATE ON client_quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE client_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_quote_items ENABLE ROW LEVEL SECURITY;

-- Public anon key can read (the web app uses anon key for fetching)
CREATE POLICY "Public read client_quotes" ON client_quotes
  FOR SELECT USING (true);

CREATE POLICY "Public read client_quote_items" ON client_quote_items
  FOR SELECT USING (true);

-- Authenticated admin users can do everything
CREATE POLICY "Authenticated full access client_quotes" ON client_quotes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access client_quote_items" ON client_quote_items
  FOR ALL USING (auth.role() = 'authenticated');
