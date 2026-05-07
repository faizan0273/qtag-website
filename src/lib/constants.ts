import { publicEnv } from './env-public';

/* -------------------------------------------------------------------------- */
/*  Product (single SKU)                                                      */
/* -------------------------------------------------------------------------- */

export const PRODUCT = {
  sku: 'VEHICLE-QR-001',
  name: 'Vehicle QR Sticker',
  shortDescription: 'A weather-resistant QR sticker for your windshield.',
  pricePkr: publicEnv.PRODUCT_PRICE_PKR,
  imageAlt: `A ${publicEnv.NEXT_PUBLIC_BRAND_NAME} vehicle QR sticker on a car windshield`,
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

export function quoteOrder(quantity: number, paymentMethod: 'COD'): OrderQuote {
  const subtotal = PRODUCT.pricePkr * quantity;
  const freeShipping = subtotal >= publicEnv.FREE_SHIPPING_THRESHOLD_PKR;
  const shipping = freeShipping ? 0 : publicEnv.SHIPPING_FEE_PKR;
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
