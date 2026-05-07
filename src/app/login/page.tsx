'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') ?? '';

  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const res = await fetch('/api/auth/otp/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? 'Could not send code.');
          return;
        }
        const params = new URLSearchParams({ phone });
        if (next) params.set('next', next);
        if (json.data.devCode) params.set('devCode', json.data.devCode);
        router.push(`/verify?${params.toString()}`);
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  return (
    <div className="container-page py-12 md:py-20 max-w-md">
      <Card padding="lg">
        <h1 className="font-display text-display-md text-ink">Sign in</h1>
        <p className="mt-2 text-ink-soft">
          We'll send a 6-digit code to your WhatsApp.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <Field
            label="Phone number"
            htmlFor="phone"
            hint="Pakistani number, e.g. 0300 1234567"
            error={error}
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="03001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              invalid={Boolean(error)}
              required
            />
          </Field>

          <Button type="submit" size="lg" fullWidth loading={pending}>
            Send code
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-muted">
          By continuing you agree to our{' '}
          <Link href="/terms" className="underline hover:text-ink">Terms</Link> and{' '}
          <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>.
        </p>
      </Card>
    </div>
  );
}
