'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import type { ProductType } from '@/lib/product-type';

interface Props {
  tagId: string;
  isLost: boolean;
  initialLastSeenCity: string;
  initialReward: number | null;
  initialMessage: string;
  productType: ProductType;
}

function assetLabel(pt: ProductType): string {
  switch (pt) {
    case 'PET':
      return 'pet';
    case 'BAG':
      return 'bag';
    case 'PROPERTY':
      return 'property';
    case 'ITEM':
      return 'item';
    default:
      return 'vehicle';
  }
}

export function TagActions({
  tagId,
  isLost,
  initialLastSeenCity,
  initialReward,
  initialMessage,
  productType,
}: Props) {
  const router = useRouter();
  const [showLostForm, setShowLostForm] = useState(false);
  const [lastSeenCity, setLastSeenCity] = useState(initialLastSeenCity);
  const [reward, setReward] = useState(initialReward ? String(initialReward) : '');
  const [message, setMessage] = useState(initialMessage);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function markLost(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const res = await fetch(`/api/tags/${tagId}/lost`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lastSeenCity: lastSeenCity || undefined,
            rewardPkr: reward ? Number(reward) : undefined,
            message: message || undefined,
          }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? 'Could not update.');
          return;
        }
        setShowLostForm(false);
        router.refresh();
      } catch {
        setError('Network error.');
      }
    });
  }

  function markFound() {
    const asset = assetLabel(productType);
    if (!confirm(`Mark this ${asset} as found? The public page will return to normal.`)) return;
    start(async () => {
      try {
        const res = await fetch(`/api/tags/${tagId}/found`, { method: 'POST' });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? 'Could not update.');
          return;
        }
        router.refresh();
      } catch {
        setError('Network error.');
      }
    });
  }

  if (isLost) {
    return (
      <Card padding="md">
        <h2 className="font-display text-lg text-ink mb-2">Lost mode is on</h2>
        <p className="text-sm text-ink-soft mb-5">
          The public scan page highlights that this{' '}
          {productType === 'CAR' ? 'vehicle' : productType.toLowerCase()} may be missing. Mark it once it is safe again.
        </p>
        <Button
          fullWidth
          variant="primary"
          loading={pending}
          onClick={markFound}
        >
          Mark as found
        </Button>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </Card>
    );
  }

  if (!showLostForm) {
    return (
      <Card padding="md">
        <h2 className="font-display text-lg text-ink mb-2">
          Misplaced your {assetLabel(productType)}?
        </h2>
        <p className="text-sm text-ink-soft mb-5">
          Turn on lost mode so scanners see a bolder alert banner and incentive copy (if configured).
        </p>
        <Button
          variant="danger"
          fullWidth
          onClick={() => setShowLostForm(true)}
        >
          Mark as lost
        </Button>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <h2 className="font-display text-lg text-ink mb-4">Mark as lost</h2>
      <form onSubmit={markLost} className="space-y-4">
        <Field label="Last seen (optional)" htmlFor="lastSeenCity">
          <Input
            id="lastSeenCity"
            value={lastSeenCity}
            onChange={(e) => setLastSeenCity(e.target.value)}
            placeholder="DHA Phase 5, Lahore"
          />
        </Field>
        <Field label="Reward (PKR, optional)" htmlFor="reward">
          <Input
            id="reward"
            type="number"
            inputMode="numeric"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            placeholder="5000"
            min={0}
          />
        </Field>
        <Field label="Note to finder (optional)" htmlFor="message">
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please call me — thank you."
            maxLength={280}
            rows={3}
          />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowLostForm(false)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={pending} fullWidth>
            Turn on lost mode
          </Button>
        </div>
      </form>
    </Card>
  );
}
