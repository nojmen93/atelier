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
-- VIEWS (Saved view configurations)
-- Stores admin-created views for Style data in grid/gallery format.
-- Each view saves: selected attributes, filters, sort, group,
-- display options, and export options.
-- ============================================================

CREATE TABLE views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'gallery' CHECK (type IN ('grid', 'gallery')),
  entity TEXT NOT NULL DEFAULT 'styles',
  selected_attributes TEXT[] NOT NULL DEFAULT '{}',
  filters JSONB DEFAULT '[]',
  sort JSONB DEFAULT '[]',
  group_by TEXT[] DEFAULT '{}',
  display_options JSONB DEFAULT '{}',
  export_options JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID,
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

CREATE TRIGGER update_views_updated_at BEFORE UPDATE ON views
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- QUOTE REQUESTS
-- B2B quote request system. Customers request quotes for
-- customized products. Admin reviews, quotes, and can convert
-- to a Style + Customization + Variants in one click.
-- ============================================================

CREATE TYPE quote_status AS ENUM ('new', 'reviewed', 'quoted', 'accepted', 'rejected', 'converted');

CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_company TEXT,
  customer_phone TEXT,
  -- Product reference (optional — may reference an existing style)
  style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  product_name TEXT,
  -- Customization preferences
  customization_preferences JSONB DEFAULT '{}',
  -- JSON: { placement, technique, pantone_color, width_cm, height_cm }
  logo_file_url TEXT,
  -- Quantity and variant breakdown
  quantity INTEGER NOT NULL DEFAULT 1,
  variant_preferences JSONB DEFAULT '[]',
  -- JSON array: [{ size, color, quantity }]
  -- Customer message
  message TEXT,
  -- Status workflow
  status quote_status NOT NULL DEFAULT 'new',
  -- Quote response
  quoted_price DECIMAL(10,2),
  customization_fee DECIMAL(10,2),
  quoted_at TIMESTAMP WITH TIME ZONE,
  -- Internal
  internal_notes TEXT,
  -- Conversion tracking
  converted_style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  converted_at TIMESTAMP WITH TIME ZONE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_email ON quote_requests(customer_email);
CREATE INDEX idx_quote_requests_style ON quote_requests(style_id);
CREATE INDEX idx_quote_requests_created ON quote_requests(created_at DESC);

CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
-- ORDERS (Production orders)
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  quote_request_id UUID REFERENCES quote_requests(id) ON DELETE SET NULL,
  style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  order_date DATE,
  expected_delivery DATE,
  actual_delivery DATE,
  status order_status NOT NULL DEFAULT 'draft',
  notes TEXT,
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
