'use client';

import { Suspense, useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';
import { resolvePostLoginPath } from '@/lib/shopify-embed';
import { DEV_FAST_OTP } from '@/lib/dev-auth';

function buildVerifyUrl(phone: string, postLogin: string, devCode?: string): string {
  const params = new URLSearchParams({ phone });
  if (postLogin && postLogin !== '/login') params.set('next', postLogin);
  if (devCode) params.set('devCode', devCode);
  return `/verify?${params.toString()}`;
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = search.get('next');
  const phoneFromUrl = search.get('phone') ?? '';
  const postLogin = resolvePostLoginPath(nextParam);

  const [phone, setPhone] = useState(phoneFromUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const autoStarted = useRef(false);

  const goToVerify = useCallback(
    (phoneValue: string, devCode?: string) => {
      const url = buildVerifyUrl(phoneValue, postLogin, devCode);
      if (DEV_FAST_OTP) {
        window.location.assign(url);
        return;
      }
      router.push(url);
    },
    [postLogin, router],
  );

  const sendCode = useCallback(
    (phoneValue: string) => {
      const trimmed = phoneValue.trim();
      if (!trimmed) {
        setError('Enter your phone number.');
        return;
      }
      setError(null);
      start(async () => {
        try {
          const res = await fetch('/api/auth/otp/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: trimmed }),
          });
          const json = await res.json();
          if (!json.ok) {
            setError(json.error?.message ?? 'Could not send code.');
            return;
          }
          goToVerify(trimmed, json.data?.devCode);
        } catch {
          setError('Network error. Please try again.');
        }
      });
    },
    [goToVerify],
  );

  /* Recover from native GET submit (?phone= on URL) — common on mobile before hydration. */
  useEffect(() => {
    const trimmed = phoneFromUrl.trim();
    if (!trimmed) return;
    setPhone(trimmed);
    if (!DEV_FAST_OTP || autoStarted.current) return;
    autoStarted.current = true;

    (async () => {
      setError(null);
      try {
        const res = await fetch('/api/auth/otp/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: trimmed }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error?.message ?? 'Could not send code.');
          autoStarted.current = false;
          return;
        }
        goToVerify(trimmed, json.data?.devCode);
      } catch {
        setError('Network error. Please try again.');
        autoStarted.current = false;
      }
    })();
  }, [phoneFromUrl, goToVerify]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendCode(phone);
  }

  return (
    <div className="container-page py-12 md:py-20 max-w-md">
      <Card padding="lg">
        <h1 className="font-display text-display-md text-ink">Sign in</h1>
        <p className="mt-2 text-ink-soft">
          {DEV_FAST_OTP
            ? 'Dev mode: we send the code automatically and open the OTP screen with the code filled in.'
            : "We'll send a 6-digit code to your WhatsApp."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          {postLogin && postLogin !== '/login' ? (
            <input type="hidden" name="next" value={postLogin} readOnly />
          ) : null}
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
            {DEV_FAST_OTP ? 'Send code & continue' : 'Send code'}
          </Button>
        </form>

        {DEV_FAST_OTP && postLogin.startsWith('/t/') ? (
          <p className="mt-4 text-xs text-ink-muted">
            After OTP you will activate: <span className="font-mono">{postLogin}</span>
          </p>
        ) : null}
      </Card>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="container-page py-12 md:py-20 max-w-md">
      <Card padding="lg">
        <p className="text-ink-soft">Loading sign in…</p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
