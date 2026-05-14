import { ScanPublicPage } from '@/components/scan/ScanPublicPage';
import { BRAND_NAME } from '@/lib/brand';

export const revalidate = 60;

export const metadata = {
  robots: { index: false, follow: false },
  title: `${BRAND_NAME}, scan profile`,
};

export default async function PublicScanSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ScanPublicPage slug={slug} />;
}
