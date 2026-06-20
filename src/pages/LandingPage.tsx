import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Keyboard,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Star,
  Users,
  Laptop,
  MemoryStick,
  Package,
  ShieldCheck,
  MessagesSquare,
  Tag,
  Smartphone,
  Tablet,
  Camera,
  Headphones,
  Gamepad2,
  Watch,
  Tv,
  Plane,
  Home,
  CircuitBoard,
} from 'lucide-react';
import { getListings, getCategories, getPlatformStats } from '../lib/supabase';
import { fadeUp, stagger, item, viewportOnce, EASE, springSnappy } from '../lib/motion';
import ListingCard from '../components/ListingCard';
import Typewriter from '../components/Typewriter';
import { HERO_SLIDES } from '../lib/heroImages';
import type { Listing, Category } from '../types';

const categoryIcons: Record<string, React.ReactNode> = {
  'desktop-pcs': <Monitor className="w-5 h-5" />,
  laptops: <Laptop className="w-5 h-5" />,
  'graphics-cards': <CircuitBoard className="w-5 h-5" />,
  processors: <Cpu className="w-5 h-5" />,
  ram: <MemoryStick className="w-5 h-5" />,
  storage: <HardDrive className="w-5 h-5" />,
  monitors: <Monitor className="w-5 h-5" />,
  accessories: <Keyboard className="w-5 h-5" />,
  networking: <Wifi className="w-5 h-5" />,
  phones: <Smartphone className="w-5 h-5" />,
  tablets: <Tablet className="w-5 h-5" />,
  cameras: <Camera className="w-5 h-5" />,
  audio: <Headphones className="w-5 h-5" />,
  consoles: <Gamepad2 className="w-5 h-5" />,
  wearables: <Watch className="w-5 h-5" />,
  tvs: <Tv className="w-5 h-5" />,
  drones: <Plane className="w-5 h-5" />,
  'smart-home': <Home className="w-5 h-5" />,
  other: <Package className="w-5 h-5" />,
};

// Soft floating accent dot — quiet ambience, not neon.
const Dot = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <motion.span
    aria-hidden
    className={`absolute rounded-full ${className}`}
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

/**
 * Hero slideshow — shows real user-uploaded listing images.
 * Falls back to the shared static HERO_SLIDES when there aren't enough listings yet.
 * The set of featured listings rotates every 4 days so fresh posts get exposure.
 */
