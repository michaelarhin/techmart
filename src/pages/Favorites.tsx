import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import { getFavorites, toggleFavorite } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { fadeUp, stagger, item } from '../lib/motion';
import ListingCard from '../components/ListingCard';
import type { Listing } from '../types';

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      const { data } = await getFavorites(user.id);
      const favListings = data?.map((f: any) => f.listings).filter(Boolean) || [];
      setFavorites(favListings);
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (listingId: string) => {
    if (!user) return;
    await toggleFavorite(user.id, listingId);
    setFavorites(favorites.filter((f) => f.id !== listingId));
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <span className="w-16 h-16 rounded-2xl surface grid place-items-center text-ink-faint mb-5">
          <Heart className="w-7 h-7" />
        </span>
        <h1 className="text-2xl font-extrabold text-ink mb-2">Sign in required</h1>
        <p className="text-ink-muted mb-6">Please sign in to view your favorites.</p>
        <button onClick={() => navigate('/auth')} className="btn-navy px-6 py-3 rounded-full transition-colors">
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h1 className="text-3xl md:text-4xl font-extrabold text-ink">Favorites</h1>
          <p className="text-ink-muted mt-1 text-lg">
            {favorites.length} saved item{favorites.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl surface-muted animate-pulse" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface rounded-4xl text-center py-20 px-6 mt-8"
          >
            <span className="w-14 h-14 mx-auto rounded-2xl surface-muted grid place-items-center text-ink-faint mb-4">
              <Heart className="w-7 h-7" />
            </span>
            <h3 className="text-xl font-bold text-ink mb-2">No favorites yet</h3>
            <p className="text-ink-muted mb-6">Save listings you like to find them again here.</p>
            <Link to="/marketplace" className="inline-flex btn-navy px-6 py-3 rounded-full transition-colors">
              Browse marketplace
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger(0.04)}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8"
          >
            {favorites.map((listing) => (
              <motion.div key={listing.id} variants={item} className="relative group">
                <ListingCard listing={listing} />
                <button
                  onClick={() => handleRemoveFavorite(listing.id)}
                  aria-label="Remove from favorites"
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-surface/90 backdrop-blur text-ink-muted opacity-0 group-hover:opacity-100 transition-all duration-300 grid place-items-center hover:text-red-500 hover:bg-surface shadow-pill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
