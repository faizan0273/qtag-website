import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { ok, bad, fromZod, getClientIp, safe } from '@/lib/api-helpers';
import { contactMessageSchema } from '@/lib/validation';
import { isValidUid } from '@/lib/uid';
import { connectDB } from '@/lib/db';
import { TagModel } from '@/models/Tag';
import { UserModel } from '@/models/User';
import { ScanModel } from '@/models/Scan';
import { MessageModel } from '@/models/Message';
import { contactMessageItemLabel } from '@/lib/services/qr-product.service';
import { normalizeProductType } from '@/lib/product-type';
import { rateLimit } from '@/lib/rate-limit';
import { env } from '@/lib/env';
import { notifyOwner } from '@/lib/whatsapp';
import { normalizePkPhone } from '@/lib/phone';
export const dynamic = 'force-dynamic';


/**
 * The privacy relay.
 *
 * The finder calls this endpoint with a message (and optionally their phone
 * and geolocation). We:
 *   1. Validate + rate limit.
 *   2. Look up the tag and its owner.
 *   3. Log a Scan event.
 *   4. Persist the Message.
 *   5. Notify the owner on WhatsApp.
 *
 * The owner's real phone never touches the response. The finder's phone, if
 * provided, is only ever sent through to the owner's WhatsApp message body —
 * we don't return it anywhere visible to other parties, and we store it
 * hashed for abuse tracking.
 */
export async function POST(req: NextRequest, { params }: { params: { uid: string } }) {
  return safe(async () => {
    if (!isValidUid(params.uid)) return bad('NOT_FOUND', 'This tag does not exist.');

    const ip = getClientIp(req);

    // Rate limit per IP and per tag to prevent abuse
    if (!rateLimit(`contact:ip:${ip}`, env.RATE_LIMIT_CONTACT_PER_IP_PER_HOUR, 60 * 60_000)) {
      return bad('RATE_LIMITED', 'You have sent too many messages. Please wait an hour.');
    }
    if (!rateLimit(`contact:tag:${params.uid}`, 30, 60 * 60_000)) {
      return bad('RATE_LIMITED', 'Too many messages on this tag. Please try later.');
    }

    const json = await req.json().catch(() => null);
    const parsed = contactMessageSchema.safeParse(json);
    if (!parsed.success) return fromZod(parsed.error);

    await connectDB();
    const tag = await TagModel.findOne({ uid: params.uid });
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

    // Optional finder phone (we hash before storing)
    const finderPhone = parsed.data.finderPhone
      ? normalizePkPhone(parsed.data.finderPhone)
      : null;
    const finderPhoneHash = finderPhone ? await bcrypt.hash(finderPhone, 6) : undefined;

    const pt = normalizeProductType(tag.productType);

    // 1. Log the scan
    const scan = await ScanModel.create({
      tagId: tag._id,
      ownerId: owner._id,
      productType: pt,
      ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
      lat: parsed.data.geo?.lat,
      lng: parsed.data.geo?.lng,
    });

    // 2. Build the message that the owner will read on WhatsApp
    const vehicleLabel = contactMessageItemLabel(tag);

    const finderLine = finderPhone
      ? `\n\n📞 Finder shared their number: ${finderPhone}`
      : '\n\n(The finder did not share their number.)';

    const fullBody = parsed.data.body.trim() + finderLine;

    // 3. Notify owner on WhatsApp
    const delivery = await notifyOwner(owner.phone, vehicleLabel, fullBody);

    // 4. Persist the message
    await MessageModel.create({
      tagId: tag._id,
      ownerId: owner._id,
      scanId: scan._id,
      direction: 'FINDER_TO_OWNER',
      body: parsed.data.body.trim(),
      finderPhoneHash,
      delivered: delivery.ok,
      deliveryError: delivery.error,
      ip,
    });

    return ok({
      sent: true,
      // We do NOT return whether WhatsApp succeeded — the finder doesn't need
      // to know how the system contacts the owner. They just need confirmation.
    });
  });
}
