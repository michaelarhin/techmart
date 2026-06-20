-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  bio TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  listings_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'used-like-new', 'used-good', 'used-fair')),
  images TEXT[] DEFAULT '{}',
  specs JSONB DEFAULT '{}',
  location TEXT,
  phone TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_sold BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  favorites_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Messages table (for contact)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  phone_shared BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, icon, description) VALUES
('Desktop PCs', 'desktop-pcs', 'Monitor', 'Complete desktop computer systems'),
('Laptops', 'laptops', 'Laptop', 'Laptops and notebooks'),
('Graphics Cards', 'graphics-cards', 'Cpu', 'GPUs and video cards'),
('Processors', 'processors', 'Cpu', 'CPUs and processors'),
('RAM', 'ram', 'MemoryStick', 'Memory modules'),
('Storage', 'storage', 'HardDrive', 'SSDs, HDDs and storage devices'),
('Monitors', 'monitors', 'Monitor', 'Computer monitors and displays'),
('Accessories', 'accessories', 'Keyboard', 'Keyboards, mice, and peripherals'),
('Networking', 'networking', 'Wifi', 'Routers, modems, and network equipment'),
('Other', 'other', 'Package', 'Other computer-related items');

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read)
CREATE POLICY "categories_public_read" ON categories FOR SELECT TO public USING (true);

-- Profiles policies
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT TO public USING (true);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Listings policies
CREATE POLICY "listings_public_read" ON listings FOR SELECT TO public USING (true);
CREATE POLICY "listings_authenticated_insert" ON listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "listings_own_update" ON listings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "listings_own_delete" ON listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT TO public USING (true);
CREATE POLICY "reviews_authenticated_insert" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- Favorites policies
CREATE POLICY "favorites_own_read" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "favorites_own_insert" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_own_delete" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "messages_own_read" ON messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_own_insert" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_own_update" ON messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- Functions to update user stats
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE seller_id = NEW.seller_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE seller_id = NEW.seller_id)
  WHERE id = NEW.seller_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_user_rating();

CREATE OR REPLACE FUNCTION update_listing_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET listings_count = (SELECT COUNT(*) FROM listings WHERE user_id = NEW.user_id AND is_sold = false)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_listing_count
AFTER INSERT OR UPDATE OR DELETE ON listings
FOR EACH ROW EXECUTE FUNCTION update_listing_count();

-- Indexes for better performance
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_reviews_seller ON reviews(seller_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);