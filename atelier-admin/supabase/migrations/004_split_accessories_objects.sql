-- ============================================================
-- Migration 004: Split "Accessories and Objects" into two
-- separate concepts: "Accessories" and "Objects".
-- Remove categories: SLG, Scarves, Eyewear, Jewellery, 5-pocket denim
-- Add "Other" category under Objects.
-- ============================================================

BEGIN;

-- Step 1: Rename "Accessories and Objects" to "Accessories"
UPDATE concepts
SET name = 'Accessories', slug = 'accessories'
WHERE slug = 'accessories-and-objects';

-- Step 2: Insert "Objects" as a new concept
INSERT INTO concepts (name, slug, display_order) VALUES
  ('Objects', 'objects', 2)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order;

-- Step 3: Add "Other" category under Objects
INSERT INTO categories (concept_id, name, slug, display_order) VALUES
  ((SELECT id FROM concepts WHERE slug = 'objects'), 'Other', 'other', 0)
ON CONFLICT (concept_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order;

-- Step 4: Remove unwanted categories
-- (reassign any styles referencing them to a safe fallback first)

-- Reassign styles on removed Accessories categories to "Other accessories"
UPDATE styles
SET category_id = (
  SELECT id FROM categories
  WHERE slug = 'other-accessories'
    AND concept_id = (SELECT id FROM concepts WHERE slug = 'accessories')
)
WHERE category_id IN (
  SELECT id FROM categories
  WHERE slug IN ('slg', 'scarves', 'eyewear', 'jewellery')
    AND concept_id = (SELECT id FROM concepts WHERE slug = 'accessories')
);

-- Reassign styles on 5-pocket denim (RTW) to Trousers
UPDATE styles
SET category_id = (
  SELECT id FROM categories
  WHERE slug = 'trousers'
    AND concept_id = (SELECT id FROM concepts WHERE slug = 'rtw')
)
WHERE category_id IN (
  SELECT id FROM categories
  WHERE slug = '5-pocket-denim'
    AND concept_id = (SELECT id FROM concepts WHERE slug = 'rtw')
);

-- Now delete the removed categories
DELETE FROM categories WHERE slug = 'slg'
  AND concept_id = (SELECT id FROM concepts WHERE slug = 'accessories');
DELETE FROM categories WHERE slug = 'scarves'
  AND concept_id = (SELECT id FROM concepts WHERE slug = 'accessories');
DELETE FROM categories WHERE slug = 'eyewear'
  AND concept_id = (SELECT id FROM concepts WHERE slug = 'accessories');
DELETE FROM categories WHERE slug = 'jewellery'
  AND concept_id = (SELECT id FROM concepts WHERE slug = 'accessories');
DELETE FROM categories WHERE slug = '5-pocket-denim'
  AND concept_id = (SELECT id FROM concepts WHERE slug = 'rtw');

-- Step 5: Re-order remaining Accessories categories
UPDATE categories SET display_order = 0 WHERE slug = 'bags'
  AND concept_id = (SELECT id FROM concepts WHERE slug = 'accessories');
UPDATE categories SET display_order = 1 WHERE slug = 'shoes'
  AND concept_id = (SELECT id FROM concepts WHERE slug = 'accessories');
UPDATE categories SET display_order = 2 WHERE slug = 'hats'
  AND concept_id = (SELECT id FROM concepts WHERE slug = 'accessories');
UPDATE categories SET display_order = 3 WHERE slug = 'other-accessories'
  AND concept_id = (SELECT id FROM concepts WHERE slug = 'accessories');
UPDATE categories SET display_order = 4 WHERE slug = 'socks'
  AND concept_id = (SELECT id FROM concepts WHERE slug = 'accessories');

COMMIT;
