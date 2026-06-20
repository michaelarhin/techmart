-- Seller follow system: customers can "follow" a seller (via the existing
-- favorites mechanism on their profile) and get notified when the seller
-- posts a new listing.
--
-- We add a dedicated follows table (user follows seller) so we can look up
-- followers when a listing is created.

CREATE TABLE IF NOT EXISTS seller_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, seller_id)
);

ALTER TABLE seller_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seller_follows_public_read" ON seller_follows
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "seller_follows_own_insert" ON seller_follows
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "seller_follows_own_delete" ON seller_follows
  FOR DELETE TO authenticated USING (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS idx_seller_follows_seller ON seller_follows(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_follows_follower ON seller_follows(follower_id);
