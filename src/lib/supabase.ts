import { createClient } from '@supabase/supabase-js';

// Hardcoded for reliability — these are public (anon) credentials, safe for client-side.
const supabaseUrl = 'https://bsdcskvwqwadcoplklir.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZGNza3Z3cXdhZGNvcGxrbGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMzc0NDQsImV4cCI6MjA5NjYxMzQ0NH0.6wd9jgyJthAJByl2LDiuNdAdbeavOzhh-9GmATP9SQM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Profiles ---

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const createProfile = async (
  userId: string,
  profileData: { full_name?: string; email?: string; phone?: string; location?: string; bio?: string; avatar_url?: string }
) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, ...profileData })
    .select()
    .single();
  return { data, error };
};

/**
 * Makes sure a profile row exists for the signed-in user. First-time OAuth
 * (e.g. Google) users have an auth session but no profile yet, so we create
 * one from their Google name / email / avatar. Returns the profile.
 */
export const ensureProfile = async (user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) => {
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (existing) return { data: existing, error: null };

  const meta = user.user_metadata || {};
  const full_name =
    (meta.full_name as string) ||
    (meta.name as string) ||
    (user.email ? user.email.split('@')[0] : 'User');
  const avatar_url = (meta.avatar_url as string) || (meta.picture as string) || undefined;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, full_name, email: user.email ?? null, avatar_url },
      { onConflict: 'id' }
    )
    .select()
    .single();
  return { data, error };
};

export const updateProfile = async (
  userId: string,
  patch: Record<string, unknown>
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

const GHANA_CARD_RE = /^GHA-\d{9}-\d$/;

export const isValidGhanaCard = (value: string) => GHANA_CARD_RE.test(value.trim().toUpperCase());

/**
 * Submit Ghana Card details for review. The card number must match the official
 * format and a clear photo is required. The submission goes into a 'pending'
 * state for an admin to approve from the review queue (/admin).
 */
export const submitVerification = async (
  userId: string,
  payload: { number: string; image: string }
) => {
  const number = payload.number.trim().toUpperCase();
  if (!isValidGhanaCard(number)) {
    return { data: null, error: new Error('Enter a valid Ghana Card number (GHA-XXXXXXXXX-X).') };
  }
  if (!payload.image) {
    return { data: null, error: new Error('Please upload a clear photo of your Ghana Card.') };
  }
  const { error: vErr } = await supabase.from('verifications').upsert({
    user_id: userId,
    ghana_card_number: number,
    ghana_card_image: payload.image,
    status: 'pending',
    updated_at: new Date().toISOString(),
  });
  if (vErr) return { data: null, error: vErr };
  return updateProfile(userId, { verification_status: 'pending' });
};

// --- Admin: verification review queue ---

export const getPendingVerifications = async () => {
  const { data, error } = await supabase
    .from('verifications')
    .select('user_id, ghana_card_number, ghana_card_image, status, created_at, profiles:user_id(full_name, email, phone, location)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  return { data: data || [], error };
};

export const reviewVerification = async (userId: string, approve: boolean) => {
  const status = approve ? 'verified' : 'rejected';
  const { error: vErr } = await supabase
    .from('verifications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (vErr) return { error: vErr };
  const { error } = await supabase
    .from('profiles')
    .update({ verification_status: status, is_verified: approve })
    .eq('id', userId);
  return { error };
};

// --- Categories ---

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  return { data: data || [], error };
};

// --- Listings ---

interface ListingFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  limit?: number;
}

export const getListings = async (filters: ListingFilters = {}) => {
  let query = supabase
    .from('listings')
    .select('*, profiles!listings_user_id_fkey(*), categories(*)')
    .eq('is_sold', false)
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('categories.slug', filters.category);
    // Use an inner join approach by filtering on a joined table
    query = supabase
      .from('listings')
      .select('*, profiles!listings_user_id_fkey(*), categories!inner(*)')
      .eq('is_sold', false)
      .eq('categories.slug', filters.category)
      .order('created_at', { ascending: false });
  }

  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters.condition) {
    query = query.eq('condition', filters.condition);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  return { data: data || [], error };
};

