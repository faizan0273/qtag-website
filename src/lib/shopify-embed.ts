/**
 * Shopify external embed — minimal surface for iframe / post-purchase links.
 *
 * Active: login, OTP, activate, public scan, browser calls + contact relay, dev test lab.
 * Disabled: shop, dashboard, orders UI, payments (stubs return 503).
 */
export const SHOPIFY_EMBED_MODE = true;

export const EMBED_ALLOWED_PATH_PREFIXES = [
  '/login',
  '/verify',
  '/dev/qr',
  '/api/auth',
  '/api/activate',
  '/api/contact',
  '/api/calls',
  '/api/scans',
  '/api/dev',
] as const;

export function isEmbedAllowedPath(pathname: string): boolean {
  const path = pathname.split('?')[0] ?? pathname;
  if (path === '/' || path === '') return true;
  if (path.match(/^\/t\/[^/]+\/activate$/)) return true;
  if (path.match(/^\/t\/[^/]+$/)) return true;
  if (path.match(/^\/scan\/[^/]+$/)) return true;
  if (path.match(/^\/call\/[^/]+$/)) return true;
  return EMBED_ALLOWED_PATH_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

export function defaultActivatePath(): string | null {
  const uid =
    typeof process.env.NEXT_PUBLIC_DEFAULT_TAG_UID === 'string'
      ? process.env.NEXT_PUBLIC_DEFAULT_TAG_UID.trim()
      : '';
  if (!uid) return null;
  return `/t/${uid}/activate`;
}

export function resolvePostLoginPath(nextParam: string | null | undefined): string {
  const raw = nextParam?.trim();
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) {
    const pathOnly = raw.split('?')[0] ?? raw;
    if (!SHOPIFY_EMBED_MODE || isEmbedAllowedPath(pathOnly)) return raw;
  }

  if (SHOPIFY_EMBED_MODE) {
    if (process.env.NODE_ENV === 'development') return '/dev/qr';
    const activate = defaultActivatePath();
    if (activate) return activate;
    return '/login';
  }

  return raw || '/dashboard';
}
