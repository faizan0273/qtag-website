'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { BRAND_NAME } from '@/lib/brand';
import type { ProductType } from '@/lib/product-type';

interface Props {
  uid: string;
  isLost: boolean;
  productType: ProductType;
  relayMode?: boolean;
  companyContactPhone?: string | null;
}

function copy(productType: ProductType, isLost: boolean): { headline: string; placeholder: string; geoHint?: string } {
  switch (productType) {
    case 'PET':
      return isLost
        ? {
            headline: 'I saw this pet',
            placeholder:
              'Hi! I spotted a pet matching this profile near … (colour, landmarks, approximate time)',
            geoHint:
              'Helps reunite pets faster, only used once for this message.',
          }
        : {
            headline: 'Send a gentle message',
            placeholder: 'Hi, I scanned this tag near … Quick question:',
            geoHint: undefined,
          };
    case 'BAG':
      return isLost
        ? {
            headline: 'I found this bag',
            placeholder: 'Hi! I picked up luggage / a bag labelled like yours at … ',
            geoHint: 'Owners move fast when bags go missing.',
          }
        : {
            headline: 'Leave a secure note',
            placeholder: 'Hi, spotted this tag on a bag nearby … ',
            geoHint: undefined,
          };
    case 'PROPERTY':
      return isLost
        ? {
            headline: 'Urgent, property contact',
            placeholder: 'Please describe why you scanned (delivery, neighbourhood watch, inquiry)…',
          }
        : {
            headline: 'Message property',
            placeholder: 'Hi, I scanned this QR and wanted to ask about … ',
          };
    case 'ITEM':
      return isLost
        ? {
            headline: 'I found this item',
            placeholder:
              'Hi! I located something that looks like yours, describing colour, markings, and where:',
          }
        : {
            headline: 'Message about this item',
            placeholder: 'Hi, about the item paired with this tag:',
          };
    default:
      return isLost
        ? {
            headline: 'I need the owner',
            placeholder:
              'Hi, I scanned this tag and I’m reaching you about a safety or location issue (please describe):',
            geoHint: 'Helps the owner respond quickly. Used only for this message.',
          }
        : {
            headline: 'Message the owner',
            placeholder: 'Hi, I scanned this tag and wanted to reach you about…',
            geoHint: undefined,
          };
  }
}

export function ContactForm({
  uid,
  isLost,
  productType,
  relayMode = true,
  companyContactPhone,
}: Props) {
  const [body, setBody] = useState('');
  const [finderPhone, setFinderPhone] = useState('');
  const [shareLocation, setShareLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  const { headline, placeholder, geoHint } = copy(productType, isLost);

  async function getGeo(): Promise<{ lat: number; lng: number } | undefined> {
    if (!shareLocation || typeof navigator === 'undefined' || !navigator.geolocation) return undefined;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(undefined),
        { timeout: 5000 },
      );
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const geo = await getGeo();
        const res = await fetch(`/api/contact/message/${uid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            body: body.trim(),
            finderPhone: finderPhone.trim() || undefined,
            geo,
          }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? 'Could not send.');
          return;
        }
        setSent(true);
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">✅</div>
        <h2 className="font-display text-xl text-ink">Message sent</h2>
        <p className="mt-2 text-ink-soft">
          {relayMode
            ? companyContactPhone
              ? `The owner was notified on WhatsApp from our company number (${companyContactPhone}). Thank you for being kind.`
              : `The owner was notified on WhatsApp through ${BRAND_NAME}. Thank you for being kind.`
            : 'The owner has been notified on WhatsApp. Thank you for being kind.'}
        </p>
      </div>
    );
  }

  return (
    <div id="qtag-contact" className="scroll-mt-8">
      <form onSubmit={submit} className="space-y-4">
        <h2 className="font-display text-lg text-ink">{headline}</h2>

        <Field label="Your message" htmlFor="qtag-contact-body">
          <Textarea
            id="qtag-contact-body"
            rows={4}
            maxLength={500}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={placeholder}
            required
            invalid={Boolean(error)}
          />
        </Field>

        <Field
          label="Your phone (optional)"
          htmlFor="finderPhone"
          hint="Helps the owner call you back faster. Not shown anywhere else."
        >
          <Input
            id="finderPhone"
            type="tel"
            inputMode="tel"
            value={finderPhone}
            onChange={(e) => setFinderPhone(e.target.value)}
            placeholder="03001234567"
            autoComplete="tel"
          />
        </Field>

        {isLost && geoHint ? (
          <label className="flex items-start gap-3 p-3 rounded-lg bg-paper border border-paper-line cursor-pointer">
            <input
              type="checkbox"
              checked={shareLocation}
              onChange={(e) => setShareLocation(e.target.checked)}
              className="mt-1 accent-brand"
            />
            <div className="text-sm">
              <div className="font-medium text-ink">Share my location</div>
              <div className="text-ink-muted">{geoHint}</div>
            </div>
          </label>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={pending}
          disabled={body.trim().length < 2}
          variant={isLost ? 'danger' : 'primary'}
        >
          {isLost ? 'Notify owner now' : 'Send message'}
        </Button>
        <p className="text-xs text-ink-muted text-center">
          {relayMode
            ? companyContactPhone
              ? `Your message is sent to the owner from ${BRAND_NAME} (${companyContactPhone}), not from your SIM.`
              : `Your message is relayed to the owner through ${BRAND_NAME}, not from your SIM.`
            : `Your message goes to the owner through ${BRAND_NAME}.`}
          {finderPhone ? ' Your number is shared with the owner only.' : " You haven't shared your number."}
        </p>
      </form>
    </div>
  );
}
