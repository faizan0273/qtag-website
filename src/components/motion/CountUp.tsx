'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { EASE } from '@/lib/motion';

interface ParsedValue {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
}

/**
 * Splits a display string into an animatable number plus surrounding text.
 * Handles the real homepage values:
 *   "10K+"     -> ""   | 10 | "K+"
 *   "6+"       -> ""   | 6  | "+"
 *   "< 2s"     -> "< " | 2  | "s"
 *   "Pakistan" -> no digits -> null (rendered verbatim)
 */
function parseValue(value: string): ParsedValue | null {
  const match = value.match(/[\d.,]+/);
  if (!match) return null;

  const raw = match[0].replace(/,/g, '');
  const target = parseFloat(raw);
  if (Number.isNaN(target)) return null;

  const start = match.index ?? 0;
  return {
    prefix: value.slice(0, start),
    suffix: value.slice(start + match[0].length),
    target,
    decimals: raw.includes('.') ? raw.split('.')[1]?.length ?? 0 : 0,
  };
}

interface CountUpProps {
  /** The final display string, e.g. "10K+". */
  value: string;
  /** Count duration in seconds. */
  duration?: number;
  className?: string;
}

/**
 * Counts up to a stat when it scrolls into view. Non-numeric values (like
 * "Pakistan") render verbatim.
 *
 * SSR note: the initial render is deterministic — it does NOT depend on
 * the reduced-motion media query, so server and client first render
 * always match. Reduced motion is read only inside the effect, where it
 * snaps straight to the final value instead of counting.
 */
export function CountUp({ value, duration = 1.6, className }: CountUpProps) {
  const parsed = useMemo(() => parseValue(value), [value]);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduceMotion = useReducedMotion();

  // Deterministic initial text: the "zero" form for numeric stats, the
  // raw string for non-numeric ones. No media-query read during render.
  const [display, setDisplay] = useState(() =>
    parsed ? `${parsed.prefix}0${parsed.suffix}` : value,
  );

  useEffect(() => {
    if (!parsed || !inView) return;

    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    const controls = animate(0, parsed.target, {
      duration,
      ease: EASE.outSoft,
      onUpdate: (v) => setDisplay(`${parsed.prefix}${v.toFixed(parsed.decimals)}${parsed.suffix}`),
    });
    return () => controls.stop();
  }, [parsed, inView, reduceMotion, duration, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
