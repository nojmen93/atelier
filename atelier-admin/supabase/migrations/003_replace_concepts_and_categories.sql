-- ============================================================
-- Migration: Replace old concepts and categories with correct
-- product hierarchy data.
--
-- Old concepts (Culture, Collection, Infrastructure) are replaced
-- with the correct ones: RTW, Accessories and Objects.
--
-- Categories are seeded per concept as defined in the product
-- hierarchy specification.
-- ============================================================

-- ============================================================
-- Step 0: Add new enum value (must be outside transaction)
-- ============================================================
ALTER TYPE collection_type ADD VALUE IF NOT EXISTS 'editorials';

-- ============================================================
-- Step 1: Data migrations and concept/category replacement
-- ============================================================
BEGIN;

-- Update any styles using 'na' gender to 'unisex'
UPDATE styles SET gender = 'unisex' WHERE gender = 'na';

-- Migrate existing 'editorial' data to 'editorials'
UPDATE styles SET collection_type = 'editorials' WHERE collection_type = 'editorial';

-- ============================================================
-- Step 2: Remove old categories and concepts
-- Must delete categories first (FK to concepts).
-- Styles referencing old categories use RESTRICT —
-- if styles exist, they must be re-assigned manually
-- or this migration will fail safely.
-- ============================================================

-- Delete categories that belong to old concepts
DELETE FROM categories
WHERE concept_id IN (
  SELECT id FROM concepts
  WHERE slug IN ('culture', 'collection', 'infrastructure')
);

-- Delete old concepts
DELETE FROM concepts
WHERE slug IN ('culture', 'collection', 'infrastructure');

-- ============================================================
-- Step 3: Insert correct concepts
-- ============================================================

INSERT INTO concepts (name, slug, display_order) VALUES
  ('RTW', 'rtw', 0),
  ('Accessories and Objects', 'accessories-and-objects', 1)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order;

-- ============================================================
-- Step 4: Insert RTW categories
-- ============================================================

INSERT INTO categories (concept_id, name, slug, display_order) VALUES
  ((SELECT id FROM concepts WHERE slug = 'rtw'), 'Knitwear', 'knitwear', 0),
  ((SELECT id FROM concepts WHERE slug = 'rtw'), 'Leather', 'leather', 1),
  ((SELECT id FROM concepts WHERE slug = 'rtw'), 'Outerwear', 'outerwear', 2),
  ((SELECT id FROM concepts WHERE slug = 'rtw'), 'Suit Jackets', 'suit-jackets', 3),
  ((SELECT id FROM concepts WHERE slug = 'rtw'), 'Sweatshirts', 'sweatshirts', 4),
  ((SELECT id FROM concepts WHERE slug = 'rtw'), 'Swimwear', 'swimwear', 5),
  ((SELECT id FROM concepts WHERE slug = 'rtw'), 'Trousers', 'trousers', 6),
  ((SELECT id FROM concepts WHERE slug = 'rtw'), 'T-shirts', 't-shirts', 7),
  ((SELECT id FROM concepts WHERE slug = 'rtw'), 'Shirts', 'shirts', 8),
  ((SELECT id FROM concepts WHERE slug = 'rtw'), 'Shorts', 'shorts', 9),
  ((SELECT id FROM concepts WHERE slug = 'rtw'), 'Skirts', 'skirts', 10),
  ((SELECT id FROM concepts WHERE slug = 'rtw'), '5-pocket denim', '5-pocket-denim', 11)
ON CONFLICT (concept_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order;

-- ============================================================
-- Step 5: Insert Accessories and Objects categories
-- ============================================================

INSERT INTO categories (concept_id, name, slug, display_order) VALUES
  ((SELECT id FROM concepts WHERE slug = 'accessories-and-objects'), 'Bags', 'bags', 0),
  ((SELECT id FROM concepts WHERE slug = 'accessories-and-objects'), 'SLG', 'slg', 1),
  ((SELECT id FROM concepts WHERE slug = 'accessories-and-objects'), 'Scarves', 'scarves', 2),
  ((SELECT id FROM concepts WHERE slug = 'accessories-and-objects'), 'Shoes', 'shoes', 3),
  ((SELECT id FROM concepts WHERE slug = 'accessories-and-objects'), 'Hats', 'hats', 4),
  ((SELECT id FROM concepts WHERE slug = 'accessories-and-objects'), 'Eyewear', 'eyewear', 5),
  ((SELECT id FROM concepts WHERE slug = 'accessories-and-objects'), 'Jewellery', 'jewellery', 6),
  ((SELECT id FROM concepts WHERE slug = 'accessories-and-objects'), 'Other accessories', 'other-accessories', 7),
  ((SELECT id FROM concepts WHERE slug = 'accessories-and-objects'), 'Socks', 'socks', 8)
ON CONFLICT (concept_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order;

COMMIT;
