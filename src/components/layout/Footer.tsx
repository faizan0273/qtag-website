import Image from 'next/image';
import Link from 'next/link';
import { BRAND_LOGO_SRC, BRAND_NAME } from '@/lib/brand';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-paper-line bg-paper">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <Image
            src={BRAND_LOGO_SRC}
            alt=""
            width={120}
            height={36}
            className="h-8 w-auto max-h-8 object-contain object-left"
          />
          <p className="mt-2 text-ink-muted max-w-xs">
            Smart safety in Pakistan: privacy first QR tags, reach people when it matters without exposing private
            numbers.
          </p>
        </div>

        <div>
          <div className="font-medium text-ink mb-3">Product</div>
          <ul className="space-y-2 text-ink-muted">
            <li><Link href="/shop" className="hover:text-ink">Shop tags</Link></li>
            <li><Link href="/#how" className="hover:text-ink">How it works</Link></li>
            <li><Link href="/#faq" className="hover:text-ink">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium text-ink mb-3">Company</div>
          <ul className="space-y-2 text-ink-muted">
            <li><Link href="/about" className="hover:text-ink">About</Link></li>
            <li><Link href="/privacy" className="hover:text-ink">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-ink">Terms</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium text-ink mb-3">Help</div>
          <ul className="space-y-2 text-ink-muted">
            <li><a href="https://wa.me/" className="hover:text-ink">WhatsApp support</a></li>
            <li><a href="mailto:hello@qtag.pk" className="hover:text-ink">hello@qtag.pk</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper-line">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 flex justify-between text-xs text-ink-muted">
          <span>© {new Date().getFullYear()} {BRAND_NAME}. Made in Pakistan.</span>
          <span>Your number is hidden.</span>
        </div>
      </div>
    </footer>
  );
}
