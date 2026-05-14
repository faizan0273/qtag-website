'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { SPRING } from '@/lib/motion';

/**
 * Subtle horizontal drift on hover — use on dense copy blocks (e.g. feature
 * rows) so the section feels alive without full 3D tilt.
 */
export function HoverDrift({
  children,
  className,
  x = 5,
}: {
  children: ReactNode;
  className?: string;
  /** Peak shift in px toward the reading direction. */
  x?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={false}
      whileHover={{ x }}
      transition={SPRING.snappy}
    >
      {children}
    </motion.div>
  );
}
