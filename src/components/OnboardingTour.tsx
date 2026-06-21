import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Tag, MessageCircle, ArrowRight, X } from 'lucide-react';
import { EASE } from '../lib/motion';

const steps = [
  { icon: Search, title: 'Browse gear from real people', body: 'Phones, laptops, PCs, cameras and more — search by category, price or location.' },
  { icon: Tag, title: 'Sell in under 2 minutes', body: 'Snap photos, set a price, publish. Your listing goes live instantly for 30 days.' },
  { icon: MessageCircle, title: 'Chat & close the deal', body: 'Message sellers directly on TechMart, WhatsApp, or call — your choice.' },
];

const STORAGE_KEY = 'techmart_onboarded';

const OnboardingTour = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setShow(true);
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
  };

  if (!show) return null;

  const current = steps[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="w-full max-w-sm bg-surface rounded-2xl p-8 text-center shadow-lift relative"
        >
          <button
            onClick={finish}
            className="absolute top-4 right-4 text-ink-faint hover:text-ink transition-colors"
            aria-label="Skip tour"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="w-16 h-16 mx-auto rounded-2xl surface-muted grid place-items-center text-navy-600 mb-5">
            <current.icon className="w-7 h-7" />
          </span>

          <h2 className="text-xl font-bold text-ink mb-2">{current.title}</h2>
          <p className="text-ink-muted leading-relaxed mb-6">{current.body}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-lime' : 'w-1.5 bg-ink-faint/30'}`}
              />
            ))}
          </div>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-navy px-6 py-3 rounded-full inline-flex items-center gap-2 transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={finish}
              className="btn-lime px-6 py-3 rounded-full inline-flex items-center gap-2 font-bold transition-colors"
            >
              Let's go!
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
