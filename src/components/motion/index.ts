/**
 * Reusable animation system.
 *
 * All primitives are client components and every one respects
 * `prefers-reduced-motion`. Import from `@/components/motion` rather than
 * the individual files.
 *
 *   Reveal          — fade/slide/blur a block in on viewport enter
 *   RevealText      — per-line mask reveal for headings
 *   Stagger / Item  — orchestrated sequential reveals for grids & lists
 *   MagneticButton  — cursor-attracting CTA wrapper
 *   CountUp         — animated stat counter (keeps prefixes/suffixes)
 *   TiltCard        — pointer-tracking 3D tilt + hover lift
 *   Parallax        — scroll-linked depth translation
 *   HeroGlow        — animated gradient + cursor light (hero only)
 *   ScrollIndicator — fades-on-scroll scroll cue (hero only)
 *   SmoothScroll    — Lenis provider, mount once in the root layout
 *   HoverDrift      — subtle hover slide for text/feature rows
 */
export { Reveal } from './Reveal';
export { RevealText } from './RevealText';
export { Stagger, StaggerItem } from './Stagger';
export { MagneticButton } from './MagneticButton';
export { CountUp } from './CountUp';
export { TiltCard } from './TiltCard';
export { Parallax } from './Parallax';
export { HeroGlow } from './HeroGlow';
export { ScrollIndicator } from './ScrollIndicator';
export { SmoothScroll } from './SmoothScroll';
export { HoverDrift } from './HoverDrift';
