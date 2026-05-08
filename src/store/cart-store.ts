import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SHOP_SKUS, isShopSku, type ShopSku } from '@/lib/shop-products';

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

const DEFAULT_SKU = SHOP_SKUS[0];

interface CartState {
  qty: number;
  /** Catalogue product id driving checkout pricing + tag provisioning. */
  shopSku: ShopSku;
  setQty: (qty: number) => void;
  setSku: (sku: ShopSku) => void;
  increment: () => void;
  decrement: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      qty: MIN_QTY,
      shopSku: DEFAULT_SKU,
      setQty: (qty) => set({ qty: clampQty(qty) }),
      setSku: (sku) => set({ shopSku: sku }),
      increment: () => set({ qty: clampQty(get().qty + 1) }),
      decrement: () => set({ qty: clampQty(get().qty - 1) }),
    }),
    {
      name: 'qrsaathi-cart',
      partialize: (state) => ({ qty: state.qty, shopSku: state.shopSku }),
      merge: (persisted, current) => {
        const p = persisted as Partial<Pick<CartState, 'qty' | 'shopSku'>> | undefined;
        if (!p || typeof p !== 'object') return current;
        return {
          ...current,
          qty: clampQty(typeof p.qty === 'number' ? p.qty : current.qty),
          shopSku:
            typeof p.shopSku === 'string' && isShopSku(p.shopSku) ? p.shopSku : DEFAULT_SKU,
        };
      },
      storage: createJSONStorage(getClientStorage),
      skipHydration: true,
    }
  )
);
