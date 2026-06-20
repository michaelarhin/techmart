export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  parent_id: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  review_count: number;
  listings_count: number;
  is_verified: boolean;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  two_factor_enabled: boolean;
  is_admin: boolean;
  created_at: string;
}

export type ListingCondition = 'new' | 'used-like-new' | 'used-good' | 'used-fair';

export interface Listing {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  price_max: number | null;
  is_negotiable: boolean;
  condition: ListingCondition;
  images: string[];
  specs: Record<string, string>;
  location: string | null;
  phone: string | null;
  is_featured: boolean;
  is_sold: boolean;
  expires_at: string | null;
  reminder_sent_at: string | null;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  categories?: Category;
}

export interface Review {
  id: string;
  reviewer_id: string;
  seller_id: string;
  listing_id: string | null;
  rating: number;
  recommend: boolean | null;
  comment: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string | null;
  content: string;
  phone_shared: boolean;
  is_read: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
}
