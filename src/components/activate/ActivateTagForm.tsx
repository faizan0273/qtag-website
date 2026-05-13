'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import type { ProductType, TagOrigin } from '@/lib/product-type';

interface Props {
  slug: string;
  productType: ProductType;
  origin: TagOrigin;
  initialTitle?: string;
  initialDescription?: string;
}

export function ActivateTagForm({
  slug,
  productType,
  origin,
  initialTitle = '',
  initialDescription = '',
}: Props) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState({
    plate: '',
    make: '',
    model: '',
    color: '',
    year: '',
  });
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [publicName, setPublicName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.data?.user?.name && !publicName) setPublicName(j.data.user.name);
      })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof typeof vehicle>(key: K, value: string) {
    setVehicle((v) => ({ ...v, [key]: value }));
  }

  function buildPayload(): Record<string, unknown> {
    if (productType === 'CAR') {
      return {
        productType: 'CAR',
        publicName,
        vehicle: {
          ...vehicle,
          year: vehicle.year ? Number(vehicle.year) : undefined,
          model: vehicle.model || undefined,
        },
      };
    }
    return {
      productType,
      publicName,
      title,
      description: description || undefined,
    };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const res = await fetch(`/api/activate/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? 'Could not activate.');
          return;
        }
        router.push(`/dashboard/tags/${json.data.tag.id}?activated=1`);
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  const isCar = productType === 'CAR';
  const head =
    origin === 'DASHBOARD' ? (
      <>
        <div className="text-sm text-brand font-medium uppercase tracking-wide">Finalize and activate</div>
        <h1 className="mt-1 font-display text-display-lg text-ink">Go live</h1>
        <p className="mt-2 text-ink-soft">
          Confirm the display name strangers see, we already kept your QR safe until this step finishes.
        </p>
      </>
    ) : (
      <>
        <div className="text-sm text-brand font-medium uppercase tracking-wide">Step 1 of 1</div>
        <h1 className="mt-1 font-display text-display-lg text-ink">Activate your tag</h1>
        <p className="mt-2 text-ink-soft">
          Add what should appear publicly. Your phone stays private unless you tap call / WhatsApp on the scan page.
        </p>
      </>
    );

  return (
    <div className="container-page py-10 md:py-16 max-w-xl">
      <div className="mb-8">{head}</div>

      <Card padding="lg">
        <form onSubmit={submit} className="space-y-5">
          {isCar ? (
            <>
              <Field label="Number plate" htmlFor="plate" hint="As written on your registration (e.g. LEC-1234).">
                <Input
                  id="plate"
                  value={vehicle.plate}
                  onChange={(e) => update('plate', e.target.value.toUpperCase())}
                  required
                  placeholder="LEC-1234"
                  maxLength={15}
                  autoCapitalize="characters"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Make" htmlFor="make">
                  <Input
                    id="make"
                    value={vehicle.make}
                    onChange={(e) => update('make', e.target.value)}
                    required
                    placeholder="Toyota"
                  />
                </Field>
                <Field label="Model (optional)" htmlFor="model">
                  <Input
                    id="model"
                    value={vehicle.model}
                    onChange={(e) => update('model', e.target.value)}
                    placeholder="Corolla"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Color" htmlFor="color">
                  <Input
                    id="color"
                    value={vehicle.color}
                    onChange={(e) => update('color', e.target.value)}
                    required
                    placeholder="Pearl White"
                  />
                </Field>
                <Field label="Year (optional)" htmlFor="year">
                  <Input
                    id="year"
                    type="number"
                    inputMode="numeric"
                    min={1950}
                    max={new Date().getFullYear() + 1}
                    value={vehicle.year}
                    onChange={(e) => update('year', e.target.value)}
                    placeholder="2019"
                  />
                </Field>
              </div>
            </>
          ) : (
            <>
              <Field label="Title" htmlFor="title" hint='Shown on every scan, e.g. “Golden Retriever, Max”.'>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                  placeholder={productType === 'PET' ? 'Golden Retriever · Max' : 'Rolling suitcase · Midnight blue'}
                />
              </Field>
              <Field
                label="Description (optional)"
                htmlFor="description"
                hint="Anything safe to publish, no phone numbers."
              >
                <Textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Distinctive markings, temperament, neighbourhood context…"
                  maxLength={500}
                />
              </Field>
            </>
          )}

          <div className="border-t border-paper-line pt-5">
            <Field
              label="Display name"
              htmlFor="publicName"
              hint="What strangers see on the public profile, e.g. 'Ahmed K.'."
            >
              <Input
                id="publicName"
                value={publicName}
                onChange={(e) => setPublicName(e.target.value)}
                required
                maxLength={40}
                placeholder="Ahmed K."
              />
            </Field>
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button type="submit" size="lg" fullWidth loading={pending}>
            Activate this tag
          </Button>
          <p className="text-xs text-ink-muted text-center">
            Tag code: <span className="font-mono">{slug}</span>
          </p>
        </form>
      </Card>
    </div>
  );
}
