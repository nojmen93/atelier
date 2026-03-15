-- Add margin calculation and pricing method fields to supplier_quotes
-- Matches PRICE & MARGIN CALCULATION spreadsheet columns

ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS pricing_method TEXT DEFAULT 'FOB';
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS shipping_country TEXT;
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS material_cost DECIMAL(10,2);
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS material_cost_currency TEXT DEFAULT 'EUR';
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS target_margin_pct DECIMAL(5,2);
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS target_retail_price DECIMAL(10,2);
