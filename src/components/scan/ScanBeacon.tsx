'use client';

import { useEffect, useRef } from 'react';

export function ScanBeacon({ uid }: { uid: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
      keepalive: true,
    }).catch(() => {
      /* silent: telemetry should never break the page */
    });
  }, [uid]);
  return null;
}
