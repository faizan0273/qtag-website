'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BRAND_LOGO_SRC, BRAND_NAME } from '@/lib/brand';
import { EASE, SPRING } from '@/lib/motion';

/**
 * Client-side header chrome. The data-fetching `Header` (a Server
 * Component) renders this and passes the auth buttons in via `authSlot`,
 * so session logic stays on the server.
 *
 * Responsibilities:
 * - Transparent at the top of the page, gains a blurred paper background
 *   + border once scrolled.
 * - Desktop nav with a shared-layout animated underline that tracks the
 *   active in-page section (`#how`, `#faq`).
 * - Animated mobile menu (the original header had none).
 */

const NAV_LINKS = [
  { href: '/shop', label: 'Shop', section: 'shop' as const, scroll: true },
  { href: '/#how', label: 'How it works', section: 'how' as const, scroll: false },
  { href: '/#faq', label: 'FAQ', section: 'faq' as const, scroll: false },
] as const;

export function HeaderShell({ authSlot }: { authSlot: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Toggle the scrolled background once the user moves off the very top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track which in-page section is in view on the home page (How / FAQ).
  useEffect(() => {
    const sections = ['how', 'faq']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) {
      setActiveSection('');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <motion.header
      initial={false}
      animate={{
        backgroundColor: scrolled ? 'rgba(251, 250, 246, 0.85)' : 'rgba(251, 250, 246, 0)',
        borderColor: scrolled ? 'rgba(232, 229, 221, 1)' : 'rgba(232, 229, 221, 0)',
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${BRAND_NAME} home`}>
          <Image
            src={BRAND_LOGO_SRC}
            alt=""
            width={180}
            height={52}
            className="h-12 w-auto max-h-12 object-contain object-left"
            priority
          />
        </Link>

        {/* Desktop navigation with shared-layout underline */}
        <nav className="hidden md:flex items-center gap-7 text-[15px] text-ink-soft">
          {NAV_LINKS.map((link) => {
            const onShop = link.section === 'shop' && pathname.startsWith('/shop');
            const onHomeSection =
              pathname === '/' &&
              (link.section === 'how' || link.section === 'faq') &&
              activeSection === link.section;
            const showUnderline = onShop || onHomeSection;

            return (
              <Link
                key={link.href}
                href={link.href}
                scroll={link.scroll}
                className="relative py-1 transition-colors hover:text-ink"
              >
                {link.label}
                {showUnderline ? (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-brand"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">{authSlot}</div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden grid place-items-center h-10 w-10 rounded-lg text-ink hover:bg-paper-line/60"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <Burger open={menuOpen} />
        </button>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE.out }}
            className="md:hidden overflow-hidden border-t border-paper-line bg-paper/95 backdrop-blur-md"
          >
            <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.05 + i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    scroll={link.scroll}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-3 rounded-lg text-ink hover:bg-paper-line/60"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-paper-line px-3 pt-3 [&_a]:w-full [&_a]:justify-center">
                {authSlot}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/** Three-line icon that morphs into an X. */
function Burger({ open }: { open: boolean }) {
  const bar = 'absolute left-0 block h-0.5 w-5 rounded-full bg-current';
  return (
    <div className="relative h-4 w-5">
      <motion.span
        className={bar}
        initial={false}
        animate={{ top: open ? 7 : 2, rotate: open ? 45 : 0 }}
        transition={SPRING.snappy}
      />
      <motion.span
        className={`${bar} top-[7px]`}
        initial={false}
        animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.6 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className={bar}
        initial={false}
        animate={{ top: open ? 7 : 12, rotate: open ? -45 : 0 }}
        transition={SPRING.snappy}
      />
    </div>
  );
}
