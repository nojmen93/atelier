-- ============================================================
-- Migration: Replace old concepts and categories with correct
-- product hierarchy data.
--
-- Old concepts (Culture, Collection, Infrastructure) are replaced
-- with the correct ones: RTW, Accessories and Objects.
--
-- Existing styles are reassigned to the new hierarchy before
-- old data is deleted.
-- ============================================================

-- Step 0: Add new enum value (must be outside transaction)
ALTER TYPE collection_type ADD VALUE IF NOT EXISTS 'editorials';

-- ============================================================
BEGIN;

-- Step 1: Enum data migrations
UPDATE styles SET gender = 'unisex' WHERE gender = 'na';
UPDATE styles SET collection_type = 'editorials' WHERE collection_type = 'editorial';

-- Step 2: Insert new concepts first (so we can reference them)
INSERT INTO concepts (name, slug, display_order) VALUES
  ('RTW', 'rtw', 0),
  ('Accessories and Objects', 'accessories-and-objects', 1)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order;

-- Step 3: Insert new categories
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

-- Step 4: Reassign existing styles from old concepts to RTW / T-shirts
-- (all existing test/demo styles default to RTW > T-shirts as a safe fallback)
UPDATE styles
SET concept_id = (SELECT id FROM concepts WHERE slug = 'rtw'),
    category_id = (SELECT id FROM categories WHERE slug = 't-shirts'
                   AND concept_id = (SELECT id FROM concepts WHERE slug = 'rtw'))
WHERE concept_id IN (
  SELECT id FROM concepts WHERE slug IN ('culture', 'collection', 'infrastructure')
);

-- Step 5: Now safe to delete old categories (no more FK references)
DELETE FROM categories
WHERE concept_id IN (
  SELECT id FROM concepts
  WHERE slug IN ('culture', 'collection', 'infrastructure')
);

-- Step 6: Delete old concepts
DELETE FROM concepts
WHERE slug IN ('culture', 'collection', 'infrastructure');

COMMIT;
