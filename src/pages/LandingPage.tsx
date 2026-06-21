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
  Laptop,
  MemoryStick,
  Package,
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
import { stagger, item, viewportOnce, EASE, springSnappy, fadeUp } from '../lib/motion';
import ListingCard from '../components/ListingCard';
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
            <p className="text-white text-xl sm:text-2xl font-bold leading-tight drop-shadow line-clamp-2">
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

const HEADLINES = [
  'Buy & sell tech\nwithout the noise.',
  'Your next upgrade\nis one tap away.',
  'Trade gear with\npeople you trust.',
  'List it. Sell it.\nThat simple.',
  'Tech finds a new\nhome every day.',
];

const RotatingHeadline = () => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [, setIsTyping] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplayText(HEADLINES[0]);
      return;
    }

    let charIndex = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const currentText = HEADLINES[index];

    const type = () => {
      charIndex++;
      setDisplayText(currentText.slice(0, charIndex));
      if (charIndex < currentText.length) {
        timeout = setTimeout(type, 45);
      } else {
        setIsTyping(false);
        timeout = setTimeout(() => {
          erase();
        }, 3000);
      }
    };

    const erase = () => {
      setIsTyping(true);
      const eraseStep = () => {
        charIndex--;
        setDisplayText(currentText.slice(0, charIndex));
        if (charIndex > 0) {
          timeout = setTimeout(eraseStep, 25);
        } else {
          setIndex((i) => (i + 1) % HEADLINES.length);
        }
      };
      eraseStep();
    };

    timeout = setTimeout(type, 400);
    return () => clearTimeout(timeout);
  }, [index]);

  return (
    <span className="relative inline-block whitespace-pre-line">
      <span className="invisible" aria-hidden="true">
        {HEADLINES.reduce((a, b) => (a.length > b.length ? a : b))}
      </span>
      <span className="absolute inset-0" aria-hidden="true">
        {displayText}
        <span className="type-caret" />
      </span>
      <span className="sr-only">{HEADLINES[index]}</span>
    </span>
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
            className="lg:col-span-7 surface rounded-2xl p-7 sm:p-10 lg:p-12 relative overflow-hidden flex flex-col"
          >
            <p className="text-sm text-ink-muted">
              {stats.totalListings > 0 ? `${stats.totalListings.toLocaleString()} listings live right now` : 'Marketplace for tech in Ghana'}
            </p>

            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] text-ink">
              <RotatingHeadline />
            </h1>

            <p className="mt-4 text-ink-muted text-base sm:text-lg max-w-lg leading-relaxed">
              Phones, laptops, PCs, cameras, consoles and more.
              Browse listings from real people, message sellers, and trade locally.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/marketplace" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl btn-navy text-sm transition-colors">
                Browse marketplace
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link to="/create" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-line bg-surface text-ink font-medium text-sm hover:border-ink-faint transition-colors">
                Sell something
              </Link>
            </div>

          </motion.div>

          {/* Slideshow card */}
          <motion.div variants={item} className="lg:col-span-5 surface rounded-2xl p-3">
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
            <h2 className="text-2xl md:text-3xl font-bold text-ink">Categories</h2>
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
                  className="surface rounded-xl p-5 flex flex-col gap-4 group hover:shadow-card transition-shadow duration-300"
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
            <h2 className="text-2xl md:text-3xl font-bold text-ink">Fresh listings</h2>
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
              <div key={i} className="w-72 shrink-0 h-80 rounded-xl surface-muted animate-pulse" />
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
              className="w-[78%] sm:w-72 shrink-0 snap-start surface rounded-xl grid place-items-center text-center p-6 hover:shadow-card transition-shadow group"
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

      {/* ===== Simple CTA ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24 mb-8">
        <div className="surface rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">Got something to sell?</h2>
          <p className="text-ink-muted mt-2 max-w-md mx-auto">
            List it in under 2 minutes. Add photos, set your price, and reach buyers in your area.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/create" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl btn-navy text-sm transition-colors">
              Post a listing
            </Link>
            <Link to="/help" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-line bg-surface text-ink-muted font-medium text-sm hover:text-ink transition-colors">
              How it works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
