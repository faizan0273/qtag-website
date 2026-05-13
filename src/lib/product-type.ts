/**
 * Qtag multi-product QR types (single Tag collection, discriminated by productType).
 */

export const PRODUCT_TYPES = ['CAR', 'PET', 'BAG', 'PROPERTY', 'ITEM'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const TAG_ORIGINS = ['ORDER', 'DASHBOARD'] as const;
export type TagOrigin = (typeof TAG_ORIGINS)[number];

export function isProductType(v: string | undefined): v is ProductType {
  return PRODUCT_TYPES.includes(v as ProductType);
}

export function normalizeProductType(value: unknown): ProductType {
  if (typeof value === 'string' && isProductType(value)) return value;
  return 'CAR';
}

const LABELS: Record<ProductType, string> = {
  CAR: 'Car Tag',
  PET: 'Pet Tag',
  BAG: 'Bag Tag',
  PROPERTY: 'Property Tag',
  ITEM: 'Item Tag',
};

export function productTypeLabel(pt: ProductType): string {
  return LABELS[pt] ?? 'Tag';
}

const ICONS: Record<ProductType, string> = {
  CAR: '🚗',
  PET: '🐾',
  BAG: '🎒',
  PROPERTY: '🏠',
  ITEM: '🏷️',
};

export function productTypeIcon(pt: ProductType): string {
  return ICONS[pt] ?? '📱';
}

/** Short label used in WhatsApp / SMS alerts, e.g. "CAR" → "car" phrase */
export function productTypeAlertFragment(pt: ProductType): string {
  switch (pt) {
    case 'CAR':
      return 'Car';
    case 'PET':
      return 'Pet';
    case 'BAG':
      return 'Bag';
    case 'PROPERTY':
      return 'Property';
    case 'ITEM':
      return 'Item';
    default:
      return 'Item';
  }
}
