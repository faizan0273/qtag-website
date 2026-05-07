import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { formatPkPhone } from '@/lib/phone';

export const dynamic = 'force-dynamic';

const NAV_BASE = [
  { href: '/dashboard', label: 'My stickers' },
  { href: '/dashboard/orders', label: 'Orders' },
  { href: '/dashboard/tags/new', label: 'Create tag' },
] as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dashboard');

  return (
    <div className="container-page py-8 md:py-12">
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        {/* Sidebar */}
        <aside>
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest text-ink-muted">Signed in</div>
            <div className="mt-1 font-medium text-ink truncate">
              {user.name || formatPkPhone(user.phone)}
            </div>
            {user.name ? (
              <div className="text-sm text-ink-muted tnum">{formatPkPhone(user.phone)}</div>
            ) : null}
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto">
            {[...NAV_BASE, ...(user.role === 'ADMIN' ? [{ href: '/dashboard/admin', label: 'Admin' }] : [])].map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-lg text-[15px] text-ink-soft hover:bg-paper-line/60 hover:text-ink whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link
              href="/shop"
              className="lg:mt-4 px-3 py-2 rounded-lg text-[15px] bg-ink text-paper hover:bg-ink-soft text-center whitespace-nowrap"
            >
              Buy more
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
