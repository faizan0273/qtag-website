import { ScanPublicPage } from '@/components/scan/ScanPublicPage';

export const revalidate = 60;

export const metadata = {
  robots: { index: false, follow: false },
  title: 'Scano — scan profile',
};

export default function PublicScanSlugPage({ params }: { params: { slug: string } }) {
  return <ScanPublicPage slug={params.slug} />;
}
