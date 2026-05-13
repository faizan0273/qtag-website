import { publicEnv } from './env-public';
import { isShopSku, shopCatalogById } from '@/lib/shop-products';
import type { ProductType } from '@/lib/product-type';

/* -------------------------------------------------------------------------- */
/*  Legacy single SKU (homepage, old links, no shopSku on order)           */
/* -------------------------------------------------------------------------- */

export const PRODUCT = {
  sku: 'VEHICLE-QR-001',
  name: 'Safety QR tag',
  shortDescription: 'A weather-resistant physical tag you can mount where you need it.',
  pricePkr: publicEnv.PRODUCT_PRICE_PKR,
  imageAlt: `A ${publicEnv.NEXT_PUBLIC_BRAND_NAME} safety QR tag`,
} as const;

/* -------------------------------------------------------------------------- */
/*  Pricing helpers                                                           */
/* -------------------------------------------------------------------------- */

export interface OrderQuote {
  subtotalPkr: number;
  shippingPkr: number;
  codFeePkr: number;
  totalPkr: number;
  freeShippingApplied: boolean;
}

export function orderUnitPricePkr(shopSku?: string | null): number {
  if (shopSku && isShopSku(shopSku)) {
    const row = shopCatalogById(shopSku);
    if (row) return row.pricePkr;
  }
  return PRODUCT.pricePkr;
}

export function orderTagsPerPack(shopSku?: string | null): number {
  if (shopSku && isShopSku(shopSku)) {
    const row = shopCatalogById(shopSku);
    if (row) return row.tagsPerPack;
  }
  return 1;
}

export function orderDefaultTagProductType(shopSku?: string | null): ProductType {
  if (shopSku && isShopSku(shopSku)) {
    const row = shopCatalogById(shopSku);
    if (row) return row.defaultTagProductType;
  }
  return 'CAR';
}

/** Cart / checkout summary line title */
export function orderLineTitleFromSku(shopSku?: string | null): string {
  if (shopSku && isShopSku(shopSku)) {
    const row = shopCatalogById(shopSku);
    if (row) return row.title;
  }
  return PRODUCT.name;
}

export type CheckoutPaymentMethod = 'COD' | 'JAZZCASH';

export function quoteOrder(
  quantity: number,
  paymentMethod: CheckoutPaymentMethod,
  shopSku?: string | null,
): OrderQuote {
  const unit = orderUnitPricePkr(shopSku);
  const subtotal = unit * quantity;
  const freeShipping = subtotal >= publicEnv.FREE_SHIPPING_THRESHOLD_PKR;
  const shipping = freeShipping ? 0 : publicEnv.SHIPPING_FEE_PKR;
  // Only Cash on Delivery carries the COD handling fee.
  const codFee = paymentMethod === 'COD' ? publicEnv.COD_FEE_PKR : 0;
  return {
    subtotalPkr: subtotal,
    shippingPkr: shipping,
    codFeePkr: codFee,
    totalPkr: subtotal + shipping + codFee,
    freeShippingApplied: freeShipping,
  };
}

/** Format PKR for UI: "Rs 1,499". */
export function formatPkr(amount: number): string {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}

/* -------------------------------------------------------------------------- */
/*  Provinces                                                                 */
/* -------------------------------------------------------------------------- */

export const PK_PROVINCES = [
  'Punjab',
  'Sindh',
  'KPK',
  'Balochistan',
  'Islamabad',
  'AJK',
  'GB',
] as const;
