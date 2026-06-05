import type { NextRequest } from 'next/server';
import { ok, bad, fromZod, safe } from '@/lib/api-helpers';
import { activateTagSchema } from '@/lib/validation';
import { isValidUid } from '@/lib/uid';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { TagModel } from '@/models/Tag';
import { UserModel } from '@/models/User';
import { activateQR } from '@/lib/services/qr-product.service';
import { normalizeProductType } from '@/lib/product-type';
import { resolveDevTagUid } from '@/lib/dev-test-tags';
export const dynamic = 'force-dynamic';


/**
 * Activation rules:
 *  - Tag must exist and be in PRINTED state.
 *  - ORDER stickers: tag reserved by an order belonging to this user
 *    (via OrderModel.tagUids), per original Car Tag flow.
 *  - DASHBOARD tags: same user who created the UID can activate without an order.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const { uid: rawUid } = await params;
  const uid = resolveDevTagUid(rawUid);
  return safe(async () => {
    if (!isValidUid(uid)) {
      return bad(
        'NOT_FOUND',
        'This tag code is not valid. Scan a current test QR from /dev/qr or check the code on your sticker.',
      );
    }

    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'Please sign in to activate.');

    const raw = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!raw) return bad('BAD_REQUEST', 'Invalid JSON body.');

    await connectDB();
    const tagLean = await TagModel.findOne({ uid }).lean();
    if (!tagLean) return bad('NOT_FOUND', 'This tag does not exist.');

    const effectiveType = normalizeProductType((raw.productType as string) ?? tagLean.productType);
    const merged: Record<string, unknown> = {
      ...raw,
      productType: effectiveType,
    };
    if (effectiveType !== 'CAR' && !(String(merged.title ?? '').trim()) && tagLean.title) {
      merged.title = tagLean.title;
    }

    const parsed = activateTagSchema.safeParse(merged);
    if (!parsed.success) return fromZod(parsed.error);

    const tag = await TagModel.findOne({ uid });
    if (!tag) return bad('NOT_FOUND', 'This tag does not exist.');

    const body = parsed.data;
    const pt = body.productType ?? 'CAR';

    const result = await activateQR(tag, user, {
      productType: pt,
      publicName: body.publicName.trim(),
      vehicle: body.vehicle,
      title: body.title,
      description: body.description,
      metadata: body.metadata,
    });

    if (!result.ok) {
      return bad(result.code, result.message);
    }

    if (typeof body.isPhoneNumberAllow === 'boolean') {
      await UserModel.findByIdAndUpdate(user._id, { isPhoneNumberAllow: body.isPhoneNumberAllow });
    }

    return ok({ tag: result.tag });
  });
}
