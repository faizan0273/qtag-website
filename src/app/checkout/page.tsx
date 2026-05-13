'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import {
  type CheckoutPaymentMethod,
  orderLineTitleFromSku,
  orderUnitPricePkr,
  PK_PROVINCES,
  formatPkr,
  quoteOrder,
} from '@/lib/constants';
import { isShopSku } from '@/lib/shop-products';
import { useCartStore } from '@/store/cart-store';
import { useSessionStore } from '@/store/session-store';

const initialShipping = {
  fullName: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  province: 'Punjab' as (typeof PK_PROVINCES)[number],
};

export default function CheckoutPage() {
  const router = useRouter();
  const search = useSearchParams();

  const qty = useCartStore((s) => s.qty);
  const shopSku = useCartStore((s) => s.shopSku);
  const setCartQty = useCartStore((s) => s.setQty);
  const setCartSku = useCartStore((s) => s.setSku);
  const fetchSession = useSessionStore((s) => s.fetchSession);
  const fetchStatus = useSessionStore((s) => s.fetchStatus);
  const sessionUser = useSessionStore((s) => s.user);

  const [shipping, setShipping] = useState(initialShipping);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('COD');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const rawSku = search.get('sku');
    if (rawSku && isShopSku(rawSku)) setCartSku(rawSku);
    const raw = search.get('qty');
    if (raw != null && raw !== '') {
      const q = parseInt(raw, 10);
      if (q >= 1 && q <= 20) setCartQty(q);
    }
  }, [search, setCartQty, setCartSku]);

  useEffect(() => {
    if (fetchStatus === 'idle') void fetchSession();
  }, [fetchStatus, fetchSession]);

  useEffect(() => {
    const phone = sessionUser?.phone;
    if (!phone) return;
    setShipping((s) => (s.phone ? s : { ...s, phone }));
  }, [sessionUser?.phone]);

  const quote = useMemo(
    () => quoteOrder(qty, paymentMethod, shopSku),
    [qty, paymentMethod, shopSku],
  );
  const lineTitle = orderLineTitleFromSku(shopSku);
  const unitPkr = orderUnitPricePkr(shopSku);

  function update<K extends keyof typeof shipping>(key: K, value: (typeof shipping)[K]) {
    setShipping((s) => ({ ...s, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: qty,
            shopSku,
            shipping,
            paymentMethod,
            notes,
          }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? 'Could not place order.');
          return;
        }
        const payment = json.data?.payment;
        if (payment?.provider === 'JAZZCASH' && payment.redirectUrl) {
          // Hand off to the server page that auto-submits to JazzCash.
          window.location.href = payment.redirectUrl;
          return;
        }
        router.push(`/order-success/${json.data.order.id}`);
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  return (
    <div className="container-page py-10 md:py-16">
      <h1 className="font-display text-display-lg text-ink">Checkout</h1>
      <p className="mt-2 text-ink-soft">Standard 2 to 3 day delivery to major cities.</p>

      <form onSubmit={submit} className="mt-10 grid lg:grid-cols-3 gap-8 items-start">
        {/* ---- Shipping form ---- */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <h2 className="font-display text-xl text-ink mb-6">Where should we send it?</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Full name" htmlFor="fullName">
                <Input
                  id="fullName"
                  value={shipping.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  required
                  autoComplete="name"
                />
              </Field>

              <Field label="Phone (for delivery rider)" htmlFor="phone">
                <Input
                  id="phone"
                  value={shipping.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  inputMode="tel"
                  placeholder="03001234567"
                  required
                  autoComplete="tel"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Street / house" htmlFor="address1">
                  <Input
                    id="address1"
                    value={shipping.address1}
                    onChange={(e) => update('address1', e.target.value)}
                    required
                    autoComplete="address-line1"
                    placeholder="House 123, Street 4"
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Area / landmark (optional)" htmlFor="address2">
                  <Input
                    id="address2"
                    value={shipping.address2}
                    onChange={(e) => update('address2', e.target.value)}
                    autoComplete="address-line2"
                    placeholder="DHA Phase 5, near Phase 5 Park"
                  />
                </Field>
              </div>

              <Field label="City" htmlFor="city">
                <Input
                  id="city"
                  value={shipping.city}
                  onChange={(e) => update('city', e.target.value)}
                  required
                  autoComplete="address-level2"
                />
              </Field>

              <Field label="Province" htmlFor="province">
                <Select
                  id="province"
                  value={shipping.province}
                  onChange={(e) =>
                    update('province', e.target.value as (typeof PK_PROVINCES)[number])
                  }
                >
                  {PK_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="md:col-span-2">
                <Field label="Order notes (optional)" htmlFor="notes" hint="Anything the rider should know.">
                  <Textarea
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="font-display text-xl text-ink mb-4">Payment</h2>
            <div className="space-y-3">
              <PaymentOption
                checked={paymentMethod === 'COD'}
                onSelect={() => setPaymentMethod('COD')}
                title="Cash on Delivery"
                subtitle="Pay the rider when your order arrives."
                right={`+${formatPkr(quote.codFeePkr)} fee`}
              />
              <PaymentOption
                checked={paymentMethod === 'JAZZCASH'}
                onSelect={() => setPaymentMethod('JAZZCASH')}
                title="JazzCash"
                subtitle="Pay securely now with your JazzCash mobile account or card."
                right="No COD fee"
              />
            </div>
            {paymentMethod === 'JAZZCASH' ? (
              <p className="mt-4 text-xs text-ink-muted">
                You&apos;ll be redirected to JazzCash to complete payment, then sent back to your order page.
              </p>
            ) : null}
          </Card>
        </div>

        {/* ---- Summary ---- */}
        <div className="lg:sticky lg:top-24">
          <Card padding="lg">
            <h2 className="font-display text-xl text-ink mb-5">Your order</h2>

            <div className="flex items-center gap-4 pb-5 border-b border-paper-line">
              <div className="h-14 w-14 rounded-lg bg-ink grid place-items-center">
                <span className="text-paper text-xs font-display tracking-widest">QR</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-ink">{lineTitle}</div>
                <div className="text-sm text-ink-muted">Qty: {qty}</div>
              </div>
              <div className="font-medium tnum">{formatPkr(unitPkr * qty)}</div>
            </div>

            <dl className="mt-5 space-y-2.5 text-sm">
              <Row label="Subtotal" value={formatPkr(quote.subtotalPkr)} />
              <Row
                label="Shipping"
                value={
                  quote.freeShippingApplied ? 'Free' : formatPkr(quote.shippingPkr)
                }
              />
              {paymentMethod === 'COD' ? (
                <Row label="COD fee" value={formatPkr(quote.codFeePkr)} />
              ) : null}
              <div className="border-t border-paper-line pt-3 flex justify-between font-display text-lg text-ink">
                <span>Total</span>
                <span className="tnum">{formatPkr(quote.totalPkr)}</span>
              </div>
            </dl>

            {error ? (
              <p className="mt-4 text-sm text-danger">{error}</p>
            ) : null}

            <Button type="submit" size="lg" fullWidth className="mt-6" loading={pending}>
              {paymentMethod === 'JAZZCASH' ? 'Pay with JazzCash' : 'Place order'}
            </Button>
            <p className="mt-3 text-xs text-ink-muted text-center">
              By placing this order you accept our terms.
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-soft">
      <dt>{label}</dt>
      <dd className="text-ink tnum">{value}</dd>
    </div>
  );
}

function PaymentOption({
  checked,
  onSelect,
  title,
  subtitle,
  right,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  right?: string;
}) {
  return (
    <label
      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
        checked ? 'border-brand bg-brand-soft' : 'border-paper-line hover:border-ink-muted'
      }`}
    >
      <input
        type="radio"
        name="paymentMethod"
        checked={checked}
        onChange={onSelect}
        className="accent-brand"
      />
      <div>
        <div className="font-medium text-ink">{title}</div>
        <div className="text-sm text-ink-muted">{subtitle}</div>
      </div>
      {right ? <div className="ml-auto text-sm text-ink-soft tnum">{right}</div> : null}
    </label>
  );
}
