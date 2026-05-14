import type { Variants } from 'framer-motion';

/**
 * Shared motion tokens.
 *
 * Centralising easing + timing here keeps every animation on the site
 * consistent. If a reveal feels off, tune it in ONE place.
 */

/** Easing curves. `out` is an expo-out — the workhorse for premium reveals. */
export const EASE = {
  /** expo-out — fast start, long graceful settle. Use for reveals. */
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** symmetric ease — use for height/expand transitions. */
  inOut: [0.83, 0, 0.17, 1] as [number, number, number, number],
  /** Slight “settle” — a touch more character than linear-out. */
  outSoft: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

/** Duration scale (seconds). */
export const DURATION = {
  fast: 0.4,
  base: 0.78,
  slow: 1.05,
};

/** Spring presets for interactive / organic motion (Framer Motion). */
export const SPRING = {
  /** Snappy UI feedback (buttons, toggles). */
  snappy: { type: 'spring' as const, stiffness: 420, damping: 28, mass: 0.85 },
  /** Heavier, luxury settle (magnetic pull, large surfaces). */
  luxe: { type: 'spring' as const, stiffness: 180, damping: 22, mass: 0.55 },
  /** Cursor-follow layers. */
  ambient: { type: 'spring' as const, stiffness: 52, damping: 22, mass: 0.45 },
};

/**
 * Default viewport config for scroll-triggered reveals.
 * `once` so things don't re-animate on scroll-up; margin + amount fire
 * slightly before the block is centred so motion leads the eye.
 */
export const VIEWPORT = {
  once: true,
  margin: '-10% 0px -16% 0px',
  amount: 0.22,
} as const;

/** Basic fade-up variant — used by Stagger children and ad-hoc reveals. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE.out },
  },
};

/** Container variant factory — controls how its children stagger in. */
export const staggerContainer = (stagger = 0.09, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});
