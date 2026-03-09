-- Add quote_number column for human-readable unique IDs
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS quote_number TEXT UNIQUE;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_quote_requests_quote_number ON quote_requests(quote_number);
