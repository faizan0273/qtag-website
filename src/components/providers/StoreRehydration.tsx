'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cart-store';

/** Deferred rehydration so server HTML matches first client paint (Next.js App Router). */
export function StoreRehydration() {
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
}
