'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function DevQrSeedButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function reset() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/dev/test-tags', { method: 'POST' });
      const json = await res.json();
      if (!json.ok) {
        setMsg(json.error?.message ?? 'Could not reset tags.');
        return;
      }
      setMsg('All test tags reset to PRINTED — scan again to test activation.');
      router.refresh();
    } catch {
      setMsg('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button type="button" variant="secondary" loading={loading} onClick={reset}>
        Reset all test tags (PRINTED)
      </Button>
      {msg ? <p className="mt-2 text-sm text-ink-soft">{msg}</p> : null}
    </div>
  );
}
