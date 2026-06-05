import { env } from '@/lib/env';

/** Base URL encoded in QR codes (use LAN IP on phone, e.g. http://192.168.2.102:3000). */
export function getPublicAppBaseUrl(): string {
  const qr =
    typeof process.env.NEXT_PUBLIC_QR_BASE_URL === 'string'
      ? process.env.NEXT_PUBLIC_QR_BASE_URL.trim()
      : '';
  const base = (qr || env.NEXT_PUBLIC_APP_URL).replace(/\/+$/, '');
  return base;
}

/** Where a physical QR should send the customer to activate. */
export function tagActivateUrl(uid: string): string {
  return `${getPublicAppBaseUrl()}/t/${uid}/activate`;
}

export function tagPublicProfileUrl(uid: string): string {
  return `${getPublicAppBaseUrl()}/t/${uid}`;
}
