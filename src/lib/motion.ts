import type { Transition, Variants } from 'framer-motion';

// Buttery easing curve (easeOutExpo-ish) used across the app.
export const EASE = [0.22, 1, 0.36, 1] as const;

// Smooth, slightly springy transition for entrances.
export const spring: Transition = {
  type: 'spring',
  stiffness: 130,
  damping: 18,
  mass: 0.7,
};

// Snappier spring for hover / tap micro-interactions.
export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 24,
  mass: 0.55,
};

// Fade + rise, ideal for whileInView reveals.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: EASE },
  },
};

// Parent that staggers its children.
export const stagger = (gap = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: gap, delayChildren: delay },
  },
});

// Child item to pair with `stagger`.
export const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// Shared viewport config — animate once, trigger a touch early.
export const viewportOnce = { once: true, margin: '0px 0px -10% 0px' } as const;
