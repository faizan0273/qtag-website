import { redirect } from 'next/navigation';
import { defaultActivatePath, SHOPIFY_EMBED_MODE } from '@/lib/shopify-embed';

/**
 * Shopify embed: no marketing homepage — sign-in, then activate.
 */
export default function HomePage() {
  if (SHOPIFY_EMBED_MODE) {
    if (process.env.NODE_ENV === 'development') redirect('/dev/qr');
    const activate = defaultActivatePath();
    if (activate) {
      redirect(`/login?next=${encodeURIComponent(activate)}`);
    }
    redirect('/login');
  }
  redirect('/login');
}
