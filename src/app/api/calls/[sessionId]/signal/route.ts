import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { bad, fromZod, ok, safe } from '@/lib/api-helpers';
import { connectDB } from '@/lib/db';
import {
  activeExpiresAt,
  newSignalMessage,
  publicCallSessionView,
  trimSignalMessages,
  verifyCallSessionAccess,
} from '@/lib/call-session';

export const dynamic = 'force-dynamic';

const signalSchema = z.object({
  token: z.string().min(20),
  type: z.enum(['offer', 'answer', 'ice']),
  payload: z.unknown(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const token = req.nextUrl.searchParams.get('token');

  return safe(async () => {
    await connectDB();
    const verified = await verifyCallSessionAccess(sessionId, token);
    if (!verified) return bad('UNAUTHORIZED', 'This call link is invalid or expired.');

    const signals = verified.session.signals
      .filter((message) => message.from !== verified.role)
      .map((message) => ({
        messageId: message.messageId,
        from: message.from,
        type: message.type,
        payload: message.payload,
        createdAt: message.createdAt.toISOString(),
      }));

    return ok({
      session: publicCallSessionView(verified.session, verified.role),
      signals,
    });
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;

  return safe(async () => {
    await connectDB();
    const json = await req.json().catch(() => null);
    const parsed = signalSchema.safeParse(json);
    if (!parsed.success) return fromZod(parsed.error);

    const verified = await verifyCallSessionAccess(sessionId, parsed.data.token);
    if (!verified) return bad('UNAUTHORIZED', 'This call link is invalid or expired.');

    if (verified.session.status !== 'RINGING' && verified.session.status !== 'ACTIVE') {
      return bad('CONFLICT', 'This call is no longer active.');
    }

    if (parsed.data.type === 'answer' && verified.role === 'OWNER') {
      verified.session.status = 'ACTIVE';
      verified.session.answeredAt = verified.session.answeredAt ?? new Date();
      verified.session.expiresAt = activeExpiresAt();
    }

    verified.session.signals = trimSignalMessages([
      ...verified.session.signals,
      newSignalMessage({
        from: verified.role,
        type: parsed.data.type,
        payload: parsed.data.payload,
      }),
    ]);

    await verified.session.save();

    return ok({
      accepted: true,
      session: publicCallSessionView(verified.session, verified.role),
    });
  });
}
