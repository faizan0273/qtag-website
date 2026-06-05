import { ok, bad, safe } from '@/lib/api-helpers';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { seedDevTestTags, DEV_TEST_TAG_SPECS } from '@/lib/dev-test-tags';
import { generateTagQrDataUrl } from '@/lib/qr';
import { tagActivateUrl } from '@/lib/qr-base-url';
import { TagModel } from '@/models/Tag';
export const dynamic = 'force-dynamic';

function devOnly() {
  if (process.env.NODE_ENV !== 'development') {
    return bad('FORBIDDEN', 'Dev test tags are only available in development.');
  }
  return null;
}

export async function GET() {
  return safe(async () => {
    const blocked = devOnly();
    if (blocked) return blocked;

    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'Sign in to view dev test QR codes.');

    await connectDB();
    const tags = await TagModel.find({
      uid: { $in: DEV_TEST_TAG_SPECS.map((s) => s.uid) },
    }).lean();

    const items = await Promise.all(
      DEV_TEST_TAG_SPECS.map(async (spec) => {
        const row = tags.find((t) => t.uid === spec.uid);
        const activateUrl = tagActivateUrl(spec.uid);
        const qrDataUrl = await generateTagQrDataUrl(spec.uid, {
          width: 280,
          urlVariant: 'activate',
        });
        return {
          ...spec,
          status: row?.status ?? 'MISSING',
          activateUrl,
          qrDataUrl,
        };
      }),
    );

    return ok({ tags: items });
  });
}

/** Reset all dev stickers to PRINTED so you can test activation again. */
export async function POST() {
  return safe(async () => {
    const blocked = devOnly();
    if (blocked) return blocked;

    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'Sign in to seed dev test tags.');

    await connectDB();
    await seedDevTestTags();

    const items = await Promise.all(
      DEV_TEST_TAG_SPECS.map(async (spec) => ({
        ...spec,
        activateUrl: tagActivateUrl(spec.uid),
        qrDataUrl: await generateTagQrDataUrl(spec.uid, { width: 280, urlVariant: 'activate' }),
        status: 'PRINTED' as const,
      })),
    );

    return ok({ tags: items, message: 'Dev test tags reset to PRINTED.' });
  });
}
