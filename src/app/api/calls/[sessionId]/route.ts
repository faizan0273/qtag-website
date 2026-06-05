import type { NextRequest } from 'next/server';
import { bad, ok, safe } from '@/lib/api-helpers';
import { connectDB } from '@/lib/db';
import { publicCallSessionView, verifyCallSessionAccess } from '@/lib/call-session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const token = req.nextUrl.searchParams.get('token');

  return safe(async () => {
    await connectDB();
    const verified = await verifyCallSessionAccess(sessionId, token);
    if (!verified) return bad('UNAUTHORIZED', 'This call link is invalid or expired.');

    return ok(publicCallSessionView(verified.session, verified.role));
  });
}
