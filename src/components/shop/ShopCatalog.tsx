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
    <>
      <section className="bg-brand">
        <div className="container-page py-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/80">{BRAND_NAME} shop</p>
          <h1 className="mt-3 font-display text-display-xl text-ink max-w-3xl">
            Physical QR tags, ready to ship.
          </h1>
          <p className="mt-5 text-lg text-ink/80 max-w-2xl leading-relaxed">
            Every product uses the same privacy first scan flow: people reach you through {BRAND_NAME}, and your number
            stays off the public page. Tap a card to see materials, use cases, and checkout options.
          </p>
          <p className="mt-4 text-xs text-ink/65">
            Store &amp; activation: <span className="font-mono text-ink/80">{siteUrl}</span>
          </p>
        </div>
      </section>

      <div className="container-page py-10 md:py-14 pb-16">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 items-stretch">
          {SHOP_CATALOG.map((p) => (
            <CatalogProductCard key={p.id} product={p} onBuy={buy} />
          ))}
        </div>

        <footer className="mt-12 max-w-2xl mx-auto text-center text-xs text-ink-muted space-y-3">
          <p>
            Shipping and totals are calculated at checkout. Capabilities in the grid reflect what {BRAND_NAME} is built
            for today; we expand channels over time.
          </p>
          <Link href="/dashboard/tags/new" className="inline-block text-sm font-medium text-brand hover:text-brand-dark">
            Need a free digital tag only? Create one in the dashboard →
          </Link>
        </footer>
      </div>
    </>
  );
}
