/**
 * Public product name from `NEXT_PUBLIC_BRAND_NAME` (inlined on the client).
 */
export const BRAND_NAME =
  (typeof process.env.NEXT_PUBLIC_BRAND_NAME === 'string' &&
    process.env.NEXT_PUBLIC_BRAND_NAME.trim()) ||
  'Scano';
