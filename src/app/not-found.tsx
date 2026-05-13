import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BRAND_NAME } from '@/lib/brand';

export default function NotFound() {
  return (
    <div className="container-page py-20 md:py-32 text-center max-w-lg">
      <div className="font-display text-7xl text-brand/20 mb-3">404</div>
      <h1 className="font-display text-display-md text-ink">We couldn't find that.</h1>
      <p className="mt-3 text-ink-soft">
        The page or link you&apos;re looking for doesn&apos;t exist. If you scanned a {BRAND_NAME} QR, double-check
        that it&apos;s a real tag.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/"><Button>Go home</Button></Link>
        <Link href="/shop"><Button variant="secondary">Shop</Button></Link>
      </div>
    </div>
  );
}
