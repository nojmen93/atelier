-- Add size field to product_skus for per-colour-per-size SKU generation
ALTER TABLE product_skus ADD COLUMN IF NOT EXISTS size TEXT;

-- Drop the unique constraint on sku_code to allow colour+size combos
-- (sku_code will still be unique per row via the generated format)
