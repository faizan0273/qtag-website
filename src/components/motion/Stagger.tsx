'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { DURATION, EASE, VIEWPORT } from '@/lib/motion';

type Direction = 'up' | 'down' | 'left' | 'right';

const motionEl = motion as unknown as Record<string, typeof motion.div>;

const OFFSET: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 26 },
  down: { y: -26 },
  left: { x: 26 },
  right: { x: -26 },
};

/* ------------------------------------------------------------------ */
/* Container                                                          */
/* ------------------------------------------------------------------ */

interface StaggerProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  /** Gap between each child's reveal (seconds). */
  stagger?: number;
  /** Delay before the first child starts (seconds). */
  delayChildren?: number;
  /** Play on mount instead of on scroll (used by the hero). */
  immediate?: boolean;
}

/**
 * Wraps a group of `StaggerItem`s and orchestrates their entrance in
 * sequence. Pair every `Stagger` with `StaggerItem` children — plain
 * children won't pick up the variants.
 *
 * Reduced motion is handled globally (see SmoothScroll's MotionConfig);
 * markup is identical server/client.
 */
export function Stagger({
  children,
  as = 'div',
  className,
  stagger = 0.09,
  delayChildren = 0,
  immediate = false,
}: StaggerProps) {
  const MotionTag = motionEl[as as string] ?? motion.div;
  const trigger = immediate
    ? { animate: 'show' }
    : { whileInView: 'show', viewport: VIEWPORT };

  return (
    <MotionTag
      className={className}
      initial="hidden"
      {...trigger}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren } },
      }}
    >
      {children}
    </MotionTag>
  );
}

/* ------------------------------------------------------------------ */
/* Item                                                               */
/* ------------------------------------------------------------------ */

interface StaggerItemProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  direction?: Direction;
  /** Add a subtle blur-in. Use sparingly — slightly heavier to composite. */
  blur?: boolean;
}

/**
 * A single child of `Stagger`. Inherits timing from its parent container,
 * so it carries no delay of its own — the container schedules it.
 */
export function StaggerItem({
  children,
  as = 'div',
  className,
  direction = 'up',
  blur = false,
}: StaggerItemProps) {
  const MotionTag = motionEl[as as string] ?? motion.div;

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          scale: 0.96,
          ...OFFSET[direction],
          ...(blur ? { filter: 'blur(8px)' } : null),
        },
        show: {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          ...(blur ? { filter: 'blur(0px)' } : null),
          transition: { duration: DURATION.base, ease: EASE.outSoft },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
