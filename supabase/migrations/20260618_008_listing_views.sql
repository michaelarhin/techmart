-- Track individual listing views so sellers can see who visited their ads.
-- Each row = one user visiting one listing (logged once per user per listing per day).

CREATE TABLE IF NOT EXISTS listing_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, viewer_id, viewed_at)
);

-- Prevent duplicate rows for the same user on the same day
CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_views_unique_daily
  ON listing_views (listing_id, viewer_id, (viewed_at::date));

ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

-- Anyone signed in can insert their own view.
CREATE POLICY "listing_views_insert" ON listing_views
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = viewer_id);

-- The listing owner can see who viewed their listings.
CREATE POLICY "listing_views_owner_read" ON listing_views
  FOR SELECT TO authenticated
  USING (
    listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid())
  );

-- The viewer can also see their own view rows.
CREATE POLICY "listing_views_self_read" ON listing_views
  FOR SELECT TO authenticated
  USING (auth.uid() = viewer_id);

CREATE INDEX IF NOT EXISTS idx_listing_views_listing ON listing_views(listing_id, viewed_at DESC);
