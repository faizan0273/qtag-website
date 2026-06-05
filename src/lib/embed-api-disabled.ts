import { bad } from '@/lib/api-helpers';

/** Returned by API routes disabled during Shopify embed mode. */
export function embedApiDisabled() {
  return bad(
    'INTERNAL_ERROR',
    'This endpoint is disabled while Qtag runs in Shopify embed mode (login + activate only).',
  );
}
