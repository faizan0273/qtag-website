import { redirect } from 'next/navigation';
import { SHOPIFY_EMBED_MODE } from '@/lib/shopify-embed';

/** Use at top of pages disabled during Shopify embed mode. */
export function redirectIfEmbedDisabled(fallback = '/login'): void {
  if (SHOPIFY_EMBED_MODE) redirect(fallback);
}
