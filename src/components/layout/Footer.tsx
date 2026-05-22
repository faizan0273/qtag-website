import Image from 'next/image';
import Link from 'next/link';
import { BRAND_LOGO_SRC, BRAND_NAME } from '@/lib/brand';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { href: '/shop', label: 'All tags' },
      { href: '/shop#vehicle', label: 'Vehicle' },
      { href: '/shop#home', label: 'Home & entryway' },
      { href: '/shop#everyday', label: 'Everyday carry' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/#how', label: 'How it works' },
      { href: '/#advantage', label: `${BRAND_NAME} advantage` },
      { href: '/#faq', label: 'FAQ' },
      { href: '/about', label: 'About us' },
    ],
  },
  {
    title: 'Help',
    links: [
      { href: 'https://wa.me/', label: 'WhatsApp support' },
      { href: 'mailto:hello@qtag.pk', label: 'hello@qtag.pk' },
      { href: '/dashboard', label: 'Your dashboard' },
      { href: '/login', label: 'Sign in' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
      { href: '/refunds', label: 'Refunds' },
      { href: '/shipping', label: 'Shipping' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 grid gap-10 md:gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="inline-flex items-center gap-3 bg-paper rounded-xl px-3 py-2">
            <Image
              src={BRAND_LOGO_SRC}
              alt=""
              width={120}
              height={36}
              className="h-7 w-auto max-h-7 object-contain object-left"
            />
          </div>
          <p className="mt-5 text-paper/70 leading-relaxed max-w-xs">
            Smart safety in Pakistan. Privacy first QR tags that let people reach you when it matters, without exposing
            your number.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-paper/10 px-3 py-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            Made in Pakistan
          </div>
        </div>

        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="font-medium text-paper mb-4">{col.title}</div>
              <ul className="space-y-2.5 text-paper/65">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-brand transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 flex flex-col md:flex-row justify-between gap-2 text-xs text-paper/55">
          <span>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</span>
          <span>Your phone number stays hidden. Always.</span>
        </div>
      </div>
    </footer>
  );
}
