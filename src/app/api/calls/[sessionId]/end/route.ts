import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { bad, fromZod, ok, safe } from '@/lib/api-helpers';
import { connectDB } from '@/lib/db';
import { verifyCallSessionAccess } from '@/lib/call-session';

export const dynamic = 'force-dynamic';

const endSchema = z.object({
  token: z.string().min(20),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;

  return safe(async () => {
    await connectDB();
    const json = await req.json().catch(() => null);
    const parsed = endSchema.safeParse(json);
    if (!parsed.success) return fromZod(parsed.error);

    const verified = await verifyCallSessionAccess(sessionId, parsed.data.token);
    if (!verified) return bad('UNAUTHORIZED', 'This call link is invalid or expired.');

    verified.session.status = 'ENDED';
    verified.session.endedAt = new Date();
    await verified.session.save();

    return ok({ ended: true });
  });
}
