'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[app] error:', error);
  }, [error]);

  return (
    <div className="container-page py-20 text-center max-w-lg">
      <div className="text-5xl mb-3">⚠️</div>
      <h1 className="font-display text-display-md text-ink">Something went wrong.</h1>
      <p className="mt-3 text-ink-soft">
        We've been notified. Please try again, most issues clear up quickly.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-ink-muted font-mono">Ref: {error.digest}</p>
      ) : null}
      <div className="mt-6">
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}
