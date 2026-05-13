'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { publicEnv } from '@/lib/env-public';
import type { ShopSku } from '@/lib/shop-products';
import { SHOP_CATALOG } from '@/lib/shop-products';
import { BRAND_NAME } from '@/lib/brand';
import { useCartStore } from '@/store/cart-store';
import { CatalogProductCard } from './CatalogProductCard';

export function ShopCatalog() {
  const router = useRouter();
  const setCartSku = useCartStore((s) => s.setSku);
  const setCartQty = useCartStore((s) => s.setQty);
  const siteUrl = publicEnv.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//i, '');

  const buy = useCallback(
    (sku: ShopSku, qty: number, tagsPerPack: number) => {
      const totalTags = qty * tagsPerPack;
      if (totalTags > 100) return;
      setCartSku(sku);
      setCartQty(qty);
      router.push('/checkout');
    },
    [router, setCartQty, setCartSku],
  );

  return (
    <div className="container-page py-8 md:py-12 pb-16">
      <header className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{BRAND_NAME} shop</p>
        <h1 className="mt-2 font-display text-display-md md:text-display-lg text-ink">Physical QR tags</h1>
        <p className="mt-3 text-sm md:text-base text-ink-soft leading-relaxed">
          Every product below uses the same privacy first scan flow: people reach you through {BRAND_NAME}, and your
          number stays off the public page. Tap a card to see materials, use cases, and checkout options.
        </p>
        <p className="mt-2 text-xs text-ink-muted">
          Store &amp; activation:{' '}
          <span className="font-mono text-ink-soft">{siteUrl}</span>
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 items-stretch">
        {SHOP_CATALOG.map((p) => (
          <CatalogProductCard key={p.id} product={p} onBuy={buy} />
        ))}
      </div>

      <footer className="mt-12 max-w-2xl mx-auto text-center text-xs text-ink-muted space-y-3">
        <p>
          Shipping and totals are calculated at checkout. Capabilities in the grid reflect
          what {BRAND_NAME} is built for today; we expand channels over time.
        </p>
        <Link href="/dashboard/tags/new" className="inline-block text-sm font-medium text-brand hover:text-brand-dark">
          Need a free digital tag only? Create one in the dashboard →
        </Link>
      </footer>
    </div>
  );
}
