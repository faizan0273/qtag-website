'use client';

import { motion } from 'framer-motion';
import type { JSX, ReactNode } from 'react';
import { DURATION, EASE, VIEWPORT } from '@/lib/motion';

interface RevealTextProps {
  /**
   * Each entry is one visual line. Pass plain strings, or JSX when a line
   * needs inline styling (e.g. a brand-coloured word).
   */
  lines: ReactNode[];
  /** Rendered element — usually a heading. Defaults to `h2`. */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  /** Delay before the first line starts (seconds). */
  delay?: number;
  /** Gap between consecutive line reveals (seconds). */
  stagger?: number;
  /**
   * Play on mount instead of on scroll. Use for above-the-fold headings
   * (the hero) so they animate immediately on load.
   */
  immediate?: boolean;
}

/**
 * Headline reveal: each line sits inside an `overflow-hidden` mask and
 * slides up into place, staggered. The most "premium" motion on the page,
 * so it's reserved for section headings.
 *
 * The mask gets a touch of vertical padding (with matching negative
 * margin) so descenders like `y`/`g` aren't clipped.
 *
 * Reduced motion: `MotionConfig reducedMotion="user"` strips the Y slide,
 * so lines simply appear. Markup is identical server/client.
 */
export function RevealText({
  lines,
  as = 'h2',
  className,
  delay = 0,
  stagger = 0.12,
  immediate = false,
}: RevealTextProps) {
  const Tag = as;
  const trigger = immediate
    ? { animate: 'show' as const }
    : { whileInView: 'show' as const, viewport: VIEWPORT };

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className="block will-change-transform"
            initial="hidden"
            {...trigger}
            variants={{
              hidden: { y: '108%', opacity: 0.35 },
              show: {
                y: '0%',
                opacity: 1,
                transition: {
                  duration: DURATION.slow,
                  ease: EASE.outSoft,
                  delay: delay + i * stagger,
                },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
