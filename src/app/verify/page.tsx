'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSessionStore } from '@/store/session-store';

export default function VerifyPage() {
  const router = useRouter();
  const search = useSearchParams();
  const phone = search.get('phone') ?? '';
  const next = search.get('next') ?? '/dashboard';
  const devCode = search.get('devCode');

  const [code, setCode] = useState(devCode ?? '');
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(30);
  const [resending, setResending] = useState(false);
  const [pending, startVerify] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!phone) router.replace('/login');
  }, [phone, router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startVerify(async () => {
      try {
        const res = await fetch('/api/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, code }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? 'Could not verify.');
          return;
        }
        if (json.data?.user) {
          useSessionStore.getState().setSessionFromVerify(json.data.user);
        }
        router.push(next);
        router.refresh();
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  async function resend() {
    if (resendIn > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/otp/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error?.message ?? 'Could not resend.');
        return;
      }
      setResendIn(30);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="container-page py-12 md:py-20 max-w-md">
      <Card padding="lg">
        <h1 className="font-display text-display-md text-ink">Enter the code</h1>
        <p className="mt-2 text-ink-soft">
          We sent a 6-digit code on WhatsApp to{' '}
          <span className="text-ink font-medium tnum">{phone}</span>.
        </p>

        {devCode ? (
          <div className="mt-4 px-4 py-3 rounded-xl bg-brand-soft text-brand text-sm">
            <span className="font-semibold">Dev mode:</span> the code is{' '}
            <span className="font-mono tnum">{devCode}</span>.
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-8 space-y-5">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={[
              'w-full text-center font-mono tracking-[0.6em] text-2xl h-16',
              'bg-paper-card border rounded-xl text-ink',
              'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand',
              error ? 'border-danger' : 'border-paper-line',
            ].join(' ')}
            required
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button type="submit" size="lg" fullWidth loading={pending} disabled={code.length < 6}>
            Verify and sign in
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/login" className="text-ink-muted hover:text-ink">
            ← Use a different number
          </Link>
          <button
            type="button"
            onClick={resend}
            disabled={resendIn > 0 || resending}
            className="text-brand hover:text-brand-dark disabled:text-ink-muted disabled:cursor-not-allowed"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : resending ? 'Sending…' : 'Resend code'}
          </button>
        </div>
      </Card>
    </div>
  );
}