const HeroSlideshow = ({ listings }: { listings: Listing[] }) => {
  const [index, setIndex] = useState(0);

  // Pick up to 5 listings with images, rotating the selection every 4 days.
  // We use a day-based epoch to create a stable "window" that shifts every 4 days.
  const fourDayEpoch = Math.floor(Date.now() / (4 * 24 * 60 * 60 * 1000));
  const withImages = listings.filter((l) => l.images?.[0]);
  const offset = fourDayEpoch % Math.max(withImages.length, 1);
  const rotated = [...withImages.slice(offset), ...withImages.slice(0, offset)];
  const featured = rotated.slice(0, 5);

  // Build slides from live listings, padding with static fallbacks if needed.
  const slides = featured.length > 0
    ? featured.map((l) => ({ src: l.images[0], title: l.title, id: l.id }))
    : HERO_SLIDES.map((s) => ({ src: s.src, title: s.label, id: null, fallback: s.fallback }));

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index % slides.length];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[1.5rem] bg-canvas">
      <AnimatePresence>
        <motion.div
          key={`${slide.src}-${index}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1, ease: EASE }, scale: { duration: 6, ease: 'linear' } }}
        >
          <img
            src={slide.src}
            alt={slide.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fallback !== '1' && 'fallback' in slide) {
                img.dataset.fallback = '1';
                img.src = (slide as { fallback: string }).fallback;
              }
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* readability gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

      {/* caption */}
      <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <span className="inline-block px-2.5 py-1 rounded-full btn-lime text-[11px] font-bold mb-2">
              {featured.length > 0 ? 'Live listing' : 'Featured'}
            </span>
            <p className="text-white text-xl sm:text-2xl font-extrabold leading-tight drop-shadow line-clamp-2">
              {slide.title}
            </p>
          </motion.div>
        </AnimatePresence>

        <Link
          to={slide.id ? `/listing/${slide.id}` : '/marketplace'}
          aria-label={slide.id ? 'View listing' : 'Browse marketplace'}
          className="shrink-0 w-11 h-11 rounded-full btn-lime grid place-items-center transition-transform duration-300 ease-spring hover:rotate-45"
        >
          <ArrowUpRight className="w-5 h-5" />
        </Link>
      </div>

      {/* progress dots */}
      {slides.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === index ? 22 : 6,
                background: i === index ? '#cdf24a' : 'rgba(255,255,255,0.6)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LandingPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalListings: 0, avgRating: 0 });
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [listingsRes, categoriesRes, platformStats] = await Promise.all([
        getListings({ limit: 10 }),
        getCategories(),
        getPlatformStats(),
      ]);
      if (listingsRes.data) setListings(listingsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setStats(platformStats);
      setLoading(false);
    };
    fetchData();
  }, []);

  const scrollBy = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 560), behavior: 'smooth' });
  };

  return (
    <div className="pt-24 md:pt-28">
      {/* ===== Hero bento ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4"
        >
          {/* Main hero card */}
          <motion.div
            variants={item}
            className="lg:col-span-7 surface rounded-4xl p-7 sm:p-10 lg:p-12 relative overflow-hidden flex flex-col"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full surface-muted text-xs font-semibold text-ink-soft w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-dark" />
              The calm tech marketplace
            </span>

            <h1 className="mt-5 text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-7xl font-extrabold text-ink">
              <Typewriter text={'Buy & sell tech\nwithout the noise.'} />
            </h1>

            <p className="mt-5 text-ink-muted text-base sm:text-lg max-w-lg leading-relaxed">
              Phones, laptops, PCs, cameras, consoles and every gadget in between —
              from real people. Browse, message sellers directly, and trade with confidence.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/marketplace" className="group inline-flex items-center gap-1.5 pl-5 pr-2 py-2 rounded-full btn-lime transition-colors duration-300">
                <span className="text-sm">Browse marketplace</span>
                <span className="w-8 h-8 rounded-full bg-navy-600 text-white grid place-items-center transition-transform duration-300 ease-spring group-hover:rotate-45">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
              <Link to="/create" className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-line bg-surface text-ink font-semibold text-sm hover:shadow-pill transition-shadow duration-300">
                Start selling
                <Tag className="w-4 h-4 text-ink-muted" />
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-auto pt-10 grid grid-cols-3 gap-3 max-w-lg">
              {[
                { icon: Users, value: stats.totalUsers.toLocaleString(), label: 'Members' },
                { icon: Package, value: stats.totalListings.toLocaleString(), label: 'Listings' },
                { icon: Star, value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—', label: 'Avg rating' },
              ].map((s) => (
                <div key={s.label} className="surface-muted rounded-2xl px-3 py-3">
                  <s.icon className="w-4 h-4 text-ink-muted" />
                  <div className="mt-2 text-xl sm:text-2xl font-extrabold text-ink leading-none">{s.value}</div>
                  <div className="text-xs text-ink-muted mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <Dot className="hidden sm:block w-3 h-3 bg-navy-600/20 top-10 right-16" delay={0.5} />
            <Dot className="hidden sm:block w-2 h-2 bg-lime-dark/40 top-24 right-40" delay={1.2} />
          </motion.div>

          {/* Slideshow card */}
          <motion.div variants={item} className="lg:col-span-5 surface rounded-4xl p-3">
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-full lg:min-h-[540px]">
              <HeroSlideshow listings={listings} />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== Categories ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex items-end justify-between mb-6"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Categories</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-1">Shop by category</h2>
            <p className="text-ink-muted mt-1">Find exactly the kind of gear you're after.</p>
          </div>
          <Link to="/marketplace" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-navy-600 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={item}>
              <motion.div whileHover={{ y: -4 }} transition={springSnappy} className="will-transform">
                <Link
                  to={`/marketplace?category=${category.slug}`}
                  className="surface rounded-3xl p-5 flex flex-col gap-4 group hover:shadow-card transition-shadow duration-300"
                >
                  <span className="w-11 h-11 rounded-2xl surface-muted grid place-items-center text-navy-600 group-hover:bg-lime group-hover:text-[#15181d] transition-colors duration-300">
                    {categoryIcons[category.slug] || <Package className="w-5 h-5" />}
                  </span>
                  <span className="font-semibold text-ink text-sm">{category.name}</span>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== Featured carousel ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex items-end justify-between mb-6"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Just listed</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-1">Fresh on the market</h2>
            <p className="text-ink-muted mt-1">Recently listed gear, ready to go.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => scrollBy(-1)} aria-label="Scroll left" className="w-10 h-10 rounded-full border border-line bg-surface grid place-items-center text-ink hover:shadow-pill transition-shadow">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Scroll right" className="w-10 h-10 rounded-full icon-navy grid place-items-center transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-72 shrink-0 h-80 rounded-3xl surface-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-1 px-1"
          >
            {listings.map((listing) => (
              <div key={listing.id} className="w-[78%] sm:w-72 shrink-0 snap-start">
                <ListingCard listing={listing} />
              </div>
            ))}
            <Link
              to="/marketplace"
              className="w-[78%] sm:w-72 shrink-0 snap-start surface rounded-3xl grid place-items-center text-center p-6 hover:shadow-card transition-shadow group"
            >
              <span>
                <span className="w-12 h-12 mx-auto rounded-full icon-navy grid place-items-center mb-3 transition-transform duration-300 ease-spring group-hover:rotate-45">
                  <ArrowUpRight className="w-5 h-5" />
                </span>
                <span className="block font-bold text-ink">See everything</span>
                <span className="block text-sm text-ink-muted mt-1">Browse the full marketplace</span>
              </span>
            </Link>
          </div>
        )}
      </section>

      {/* ===== How it works ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { step: '01', title: 'Make an account', desc: 'Sign up in seconds and set up a profile sellers will trust.', icon: Users },
            { step: '02', title: 'List your gear', desc: 'Add photos, set a price or a range, and publish in minutes.', icon: Tag },
            { step: '03', title: 'Chat & close', desc: 'Message buyers, agree on details, and meet up safely.', icon: MessagesSquare },
          ].map((s) => (
            <motion.div key={s.step} variants={item} className="surface rounded-4xl p-7">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-2xl surface-muted grid place-items-center text-navy-600">
                  <s.icon className="w-5 h-5" />
                </span>
                <span className="text-3xl font-extrabold text-ink-faint/40">{s.step}</span>
              </div>
              <h3 className="text-xl font-bold text-ink mt-5">{s.title}</h3>
              <p className="text-ink-muted mt-2 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== CTA banner ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative overflow-hidden rounded-5xl bg-navy-600 text-white p-8 sm:p-14"
        >
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-lime" />
              Trusted by the community
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-5 leading-tight text-white">
              Ready to clear out or gear up?
            </h2>
            <p className="text-white/70 mt-3 text-lg">
              Join thousands of people buying and selling tech the friendly way.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/auth" className="group inline-flex items-center gap-1.5 pl-5 pr-2 py-2 rounded-full btn-lime transition-colors duration-300">
                <span className="text-sm">Create free account</span>
                <span className="w-8 h-8 rounded-full bg-navy-600 text-white grid place-items-center transition-transform duration-300 ease-spring group-hover:rotate-45">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
              <Link to="/marketplace" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors">
                Browse listings
              </Link>
            </div>
          </div>

          <Dot className="w-24 h-24 bg-white/5 -top-6 right-10" delay={0.4} />
          <Dot className="w-16 h-16 bg-lime/10 bottom-6 right-40" delay={1.1} />
          <Dot className="w-32 h-32 bg-white/5 -bottom-12 right-[-20px]" delay={0.7} />
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
