-- ============================================================
-- Migration 008: Add product attributes from PLM mapping
-- Adds all missing columns to styles table as defined in
-- the PLM_Mapping_Attributes spreadsheet (Styles - Attributes)
-- ============================================================

-- Product (Base) attributes
ALTER TABLE styles ADD COLUMN IF NOT EXISTS base_style_code TEXT;

-- Hierarchy
ALTER TABLE styles ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- Commercial attributes
ALTER TABLE styles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS show_on_website BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS rrp_eur DECIMAL(10,2);

-- Content
ALTER TABLE styles ADD COLUMN IF NOT EXISTS extended_description TEXT;

-- Specification
ALTER TABLE styles ADD COLUMN IF NOT EXISTS composition TEXT;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS fabric_construction TEXT;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS packaging_method TEXT;

-- Production
ALTER TABLE styles ADD COLUMN IF NOT EXISTS production_factory TEXT;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS production_country TEXT;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS production_city TEXT;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS mid_number TEXT;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS delivery_drop TEXT;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS eu_hs_code TEXT;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS us_hs_code TEXT;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS hts_lookup_ref TEXT;
ALTER TABLE styles ADD COLUMN IF NOT EXISTS landed_cost_eur DECIMAL(10,2);

-- Add comments for documentation
COMMENT ON COLUMN styles.base_style_code IS 'Stable internal code (e.g., SH-SOF-01)';
COMMENT ON COLUMN styles.sub_category IS 'Optional finer category grouping';
COMMENT ON COLUMN styles.display_name IS 'Customer-facing name on portal/website';
COMMENT ON COLUMN styles.active IS 'Controls if the style is active in the system';
COMMENT ON COLUMN styles.show_on_website IS 'Controls visibility on public website';
COMMENT ON COLUMN styles.rrp_eur IS 'Optional reference retail price (EUR)';
COMMENT ON COLUMN styles.extended_description IS 'Longer description for PDFs/quotes';
COMMENT ON COLUMN styles.composition IS 'Fiber composition (e.g., 100% cotton)';
COMMENT ON COLUMN styles.fabric_construction IS 'Knit / Woven / Neither classification';
COMMENT ON COLUMN styles.packaging_method IS 'Packaging/labeling method';
COMMENT ON COLUMN styles.production_factory IS 'Factory (optional separate entity)';
COMMENT ON COLUMN styles.production_country IS 'Country of production';
COMMENT ON COLUMN styles.production_city IS 'City of production';
COMMENT ON COLUMN styles.mid_number IS 'Manufacturer Identification (US) where relevant';
COMMENT ON COLUMN styles.delivery_drop IS 'Optional internal delivery/drop field';
COMMENT ON COLUMN styles.eu_hs_code IS 'Tariff/HS code for EU';
COMMENT ON COLUMN styles.us_hs_code IS 'Tariff/HS code for US';
COMMENT ON COLUMN styles.hts_lookup_ref IS 'Reference used for HTS lookup';
COMMENT ON COLUMN styles.landed_cost_eur IS 'Baseline landed cost (can be derived from open costing)';
