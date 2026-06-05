import { notFound, redirect } from 'next/navigation';
import { ScanPublicPage } from '@/components/scan/ScanPublicPage';
import { resolveScanRoute } from '@/lib/scan-router';
import { resolveDevTagUid } from '@/lib/dev-test-tags';
import { BRAND_NAME } from '@/lib/brand';

export const dynamic = 'force-dynamic';

export const metadata = {
  robots: { index: false, follow: false },
  title: `${BRAND_NAME}, tag profile`,
};

/**
 * Primary QR entry: /t/{uid}
 * Router sends owners of PRINTED tags to activate; everyone else sees contact / not-active UI.
 */
export default async function TagScanPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid: rawUid } = await params;
  const uid = resolveDevTagUid(rawUid);
  if (rawUid !== uid) redirect(`/t/${uid}`);

  const route = await resolveScanRoute(rawUid);
  if (route.kind === 'not_found') notFound();
  if (route.kind === 'go_activate') redirect(`/t/${route.uid}/activate`);

  return <ScanPublicPage slug={route.uid} />;
}