/** Push a listing's expiry 30 days into the future and clear any reminder flag. */
export const renewListing = async (id: string) => {
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('listings')
    .update({ expires_at, reminder_sent_at: null })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

/** Toggle a listing's sold state (owner only, enforced by RLS). */
export const setListingSold = async (id: string, isSold: boolean) => {
  const { data, error } = await supabase
    .from('listings')
    .update({ is_sold: isSold })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

/** Permanently delete a listing (owner only, enforced by RLS). */
export const deleteListing = async (id: string) => {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  return { error };
};

export const getListing = async (id: string) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*, profiles!listings_user_id_fkey(*), categories(*)')
    .eq('id', id)
    .single();

  // Increment the counter (best-effort, fire-and-forget).
  if (data) {
    supabase
      .from('listings')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', id)
      .then(() => {});
  }

  return { data, error };
};

/**
 * Record that a signed-in user viewed a listing (one record per user per day).
 * Fire-and-forget — silently does nothing on conflict or when logged out.
 */
export const recordListingView = async (listingId: string, viewerId: string) => {
  await supabase.from('listing_views').upsert(
    { listing_id: listingId, viewer_id: viewerId, viewed_at: new Date().toISOString() },
    { onConflict: 'listing_id,viewer_id,viewed_at' }
  ).then(() => {});
};

/**
 * Get the list of users who viewed a listing (for the listing owner).
 * Returns most recent viewers first, with their profile info.
 */
export const getListingViewers = async (listingId: string) => {
  const { data, error } = await supabase
    .from('listing_views')
    .select('viewer_id, viewed_at, profiles:viewer_id(full_name, avatar_url, location)')
    .eq('listing_id', listingId)
    .order('viewed_at', { ascending: false })
    .limit(100);
  return { data: data || [], error };
};

export const createListing = async (listingData: {
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  price_max?: number | null;
  is_negotiable?: boolean;
  condition: string;
  images: string[];
  specs?: Record<string, string>;
  location?: string;
  phone?: string;
}) => {
  const { data, error } = await supabase
    .from('listings')
    .insert(listingData)
    .select()
    .single();
  return { data, error };
};

/** Update an existing listing (owner only, enforced by RLS). */
export const updateListing = async (id: string, patch: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('listings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

/**
 * Uploads a listing image to Supabase Storage and returns its public URL.
 * If Storage isn't configured (or upload fails), falls back to the inline
 * data URL so listings still work.
 */
export const uploadListingImage = async (
  blob: Blob,
  userId: string,
  fallbackDataUrl: string
): Promise<string> => {
  try {
    const path = `${userId}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage
      .from('listings')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (error) return fallbackDataUrl;
    const { data } = supabase.storage.from('listings').getPublicUrl(path);
    return data?.publicUrl || fallbackDataUrl;
  } catch {
    return fallbackDataUrl;
  }
};

// --- Reviews ---

export const getReviews = async (sellerId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles:reviewer_id(*)')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
};

export const createReview = async (reviewData: {
  reviewer_id: string;
  seller_id: string;
  listing_id: string;
  rating: number;
  recommend?: boolean | null;
  comment?: string;
}) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single();
  return { data, error };
};

// --- Favorites ---

export const getFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, listings(*, profiles!listings_user_id_fkey(*), categories(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
};

export const toggleFavorite = async (userId: string, listingId: string) => {
  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .single();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    return { added: false };
  } else {
    await supabase.from('favorites').insert({ user_id: userId, listing_id: listingId });
    return { added: true };
  }
};

// --- Messages ---

export const getMessages = async (userId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:sender_id(id, full_name, avatar_url), receiver:receiver_id(id, full_name, avatar_url)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: true });
  return { data: data || [], error };
};

export const sendMessage = async (messageData: {
  sender_id: string;
  receiver_id: string;
  listing_id?: string | null;
  content: string;
}) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();
  return { data, error };
};

// --- Seller Follows ---

export const followSeller = async (followerId: string, sellerId: string) => {
  const { error } = await supabase.from('seller_follows').insert({ follower_id: followerId, seller_id: sellerId });
  return { error };
};

export const unfollowSeller = async (followerId: string, sellerId: string) => {
  const { error } = await supabase.from('seller_follows').delete().eq('follower_id', followerId).eq('seller_id', sellerId);
  return { error };
};

export const isFollowingSeller = async (followerId: string, sellerId: string) => {
  const { data } = await supabase.from('seller_follows').select('id').eq('follower_id', followerId).eq('seller_id', sellerId).maybeSingle();
  return !!data;
};

export const getSellerFollowerCount = async (sellerId: string) => {
  const { count } = await supabase.from('seller_follows').select('id', { count: 'exact', head: true }).eq('seller_id', sellerId);
  return count || 0;
};

/** Get emails of all followers of a seller (for notification). */
export const getFollowerEmails = async (sellerId: string) => {
  const { data } = await supabase
    .from('seller_follows')
    .select('profiles:follower_id(email, full_name)')
    .eq('seller_id', sellerId);
  return (data || []).map((r: any) => r.profiles).filter((p: any) => p?.email);
};

// --- Notifications ---

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return { data: data || [], error };
};

export const getUnreadCount = async (userId: string) => {
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return count || 0;
};

export const markNotificationsRead = async (userId: string) => {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
};

export const createNotification = async (data: {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}) => {
  await supabase.from('notifications').insert(data);
};

// --- Reports ---

export const reportListing = async (data: {
  reporter_id: string;
  listing_id?: string;
  seller_id?: string;
  reason: string;
  details?: string;
}) => {
  const { error } = await supabase.from('reports').insert(data);
  return { error };
};

export const getPendingReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select('*, profiles:reporter_id(full_name), listings:listing_id(title, images)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  return { data: data || [], error };
};

export const updateReport = async (id: string, status: string) => {
  await supabase.from('reports').update({ status }).eq('id', id);
};

// --- Saved Searches ---

export const getSavedSearches = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
};

export const saveSearch = async (data: {
  user_id: string;
  name: string;
  query?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  condition?: string;
  location?: string;
}) => {
  const { error } = await supabase.from('saved_searches').insert(data);
  return { error };
};

export const deleteSavedSearch = async (id: string) => {
  await supabase.from('saved_searches').delete().eq('id', id);
};

// --- Recently Viewed ---

export const recordRecentView = async (userId: string, listingId: string) => {
  await supabase.from('recently_viewed').upsert(
    { user_id: userId, listing_id: listingId, viewed_at: new Date().toISOString() },
    { onConflict: 'user_id,listing_id' }
  );
};

export const getRecentlyViewed = async (userId: string) => {
  const { data, error } = await supabase
    .from('recently_viewed')
    .select('listing_id, viewed_at, listings:listing_id(*, profiles!listings_user_id_fkey(*), categories(*))')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(12);
  return { data: data || [], error };
};

// --- Platform Stats ---

export const getPlatformStats = async () => {
  const [usersRes, listingsRes, reviewsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }),
    supabase.from('reviews').select('rating'),
  ]);

  const totalUsers = usersRes.count || 0;
  const totalListings = listingsRes.count || 0;

  // Calculate average rating from all reviews
  const reviews = reviewsRes.data || [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

  return {
    totalUsers,
    totalListings,
    avgRating: Math.round(avgRating * 10) / 10, // round to 1 decimal
  };
};
