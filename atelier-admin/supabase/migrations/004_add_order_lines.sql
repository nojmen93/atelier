-- ============================================================
-- ORDER LINES — Individual product lines within an order
-- An order can have multiple styles, each as a separate line.
-- ============================================================

CREATE TABLE IF NOT EXISTS order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  style_name TEXT, -- snapshot of the style name at order time
  color TEXT,
  sku TEXT,
  size_breakdown JSONB DEFAULT '[]',
  -- JSON array: [{ size, quantity }]
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2),
  line_total DECIMAL(10,2),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_lines_order ON order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_order_lines_style ON order_lines(style_id);

-- Make style_id nullable on orders since lines now carry the products
-- (The existing column stays for backwards compat but is no longer required)
