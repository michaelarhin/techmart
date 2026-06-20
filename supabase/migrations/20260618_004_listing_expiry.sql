-- Listings go live for 30 days. We track when they expire and whether a
-- "your listing is about to disappear" reminder has already been sent.
-- Also store the seller's email so buyers can reach out directly.

ALTER TABLE listings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- Backfill existing listings: 30 days from when they were created.
UPDATE listings
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;

-- New listings default to 30 days from now.
ALTER TABLE listings ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '30 days');

CREATE INDEX IF NOT EXISTS idx_listings_expires ON listings(expires_at);

-- Seller email for the public "contact the publisher" block.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
