'use client';

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { SPRING } from '@/lib/motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees at the corners. Keep low (4–7) for "premium". */
  max?: number;
  /** How far the card lifts toward the viewer on hover (px). */
  lift?: number;
}

/**
 * Wraps a `Card` (or any block) and tilts it in 3D toward the cursor,
 * plus a small hover lift. Spring-damped so it feels weighty, not jittery.
 *
 * The wrapper applies Tailwind's `group` class, so the child can react to
 * hover with `group-hover:*` — e.g. swap to `shadow-cardHover` for a
 * dynamic shadow that matches the lift.
 *
 * Reduced motion: the pointer handler bails out, so there's no tilt; the
 * `whileHover` lift is a transform, which `MotionConfig reducedMotion`
 * strips automatically. Markup is identical server/client.
 */
export function TiltCard({ children, className, max = 6, lift = 6 }: TiltCardProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Pointer position within the card, normalised 0..1.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springX = useSpring(px, { stiffness: 140, damping: 19, mass: 0.5 });
  const springY = useSpring(py, { stiffness: 140, damping: 19, mass: 0.5 });

  const rotateX = useTransform(springY, [0, 1], [max, -max]);
  const rotateY = useTransform(springX, [0, 1], [-max, max]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function reset() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      className={['group', className].filter(Boolean).join(' ')}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      whileHover={{ y: -lift, boxShadow: '0 20px 40px -18px rgba(14,17,22,0.18)' }}
      transition={SPRING.luxe}
    >
      {children}
    </motion.div>
  );
}
