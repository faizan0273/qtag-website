import { notFound, redirect } from 'next/navigation';
import { ScanPublicPage } from '@/components/scan/ScanPublicPage';
import { resolveScanRoute } from '@/lib/scan-router';
import { resolveDevTagUid } from '@/lib/dev-test-tags';
import { BRAND_NAME } from '@/lib/brand';

export const dynamic = 'force-dynamic';

export const metadata = {
  robots: { index: false, follow: false },
  title: `${BRAND_NAME}, scan profile`,
};

/** Alternate QR entry: /scan/{uid} — same router as /t/{uid}. /t/{uid} is the original route. */
export default async function ScanSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = resolveDevTagUid(rawSlug);
  if (rawSlug !== slug) redirect(`/scan/${slug}`);

  const route = await resolveScanRoute(rawSlug);
  if (route.kind === 'not_found') notFound();
  if (route.kind === 'go_activate') redirect(`/t/${route.uid}/activate`);

  return <ScanPublicPage slug={route.uid} />;
}
