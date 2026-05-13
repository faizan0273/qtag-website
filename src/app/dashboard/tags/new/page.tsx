'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { PRODUCT_TYPES, productTypeIcon, productTypeLabel, type ProductType } from '@/lib/product-type';

type Step = 1 | 2 | 3;

const HINTS: Record<ProductType, string> = {
  CAR:
    'Prefer a ready-made physical tag? Use the shop, this flow is ideal for pets, bags, property, and custom digital tags.',
  PET: 'Breed mix, distinguishing marks, temperament, whatever helps a finder recognize them.',
  BAG: 'Colour, luggage brand tag, initials on the luggage tag ribbon…',
  PROPERTY: 'Visible sign text, storefront hours, keep it informational only.',
  ITEM: 'Laptop, stroller, toolbox, helmet, describe what carries this QR.',
};

export default function CreateNewTagPage() {
  const [step, setStep] = useState<Step>(1);
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [created, setCreated] = useState<null | {
    id: string;
    uid: string;
    qrDataUrl: string;
    productType: ProductType;
  }>(null);

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!productType) return;
    setError(null);
    start(async () => {
      try {
        const res = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productType,
            title: title.trim(),
            description: description.trim() || undefined,
            metadata: {},
          }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? 'Could not create.');
          return;
        }
        const tag = json.data.tag as {
          id: string;
          uid: string;
          qrDataUrl: string;
          productType: ProductType;
        };
        setCreated({
          id: tag.id,
          uid: tag.uid,
          qrDataUrl: tag.qrDataUrl,
          productType: tag.productType,
        });
        setStep(3);
      } catch {
        setError('Network error.');
      }
    });
  }

  function downloadQr() {
    if (!created) return;
    const a = document.createElement('a');
    a.href = created.qrDataUrl;
    a.download = `qtag-tag-${created.uid}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <div className="text-sm uppercase tracking-wider text-brand font-medium">
          Create new tag
        </div>
        <h1 className="mt-2 font-display text-display-md text-ink">Create a QR identity</h1>
        <p className="mt-2 text-ink-soft text-sm leading-relaxed">
          Pick a product type, say what it represents, then download the QR. Physical tags from the shop use the same
          activation flow, this wizard is for digital first tags you create here.
        </p>
      </div>

      {step === 1 ? (
        <Card padding="lg" className="space-y-4">
          <h2 className="font-display text-lg text-ink">1 · Product type</h2>
          <div className="grid gap-3">
            {PRODUCT_TYPES.map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => {
                  setProductType(pt);
                  setStep(2);
                }}
                className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                  productType === pt
                    ? 'border-brand bg-brand-soft/60'
                    : 'border-paper-line hover:bg-paper-line/50'
                }`}
              >
                <span className="mr-2 text-xl" aria-hidden>
                  {productTypeIcon(pt)}
                </span>
                <span className="font-display text-lg text-ink">{productTypeLabel(pt)}</span>
                <p className="mt-1 text-xs text-ink-muted">{HINTS[pt]}</p>
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {step === 2 && productType ? (
        <Card padding="lg">
          <form onSubmit={submitCreate} className="space-y-5">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <h2 className="font-display text-lg text-ink">2 · Details</h2>
              <button type="button" className="text-sm text-brand" onClick={() => setStep(1)}>
                Change type ↺
              </button>
            </div>
            <p className="text-sm text-ink-muted flex gap-2">
              <span className="text-xl leading-none">{productTypeIcon(productType)}</span>
              <span>{HINTS[productType]}</span>
            </p>

            <Field label="Title" htmlFor="title" hint="Printed on every scan landing page.">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Toyota Corolla · Pearl White"
                maxLength={120}
                required
              />
            </Field>

            <Field label="Description (optional)" htmlFor="description">
              <Textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Keep it informational, phones stay private unless you expose them deliberately."
                maxLength={500}
              />
            </Field>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <Button size="lg" fullWidth loading={pending} type="submit" disabled={title.trim().length < 2}>
              3 · Generate QR
            </Button>
          </form>
        </Card>
      ) : null}

      {step === 3 && created ? (
        <Card padding="lg" className="text-center space-y-5">
          <h2 className="font-display text-lg text-ink">4 · Save your QR · 5 · Activate</h2>
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
          <img
            src={created.qrDataUrl}
            alt={`QR ${created.uid}`}
            className="mx-auto w-[min(280px,100%)] rounded-xl border border-paper-line shadow-card"
          />
          <div className="font-mono tnum text-xs text-ink-soft break-all">Code {created.uid}</div>

          <div className="flex flex-col gap-2">
            <Button size="lg" fullWidth variant="secondary" type="button" onClick={downloadQr}>
              Download PNG
            </Button>
            <Link href={`/t/${created.uid}/activate`} className="block">
              <Button size="lg" fullWidth type="button">
                Go to activate
              </Button>
            </Link>
          </div>
          <p className="text-xs text-ink-muted">
            The QR opens <span className="font-mono">/scan/{created.uid}</span>, classic{' '}
            <span className="font-mono">/t/</span> links stay valid for any physical tag shipped with that URL pattern.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
