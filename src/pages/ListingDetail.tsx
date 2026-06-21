import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  Eye,
  Heart,
  Flag,
  ShieldCheck,
  Clock,
  Package,
  ImageOff,
  CalendarClock,
  RefreshCw,
  BadgeCheck,
  Trash2,
  Check,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  Users,
  Bell,
} from 'lucide-react';
import { getListing, getReviews, createReview, toggleFavorite, sendMessage, renewListing, setListingSold, deleteListing, recordListingView, getListingViewers, isFollowingSeller, followSeller, unfollowSeller, recordRecentView, reportListing } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { useToast } from '../components/Toast';
import { EASE } from '../lib/motion';
import ContactBar from '../components/ContactBar';
import ReviewCard from '../components/ReviewCard';
import ShareSheet from '../components/ShareSheet';
import type { Listing, Review } from '../types';

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [togglingSold, setTogglingSold] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewers, setViewers] = useState<{ viewer_id: string; viewed_at: string; profiles?: { full_name: string | null; avatar_url: string | null; location: string | null } }[]>([]);
  const [showViewers, setShowViewers] = useState(false);
  const [following, setFollowing] = useState(false);
  const [togglingFollow, setTogglingFollow] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewRecommend, setReviewRecommend] = useState(true);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      const { data } = await getListing(id);
      if (data) {
        setListing(data);
        const { data: reviewsData } = await getReviews(data.user_id);
        setReviews(reviewsData || []);
      }
      setLoading(false);
    };
    fetchListing();
  }, [id]);

  // Record view + recently viewed (fire-and-forget).
  useEffect(() => {
    if (!user || !listing) return;
    if (user.id !== listing.user_id) {
      recordListingView(listing.id, user.id);
    }
    recordRecentView(user.id, listing.id);
    isFollowingSeller(user.id, listing.user_id).then(setFollowing);
  }, [user, listing?.id]);

  const handleToggleFavorite = async () => {
    if (!user || !listing) return;
    const result = await toggleFavorite(user.id, listing.id);
    setIsFavorite(!!result.added);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing || !message.trim()) return;
    setSending(true);
    const { error } = await sendMessage({
      sender_id: user.id,
      receiver_id: listing.user_id,
      listing_id: listing.id,
      content: message,
    });
    if (!error) {
      setMessage('');
      setShowContactModal(false);
      toast('Message sent to the seller');
    } else {
      toast('Could not send message', 'error');
    }
    setSending(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;
    setSubmittingReview(true);
    const { error } = await createReview({
      reviewer_id: user.id,
      seller_id: listing.user_id,
      listing_id: listing.id,
      rating: reviewRating,
      recommend: reviewRecommend,
      comment: reviewComment,
    });
    if (!error) {
      setReviewComment('');
      setReviewRating(5);
      setReviewRecommend(true);
      setShowReviewModal(false);
      const { data: reviewsData } = await getReviews(listing.user_id);
      setReviews(reviewsData || []);
      toast('Thanks for your review');
    } else {
      toast('Could not submit review', 'error');
    }
    setSubmittingReview(false);
  };

  const handleCall = () => {
    if (listing?.phone) window.location.href = `tel:${listing.phone}`;
  };

  const handleRenew = async () => {
    if (!listing) return;
    setRenewing(true);
    const { data } = await renewListing(listing.id);
    if (data) {
      setListing({ ...listing, expires_at: data.expires_at, reminder_sent_at: null });
      toast('Listing renewed for 30 days');
    }
    setRenewing(false);
  };

  const handleToggleSold = async () => {
    if (!listing) return;
    setTogglingSold(true);
    const { data } = await setListingSold(listing.id, !listing.is_sold);
    if (data) {
      setListing({ ...listing, is_sold: data.is_sold });
      toast(data.is_sold ? 'Marked as sold' : 'Marked as available');
    } else {
      toast('Could not update listing', 'error');
    }
    setTogglingSold(false);
  };

  const handleDelete = async () => {
    if (!listing) return;
    if (!window.confirm('Delete this listing permanently? This cannot be undone.')) return;
    setDeleting(true);
    const { error } = await deleteListing(listing.id);
    setDeleting(false);
    if (error) {
      toast('Could not delete listing', 'error');
      return;
    }
    toast('Listing deleted');
    navigate('/profile');
  };

  const openMessage = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowContactModal(true);
  };

  const handleToggleFollow = async () => {
    if (!user || !listing) return;
    setTogglingFollow(true);
    if (following) {
      await unfollowSeller(user.id, listing.user_id);
      setFollowing(false);
      toast('Unfollowed seller');
    } else {
      await followSeller(user.id, listing.user_id);
      setFollowing(true);
      toast('Following seller — you\'ll be notified of new listings');
    }
    setTogglingFollow(false);
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      new: 'Brand new',
      'used-like-new': 'Like new',
      'used-good': 'Good condition',
      'used-fair': 'Fair condition',
    };
    return labels[condition] || condition;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-line border-t-navy-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <span className="w-16 h-16 rounded-2xl surface grid place-items-center text-ink-faint mb-5">
          <Package className="w-7 h-7" />
        </span>
        <h1 className="text-2xl font-bold text-ink mb-2">Listing not found</h1>
        <p className="text-ink-muted mb-6">This listing may have been removed or never existed.</p>
        <Link to="/marketplace" className="btn-navy px-6 py-3 rounded-full transition-colors">
          Browse marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === listing.user_id;
  const daysLeft =
    listing.expires_at != null
      ? Math.ceil((new Date(listing.expires_at).getTime() - Date.now()) / 86400000)
      : null;
  const expiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  return (
    <div className="pt-24 md:pt-28 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-ink-muted mb-6"
        >
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-ink-faint" />
          <Link to="/marketplace" className="hover:text-ink transition-colors">Marketplace</Link>
          {listing.categories && (
            <>
              <ChevronRight className="w-4 h-4 text-ink-faint" />
              <Link to={`/marketplace?category=${listing.categories.slug}`} className="hover:text-ink transition-colors">
                {listing.categories.name}
              </Link>
            </>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="space-y-3"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden surface p-2">
              <div className="relative w-full h-full rounded-[1.6rem] overflow-hidden bg-canvas">
                {listing.images.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImageIndex}
                        src={listing.images[currentImageIndex]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.03 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                      />
                    </AnimatePresence>

                    {listing.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((p) => (p === 0 ? listing.images.length - 1 : p - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/90 backdrop-blur shadow-pill grid place-items-center text-ink hover:bg-surface transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((p) => (p === listing.images.length - 1 ? 0 : p + 1))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/90 backdrop-blur shadow-pill grid place-items-center text-ink hover:bg-surface transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-surface/90 backdrop-blur text-xs font-semibold text-ink-soft">
                          {currentImageIndex + 1} / {listing.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full grid place-items-center text-ink-faint">
                    <ImageOff className="w-14 h-14" />
                  </div>
                )}

                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-surface/90 backdrop-blur text-sm font-semibold text-ink-soft">
                  {getConditionLabel(listing.condition)}
                </div>
                {listing.is_sold && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-ink text-canvas text-sm font-semibold">
                    Sold
                  </div>
                )}
              </div>
            </div>

            {listing.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {listing.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      currentImageIndex === index ? 'border-navy-600' : 'border-transparent hover:border-line'
                    }`}
                  >
                    <img src={img} alt={`${listing.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.06 }}
            className="space-y-5"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-ink mb-3">{listing.title}</h1>
              <div className="flex items-center flex-wrap gap-3">
                <p className="text-3xl font-bold text-ink">
                  {formatPrice(listing.price)}
                  {listing.price_max && listing.price_max > listing.price && (
                    <span className="text-ink-muted"> — {formatPrice(listing.price_max)}</span>
                  )}
                </p>
                {listing.is_negotiable && (
                  <span className="px-3 py-1 rounded-full surface-muted text-sm text-ink-soft font-semibold">
                    Negotiable
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
              {listing.location && (
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /><span>{listing.location}</span></div>
              )}
              <div className="flex items-center gap-1.5"><Eye className="w-4 h-4" /><span>{listing.views_count} views</span></div>
              <div className="flex items-center gap-1.5"><Heart className="w-4 h-4" /><span>{listing.favorites_count} favorites</span></div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{new Date(listing.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {daysLeft !== null && daysLeft > 0 && (
                <div className={`flex items-center gap-1.5 ${expiringSoon ? 'text-amber-500 font-semibold' : ''}`}>
                  <CalendarClock className="w-4 h-4" />
                  <span>Ends in {daysLeft} day{daysLeft === 1 ? '' : 's'}</span>
                </div>
              )}
            </div>

            {isExpired && !isOwner && (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 flex items-start gap-3">
                <CalendarClock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-700">This listing may be outdated</p>
                  <p className="text-xs text-amber-600 mt-0.5">It was posted over 30 days ago and hasn't been renewed. Contact the seller to check if it's still available.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!isOwner && (
                <>
                  <button
                    onClick={openMessage}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 btn-navy rounded-2xl transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contact seller
                  </button>
                  {listing.phone && (
                    <button
                      onClick={handleCall}
                      className="flex items-center justify-center gap-2 px-5 py-4 btn-lime rounded-2xl transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      Call
                    </button>
                  )}
                </>
              )}
              <button
                onClick={handleToggleFavorite}
                className={`w-14 grid place-items-center rounded-2xl border transition-all ${
                  isFavorite ? 'bg-red-50 border-red-200 text-red-500' : 'border-line bg-surface text-ink-muted hover:text-ink hover:shadow-pill'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <ShareSheet
                url={window.location.href}
                title={listing.title}
                text={`Check out "${listing.title}" on TechMart — ${formatPrice(listing.price)}`}
              />
            </div>

            {isOwner && daysLeft !== null && (
              <div className={`rounded-xl p-4 ${expiringSoon ? 'bg-amber-500/10 border border-amber-500/40' : 'surface'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className={`w-10 h-10 rounded-2xl grid place-items-center shrink-0 ${expiringSoon ? 'bg-amber-500/20 text-amber-600' : 'surface-muted text-ink-soft'}`}>
                    <CalendarClock className="w-5 h-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-ink text-sm">
                      {daysLeft > 0 ? `Your listing is live for ${daysLeft} more day${daysLeft === 1 ? '' : 's'}` : 'Your listing is showing as outdated to buyers — renew it to remove the warning'}
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Listings run for 30 days. Renew to keep it visible — we'll also email/text you before it disappears.
                    </p>
                  </div>
                  <button
                    onClick={handleRenew}
                    disabled={renewing}
                    className="btn-navy px-4 py-2.5 rounded-full text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${renewing ? 'animate-spin' : ''}`} />
                    Renew 30 days
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-line">
                  <Link
                    to={`/listing/${listing.id}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-surface text-ink-soft hover:text-ink hover:shadow-pill text-sm font-semibold transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={handleToggleSold}
                    disabled={togglingSold}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-surface text-ink-soft hover:text-ink hover:shadow-pill text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {listing.is_sold ? 'Mark as available' : 'Mark as sold'}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={async () => {
                      if (!showViewers) {
                        const { data } = await getListingViewers(listing.id);
                        setViewers(data as unknown as typeof viewers);
                      }
                      setShowViewers((v) => !v);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-surface text-ink-soft hover:text-ink hover:shadow-pill text-sm font-semibold transition-all"
                  >
                    <Users className="w-4 h-4" />
                    {showViewers ? 'Hide viewers' : `Who viewed (${listing.views_count})`}
                  </button>
                </div>

                {showViewers && (
                  <div className="mt-3 pt-3 border-t border-line">
                    <p className="text-sm font-semibold text-ink mb-3">
                      {viewers.length} account{viewers.length === 1 ? '' : 's'} viewed this listing
                    </p>
                    {viewers.length === 0 ? (
                      <p className="text-sm text-ink-muted">No signed-in viewers yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto no-scrollbar">
                        {viewers.map((v) => (
                          <Link
                            key={`${v.viewer_id}-${v.viewed_at}`}
                            to={`/profile/${v.viewer_id}`}
                            className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-canvas/60 transition-colors"
                          >
                            <span className="w-8 h-8 rounded-full bg-navy-600 grid place-items-center text-white text-xs font-bold shrink-0">
                              {v.profiles?.full_name?.charAt(0) || '?'}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium text-ink truncate">{v.profiles?.full_name || 'Anonymous'}</span>
                              <span className="block text-xs text-ink-faint">{v.profiles?.location || 'Unknown location'}</span>
                            </span>
                            <span className="text-xs text-ink-faint shrink-0">
                              {new Date(v.viewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="surface rounded-xl p-6">
              <h3 className="font-bold text-ink mb-2">Description</h3>
              <p className="text-ink-soft whitespace-pre-wrap leading-relaxed">{listing.description}</p>
            </div>

            {listing.specs && Object.keys(listing.specs).length > 0 && (
              <div className="surface rounded-xl p-6">
                <h3 className="font-bold text-ink mb-3">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {Object.entries(listing.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm border-b border-line pb-2">
                      <span className="text-ink-muted">{key}</span>
                      <span className="text-ink font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="surface rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-navy-600 grid place-items-center text-white text-xl font-bold">
                  {listing.profiles?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-ink text-lg flex items-center gap-1.5">
                    {listing.profiles?.full_name || 'Anonymous seller'}
                    {listing.profiles?.is_verified && (
                      <span title="Verified seller" className="inline-flex items-center text-emerald-500">
                        <BadgeCheck className="w-4 h-4" />
                      </span>
                    )}
                  </h3>
                  {listing.profiles?.rating ? (
                    <div className="flex items-center gap-1.5 mt-0.5 text-sm text-ink-muted">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-ink font-semibold">{listing.profiles.rating.toFixed(1)}</span>
                      <span>({listing.profiles.review_count} reviews)</span>
                    </div>
                  ) : null}
                  <Link to={`/profile/${listing.user_id}`} className="text-navy-600 hover:text-navy-500 text-sm mt-1 inline-block font-semibold transition-colors">
                    View profile
                  </Link>
                </div>
              </div>
              {!isOwner && user && (
                <button
                  onClick={handleToggleFollow}
                  disabled={togglingFollow}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-50 ${
                    following
                      ? 'bg-accent/15 text-accent border border-accent/40'
                      : 'border border-line bg-surface text-ink-soft hover:text-ink hover:shadow-pill'
                  }`}
                >
                  <Bell className={`w-4 h-4 ${following ? 'fill-current' : ''}`} />
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
              <div className="mt-4 pt-4 border-t border-line flex items-start gap-2 text-sm text-ink-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>Always inspect the item and meet in a public place before paying.</p>
              </div>
            </div>

            <ContactBar
              name={listing.profiles?.full_name || 'the seller'}
              phone={listing.phone}
              email={listing.profiles?.email}
              onMessage={openMessage}
              showMessage={!isOwner}
            />

            {!isOwner && (
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center gap-2 text-ink-faint hover:text-red-500 text-sm transition-colors"
              >
                <Flag className="w-4 h-4" />
                Report this listing
              </button>
            )}
          </motion.div>
        </div>

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-16"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-ink">Seller reviews</h2>
              <p className="text-ink-muted">
                {listing.profiles?.full_name || 'Seller'} has {reviews.length} review{reviews.length === 1 ? '' : 's'}
                {reviews.some((r) => r.recommend != null) && (
                  <> · {reviews.filter((r) => r.recommend).length} positive</>
                )}
              </p>
            </div>
            {user && !isOwner && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-line bg-surface text-ink font-semibold hover:shadow-pill transition-shadow"
              >
                <Star className="w-4 h-4" />
                Leave a review
              </button>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="surface rounded-2xl text-center py-16">
              <span className="w-14 h-14 mx-auto rounded-2xl surface-muted grid place-items-center text-ink-faint mb-4">
                <Star className="w-7 h-7" />
              </span>
              <h3 className="text-lg font-bold text-ink mb-1">No reviews yet</h3>
              <p className="text-ink-muted">Be the first to review this seller.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Contact modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="w-full max-w-md bg-surface rounded-2xl p-6 shadow-lift"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-ink mb-4">Contact seller</h3>
              <form onSubmit={handleSendMessage}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi, I'm interested in this item…"
                  className="field w-full h-32 px-4 py-3 resize-none"
                  required
                />
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setShowContactModal(false)} className="flex-1 py-3 rounded-2xl border border-line bg-surface text-ink-soft hover:bg-canvas transition-colors font-semibold">
                    Cancel
                  </button>
                  <button type="submit" disabled={sending} className="flex-1 py-3 btn-navy rounded-2xl transition-colors disabled:opacity-50">
                    {sending ? 'Sending…' : 'Send message'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="w-full max-w-md bg-surface rounded-2xl p-6 shadow-lift"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-ink mb-4">Leave a review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <button key={i} type="button" onClick={() => setReviewRating(i + 1)} className="p-1 transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 ${i < reviewRating ? 'text-amber-400 fill-amber-400' : 'text-ink-faint/40'}`} />
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setReviewRecommend(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                      reviewRecommend ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500' : 'border-line bg-surface text-ink-muted hover:text-ink'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Positive
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewRecommend(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                      !reviewRecommend ? 'bg-red-500/15 border-red-500/40 text-red-500' : 'border-line bg-surface text-ink-muted hover:text-ink'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Negative
                  </button>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this seller…"
                  className="field w-full h-32 px-4 py-3 resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 py-3 rounded-2xl border border-line bg-surface text-ink-soft hover:bg-canvas transition-colors font-semibold">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingReview} className="flex-1 py-3 btn-navy rounded-2xl transition-colors disabled:opacity-50">
                    {submittingReview ? 'Submitting…' : 'Submit review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="w-full max-w-md bg-surface rounded-2xl p-6 shadow-lift"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-ink mb-2">Report this listing</h3>
              <p className="text-sm text-ink-muted mb-4">Help us keep TechMart safe. What's wrong?</p>
              <div className="flex flex-col gap-2 mb-4">
                {['Scam or fraud', 'Fake/misleading photos', 'Stolen item', 'Inappropriate content', 'Other'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReportReason(r)}
                    className={`text-left px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
                      reportReason === r ? 'border-red-300 bg-red-50 text-red-600' : 'border-line bg-surface text-ink-soft hover:bg-canvas'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowReport(false)} className="flex-1 py-3 rounded-2xl border border-line bg-surface text-ink-soft hover:bg-canvas font-semibold transition-colors">Cancel</button>
                <button
                  disabled={!reportReason || reporting}
                  onClick={async () => {
                    if (!user || !listing) return;
                    setReporting(true);
                    await reportListing({ reporter_id: user.id, listing_id: listing.id, seller_id: listing.user_id, reason: reportReason });
                    setReporting(false);
                    setShowReport(false);
                    setReportReason('');
                    toast('Report submitted — thanks for helping keep TechMart safe');
                  }}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold transition-colors disabled:opacity-50 hover:bg-red-600"
                >
                  {reporting ? 'Submitting…' : 'Submit report'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListingDetail;
