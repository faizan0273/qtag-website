import type { NextRequest } from 'next/server';
import { ok, bad, safe } from '@/lib/api-helpers';
import { connectDB } from '@/lib/db';
import { isValidUid } from '@/lib/uid';
import { z } from 'zod';
import { scanQRHandler } from '@/lib/services/qr-product.service';

const beaconSchema = z.object({
  uid: z.string(),
});

/**
 * Lightweight beacon — records the visit and optionally notifies the owner.
 */
export async function POST(req: NextRequest) {
  return safe(async () => {
    const json = await req.json().catch(() => null);
    const parsed = beaconSchema.safeParse(json);
    if (!parsed.success) return bad('BAD_REQUEST', 'Invalid payload.');
    if (!isValidUid(parsed.data.uid)) return ok({ logged: false });

    await connectDB();
    const result = await scanQRHandler(req, parsed.data.uid);
    return ok({
      logged: result.logged,
      ...('notified' in result ? { notified: result.notified } : {}),
    });
  });
}
