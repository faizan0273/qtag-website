import { ScanPublicPage } from '@/components/scan/ScanPublicPage';
import { BRAND_NAME } from '@/lib/brand';

export const revalidate = 60;

export const metadata = {
  robots: { index: false, follow: false },
  title: `${BRAND_NAME}, scan profile`,
};

export default function PublicScanSlugPage({ params }: { params: { slug: string } }) {
  return <ScanPublicPage slug={params.slug} />;
}
