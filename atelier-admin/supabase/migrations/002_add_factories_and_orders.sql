-- ============================================================
-- MIGRATION 002: Add Factories and Orders tables
-- Part of PLM domain restructure (Production module)
-- ============================================================

-- ============================================================
-- ORDER STATUS ENUM
-- ============================================================

CREATE TYPE order_status AS ENUM (
  'draft',
  'confirmed',
  'in_production',
  'shipped',
  'delivered',
  'cancelled'
);

-- ============================================================
-- FACTORIES (Production facilities)
-- Similar to suppliers but focused on manufacturing/production.
-- ============================================================

CREATE TABLE factories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  capacity_notes TEXT,
  certifications TEXT[],
  production_types TEXT[],
  moq INTEGER,
  lead_time_days INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_factories_updated_at BEFORE UPDATE ON factories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ORDERS (Production orders linking quotes, styles, suppliers)
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  -- Links
  quote_request_id UUID REFERENCES quote_requests(id) ON DELETE SET NULL,
  style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,
  -- Order details
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  -- Dates
  order_date DATE,
  expected_delivery DATE,
  actual_delivery DATE,
  -- Status
  status order_status NOT NULL DEFAULT 'draft',
  -- Notes
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_supplier ON orders(supplier_id);
CREATE INDEX idx_orders_factory ON orders(factory_id);
CREATE INDEX idx_orders_style ON orders(style_id);
CREATE INDEX idx_orders_quote ON orders(quote_request_id);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- UPDATE CONCEPTS TO MATCH PLM DOMAIN STRUCTURE
-- Ensure the 3 hardcoded concepts exist:
-- Culture, Collection, Infrastructure
-- ============================================================

-- Insert if they don't already exist
INSERT INTO concepts (name, slug, display_order)
VALUES
  ('Culture', 'culture', 1),
  ('Collection', 'collection', 2),
  ('Infrastructure', 'infrastructure', 3)
ON CONFLICT (slug) DO NOTHING;
