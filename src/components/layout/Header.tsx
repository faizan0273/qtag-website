import Link from 'next/link';
import { getCurrentSession } from '@/lib/auth';
import { BRAND_NAME } from '@/lib/brand';
import { LogoutButton } from './LogoutButton';

export async function Header() {
  const session = await getCurrentSession();
  const monogram = BRAND_NAME.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-paper/80 border-b border-paper-line">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-ink text-paper font-display text-lg leading-none">
            {monogram}
          </span>
          <span className="font-display text-lg tracking-tight">{BRAND_NAME}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[15px] text-ink-soft">
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          <Link href="/#how" className="hover:text-ink">How it works</Link>
          <Link href="/#faq" className="hover:text-ink">FAQ</Link>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-[15px] px-3 h-10 flex items-center rounded-lg hover:bg-paper-line/60 text-ink"
              >
                Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[15px] px-3 h-10 flex items-center rounded-lg hover:bg-paper-line/60 text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/shop"
                className="text-[15px] px-4 h-10 flex items-center rounded-lg bg-ink text-paper hover:bg-ink-soft"
              >
                Buy a sticker
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
