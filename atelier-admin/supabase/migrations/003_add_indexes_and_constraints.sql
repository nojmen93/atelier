-- ============================================================
-- Migration 003 — Add indexes and fix constraints
-- Applied: March 2026
--
-- Findings from schema audit:
--  - Missing composite indexes for PLM hierarchy queries
--  - Missing indexes on slug columns used in URL routing
--  - Missing index on customizations.logo_id (FK without index)
--  - Missing indexes on search fields (styles.name, logos.company_name)
--  - Missing index on styles.display_order (used in all admin list sorts)
--  - Missing updated_at trigger on variants table
-- ============================================================

-- ============================================================
-- COMPOSITE INDEXES ON styles
-- These cover the most common query patterns:
--   - Public API: "show active styles in concept X"
--   - Public API: "show active styles in category Y"
--   - Full hierarchy filter: concept + category + status
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_styles_status_concept
  ON styles(status, concept_id);

CREATE INDEX IF NOT EXISTS idx_styles_status_category
  ON styles(status, category_id);

CREATE INDEX IF NOT EXISTS idx_styles_concept_category_status
  ON styles(concept_id, category_id, status);

-- ============================================================
-- SLUG INDEXES
-- concepts.slug and categories.slug are used for URL-based
-- routing (e.g. /api/styles?concept=culture&category=t-shirts)
-- but had no indexes.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_concepts_slug
  ON concepts(slug);

CREATE INDEX IF NOT EXISTS idx_categories_slug
  ON categories(slug);

-- ============================================================
-- FOREIGN KEY INDEX — customizations.logo_id
-- FK columns without indexes cause slow joins when querying
-- customizations by logo (e.g. "all mockups using logo X").
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_customizations_logo
  ON customizations(logo_id);

-- ============================================================
-- SEARCH FIELD INDEXES
-- Needed for autocomplete / search queries on these fields.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_styles_name
  ON styles(name);

CREATE INDEX IF NOT EXISTS idx_logos_company_name
  ON logos(company_name);

-- ============================================================
-- DISPLAY ORDER INDEX
-- Every admin list view orders by display_order ASC.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_styles_display_order
  ON styles(display_order);

-- ============================================================
-- MISSING updated_at TRIGGER ON variants
-- The variants table has an updated_at column but no trigger
-- was wired up in the original schema.
-- ============================================================

CREATE TRIGGER update_variants_updated_at
  BEFORE UPDATE ON variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
