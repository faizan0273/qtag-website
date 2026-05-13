import { z } from 'zod';

/**
 * Variables that may be read in browser bundles (Client Components).
 * Do not add secrets, DB URIs, or JWT config here.
 *
 * Pricing: optional `NEXT_PUBLIC_*` overrides. On the server, the same keys as
 * `env.ts` (`PRODUCT_PRICE_PKR`, etc.) are also read so API routes and UI stay
 * aligned. In the browser only `NEXT_PUBLIC_*` exists; otherwise defaults apply.
 */
function intFromEnv(
  nextPublic: string | undefined,
  serverOnly: string | undefined,
  fallback: number,
): number {
  const raw = nextPublic ?? serverOnly;
  if (raw === undefined || raw === '') return fallback;
  const n = parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : fallback;
}

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_BRAND_NAME: z.string().default('Qtag'),
  PRODUCT_PRICE_PKR: z.number().int().positive(),
  SHIPPING_FEE_PKR: z.number().int().nonnegative(),
  FREE_SHIPPING_THRESHOLD_PKR: z.number().int().nonnegative(),
  COD_FEE_PKR: z.number().int().nonnegative(),
});

const parsed = PublicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME,
  PRODUCT_PRICE_PKR: intFromEnv(
    process.env.NEXT_PUBLIC_PRODUCT_PRICE_PKR,
    process.env.PRODUCT_PRICE_PKR,
    599,
  ),
  SHIPPING_FEE_PKR: intFromEnv(
    process.env.NEXT_PUBLIC_SHIPPING_FEE_PKR,
    process.env.SHIPPING_FEE_PKR,
    200,
  ),
  FREE_SHIPPING_THRESHOLD_PKR: intFromEnv(
    process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_PKR,
    process.env.FREE_SHIPPING_THRESHOLD_PKR,
    1500,
  ),
  COD_FEE_PKR: intFromEnv(
    process.env.NEXT_PUBLIC_COD_FEE_PKR,
    process.env.COD_FEE_PKR,
    50,
  ),
});

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid public environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error(
    'Invalid public environment variables. Set NEXT_PUBLIC_APP_URL (see README or deployment docs).',
  );
}

export const publicEnv = parsed.data;
