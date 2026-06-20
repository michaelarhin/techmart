-- ============================================================
-- Storage bucket for listing images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "listings_storage_public_read" ON storage.objects;
CREATE POLICY "listings_storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'listings');

DROP POLICY IF EXISTS "listings_storage_auth_insert" ON storage.objects;
CREATE POLICY "listings_storage_auth_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listings');

DROP POLICY IF EXISTS "listings_storage_owner_delete" ON storage.objects;
CREATE POLICY "listings_storage_owner_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'listings' AND owner = auth.uid());

-- ============================================================
-- Admin role + verification review policies
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Admins can read every pending/handled verification.
DROP POLICY IF EXISTS "verifications_admin_read" ON verifications;
CREATE POLICY "verifications_admin_read" ON verifications
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- Admins can approve/reject verifications.
DROP POLICY IF EXISTS "verifications_admin_update" ON verifications;
CREATE POLICY "verifications_admin_update" ON verifications
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- Admins can flip another user's verification flags on the profile.
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update" ON profiles
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (true);

-- ------------------------------------------------------------
-- To make yourself an admin, run (once) with your account's id:
--   UPDATE profiles SET is_admin = true WHERE id = '<your-user-id>';
-- Then visit /admin to review seller verifications.
-- ------------------------------------------------------------
