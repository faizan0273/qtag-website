'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PRODUCT, formatPkr } from '@/lib/constants';
import { BRAND_NAME } from '@/lib/brand';
import { useCartStore } from '@/store/cart-store';

export default function ShopPage() {
  const qty = useCartStore((s) => s.qty);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);

  const subtotal = useMemo(() => PRODUCT.pricePkr * qty, [qty]);

  return (
    <div className="container-page py-10 md:py-16">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Visual ----------------------------------------------------- */}
        <div className="lg:sticky lg:top-24">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-brand/15 via-paper-card to-paper-line/40 border border-paper-line shadow-card relative overflow-hidden">
            <div className="absolute inset-0 grid place-items-center">
              <div className="bg-paper-card border border-paper-line rounded-2xl p-6 w-64 shadow-cardHover rotate-[-2deg]">
                <div className="aspect-square bg-ink rounded-md grid place-items-center p-4">
                  <FakeQR />
                </div>
                <div className="mt-3 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted">Scan me</div>
                  <div className="font-display text-base">{BRAND_NAME}</div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-ink-muted text-center">
            Actual sticker is 6×6 cm, weather-resistant, fits any windshield corner.
          </p>
        </div>

        {/* Detail ---------------------------------------------------- */}
        <div>
          <div className="text-sm text-brand font-medium uppercase tracking-wide">
            Vehicle Sticker
          </div>
          <h1 className="mt-2 font-display text-display-lg text-ink">{PRODUCT.name}</h1>
          <p className="mt-4 text-lg text-ink-soft leading-relaxed">{PRODUCT.shortDescription}</p>

          <div className="mt-6 text-3xl font-display tnum text-ink">
            {formatPkr(PRODUCT.pricePkr)}
            <span className="text-base text-ink-muted font-sans"> per sticker</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link href="/dashboard/tags/new">
              <Button variant="secondary">Create tag</Button>
            </Link>
            <Link href="/checkout">
              <Button>Buy a sticker</Button>
            </Link>
          </div>

          <Card className="mt-8" padding="md" id="buy">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink-soft">Quantity</div>
                <div className="text-xs text-ink-muted">One sticker per vehicle.</div>
              </div>
              <div className="flex items-center gap-3">
                <QtyButton onClick={decrement} disabled={qty <= 1}>−</QtyButton>
                <span className="w-8 text-center text-lg font-medium tnum">{qty}</span>
                <QtyButton onClick={increment} disabled={qty >= 20}>+</QtyButton>
              </div>
            </div>

            <div className="mt-6 flex items-baseline justify-between">
              <span className="text-ink-muted">Subtotal</span>
              <span className="font-display text-xl tnum">{formatPkr(subtotal)}</span>
            </div>

            <Link href="/checkout" className="block mt-6">
              <Button size="lg" fullWidth>Buy a sticker</Button>
            </Link>
            <p className="mt-3 text-xs text-ink-muted text-center">
              Cash on delivery available. Free shipping over Rs 1,500.
            </p>
          </Card>

          <ul className="mt-8 space-y-3 text-ink-soft">
            {[
              'Activated in 30 seconds — scan once with your phone',
              'Owner phone number always hidden on the public page',
              `WhatsApp + call relay through ${BRAND_NAME}`,
              'Lost mode with optional reward',
              '7-day return policy on unactivated stickers',
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-1 grid place-items-center h-5 w-5 rounded-full bg-brand-soft text-brand shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function QtyButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="h-10 w-10 rounded-lg border border-paper-line hover:bg-paper-line/60 disabled:opacity-50 disabled:cursor-not-allowed text-lg leading-none"
      {...rest}
    >
      {children}
    </button>
  );
}

function FakeQR() {
  const cells = Array.from({ length: 49 }, (_, i) => ((i * 11 + (i % 4)) % 3) !== 0);
  return (
    <div className="grid grid-cols-7 gap-[2px] w-full h-full">
      {cells.map((on, i) => (
        <div key={i} className={on ? 'aspect-square bg-paper-card' : 'aspect-square bg-ink'} />
      ))}
    </div>
  );
}
