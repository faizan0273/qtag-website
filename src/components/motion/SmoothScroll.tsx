'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import Lenis from 'lenis';

/**
 * App-level motion provider. Does two things:
 *
 * 1. Mounts Lenis for smooth, inertia-based scrolling. Touch devices keep
 *    native scroll (wheel-only smoothing) for better mobile performance.
 *    In-page anchor links are intercepted so they scroll smoothly with an
 *    offset for the sticky header.
 *
 * 2. Wraps the tree in `MotionConfig reducedMotion="user"`. This is how
 *    `prefers-reduced-motion` is honoured *without* SSR hydration
 *    mismatches: every motion component renders identical DOM on server
 *    and client, and Framer Motion itself strips transform/layout
 *    animation for users who asked for reduced motion (opacity fades are
 *    kept — the accepted behaviour). Individual components therefore
 *    never branch their markup on the media query.
 *
 * Mount once, in the root layout.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.35,
      lerp: 0.055,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.15,
    });

    let frameId = 0;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    // Keep hash links smooth + offset for the sticky header.
    function handleAnchorClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement | null)?.closest('a[href^="#"], a[href*="/#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      const hash = href.includes('#') ? `#${href.split('#')[1]}` : '';
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
    }
    document.addEventListener('click', handleAnchorClick);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
