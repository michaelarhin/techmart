import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowUpRight, ImageOff, BadgeCheck } from 'lucide-react';
import { springSnappy, EASE } from '../lib/motion';
import { useCurrency } from '../hooks/useCurrency';
import type { Listing } from '../types';

const conditionLabel: Record<string, string> = {
  new: 'New',
  'used-like-new': 'Like new',
  'used-good': 'Good',
  'used-fair': 'Fair',
};

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, compact = false }) => {
  const { formatPrice } = useCurrency();

  const daysLeft = listing.expires_at
    ? Math.ceil((new Date(listing.expires_at).getTime() - Date.now()) / 86400000)
    : null;
  const expiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && !listing.is_sold;
  const isExpired = daysLeft !== null && daysLeft <= 0 && !listing.is_sold;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.985 }}
      transition={springSnappy}
      className="will-transform h-full"
    >
      <Link to={`/listing/${listing.id}`} className="group block h-full">
        <div className="surface rounded-xl p-2.5 h-full flex flex-col transition-shadow duration-300 group-hover:shadow-lift">
          {/* Image */}
          <div className="relative overflow-hidden rounded-[1.25rem] bg-canvas aspect-[4/3]">
            {listing.images?.[0] ? (
              <motion.img
                src={listing.images[0]}
                alt={listing.title}
                loading="lazy"
                className="w-full h-full object-cover"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-ink-faint">
                <ImageOff className="w-10 h-10" />
              </div>
            )}

            {/* Condition / sold chip */}
            <div className="absolute top-3 left-3 flex gap-2">
              {listing.is_sold ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-ink text-canvas">
                  Sold
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface/90 backdrop-blur text-ink-soft">
                  {conditionLabel[listing.condition] || 'Used'}
                </span>
              )}
              {expiringSoon && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white">
                  {daysLeft}d left
                </span>
              )}
              {isExpired && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-ink-faint/80 text-white">
                  May be outdated
                </span>
              )}
            </div>

            {/* Arrow action */}
            <span className="absolute bottom-3 right-3 w-9 h-9 rounded-full btn-lime grid place-items-center translate-y-2 opacity-0 transition-all duration-300 ease-smooth group-hover:translate-y-0 group-hover:opacity-100">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 px-2 pt-3 pb-1.5">
            <h3 className="font-semibold text-ink leading-snug line-clamp-2 group-hover:text-navy-600 transition-colors">
              {listing.title}
            </h3>

            <p className="mt-1.5 text-lg font-bold tracking-tight text-ink">
              {formatPrice(listing.price)}
              {listing.is_negotiable && (
                <span className="ml-2 align-middle text-[11px] font-semibold text-ink-muted">
                  · negotiable
                </span>
              )}
            </p>

            {!compact && (
              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-line">
                <span className="w-6 h-6 rounded-full bg-navy-600 grid place-items-center text-white text-[11px] font-bold">
                  {listing.profiles?.full_name?.charAt(0) || 'U'}
                </span>
                <span className="text-xs text-ink-muted truncate">
                  {listing.profiles?.full_name || 'Anonymous'}
                </span>
                {listing.profiles?.is_verified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-label="Verified seller" />
                )}
                {listing.profiles?.rating ? (
                  <span className="flex items-center gap-1 ml-auto text-xs text-ink-soft">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {listing.profiles.rating.toFixed(1)}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ListingCard;
