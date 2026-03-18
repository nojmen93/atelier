-- Migration: Add buyer-related tables for the Buyer Portal
-- Tables: buyers, buyer_product_access, buyer_orders, buyer_order_line_items

CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS buyers_user_id_idx ON buyers(user_id);
CREATE INDEX IF NOT EXISTS buyers_email_idx ON buyers(email);

CREATE TABLE IF NOT EXISTS buyer_product_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT TRUE,
  price_override DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(buyer_id, style_id)
);

CREATE INDEX IF NOT EXISTS bpa_buyer_id_idx ON buyer_product_access(buyer_id);
CREATE INDEX IF NOT EXISTS bpa_style_id_idx ON buyer_product_access(style_id);

CREATE TABLE IF NOT EXISTS buyer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'confirmed', 'in_production', 'shipped')),
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bo_buyer_id_idx ON buyer_orders(buyer_id);
CREATE INDEX IF NOT EXISTS bo_status_idx ON buyer_orders(status);

CREATE TABLE IF NOT EXISTS buyer_order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES buyer_orders(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES styles(id),
  variant_id UUID NOT NULL REFERENCES variants(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2),
  placement_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS boli_order_id_idx ON buyer_order_line_items(order_id);
CREATE INDEX IF NOT EXISTS boli_style_id_idx ON buyer_order_line_items(style_id);
CREATE INDEX IF NOT EXISTS boli_variant_id_idx ON buyer_order_line_items(variant_id);

-- RLS policies
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_product_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_order_line_items ENABLE ROW LEVEL SECURITY;

-- Buyers can read their own record
CREATE POLICY buyers_select_own ON buyers
  FOR SELECT USING (auth.uid() = user_id);

-- Buyer product access: buyers see their own access entries
CREATE POLICY bpa_select_own ON buyer_product_access
  FOR SELECT USING (
    buyer_id IN (SELECT id FROM buyers WHERE user_id = auth.uid())
  );

-- Buyer orders: buyers can CRUD their own orders
CREATE POLICY bo_select_own ON buyer_orders
  FOR SELECT USING (
    buyer_id IN (SELECT id FROM buyers WHERE user_id = auth.uid())
  );

CREATE POLICY bo_insert_own ON buyer_orders
  FOR INSERT WITH CHECK (
    buyer_id IN (SELECT id FROM buyers WHERE user_id = auth.uid())
  );

CREATE POLICY bo_update_own ON buyer_orders
  FOR UPDATE USING (
    buyer_id IN (SELECT id FROM buyers WHERE user_id = auth.uid())
  );

-- Buyer order line items: buyers can CRUD items on their own orders
CREATE POLICY boli_select_own ON buyer_order_line_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM buyer_orders
      WHERE buyer_id IN (SELECT id FROM buyers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY boli_insert_own ON buyer_order_line_items
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM buyer_orders
      WHERE buyer_id IN (SELECT id FROM buyers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY boli_update_own ON buyer_order_line_items
  FOR UPDATE USING (
    order_id IN (
      SELECT id FROM buyer_orders
      WHERE buyer_id IN (SELECT id FROM buyers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY boli_delete_own ON buyer_order_line_items
  FOR DELETE USING (
    order_id IN (
      SELECT id FROM buyer_orders
      WHERE buyer_id IN (SELECT id FROM buyers WHERE user_id = auth.uid())
    )
  );

-- Service role (admin) bypasses RLS, so no admin policies needed
