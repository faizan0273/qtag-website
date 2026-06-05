import Image from 'next/image';
import Link from 'next/link';
import { getCurrentSession } from '@/lib/auth';
import { LogoutButton } from './LogoutButton';
import { BRAND_LOGO_SRC, BRAND_NAME } from '@/lib/brand';

/** Minimal header for Shopify iframe — logo + sign out only. */
export async function EmbedHeader() {
  const session = await getCurrentSession();

  return (
    <header className="sticky top-0 z-50 border-b border-paper-line bg-paper/90 backdrop-blur-md">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/login" className="flex items-center" aria-label={BRAND_NAME}>
          <Image
            src={BRAND_LOGO_SRC}
            alt=""
            width={140}
            height={40}
            className="h-9 w-auto object-contain object-left"
            priority
          />
        </Link>
        <div className="flex items-center gap-2">
          {process.env.NODE_ENV === 'development' ? (
            <Link
              href="/dev/qr"
              className="text-sm px-3 h-9 flex items-center rounded-lg text-ink-soft hover:bg-paper-line/60"
            >
              Test QR
            </Link>
          ) : null}
          {session ? <LogoutButton /> : null}
        </div>
      </div>
    </header>
  );
}
