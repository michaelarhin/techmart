import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Monitor,
  Laptop,
  Cpu,
  HardDrive,
  Wifi,
  Keyboard,
  ChevronDown,
  X,
  Package,
  MemoryStick,
  ImageOff,
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
import { getListings, getCategories } from '../lib/supabase';
import { fadeUp, stagger, item, EASE } from '../lib/motion';
import ListingCard from '../components/ListingCard';
import type { Listing, Category } from '../types';

const categoryIcons: Record<string, React.ReactNode> = {
  'desktop-pcs': <Monitor className="w-4 h-4" />,
  laptops: <Laptop className="w-4 h-4" />,
  'graphics-cards': <CircuitBoard className="w-4 h-4" />,
  processors: <Cpu className="w-4 h-4" />,
  ram: <MemoryStick className="w-4 h-4" />,
  storage: <HardDrive className="w-4 h-4" />,
  monitors: <Monitor className="w-4 h-4" />,
  accessories: <Keyboard className="w-4 h-4" />,
  networking: <Wifi className="w-4 h-4" />,
  phones: <Smartphone className="w-4 h-4" />,
  tablets: <Tablet className="w-4 h-4" />,
  cameras: <Camera className="w-4 h-4" />,
  audio: <Headphones className="w-4 h-4" />,
  consoles: <Gamepad2 className="w-4 h-4" />,
  wearables: <Watch className="w-4 h-4" />,
  tvs: <Tv className="w-4 h-4" />,
  drones: <Plane className="w-4 h-4" />,
  'smart-home': <Home className="w-4 h-4" />,
  other: <Package className="w-4 h-4" />,
};

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [condition, setCondition] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const filters: Record<string, unknown> = {};

      if (selectedCategory) filters.category = selectedCategory;
      if (search) filters.search = search;
      if (priceRange[0] > 0) filters.minPrice = priceRange[0];
      if (priceRange[1] < 10000) filters.maxPrice = priceRange[1];
      if (condition.length === 1) filters.condition = condition[0];

      const [listingsRes, categoriesRes] = await Promise.all([
        getListings(filters),
        getCategories(),
      ]);

      const sortedListings = listingsRes.data || [];
      if (sortBy === 'price-asc') sortedListings.sort((a, b) => a.price - b.price);
      else if (sortBy === 'price-desc') sortedListings.sort((a, b) => b.price - a.price);
      else if (sortBy === 'popular') sortedListings.sort((a, b) => b.views_count - a.views_count);

      setListings(sortedListings);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [selectedCategory, search, priceRange, condition, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) params.set('q', search);
    else params.delete('q');
    setSearchParams(params);
  };

  const toggleCondition = (cond: string) => {
    setCondition((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'used-like-new', label: 'Like new' },
    { value: 'used-good', label: 'Good' },
    { value: 'used-fair', label: 'Fair' },
  ];

  const hasActiveFilters =
    selectedCategory || priceRange[0] > 0 || priceRange[1] < 10000 || condition.length > 0;

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 10000]);
    setCondition([]);
  };

  return (
    <div className="pt-24 md:pt-28 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h1 className="text-3xl md:text-4xl font-bold text-ink">Marketplace</h1>
          <p className="text-ink-muted mt-1 text-lg">
            Find your next piece of kit from across the community.
          </p>
        </motion.div>

        {/* Search & controls */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
          className="surface rounded-xl p-3 mt-7 flex flex-col lg:flex-row gap-3"
        >
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PCs, laptops, components…"
              className="field w-full pl-12 pr-24 py-3 rounded-2xl"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-navy px-4 py-2 rounded-xl text-sm transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                showFilters || hasActiveFilters
                  ? 'btn-navy'
                  : 'border border-line bg-surface text-ink-soft hover:shadow-pill'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="field px-4 py-3 rounded-2xl text-sm font-semibold cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most popular</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </motion.div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="surface rounded-xl p-6 mt-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-bold text-ink mb-3 text-sm">Category</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${!selectedCategory ? 'chip-active' : 'chip'}`}
                      >
                        All
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.slug)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                            selectedCategory === cat.slug ? 'chip-active' : 'chip'
                          }`}
                        >
                          {categoryIcons[cat.slug]}
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-ink mb-3 text-sm">Price range</h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="field w-full px-3 py-2 rounded-xl text-sm"
                        placeholder="Min"
                      />
                      <span className="text-ink-faint">—</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="field w-full px-3 py-2 rounded-xl text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-ink mb-3 text-sm">Condition</h3>
                    <div className="flex flex-wrap gap-2">
                      {conditions.map((cond) => (
                        <button
                          key={cond.value}
                          onClick={() => toggleCondition(cond.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                            condition.includes(cond.value) ? 'chip-active' : 'chip'
                          }`}
                        >
                          {cond.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 mt-5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        {(selectedCategory || search) && (
          <div className="flex flex-wrap gap-2 mt-5">
            {search && (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full surface text-sm text-ink-soft">
                {search}
                <button
                  onClick={() => {
                    setSearch('');
                    const params = new URLSearchParams(searchParams);
                    params.delete('q');
                    setSearchParams(params);
                  }}
                  className="text-ink-faint hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full surface text-sm text-ink-soft">
                {categories.find((c) => c.slug === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('')} className="text-ink-faint hover:text-ink">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Count */}
        <div className="text-ink-muted text-sm mt-7 mb-4">
          {loading ? 'Loading…' : `${listings.length} listing${listings.length === 1 ? '' : 's'}`}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 rounded-xl surface-muted animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface rounded-2xl text-center py-20 px-6"
          >
            <span className="w-14 h-14 mx-auto rounded-2xl surface-muted grid place-items-center text-ink-faint mb-4">
              <ImageOff className="w-7 h-7" />
            </span>
            <h3 className="text-xl font-bold text-ink mb-2">Nothing here yet</h3>
            <p className="text-ink-muted mb-6">Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="btn-navy px-6 py-2.5 rounded-full text-sm transition-colors">
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger(0.04)}
            initial="hidden"
            animate="show"
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {listings.map((listing) => (
              <motion.div key={listing.id} variants={item}>
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
