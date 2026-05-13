/**
 * Public product name from `NEXT_PUBLIC_BRAND_NAME` (inlined on the client).
 */
export const BRAND_NAME =
  (typeof process.env.NEXT_PUBLIC_BRAND_NAME === 'string' &&
    process.env.NEXT_PUBLIC_BRAND_NAME.trim()) ||
  'Qtag';

/** Primary logo under `public/` (header, footer, favicon-sized icon in metadata). */
export const BRAND_LOGO_SRC = '/qtaglogo.svg';

/** PNG fallback for OG/Twitter/apple-touch (crawler and iOS support for SVG is uneven). */
export const BRAND_LOGO_RASTER_SRC = '/qtaglogo.png';
