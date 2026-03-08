-- ============================================================
-- 3-LEVEL ORDER STRUCTURE
--   Order (customer-facing)
--     └── Purchase Order (one per supplier/factory)
--           └── PO Line (one per product within that PO)
-- ============================================================

-- ── PURCHASE ORDERS ─────────────────────────────────────────
-- One PO per supplier/factory within an order.
-- This is the document you send to a factory.

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  po_number TEXT, -- e.g. PO-2603-0001-A
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,
  expected_delivery DATE,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_order ON purchase_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);

-- ── PO LINES ────────────────────────────────────────────────
-- One line per product within a PO.

CREATE TABLE IF NOT EXISTS po_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  style_name TEXT, -- snapshot at order time
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

CREATE INDEX IF NOT EXISTS idx_po_lines_po ON po_lines(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_lines_style ON po_lines(style_id);

-- ── Customer fields on orders ───────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_company TEXT;
