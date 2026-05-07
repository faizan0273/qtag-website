import QRCode from 'qrcode';
import { env } from './env';

/** Legacy URL on physical Car Tag stickers shipped before multi-product rollout. */
export function tagPublicUrl(uid: string): string {
  return `${env.NEXT_PUBLIC_APP_URL}/t/${uid}`;
}

/** Preferred scan URL — unified public profile (/scan vs legacy /t for shipped stickers). */
export function tagScanUrl(uid: string): string {
  return `${env.NEXT_PUBLIC_APP_URL}/scan/${uid}`;
}

/** Generate a PNG data URL for a tag — used in admin previews and order receipts. */
export async function generateTagQrDataUrl(
  uid: string,
  options?: { width?: number; urlVariant?: 'legacy' | 'scan' },
): Promise<string> {
  const width = options?.width ?? 512;
  const target =
    options?.urlVariant === 'scan'
      ? tagScanUrl(uid)
      : tagPublicUrl(uid);

  return QRCode.toDataURL(target, {
    errorCorrectionLevel: 'H', // tolerates dirt and scratches on a windshield
    margin: 1,
    width,
    color: { dark: '#0E1116', light: '#FFFFFF' },
  });
}
