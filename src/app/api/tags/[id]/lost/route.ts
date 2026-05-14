import type { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { ok, bad, fromZod, safe } from '@/lib/api-helpers';
import { markLostSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { TagModel } from '@/models/Tag';
export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return safe(async () => {
    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'Please sign in.');

    if (!mongoose.isValidObjectId(id)) {
      return bad('NOT_FOUND', 'Tag not found.');
    }

    const json = await req.json().catch(() => ({}));
    const parsed = markLostSchema.safeParse(json);
    if (!parsed.success) return fromZod(parsed.error);

    await connectDB();
    const tag = await TagModel.findById(id);
    if (!tag) return bad('NOT_FOUND', 'Tag not found.');

    if (String(tag.ownerId) !== user.id) {
      return bad('FORBIDDEN', 'This tag does not belong to you.');
    }

    if (tag.status === 'DISABLED') {
      return bad('CONFLICT', 'This tag has been disabled.');
    }

    tag.status = 'LOST';
    tag.lostAt = new Date();
    tag.foundAt = undefined;
    if (parsed.data.lastSeenCity !== undefined) tag.lastSeenCity = parsed.data.lastSeenCity || undefined;
    if (parsed.data.rewardPkr !== undefined) tag.rewardPkr = parsed.data.rewardPkr;
    if (parsed.data.message !== undefined) tag.lostMessage = parsed.data.message || undefined;
    await tag.save();

    return ok({
      tag: { id: tag.id, status: tag.status, lostAt: tag.lostAt },
    });
  });
}
