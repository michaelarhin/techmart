-- Identity verification (Ghana Card) + two-factor flag.
-- Sellers must be verified before they can publish listings.

-- Non-sensitive flags live on profiles (which is public-read).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_verification_status_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_verification_status_check
      CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
  END IF;
END $$;

-- Sensitive ID documents live in their own table with strict, owner-only RLS,
-- so a Ghana Card number/photo is NEVER exposed through the public profiles read.
CREATE TABLE IF NOT EXISTS verifications (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  ghana_card_number TEXT,
  ghana_card_image TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Only the owner can read or write their own verification record.
DROP POLICY IF EXISTS "verifications_own_all" ON verifications;
CREATE POLICY "verifications_own_all" ON verifications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- For production, store the card image in a PRIVATE Storage bucket and keep only
-- a reference here, rather than an inline data URL.
