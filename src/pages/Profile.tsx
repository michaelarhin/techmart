import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Star,
  MapPin,
  Clock,
  Heart,
  Settings,
  Edit3,
  Package,
  TrendingUp,
  Phone,
} from 'lucide-react';
import { getProfile, getListings, getReviews, getFavorites } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { fadeUp, stagger, item } from '../lib/motion';
import ListingCard from '../components/ListingCard';
import ReviewCard from '../components/ReviewCard';
import type { Profile, Listing, Review } from '../types';

const Profile = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'favorites'>('listings');

  const isOwnProfile = !id || id === user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      const targetId = id || user?.id;
      if (!targetId) {
        setLoading(false);
        return;
      }
      const { data: profileData } = await getProfile(targetId);
      setProfile(profileData);

      const { data: listingsData } = await getListings({ limit: 50 });
      setListings(listingsData?.filter((l) => l.user_id === targetId) || []);

      const { data: reviewsData } = await getReviews(targetId);
      setReviews(reviewsData || []);

      if (isOwnProfile && user) {
        const { data: favData } = await getFavorites(user.id);
        setFavorites(favData?.map((f: any) => f.listings).filter(Boolean) || []);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id, user, isOwnProfile]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-line border-t-navy-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <span className="w-16 h-16 rounded-2xl surface grid place-items-center text-ink-faint mb-5">
          <User className="w-7 h-7" />
        </span>
        <h1 className="text-2xl font-extrabold text-ink mb-2">{user ? 'Profile not found' : 'Sign in required'}</h1>
        <p className="text-ink-muted mb-6">{user ? "This user doesn't exist or has been removed." : 'Please sign in to view your profile.'}</p>
        {!user && (
          <button onClick={() => navigate('/auth')} className="btn-navy px-6 py-3 rounded-full transition-colors">
            Sign in
          </button>
        )}
      </div>
    );
  }

  const tabs = [
    { key: 'listings' as const, label: 'Listings', count: listings.length, icon: Package },
    { key: 'reviews' as const, label: 'Reviews', count: reviews.length, icon: Star },
    ...(isOwnProfile ? [{ key: 'favorites' as const, label: 'Favorites', count: favorites.length, icon: Heart }] : []),
  ];

  return (
    <div className="pt-24 md:pt-28 pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header card */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="surface rounded-4xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-navy-600 grid place-items-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl md:text-4xl font-extrabold text-white">{profile.full_name?.charAt(0) || 'U'}</span>
                )}
              </div>
              {isOwnProfile && (
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface border border-line shadow-pill grid place-items-center text-ink-muted hover:text-ink transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-ink">{profile.full_name || 'Anonymous seller'}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm text-ink-muted">
                    {profile.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{profile.location}</span>}
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    {profile.phone && isOwnProfile && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{profile.phone}</span>}
                  </div>
                </div>
                {isOwnProfile && (
                  <Link to="/settings" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-surface text-ink-soft hover:text-ink hover:shadow-pill transition-all">
                    <Settings className="w-4 h-4" />
                    Edit profile
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <div className="flex items-center gap-3 surface-muted rounded-2xl px-4 py-3">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <div>
                    <div className="text-lg font-extrabold text-ink leading-none">{profile.rating ? profile.rating.toFixed(1) : '—'}</div>
                    <div className="text-xs text-ink-muted mt-0.5">{profile.review_count} reviews</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 surface-muted rounded-2xl px-4 py-3">
                  <Package className="w-5 h-5 text-navy-600" />
                  <div>
                    <div className="text-lg font-extrabold text-ink leading-none">{profile.listings_count}</div>
                    <div className="text-xs text-ink-muted mt-0.5">Listings</div>
                  </div>
                </div>
              </div>

              {profile.bio && <p className="text-ink-soft text-sm leading-relaxed mt-4">{profile.bio}</p>}
            </div>
          </div>

          {isOwnProfile && (
            <Link to="/settings" className="md:hidden flex items-center justify-center gap-2 w-full mt-5 py-3 rounded-2xl border border-line bg-surface text-ink-soft transition-all">
              <Settings className="w-4 h-4" />
              Edit profile
            </Link>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="mt-7 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'btn-navy' : 'border border-line bg-surface text-ink-soft hover:text-ink'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-7">
          {activeTab === 'listings' && (
            listings.length === 0 ? (
              <div className="surface rounded-4xl text-center py-16">
                <span className="w-14 h-14 mx-auto rounded-2xl surface-muted grid place-items-center text-ink-faint mb-4"><Package className="w-7 h-7" /></span>
                <h3 className="text-lg font-bold text-ink mb-1">No listings yet</h3>
                {isOwnProfile ? (
                  <>
                    <p className="text-ink-muted mb-6">Start selling by creating your first listing.</p>
                    <Link to="/create" className="inline-flex items-center gap-2 btn-navy px-6 py-3 rounded-full transition-colors">
                      <TrendingUp className="w-5 h-5" />
                      Create listing
                    </Link>
                  </>
                ) : (
                  <p className="text-ink-muted">This seller hasn't posted any listings yet.</p>
                )}
              </div>
            ) : (
              <motion.div variants={stagger(0.04)} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <motion.div key={listing.id} variants={item}><ListingCard listing={listing} /></motion.div>
                ))}
              </motion.div>
            )
          )}

          {activeTab === 'reviews' && (
            reviews.length === 0 ? (
              <div className="surface rounded-4xl text-center py-16">
                <span className="w-14 h-14 mx-auto rounded-2xl surface-muted grid place-items-center text-ink-faint mb-4"><Star className="w-7 h-7" /></span>
                <h3 className="text-lg font-bold text-ink mb-1">No reviews yet</h3>
                <p className="text-ink-muted">{isOwnProfile ? 'Reviews from buyers will appear here.' : "This seller hasn't received any reviews yet."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )
          )}

          {activeTab === 'favorites' && isOwnProfile && (
            favorites.length === 0 ? (
              <div className="surface rounded-4xl text-center py-16">
                <span className="w-14 h-14 mx-auto rounded-2xl surface-muted grid place-items-center text-ink-faint mb-4"><Heart className="w-7 h-7" /></span>
                <h3 className="text-lg font-bold text-ink mb-1">No favorites yet</h3>
                <p className="text-ink-muted mb-6">Save listings you like to find them again here.</p>
                <Link to="/marketplace" className="inline-flex btn-navy px-6 py-3 rounded-full transition-colors">Browse marketplace</Link>
              </div>
            ) : (
              <motion.div variants={stagger(0.04)} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((listing) => (
                  <motion.div key={listing.id} variants={item}><ListingCard listing={listing} /></motion.div>
                ))}
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
