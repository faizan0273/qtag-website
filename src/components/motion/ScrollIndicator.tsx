'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * A minimal "scroll" cue for the bottom of the hero: a small capsule with
 * a travelling dot. It fades out as soon as the user starts scrolling.
 *
 * Reduced motion: the dot's looping travel is transform-based, so
 * `MotionConfig reducedMotion="user"` stops it; the scroll-linked fade is
 * opacity-only and is kept. Markup is identical server/client.
 */
export function ScrollIndicator({ className }: { className?: string }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 160], [1, 0]);

  return (
    <motion.div style={{ opacity }} className={className}>
      <motion.div
        className="flex flex-col items-center gap-2.5 text-ink-muted"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-[10px] uppercase tracking-[0.28em] font-medium">Scroll</span>
        <span className="relative flex h-11 w-[26px] flex-col items-center justify-start rounded-full border border-paper-line/90 bg-paper/40 pt-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-[2px]">
          <motion.span
            className="h-2 w-2 rounded-full bg-gradient-to-b from-brand to-brand-dark shadow-sm"
            animate={{ y: [0, 10, 0], opacity: [1, 0.35, 1], scale: [1, 0.92, 1] }}
            transition={{ duration: 1.85, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
          />
          <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-ink/15" aria-hidden />
        </span>
      </motion.div>
    </motion.div>
  );
}
