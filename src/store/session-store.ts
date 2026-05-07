import { create } from 'zustand';
import type { SessionUser } from './session-types';

type FetchStatus = 'idle' | 'loading' | 'done';

interface SessionState {
  user: SessionUser | null;
  fetchStatus: FetchStatus;
  fetchSession: () => Promise<void>;
  setSessionFromVerify: (user: {
    id: string;
    phone: string;
    name: string | null;
    role: string;
  }) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,
  fetchStatus: 'idle',
  fetchSession: async () => {
    if (get().fetchStatus === 'loading') return;
    set({ fetchStatus: 'loading' });
    try {
      const res = await fetch('/api/auth/me');
      const json = await res.json();
      if (json.ok && json.data?.user) {
        set({ user: json.data.user as SessionUser, fetchStatus: 'done' });
      } else {
        set({ user: null, fetchStatus: 'done' });
      }
    } catch {
      set({ user: null, fetchStatus: 'done' });
    }
  },
  setSessionFromVerify: (u) =>
    set({
      user: {
        id: u.id,
        phone: u.phone,
        name: u.name,
        email: null,
        role: u.role,
      },
      fetchStatus: 'done',
    }),
  clearSession: () => set({ user: null, fetchStatus: 'idle' }),
}));
