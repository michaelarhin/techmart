import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  MapPin,
  Package,
  Info,
  Loader2,
  Check,
  ImagePlus,
} from 'lucide-react';
import { createListing, updateListing, uploadListingImage, getListing, getCategories } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { compressImage } from '../lib/image';
import { EASE } from '../lib/motion';
import type { Category } from '../types';

const CreateListing = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingListing, setLoadingListing] = useState(!!id);
  const loadedRef = useRef(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<string>('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imgError, setImgError] = useState<string | null>(null);
  const [processingImg, setProcessingImg] = useState(false);
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const MAX_IMAGES = 5;

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getCategories();
      setCategories(data || []);
    };
    fetchData();
    if (profile && !isEdit) {
      setLocation(profile.location || '');
      setPhone(profile.phone || '');
    }
  }, [profile, isEdit]);

  // Edit mode: load the existing listing once and prefill the form.
  useEffect(() => {
    if (!id || !user || loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      const { data } = await getListing(id);
      if (data) {
        if (data.user_id !== user.id) {
          navigate(`/listing/${id}`);
          return;
        }
        setTitle(data.title);
        setDescription(data.description);
        setCategoryId(data.category_id);
        setCondition(data.condition);
        setPriceMin(String(data.price ?? ''));
        setPriceMax(data.price_max ? String(data.price_max) : '');
        setIsNegotiable(!!data.is_negotiable);
        setImages(data.images || []);
        setLocation(data.location || '');
        setPhone(data.phone || '');
        setSpecs(data.specs || {});
      }
      setLoadingListing(false);
    })();
  }, [id, user, navigate]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    setImgError(null);
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      setImgError(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }
    const picked = Array.from(files).slice(0, room);
    setProcessingImg(true);
    try {
      const urls = await Promise.all(
        picked.map(async (f) => {
          const { blob, dataUrl } = await compressImage(f);
          return uploadListingImage(blob, user.id, dataUrl);
        })
      );
      setImages((prev) => [...prev, ...urls].slice(0, MAX_IMAGES));
    } catch (e) {
      setImgError(e instanceof Error ? e.message : 'Could not add those images.');
    } finally {
      setProcessingImg(false);
    }
  };

  const handleRemoveImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    setSpecs({ ...specs, [newSpecKey]: newSpecValue });
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const handleRemoveSpec = (key: string) => {
    const newSpecs = { ...specs };
    delete newSpecs[key];
    setSpecs(newSpecs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }
    if (images.length === 0) {
      toast('Please add at least one photo', 'error');
      return;
    }
    setLoading(true);

    const parsedMin = parseFloat(priceMin);
    const parsedMax = priceMax ? parseFloat(priceMax) : null;
    const payload = {
      category_id: categoryId,
      title,
      description,
      price: parsedMin,
      price_max: parsedMax && parsedMax > parsedMin ? parsedMax : null,
      is_negotiable: isNegotiable,
      condition,
      images,
      specs,
      location,
      phone: phone || profile?.phone || undefined,
    };

    if (isEdit && id) {
      const { error } = await updateListing(id, payload);
      if (!error) {
        toast('Listing updated');
        navigate(`/listing/${id}`);
      } else {
        toast(error.message || 'Failed to update listing', 'error');
      }
      setLoading(false);
      return;
    }

    const { data, error } = await createListing({ user_id: user.id, ...payload });

    if (!error && data) {
      toast('Your listing is live');
      navigate(`/listing/${data.id}`);
    } else {
      toast(error?.message || 'Failed to create listing', 'error');
    }
    setLoading(false);
  };

  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 2:
        return title.length >= 5 && description.length >= 20;
      case 3:
        return !!categoryId && !!condition && parseFloat(priceMin) > 0;
      case 4:
        return images.length > 0;
      default:
        return true;
    }
  };

  const stepTitles = ['Details', 'Category & price', 'Photos', 'Location'];

  const conditions = [
    { value: 'new', label: 'Brand new', desc: 'Never used, original packaging' },
    { value: 'used-like-new', label: 'Like new', desc: 'Barely used, no signs of wear' },
    { value: 'used-good', label: 'Good', desc: 'Used but well maintained' },
    { value: 'used-fair', label: 'Fair', desc: 'Shows wear, works perfectly' },
  ];

  const stepMotion = {
    initial: { opacity: 0, x: 18 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -18 },
    transition: { duration: 0.35, ease: EASE },
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <span className="w-16 h-16 rounded-2xl surface grid place-items-center text-ink-faint mb-5">
          <Package className="w-7 h-7" />
        </span>
        <h1 className="text-2xl font-bold text-ink mb-2">Sign in required</h1>
        <p className="text-ink-muted mb-6">You need to be signed in to create a listing.</p>
        <button type="button" onClick={() => navigate('/auth')} className="btn-navy px-6 py-3 rounded-full transition-colors">
          Sign in
        </button>
      </div>
    );
  }


  if (isEdit && loadingListing) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-line border-t-navy-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-ink">{isEdit ? 'Edit listing' : 'Create a listing'}</h1>
          <p className="text-ink-muted mt-1 text-lg">{isEdit ? 'Update your details and save changes.' : 'List your item and reach thousands of buyers.'}</p>
        </motion.div>

        {/* Progress */}
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between">
            {[...Array(totalSteps)].map((_, i) => (
              <React.Fragment key={i}>
                <div className={`flex flex-col items-center ${currentStep >= i + 1 ? '' : 'opacity-50'}`}>
                  <div
                    className={`w-10 h-10 rounded-full grid place-items-center font-bold text-sm transition-all ${
                      currentStep === i + 1
                        ? 'bg-navy-600 text-white'
                        : currentStep > i + 1
                        ? 'bg-lime text-[#15181d]'
                        : 'surface-muted text-ink-muted'
                    }`}
                  >
                    {currentStep > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-xs mt-2 text-ink-muted hidden sm:block">{stepTitles[i]}</span>
                </div>
                {i < totalSteps - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${currentStep > i + 1 ? 'bg-lime' : 'bg-line'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {currentStep === 1 && (
              <motion.div key="step1" {...stepMotion} className="space-y-4">
                <div className="surface rounded-xl p-6">
                  <label className="block text-sm font-bold text-ink mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., RTX 3080 Gaming Laptop — i9 12th Gen"
                    className="field w-full px-4 py-3"
                    maxLength={100}
                  />
                  <p className="text-xs text-ink-faint mt-1.5">{title.length}/100 — be specific and include key specs.</p>
                </div>
                <div className="surface rounded-xl p-6">
                  <label className="block text-sm font-bold text-ink mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your item. Include specs, condition, what's included, and why you're selling."
                    className="field w-full h-44 px-4 py-3 resize-none"
                    maxLength={2000}
                  />
                  <p className="text-xs text-ink-faint mt-1.5">{description.length}/2000 — minimum 20 characters.</p>
                </div>
              </motion.div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <motion.div key="step2" {...stepMotion} className="space-y-4">
                <div className="surface rounded-xl p-6">
                  <label className="block text-sm font-bold text-ink mb-3">Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          categoryId === cat.id ? 'border-navy-600 bg-navy-50' : 'border-line bg-surface hover:shadow-pill'
                        }`}
                      >
                        <div className="font-semibold text-ink text-sm">{cat.name}</div>
                        <div className="text-xs text-ink-faint mt-1 line-clamp-2">{cat.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="surface rounded-xl p-6">
                  <label className="block text-sm font-bold text-ink mb-3">Condition</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {conditions.map((cond) => (
                      <button
                        key={cond.value}
                        type="button"
                        onClick={() => setCondition(cond.value)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          condition === cond.value ? 'border-navy-600 bg-navy-50' : 'border-line bg-surface hover:shadow-pill'
                        }`}
                      >
                        <div className="font-semibold text-ink text-sm">{cond.label}</div>
                        <div className="text-xs text-ink-faint mt-1">{cond.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="surface rounded-xl p-6">
                  <label className="block text-sm font-bold text-ink mb-2">Price range (GHS)</label>
                  <p className="text-xs text-ink-faint mb-4">Set a single price, or a range. Leave "Max" empty for a fixed price.</p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <span className="block text-xs text-ink-muted mb-1.5">Min *</span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted font-medium">₵</span>
                        <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="0" className="field w-full pl-10 pr-4 py-3 text-lg font-bold" min="0" step="0.01" />
                      </div>
                    </div>
                    <span className="text-ink-faint font-medium pb-3">—</span>
                    <div className="flex-1">
                      <span className="block text-xs text-ink-muted mb-1.5">Max (optional)</span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted font-medium">₵</span>
                        <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="0" className="field w-full pl-10 pr-4 py-3 text-lg font-bold" min="0" step="0.01" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNegotiable(!isNegotiable)}
                    className={`flex items-center gap-3 w-full mt-5 p-4 rounded-2xl border transition-all ${
                      isNegotiable ? 'border-navy-600 bg-navy-50' : 'border-line bg-surface hover:shadow-pill'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg border-2 grid place-items-center transition-all ${isNegotiable ? 'bg-navy-600 border-navy-600' : 'border-ink-faint'}`}>
                      {isNegotiable && <Check className="w-4 h-4 text-white" />}
                    </span>
                    <span className="text-left">
                      <span className="block font-semibold text-ink text-sm">Price is negotiable</span>
                      <span className="block text-xs text-ink-faint mt-0.5">Let buyers know they can make offers.</span>
                    </span>
                  </button>
                </div>

                <div className="surface rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-ink">Specifications (optional)</label>
                    <Info className="w-4 h-4 text-ink-faint" />
                  </div>
                  {Object.keys(specs).length > 0 && (
                    <div className="space-y-2 mb-4">
                      {Object.entries(specs).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 surface-muted rounded-xl">
                          <div className="text-sm"><span className="text-ink-muted">{key}:</span> <span className="text-ink font-medium">{value}</span></div>
                          <button type="button" onClick={() => handleRemoveSpec(key)} className="text-ink-faint hover:text-red-500 transition-colors" aria-label={`Remove ${key}`}>
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="text" value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} placeholder="Spec (e.g., RAM)" className="field flex-1 px-3 py-2.5 text-sm" />
                    <input type="text" value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} placeholder="Value (e.g., 32GB)" className="field flex-1 px-3 py-2.5 text-sm" />
                    <button type="button" onClick={handleAddSpec} disabled={!newSpecKey.trim() || !newSpecValue.trim()} className="btn-navy px-4 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <motion.div key="step3" {...stepMotion} className="space-y-4">
                <div className="surface rounded-xl p-6">
                  <label className="block text-sm font-bold text-ink mb-1">Photos ({images.length}/{MAX_IMAGES})</label>
                  <p className="text-ink-muted text-sm mb-4">Add up to {MAX_IMAGES} photos from your device. The first one is your cover image.</p>

                  <label
                    htmlFor="listing-images"
                    className={`flex flex-col items-center justify-center text-center gap-2 py-8 px-4 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                      images.length >= MAX_IMAGES
                        ? 'border-line opacity-50 cursor-not-allowed'
                        : 'border-line hover:border-navy-600 hover:bg-canvas/60'
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (images.length < MAX_IMAGES) handleFiles(e.dataTransfer.files);
                    }}
                  >
                    <span className="w-12 h-12 rounded-2xl surface-muted grid place-items-center text-navy-600">
                      {processingImg ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
                    </span>
                    <span className="font-semibold text-ink text-sm">
                      {processingImg ? 'Processing…' : 'Tap to upload or drag photos here'}
                    </span>
                    <span className="text-xs text-ink-faint">JPG or PNG · up to {MAX_IMAGES} images</span>
                    <input
                      id="listing-images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={images.length >= MAX_IMAGES || processingImg}
                      onChange={(e) => {
                        handleFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  {imgError && <p className="text-sm text-red-500 mt-2">{imgError}</p>}

                  <div className="flex gap-2 my-4">
                    {[...Array(MAX_IMAGES)].map((_, i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < images.length ? 'bg-navy-600' : 'bg-line'}`} />
                    ))}
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {images.map((img, index) => (
                        <motion.div key={index} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-square rounded-2xl overflow-hidden group bg-canvas">
                          <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                          {index === 0 && <div className="absolute top-2 left-2 px-2 py-1 bg-navy-600 rounded-full text-xs text-white font-semibold">Cover</div>}
                          <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface/90 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center hover:text-red-500" aria-label={`Remove image ${index + 1}`}>
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <motion.div key="step4" {...stepMotion} className="space-y-4">
                <div className="surface rounded-xl p-6">
                  <label className="block text-sm font-bold text-ink mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, region (e.g., Accra, Greater Accra)" className="field w-full pl-12 pr-4 py-3" />
                  </div>
                </div>

                <div className="surface rounded-xl p-6">
                  <label className="block text-sm font-bold text-ink mb-2">Phone number (optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted font-medium">+233</span>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="XX XXX XXXX" className="field w-full pl-16 pr-4 py-3" />
                  </div>
                  <p className="text-xs text-ink-faint mt-2">Buyers can call you directly, or message you through the platform.</p>
                </div>

                <div className="rounded-xl p-6 bg-navy-600 text-white">
                  <h3 className="font-bold mb-4 text-white">Review your listing</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3"><div className="w-24 text-white/60">Title</div><div className="flex-1 font-medium">{title}</div></div>
                    <div className="flex gap-3"><div className="w-24 text-white/60">Category</div><div className="flex-1 font-medium">{categories.find((c) => c.id === categoryId)?.name}</div></div>
                    <div className="flex gap-3"><div className="w-24 text-white/60">Condition</div><div className="flex-1 font-medium">{conditions.find((c) => c.value === condition)?.label}</div></div>
                    <div className="flex gap-3">
                      <div className="w-24 text-white/60">Price</div>
                      <div className="flex-1">
                        <span className="text-2xl font-bold text-lime">
                          ₵{parseFloat(priceMin || '0').toLocaleString()}
                          {priceMax && parseFloat(priceMax) > parseFloat(priceMin) && <span> — ₵{parseFloat(priceMax).toLocaleString()}</span>}
                        </span>
                        {isNegotiable && <span className="ml-3 px-2 py-0.5 bg-white/10 rounded-full text-xs font-semibold">Negotiable</span>}
                      </div>
                    </div>
                    <div className="flex gap-3"><div className="w-24 text-white/60">Photos</div><div className="flex-1 font-medium">{images.length} image{images.length !== 1 ? 's' : ''}</div></div>
                    {location && <div className="flex gap-3"><div className="w-24 text-white/60">Location</div><div className="flex-1 font-medium">{location}</div></div>}
                  </div>
                  <p className="text-xs text-white/60 mt-4 pt-4 border-t border-white/10">
                    Your listing stays live for 30 days. We'll remind you by email or SMS before it expires so you can renew it — or let it disappear.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="flex gap-3 mt-7">
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1 py-3 rounded-2xl border border-line bg-surface text-ink-soft hover:bg-canvas transition-colors font-semibold">
                Previous
              </button>
            )}
            {currentStep < totalSteps ? (
              <button type="button" onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceedToStep(currentStep)} className="flex-1 py-3 btn-navy rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Next step
              </button>
            ) : (
              <button type="submit" disabled={loading || !canProceedToStep(currentStep)} className="flex-1 py-3 btn-lime rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />{isEdit ? 'Saving…' : 'Creating…'}</> : <>{isEdit ? 'Save changes' : 'Publish listing'}<Plus className="w-5 h-5" /></>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
