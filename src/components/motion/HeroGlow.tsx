'use client';

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { useEffect, useRef } from 'react';
import { SPRING } from '@/lib/motion';

/**
 * Decorative animated background for the hero section.
 *
 * - Two large, blurred gold blobs drift slowly on a loop.
 * - A horizontal “wash” layer breathes in the mid-field.
 * - A soft light follows the cursor across the hero.
 *
 * Implementation detail: the rendered layer is `pointer-events-none` so it
 * never blocks clicks on the hero content. Because that also means it
 * can't receive mouse events itself, cursor tracking is attached to the
 * element's parent (the hero `<section>`).
 *
 * Reduced motion: the drift is transform-based, so `MotionConfig
 * reducedMotion="user"` freezes the blobs automatically; the cursor-
 * tracking effect also bails out early. Markup is identical server/client.
 *
 * Drop in as the first child of a `position: relative` hero section.
 */
export function HeroGlow() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Cursor position as a percentage of the hero box.
  const mx = useMotionValue(50);
  const my = useMotionValue(40);
  const smoothX = useSpring(mx, SPRING.ambient);
  const smoothY = useSpring(my, SPRING.ambient);
  const lightLeft = useMotionTemplate`calc(${smoothX}% - 14rem)`;
  const lightTop = useMotionTemplate`calc(${smoothY}% - 14rem)`;

  useEffect(() => {
    if (reduceMotion) return;
    const parent = ref.current?.parentElement;
    if (!parent) return;

    function handleMove(e: MouseEvent) {
      const rect = parent!.getBoundingClientRect();
      mx.set(((e.clientX - rect.left) / rect.width) * 100);
      my.set(((e.clientY - rect.top) / rect.height) * 100);
    }

    parent.addEventListener('mousemove', handleMove);
    return () => parent.removeEventListener('mousemove', handleMove);
  }, [reduceMotion, mx, my]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft vignette + corner wash so the hero reads like a lit stage. */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          background:
            'radial-gradient(ellipse 85% 70% at 50% -10%, rgba(242, 177, 28, 0.14), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(242, 177, 28, 0.08), transparent 50%)',
        }}
      />

      {/* Slowly drifting blobs — scale + drift for depth (frozen under reduced motion). */}
      <motion.div
        className="absolute -top-36 -left-28 h-[32rem] w-[32rem] rounded-full bg-brand/16 blur-3xl will-change-transform"
        animate={{
          x: [0, 48, -8, 0],
          y: [0, 22, 38, 0],
          scale: [1, 1.06, 1.02, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-44 -right-28 h-[28rem] w-[28rem] rounded-full bg-brand/11 blur-3xl will-change-transform"
        animate={{
          x: [0, -42, 12, 0],
          y: [0, -26, -14, 0],
          scale: [1, 1.05, 0.98, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[18rem] w-[42rem] max-w-[120vw] rounded-full bg-brand-soft/25 blur-3xl will-change-transform"
        animate={{ opacity: [0.32, 0.52, 0.38] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Cursor-following light — larger, softer falloff. */}
      <motion.div
        className="absolute h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-brand/18 via-brand/8 to-transparent blur-3xl"
        style={{ left: lightLeft, top: lightTop }}
      />
    </div>
  );
}
