import { notFound } from 'next/navigation';
import { BRAND_NAME } from '@/lib/brand';
import { WebRtcCallRoom } from '@/components/call/WebRtcCallRoom';

export const dynamic = 'force-dynamic';

export const metadata = {
  robots: { index: false, follow: false },
  title: `${BRAND_NAME}, private call`,
};

export default async function CallPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { sessionId } = await params;
  const { token } = await searchParams;

  if (!token || !/^[a-f\d]{24}$/i.test(sessionId)) notFound();

  return <WebRtcCallRoom sessionId={sessionId} token={token} />;
}
