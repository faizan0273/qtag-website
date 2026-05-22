'use client';

import { motion } from 'framer-motion';
import type { JSX, ReactNode } from 'react';
import { DURATION, EASE, VIEWPORT } from '@/lib/motion';

const motionEl = motion as unknown as Record<string, typeof motion.div>;

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const OFFSET: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: 28 },
  right: { x: -28 },
  none: {},
};

interface RevealProps {
  children: ReactNode;
  /** Rendered element. Defaults to `div`. */
  as?: keyof JSX.IntrinsicElements;
  /** Travel direction of the entrance. */
  direction?: Direction;
  /** Delay before the animation starts (seconds). */
  delay?: number;
  /** Add a subtle blur-in for extra depth. Use sparingly — slightly heavier. */
  blur?: boolean;
  duration?: number;
  className?: string;
}

/**
 * The workhorse scroll-reveal: wrap any block that should fade up as it
 * enters the viewport. Fires once.
 *
 * Reduced motion: handled globally by `MotionConfig reducedMotion="user"`
 * (see SmoothScroll). Framer Motion drops the transform offset and keeps
 * the opacity fade — no structural branching here, so server and client
 * markup always match.
 */
export function Reveal({
  children,
  as = 'div',
  direction = 'up',
  delay = 0,
  blur = false,
  duration = DURATION.base,
  className,
}: RevealProps) {
  const MotionTag = motionEl[as as string] ?? motion.div;

  return (
    <MotionTag
      className={className}
      initial={{
        opacity: 0,
        scale: 0.97,
        ...OFFSET[direction],
        ...(blur ? { filter: 'blur(10px)' } : null),
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        ...(blur ? { filter: 'blur(0px)' } : null),
      }}
      viewport={VIEWPORT}
      transition={{ duration, ease: EASE.outSoft, delay }}
    >
      {children}
    </MotionTag>
  );
}
