'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { productTypeIcon, type ProductType, type TagOrigin } from '@/lib/product-type';

function SignOutLink({ loginNext }: { loginNext: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push(loginNext);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="w-full text-center text-sm text-brand hover:underline disabled:opacity-60"
    >
      {busy ? 'Signing out…' : 'Sign out and try another number'}
    </button>
  );
}

interface Props {
  slug: string;
  productType: ProductType;
  categoryLabel: string;
  origin: TagOrigin;
  initialTitle?: string;
  initialDescription?: string;
  publicScanUrl: string;
  alreadyActive?: boolean;
  claimedByOther?: boolean;
  ownerPhone?: string;
  tagSummary?: { title: string; plate?: string };
}

export function ActivateTagForm({
  slug,
  productType,
  categoryLabel,
  origin,
  initialTitle = '',
  initialDescription = '',
  publicScanUrl,
  alreadyActive = false,
  claimedByOther = false,
  ownerPhone,
  tagSummary,
}: Props) {
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
  const [isPhoneNumberAllow, setIsPhoneNumberAllow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [activated, setActivated] = useState(alreadyActive);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.data?.user?.name && !publicName) setPublicName(j.data.user.name);
      })
      .catch(() => {});
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
        isPhoneNumberAllow,
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
      isPhoneNumberAllow,
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
        setActivated(true);
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  const isCar = productType === 'CAR';
  const icon = productTypeIcon(productType);

  const categoryBanner = (
    <div className="mb-6 rounded-xl border border-paper-line bg-paper/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
        <div>
          <div className="text-xs uppercase tracking-wide text-brand font-medium">Sticker category</div>
          <div className="font-display text-lg text-ink">{categoryLabel} tag</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        Category was set on this sticker before shipping. Sign in with WhatsApp OTP to verify it is you.
      </p>
    </div>
  );

  if (claimedByOther) {
    return (
      <div className="container-page py-10 md:py-16 max-w-xl">
        {categoryBanner}
        <Card padding="lg">
          <h1 className="font-display text-display-md text-ink">This tag is already active</h1>
          <p className="mt-3 text-ink-soft">
            Another account activated this sticker. Sign in with the <strong>same phone number</strong> you used
            when you first set it up to see your profile.
          </p>
          <p className="mt-4 text-sm text-ink-muted">
            Tag code: <span className="font-mono">{slug}</span>
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href={`/login?next=${encodeURIComponent(`/t/${slug}/activate`)}`}>
              <Button size="lg" fullWidth>
                Sign in with owner number
              </Button>
            </Link>
            <SignOutLink loginNext={`/login?next=${encodeURIComponent(`/t/${slug}/activate`)}`} />
          </div>
        </Card>
      </div>
    );
  }

  if (activated) {
    const label =
      tagSummary?.title ??
      ((isCar && vehicle.make ? `${vehicle.color} ${vehicle.make}`.trim() : title) || 'Your tag');
    const plate = tagSummary?.plate ?? (vehicle.plate || undefined);

    return (
      <div className="container-page py-10 md:py-16 max-w-xl">
        <div className="mb-6 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-success text-sm">
          Tag activated. Test it by scanning the QR with your phone camera.
        </div>
        <Card padding="lg">
          <div className="text-sm text-brand font-medium uppercase tracking-wide">
            {categoryLabel} tag
          </div>
          <h1 className="mt-1 font-display text-display-md text-ink">{label}</h1>
          {plate ? (
            <div className="mt-2 inline-block px-3 py-1 rounded-md bg-ink text-paper font-mono text-sm tracking-wider">
              {plate}
            </div>
          ) : null}
          {ownerPhone ? (
            <p className="mt-4 text-xs text-ink-muted">
              Verified owner: <span className="font-mono">{ownerPhone}</span>
            </p>
          ) : null}
          <p className="mt-6 text-sm text-ink-soft">Public scan link (for your records):</p>
          <p className="mt-1 font-mono text-xs break-all text-ink">{publicScanUrl}</p>
          <div className="mt-6 flex flex-col gap-2">
            <a href={publicScanUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" fullWidth>
                Open public profile
              </Button>
            </a>
            <p className="text-xs text-ink-muted text-center">
              Tag code: <span className="font-mono">{slug}</span>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const head =
    origin === 'DASHBOARD' ? (
      <>
        <div className="text-sm text-brand font-medium uppercase tracking-wide">Finalize and activate</div>
        <h1 className="mt-1 font-display text-display-lg text-ink">Go live</h1>
        <p className="mt-2 text-ink-soft">Confirm what strangers see on scan. Your phone stays private.</p>
      </>
    ) : (
      <>
        <div className="text-sm text-brand font-medium uppercase tracking-wide">Step 1 of 1</div>
        <h1 className="mt-1 font-display text-display-lg text-ink">Activate your tag</h1>
        <p className="mt-2 text-ink-soft">
          Add what should appear publicly. Your phone stays private unless you choose to share it on the scan page.
        </p>
      </>
    );

  return (
    <div className="container-page py-10 md:py-16 max-w-xl">
      {categoryBanner}
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
              <Field
                label="Title"
                htmlFor="title"
                hint={
                  productType === 'PET'
                    ? 'Shown on every scan, e.g. Golden Retriever · Max'
                    : categoryLabel === 'Baby'
                      ? 'e.g. Baby on board — Family name'
                      : 'Shown on every scan'
                }
              >
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                  placeholder={
                    productType === 'PET'
                      ? 'Golden Retriever · Max'
                      : categoryLabel === 'Baby'
                        ? 'Baby on board'
                        : 'Item title'
                  }
                />
              </Field>
              <Field label="Description (optional)" htmlFor="description">
                <Textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
              </Field>
            </>
          )}

          <div className="border-t border-paper-line pt-5 space-y-5">
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

            <label className="flex items-start gap-3 p-3 rounded-lg bg-paper border border-paper-line cursor-pointer">
              <input
                type="checkbox"
                checked={isPhoneNumberAllow}
                onChange={(e) => setIsPhoneNumberAllow(e.target.checked)}
                className="mt-1 accent-brand"
              />
              <div className="text-sm">
                <div className="font-medium text-ink">Allow WhatsApp contact</div>
                <div className="text-ink-muted">
                  When enabled, finders can open WhatsApp to reach you directly. When off, they can only
                  message you through our company relay.
                </div>
              </div>
            </label>
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
