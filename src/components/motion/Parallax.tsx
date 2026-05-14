'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface ParallaxProps {
  children: ReactNode;
  /**
   * Total travel in px across the element's full scroll pass. Higher =
   * more pronounced depth. Kept subtle by default.
   */
  speed?: number;
  className?: string;
}

/**
 * Translates its children vertically as they scroll through the viewport,
 * creating layered depth. Spring-smoothed so it tracks scroll without
 * feeling rigid.
 *
 * Reduced motion: the translation is a transform, so `MotionConfig
 * reducedMotion="user"` neutralises it automatically — the element just
 * sits still. Markup is identical server/client.
 */
export function Parallax({ children, speed = 40, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 0 when the element enters the viewport, 1 when it leaves.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const yRaw = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const y = useSpring(yRaw, { stiffness: 88, damping: 34, mass: 0.62 });

  return (
    <div ref={ref} className={['relative', className].filter(Boolean).join(' ')}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
