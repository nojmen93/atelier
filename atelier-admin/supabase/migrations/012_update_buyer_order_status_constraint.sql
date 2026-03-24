-- Migration: Expand buyer_orders.status CHECK constraint
-- Adds 'delivered' and 'cancelled' to the allowed status values

ALTER TABLE buyer_orders DROP CONSTRAINT IF EXISTS buyer_orders_status_check;
ALTER TABLE buyer_orders ADD CONSTRAINT buyer_orders_status_check
  CHECK (status IN ('draft', 'pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'));
