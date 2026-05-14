'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPkr } from '@/lib/constants';
import { BRAND_NAME } from '@/lib/brand';
import type { ShopCatalogEntry, ShopSku } from '@/lib/shop-products';
import { discountPercent } from '@/lib/shop-products';

function QtyStepper({
  disabledPlus,
  value,
  onChange,
}: {
  disabledPlus: boolean;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-xl border border-paper-line bg-paper p-0.5">
      <button
        type="button"
        className="h-9 w-9 rounded-lg hover:bg-paper-line/50 disabled:opacity-40 text-lg leading-none"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-[2rem] text-center text-sm font-semibold tnum">{value}</span>
      <button
        type="button"
        className="h-9 w-9 rounded-lg hover:bg-paper-line/50 disabled:opacity-40 text-lg leading-none"
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={disabledPlus || value >= 20}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function MatrixTable({ rows }: { rows: ShopCatalogEntry['matrixRows'] }) {
  return (
    <div className="rounded-xl border border-paper-line bg-paper/40 overflow-hidden text-xs">
      <table className="w-full min-w-0 border-collapse">
        <thead>
          <tr className="bg-paper-line/35 text-left border-b border-paper-line">
            <th className="px-2.5 py-2 font-medium text-ink w-[32%]" scope="col">
              Area
            </th>
            <th className="px-1.5 py-2 font-normal text-ink-muted text-center" colSpan={4} scope="colgroup">
              What you get
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.title} className="border-t border-paper-line">
              <td className="px-2.5 py-2 font-medium text-ink align-top">{row.title}</td>
              {row.cells.map((c) => (
                <td
                  key={`${row.title}-${c}`}
                  className="px-1.5 py-2 text-ink-soft leading-snug align-top text-center border-l border-paper-line/60"
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniQrArt() {
  const cells = Array.from({ length: 49 }, (_, i) => ((i * 11 + (i % 4)) % 3) !== 0);
  return (
    <div className="grid grid-cols-7 gap-[1.5px] w-14 h-14 shrink-0 rounded-md overflow-hidden ring-1 ring-ink/10">
      {cells.map((on, i) => (
        <div key={i} className={on ? 'bg-paper-card' : 'bg-ink'} />
      ))}
    </div>
  );
}

function ProductVisual({ title }: { title: string }) {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-paper-line bg-gradient-to-br from-brand/14 via-paper-card to-paper-line/50 p-4">
      <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-brand/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-ink/5 blur-2xl" />
      <div className="relative flex min-h-36 items-center justify-center">
        <div className="w-40 rounded-2xl border border-paper-line bg-paper-card p-3 shadow-cardHover rotate-[-3deg]">
          <div className="flex items-center justify-between gap-3">
            <MiniQrArt />
            <div className="min-w-0 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">{BRAND_NAME}</p>
              <p className="mt-1 text-xs font-medium leading-tight text-ink line-clamp-2">{title}</p>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-paper-line" />
          <div className="mt-2 h-2 w-2/3 rounded-full bg-paper-line" />
        </div>
      </div>
    </div>
  );
}

interface Props {
  product: ShopCatalogEntry;
  onBuy: (sku: ShopSku, qty: number, tagsPerPack: number) => void;
}

export function CatalogProductCard({ product: p, onBuy }: Props) {
  const [qty, setQty] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const pct = discountPercent(p.pricePkr, p.compareAtPkr);
  const maxQtyByTags = Math.min(20, Math.floor(100 / p.tagsPerPack));
  const subtotal = p.pricePkr * qty;

  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [isOpen]);

  return (
    <>
      <Card
        padding="sm"
        className="group flex h-full flex-col overflow-hidden shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cardHover"
      >
        <button type="button" className="block flex-1 text-left" onClick={() => setIsOpen(true)}>
          <ProductVisual title={p.title} />

          <div className="mt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">{p.categoryLabel}</p>
                <h2 className="mt-1 font-display text-xl leading-tight text-ink">{p.title}</h2>
              </div>
              {pct != null ? (
                <span className="shrink-0 rounded-full bg-success/10 px-2 py-1 text-[11px] font-semibold text-success">
                  {pct}% off
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-sm leading-relaxed text-ink-muted line-clamp-2">{p.subtitle}</p>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <div className="font-display text-2xl leading-none text-ink tnum">{formatPkr(p.pricePkr)}</div>
                {p.compareAtPkr ? (
                  <div className="mt-1 text-xs text-ink-muted line-through tnum">{formatPkr(p.compareAtPkr)}</div>
                ) : null}
              </div>
              <p className="rounded-full bg-paper-line/45 px-3 py-1 text-[11px] font-medium text-ink-soft">
                {p.tagsPerPack} QR UID{p.tagsPerPack > 1 ? 's' : ''}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {p.offers.slice(0, 2).map((o) => (
                <span key={o} className="rounded-full border border-paper-line bg-paper/60 px-3 py-1 text-[11px] text-ink-soft">
                  {o}
                </span>
              ))}
            </div>
          </div>
        </button>

        <div className="mt-5 border-t border-paper-line pt-4">
          <Button type="button" fullWidth variant="secondary" onClick={() => setIsOpen(true)}>
            View details
          </Button>
        </div>
      </Card>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-ink/45 px-3 py-3 backdrop-blur-sm sm:place-items-center sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${p.id}-title`}
          onClick={() => setIsOpen(false)}
        >
          <div
            data-lenis-prevent
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-[1.5rem] border border-paper-line bg-paper-card shadow-cardHover touch-pan-y"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-paper-line bg-paper-card/95 px-4 py-3 backdrop-blur sm:px-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">{p.categoryLabel}</p>
                <h2 id={`${p.id}-title`} className="font-display text-xl leading-tight text-ink sm:text-2xl">
                  {p.title}
                </h2>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-paper-line text-xl leading-none text-ink-muted transition-colors hover:bg-paper hover:text-ink"
                onClick={() => setIsOpen(false)}
                aria-label="Close product details"
              >
                ×
              </button>
            </div>

            <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <ProductVisual title={p.title} />
                <Card padding="sm" className="bg-paper/60 shadow-none">
                  <p className="text-sm leading-relaxed text-ink-soft">{p.summary}</p>
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <div className="font-display text-3xl leading-none text-ink tnum">{formatPkr(p.pricePkr)}</div>
                      {p.compareAtPkr ? (
                        <div className="mt-1 text-sm">
                          <span className="line-through text-ink-muted tnum">{formatPkr(p.compareAtPkr)}</span>
                          {pct != null ? <span className="ml-2 font-medium text-success">{pct}% off</span> : null}
                        </div>
                      ) : null}
                    </div>
                    <p className="text-xs text-ink-muted">
                      {p.tagsPerPack} QR UID{p.tagsPerPack > 1 ? 's' : ''} / {p.unitLabel}
                    </p>
                  </div>
                </Card>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  {p.specs.map((s) => (
                    <div key={s.label} className="rounded-xl border border-paper-line bg-paper/55 px-3 py-2">
                      <div className="uppercase tracking-wide text-ink-muted">{s.label}</div>
                      <div className="mt-1 font-medium leading-tight text-ink">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <section>
                  <h3 className="font-display text-lg text-ink">What you get</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
                    {p.offers.map((o) => (
                      <li key={o} className="flex gap-2 rounded-xl border border-paper-line bg-paper/45 px-3 py-2">
                        <span className="mt-0.5 shrink-0 text-brand" aria-hidden>
                          ✓
                        </span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="font-display text-lg text-ink">Complete info</h3>
                  <div className="mt-3 space-y-4">
                    <MatrixTable rows={p.matrixRows} />
                    <ul className="space-y-1.5 text-sm text-ink-soft">
                      {p.highlights.map((line) => (
                        <li key={line}>• {line}</li>
                      ))}
                    </ul>
                    <div className="space-y-2 text-sm leading-relaxed text-ink-soft">
                      {p.story.map((para) => (
                        <p key={para}>{para}</p>
                      ))}
                    </div>
                  </div>
                </section>

                <Card padding="sm" className="bg-paper/70 shadow-none">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-ink-muted">Quantity</div>
                      <QtyStepper
                        value={qty}
                        onChange={(n) => setQty(Math.min(n, maxQtyByTags))}
                        disabledPlus={qty >= maxQtyByTags}
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wide text-ink-muted">Subtotal</div>
                      <div className="font-display text-xl text-ink tnum">{formatPkr(subtotal)}</div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="lg"
                    fullWidth
                    className="mt-4"
                    onClick={() => onBuy(p.id, qty, p.tagsPerPack)}
                    disabled={qty * p.tagsPerPack > 100}
                  >
                    Buy now
                  </Button>
                  <p className="mt-2 text-center text-[10px] text-ink-muted">
                    {BRAND_NAME} checkout · prices in PKR
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
