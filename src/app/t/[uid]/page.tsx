import { ScanPublicPage } from '@/components/scan/ScanPublicPage';

export const revalidate = 60;

export const metadata = {
  robots: { index: false, follow: false },
  title: 'Scano — tag profile',
};

export default function PublicLegacyScan({ params }: { params: { uid: string } }) {
  return <ScanPublicPage slug={params.uid} />;
}
