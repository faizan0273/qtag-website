'use client';

import { useState } from 'react';
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

interface Props {
  product: ShopCatalogEntry;
  onBuy: (sku: ShopSku, qty: number, tagsPerPack: number) => void;
}

export function CatalogProductCard({ product: p, onBuy }: Props) {
  const [qty, setQty] = useState(1);
  const pct = discountPercent(p.pricePkr, p.compareAtPkr);
  const maxQtyByTags = Math.min(20, Math.floor(100 / p.tagsPerPack));
  const subtotal = p.pricePkr * qty;

  return (
    <Card padding="sm" className="flex flex-col h-full overflow-hidden shadow-card hover:shadow-cardHover transition-shadow">
      <div className="flex gap-3">
        <div className="rounded-xl bg-gradient-to-br from-brand/12 via-paper-card to-paper-line/30 p-2.5 border border-paper-line shrink-0">
          <MiniQrArt />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">{p.categoryLabel}</p>
          <h2 className="mt-0.5 font-display text-lg sm:text-xl text-ink leading-tight">{p.title}</h2>
          <p className="mt-1 text-xs text-ink-muted line-clamp-2">{p.subtitle}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-soft leading-snug line-clamp-3">{p.summary}</p>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="font-display text-2xl text-ink tnum leading-none">{formatPkr(p.pricePkr)}</div>
          {p.compareAtPkr ? (
            <div className="mt-1 text-xs">
              <span className="line-through text-ink-muted tnum">{formatPkr(p.compareAtPkr)}</span>
              {pct != null ? (
                <span className="ml-2 text-success font-medium">{pct}% off</span>
              ) : null}
            </div>
          ) : null}
        </div>
        <p className="text-[11px] text-ink-muted">
          {p.tagsPerPack} QR UID{p.tagsPerPack > 1 ? 's' : ''} / {p.unitLabel}
        </p>
      </div>

      <ul className="mt-4 space-y-1.5 text-xs text-ink-soft">
        {p.offers.slice(0, 4).map((o) => (
          <li key={o} className="flex gap-2">
            <span className="text-brand mt-0.5 shrink-0" aria-hidden>
              ✓
            </span>
            <span>{o}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
        {p.specs.map((s) => (
          <div key={s.label} className="rounded-lg bg-paper-line/25 px-2 py-1.5 border border-paper-line/50">
            <div className="text-ink-muted uppercase tracking-wide">{s.label}</div>
            <div className="mt-0.5 font-medium text-ink leading-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <details className="mt-4 group border border-paper-line rounded-xl bg-paper/30 open:bg-paper-card">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-brand flex items-center justify-between gap-2 select-none [&::-webkit-details-marker]:hidden">
          <span>Full details</span>
          <span className="text-ink-muted text-xs font-normal group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-3 pb-3 pt-0 space-y-4 border-t border-paper-line/80">
          <MatrixTable rows={p.matrixRows} />
          <ul className="space-y-1.5 text-xs text-ink-soft">
            {p.highlights.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
          <div className="space-y-2 text-xs text-ink-soft leading-relaxed">
            {p.story.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </div>
      </details>

      <div className="mt-auto pt-5 border-t border-paper-line flex flex-col gap-3">
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
            <div className="font-display text-lg tnum text-ink">{formatPkr(subtotal)}</div>
          </div>
        </div>
        <Button
          size="lg"
          fullWidth
          onClick={() => onBuy(p.id, qty, p.tagsPerPack)}
          disabled={qty * p.tagsPerPack > 100}
        >
          Buy · COD
        </Button>
        <p className="text-[10px] text-center text-ink-muted">
          {BRAND_NAME} checkout · prices in PKR
        </p>
      </div>
    </Card>
  );
}
