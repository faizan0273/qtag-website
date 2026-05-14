import { ScanPublicPage } from '@/components/scan/ScanPublicPage';
import { BRAND_NAME } from '@/lib/brand';

export const revalidate = 60;

export const metadata = {
  robots: { index: false, follow: false },
  title: `${BRAND_NAME}, tag profile`,
};

export default async function PublicLegacyScan({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  return <ScanPublicPage slug={uid} />;
}
