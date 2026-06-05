import type { NextRequest } from 'next/server';
import { ok, bad, getClientIp, safe } from '@/lib/api-helpers';
import { connectDB } from '@/lib/db';
import { isValidUid } from '@/lib/uid';
import { TagModel } from '@/models/Tag';
import { UserModel } from '@/models/User';
import { resolveDevTagUid } from '@/lib/dev-test-tags';
import { rateLimit } from '@/lib/rate-limit';
import { env } from '@/lib/env';
import {
  buildJoinUrl,
  createCallTokens,
  ringingExpiresAt,
} from '@/lib/call-session';
import { normalizeProductType } from '@/lib/product-type';
import { contactMessageItemLabel } from '@/lib/services/qr-product.service';
import { ScanModel } from '@/models/Scan';
import { CallSessionModel } from '@/models/CallSession';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { sendSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

/**
 * Private browser call: creates a WebRTC room and sends the owner a secure answer link.
 * No phone numbers are returned to the finder.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const { uid: rawUid } = await params;
  const uid = resolveDevTagUid(rawUid);

  return safe(async () => {
    if (!isValidUid(uid)) return bad('NOT_FOUND', 'This tag does not exist.');

    const ip = getClientIp(req);
    if (!rateLimit(`call:ip:${ip}`, env.RATE_LIMIT_CALL_PER_IP_PER_HOUR, 60 * 60_000)) {
      return bad('RATE_LIMITED', 'Too many call attempts. Please wait an hour.');
    }
    if (!rateLimit(`call:tag:${uid}`, 15, 60 * 60_000)) {
      return bad('RATE_LIMITED', 'Too many calls on this tag. Please try later.');
    }

    await connectDB();
    const tag = await TagModel.findOne({ uid });
    if (!tag) return bad('NOT_FOUND', 'This tag does not exist.');
    if (tag.status === 'PRINTED' || !tag.ownerId) {
      return bad('CONFLICT', 'This tag is not active yet.');
    }
    if (tag.status === 'DISABLED') {
      return bad('FORBIDDEN', 'This tag has been disabled.');
    }

    const owner = await UserModel.findById(tag.ownerId);
    if (!owner || owner.status !== 'ACTIVE') {
      return bad('FORBIDDEN', 'This tag is unavailable.');
    }

    await ScanModel.create({
      tagId: tag._id,
      ownerId: owner._id,
      productType: normalizeProductType(tag.productType),
      ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
    });

    const tokens = createCallTokens();
    const session = await CallSessionModel.create({
      tagId: tag._id,
      ownerId: owner._id,
      uid,
      provider: 'WEBRTC',
      status: 'RINGING',
      callerTokenHash: tokens.callerTokenHash,
      ownerTokenHash: tokens.ownerTokenHash,
      ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
      expiresAt: ringingExpiresAt(),
    });

    const callerJoinUrl = buildJoinUrl(String(session._id), tokens.callerToken);
    const ownerJoinUrl = buildJoinUrl(String(session._id), tokens.ownerToken);
    const label = contactMessageItemLabel(tag);
    const notification =
      `${env.NEXT_PUBLIC_BRAND_NAME}: Someone is calling about your ${label}.\n\n` +
      `Open this secure link to answer in your browser:\n${ownerJoinUrl}\n\n` +
      `This link expires soon. Your phone number stays hidden.`;

    const wa = await sendWhatsAppMessage(owner.phone, notification);
    if (!wa.ok) {
      await sendSms(owner.phone, notification);
    }

    return ok({
      started: true,
      sessionId: String(session._id),
      joinUrl: callerJoinUrl,
      expiresAt: session.expiresAt.toISOString(),
      message: 'Opening a private browser call. The owner has been sent a secure answer link.',
    });
  });
}
