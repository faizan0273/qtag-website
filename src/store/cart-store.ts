import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const MIN_QTY = 1;
const MAX_QTY = 20;

/** Avoids divergent persist behavior on server vs client (blank / hydration issues in App Router). */
const noopStorage: Storage = {
  get length() {
    return 0;
  },
  clear() {},
  getItem: () => null,
  key: () => null,
  removeItem() {},
  setItem() {},
};

function getClientStorage(): Storage {
  if (typeof window === 'undefined') return noopStorage;
  try {
    return window.localStorage;
  } catch {
    return noopStorage;
  }
}

function clampQty(n: number): number {
  if (!Number.isFinite(n)) return MIN_QTY;
  return Math.min(MAX_QTY, Math.max(MIN_QTY, Math.floor(n)));
}

interface CartState {
  qty: number;
  setQty: (qty: number) => void;
  increment: () => void;
  decrement: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      qty: MIN_QTY,
      setQty: (qty) => set({ qty: clampQty(qty) }),
      increment: () => set({ qty: clampQty(get().qty + 1) }),
      decrement: () => set({ qty: clampQty(get().qty - 1) }),
    }),
    {
      name: 'qrsaathi-cart',
      partialize: (state) => ({ qty: state.qty }),
      storage: createJSONStorage(getClientStorage),
      skipHydration: true,
    }
  )
);
