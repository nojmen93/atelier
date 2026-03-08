-- Colour Library
CREATE TABLE IF NOT EXISTS colours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colour_name TEXT NOT NULL,
  colour_code TEXT NOT NULL,
  colour_family_code TEXT,
  hex_value TEXT,
  g1_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_colours_name ON colours(colour_name);
CREATE INDEX idx_colours_family ON colours(colour_family_code);

-- Product SKUs
CREATE TABLE IF NOT EXISTS product_skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  colour_id UUID REFERENCES colours(id) ON DELETE SET NULL,
  sku_code TEXT NOT NULL UNIQUE,
  colour_name TEXT,
  customer_abbreviation TEXT,
  logo_description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_skus_style ON product_skus(style_id);
CREATE INDEX idx_product_skus_code ON product_skus(sku_code);

-- Supplier Quotes (pricing from suppliers for products)
CREATE TABLE IF NOT EXISTS supplier_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  colour_id UUID REFERENCES colours(id) ON DELETE SET NULL,
  colour_name TEXT,
  volume_from INTEGER NOT NULL DEFAULT 1,
  volume_to INTEGER,
  currency TEXT NOT NULL DEFAULT 'EUR',
  vendor_price DECIMAL(10,2),
  exchange_rate DECIMAL(10,6) DEFAULT 1.0,
  duty_pct DECIMAL(5,2) DEFAULT 0,
  freight_cost DECIMAL(10,2) DEFAULT 0,
  surcharge DECIMAL(10,2) DEFAULT 0,
  landed_cost DECIMAL(10,2),
  notes TEXT,
  valid_from DATE,
  valid_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_supplier_quotes_style ON supplier_quotes(style_id);
CREATE INDEX idx_supplier_quotes_supplier ON supplier_quotes(supplier_id);

-- RLS policies
ALTER TABLE colours ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON colours FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON product_skus FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON supplier_quotes FOR ALL USING (true);
