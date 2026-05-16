import Link from 'next/link';
import { getCurrentSession } from '@/lib/auth';
import { LogoutButton } from './LogoutButton';
import { HeaderShell } from './HeaderShell';

/**
 * Server Component: fetches the session, then hands the rendered auth
 * buttons to `HeaderShell` (a Client Component) which owns all the
 * interactive chrome — scroll state, animated underline, mobile menu.
 *
 * Passing JSX from a Server Component into a Client Component as a prop
 * is fully supported in the App Router, and keeps session logic on the
 * server.
 */
export async function Header() {
  const session = await getCurrentSession();

  const authSlot = session ? (
    <>
      <Link
        href="/dashboard"
        className="text-[15px] px-3 h-10 flex items-center rounded-lg text-ink transition-colors hover:bg-paper-line/60"
      >
        Dashboard
      </Link>
      <LogoutButton />
    </>
  ) : (
    <>
      <Link
        href="/login"
        className="text-[15px] px-3 h-10 flex items-center rounded-lg text-ink transition-colors hover:bg-paper-line/60"
      >
        Sign in
      </Link>
      <Link
        href="/shop"
        className="text-[15px] px-4 h-10 flex items-center rounded-lg bg-brand text-ink transition-colors hover:bg-brand-dark"
      >
        Shop tags
      </Link>
    </>
  );

  return <HeaderShell authSlot={authSlot} />;
}
