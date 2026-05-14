'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { SPRING } from '@/lib/motion';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /**
   * How strongly the element is pulled toward the cursor. 0 = none,
   * ~0.4 = lively. Travel is also clamped so big CTAs don't drift far.
   */
  strength?: number;
}

const MAX_TRAVEL = 14; // px — keeps the effect tasteful on large CTAs

/**
 * Wraps an interactive element (typically `<Link><Button/></Link>`) and
 * gently pulls it toward the cursor on hover, springing back on leave.
 *
 * Reduced motion: the pointer handler bails out early, so the wrapper
 * just sits still. The markup is identical regardless — no SSR branching.
 */
export function MagneticButton({ children, className, strength = 0.35 }: MagneticButtonProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING.luxe);
  const springY = useSpring(y, SPRING.luxe);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(clamp(relX * strength, MAX_TRAVEL));
    y.set(clamp(relY * strength, MAX_TRAVEL));
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={['inline-block', className].filter(Boolean).join(' ')}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.985 }}
      transition={SPRING.snappy}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}

function clamp(value: number, max: number) {
  return Math.max(-max, Math.min(max, value));
}
