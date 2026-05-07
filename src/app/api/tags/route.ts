import type { NextRequest } from 'next/server';
import { ok, bad, fromZod, safe } from '@/lib/api-helpers';
import { createDashboardTagSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { createProduct } from '@/lib/services/qr-product.service';
import { TagModel } from '@/models/Tag';
import { tagPublicUrl, tagScanUrl, generateTagQrDataUrl } from '@/lib/qr';

export async function POST(req: NextRequest) {
  return safe(async () => {
    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'Please sign in to create tags.');
    if (user.status !== 'ACTIVE') {
      return bad('FORBIDDEN', 'Your account is suspended. Contact support.');
    }

    const json = await req.json().catch(() => null);
    const parsed = createDashboardTagSchema.safeParse(json);
    if (!parsed.success) return fromZod(parsed.error);

    await connectDB();
    const { tag, qrCodeUrl, publicSlug } = await createProduct(user, parsed.data);
    const qrDataUrl = await generateTagQrDataUrl(tag.uid, { width: 400, urlVariant: 'scan' });

    return ok(
      {
        tag: {
          id: tag.id,
          uid: tag.uid,
          productType: tag.productType,
          title: tag.title ?? null,
          description: tag.description ?? null,
          qrCodeUrl,
          publicSlug,
          publicScanUrl: qrCodeUrl,
          status: tag.status,
          qrDataUrl,
        },
      },
      { status: 201 },
    );
  });
}

export async function GET() {
  return safe(async () => {
    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'Please sign in.');

    await connectDB();
    const tags = await TagModel.find({ ownerId: user._id }).sort({ createdAt: -1 }).lean();

    return ok({
      tags: tags.map((t) => ({
        id: String(t._id),
        uid: t.uid,
        origin: t.origin ?? 'ORDER',
        productType: t.productType ?? 'CAR',
        title: t.title ?? null,
        description: t.description ?? null,
        metadata: (t.metadata && typeof t.metadata === 'object' ? t.metadata : {}) as Record<string, unknown>,
        status: t.status,
        vehicle: t.vehicle ?? null,
        publicName: t.publicName ?? null,
        rewardPkr: t.rewardPkr ?? null,
        lastSeenCity: t.lastSeenCity ?? null,
        activatedAt: t.activatedAt ?? null,
        lostAt: t.lostAt ?? null,
        foundAt: t.foundAt ?? null,
        createdAt: t.createdAt,
        qrCodeUrl: (t.origin ?? 'ORDER') === 'DASHBOARD' ? tagScanUrl(t.uid) : tagPublicUrl(t.uid),
        publicSlug: t.uid,
        isActive: t.status !== 'PRINTED' && t.status !== 'DISABLED',
      })),
    });
  });
}
