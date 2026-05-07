'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSessionStore } from '@/store/session-store';

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      useSessionStore.getState().clearSession();
      router.push('/');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      className="text-[15px] px-3 h-10 flex items-center rounded-lg text-ink-soft hover:bg-paper-line/60 disabled:opacity-60"
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
