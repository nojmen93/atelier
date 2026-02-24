-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE gender_type AS ENUM ('mens', 'womens', 'unisex', 'na');
CREATE TYPE collection_type AS ENUM ('editorial', 'signature', 'foundation', 'special_projects');
CREATE TYPE product_capability AS ENUM ('none', 'simple_customizable', 'quote_only', 'both');
CREATE TYPE style_status AS ENUM ('active', 'development', 'archived');

-- ============================================================
-- LEVEL 1 — CONCEPTS (Permanent Top Level)
-- Examples: RTW, Home, Accessories
-- Permanent structure, NOT seasonal
-- ============================================================

CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- SUPPLIERS
-- ============================================================

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  moq INTEGER,
  lead_time_days INTEGER,
  production_location TEXT,
  cost_structure JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- LEVEL 3 — CATEGORIES (Operational Level)
-- Belongs to a Concept. Used for filtering, reporting,
-- supplier grouping, MOQ logic, production planning.
-- Supports default inheritance for Styles.
-- ============================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  -- Inheritance defaults (Styles inherit unless overridden)
  default_moq INTEGER,
  default_supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  default_lead_time_days INTEGER,
  default_margin_rule TEXT,
  technique_compatibility TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(concept_id, slug)
);

-- ============================================================
-- LEVEL 4 — STYLES (Core Product Entity)
-- This IS the product. Contains all master data.
-- Gender is Level 2 in the hierarchy but stored as an enum here.
-- Collection Type is a strategic attribute, NOT hierarchy.
-- ============================================================

CREATE TABLE styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE RESTRICT,
  gender gender_type NOT NULL DEFAULT 'unisex',
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  base_cost DECIMAL(10,2),
  lead_time_days INTEGER,
  customization_mode TEXT,
  -- Strategic attribute — NOT part of hierarchy
  collection_type collection_type NOT NULL DEFAULT 'foundation',
  -- Operational attribute — controls frontend behavior
  product_capability product_capability NOT NULL DEFAULT 'none',
  status style_status NOT NULL DEFAULT 'development',
  description TEXT,
  material TEXT,
  images TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- LEVEL 5 — VARIANTS (Size/Color)
-- ============================================================

CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  sku TEXT UNIQUE,
  stock INTEGER DEFAULT 0,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- LOGO LIBRARY
-- ============================================================

CREATE TABLE logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_format TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CUSTOMIZATIONS
-- ============================================================

CREATE TABLE customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  logo_id UUID NOT NULL REFERENCES logos(id) ON DELETE CASCADE,
  placement TEXT NOT NULL,
  technique TEXT NOT NULL,
  pantone_color TEXT,
  width_cm DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  mockup_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- RULES ENGINE
-- Extensible, configurable rules (NOT hardcoded).
-- Examples:
--   IF collection_type = 'foundation' → margin_override { "margin": 0.4 }
--   IF product_capability = 'quote_only' → disable_checkout { "rfq": true }
-- ============================================================

CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  condition_field TEXT NOT NULL,
  condition_value TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_value JSONB,
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_categories_concept ON categories(concept_id);
CREATE INDEX idx_styles_concept ON styles(concept_id);
CREATE INDEX idx_styles_category ON styles(category_id);
CREATE INDEX idx_styles_gender ON styles(gender);
CREATE INDEX idx_styles_collection_type ON styles(collection_type);
CREATE INDEX idx_styles_status ON styles(status);
CREATE INDEX idx_styles_supplier ON styles(supplier_id);
CREATE INDEX idx_variants_style ON variants(style_id);
CREATE INDEX idx_customizations_style ON customizations(style_id);
CREATE INDEX idx_rules_condition ON rules(condition_field, condition_value);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_concepts_updated_at BEFORE UPDATE ON concepts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_styles_updated_at BEFORE UPDATE ON styles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- EXAMPLE: Dynamic Filtering Query
-- "Show all Signature T-shirts in RTW, Unisex"
-- ============================================================
--
-- SELECT s.*, c.name AS category_name, co.name AS concept_name
-- FROM styles s
-- JOIN categories c ON s.category_id = c.id
-- JOIN concepts co ON s.concept_id = co.id
-- WHERE co.slug = 'rtw'
--   AND s.gender = 'unisex'
--   AND c.slug = 't-shirts'
--   AND s.collection_type = 'signature'
--   AND s.status = 'active';
--
-- ============================================================
-- INHERITANCE LOGIC
-- When creating/editing a Style, the system should:
-- 1. Load category defaults (default_moq, default_supplier_id, etc.)
-- 2. Pre-fill Style fields with these defaults
-- 3. Allow Style-level override of any inherited value
-- 4. Store the final value on the Style (explicit storage, not runtime lookup)
-- ============================================================
