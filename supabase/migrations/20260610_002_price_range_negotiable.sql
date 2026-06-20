-- Add price range and negotiable fields to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS price_max NUMERIC(12,2) DEFAULT NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_negotiable BOOLEAN DEFAULT FALSE;
