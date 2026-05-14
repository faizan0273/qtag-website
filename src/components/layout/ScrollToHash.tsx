'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * After client navigations to `/#how` or `/#faq` from other routes, the
 * browser does not always scroll to the fragment. This keeps hash links
 * reliable with the App Router + Lenis.
 */
export function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollToHash = () => {
      if (window.location.pathname !== '/') return;
      const id = window.location.hash.slice(1);
      if (!id) return;
      document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };

    scrollToHash();
    const t1 = window.setTimeout(scrollToHash, 80);
    const t2 = window.setTimeout(scrollToHash, 240);
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, [pathname]);

  return null;
}
