import { ScanPublicPage } from '@/components/scan/ScanPublicPage';
import { BRAND_NAME } from '@/lib/brand';

export const revalidate = 60;

export const metadata = {
  robots: { index: false, follow: false },
  title: `${BRAND_NAME}, tag profile`,
};

export default function PublicLegacyScan({ params }: { params: { uid: string } }) {
  return <ScanPublicPage slug={params.uid} />;
}
