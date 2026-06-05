/** DISABLED — Shopify embed mode. See src/lib/shopify-embed.ts */
import { SHOPIFY_EMBED_MODE } from '@/lib/shopify-embed';
import { embedApiDisabled } from '@/lib/embed-api-disabled';
import mongoose from 'mongoose';
import { ok, bad, safe } from '@/lib/api-helpers';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { TagModel } from '@/models/Tag';
export const dynamic = 'force-dynamic';


export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (SHOPIFY_EMBED_MODE) return embedApiDisabled();
  const { id } = await params;
  return safe(async () => {
    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'Please sign in.');

    if (!mongoose.isValidObjectId(id)) {
      return bad('NOT_FOUND', 'Tag not found.');
    }

    await connectDB();
    const tag = await TagModel.findById(id);
    if (!tag) return bad('NOT_FOUND', 'Tag not found.');
    if (String(tag.ownerId) !== user.id) {
      return bad('FORBIDDEN', 'This tag does not belong to you.');
    }
    if (tag.status !== 'LOST') {
      return bad('CONFLICT', 'This tag is not currently in lost mode.');
    }

    tag.status = 'ACTIVE';
    tag.foundAt = new Date();
    tag.lastSeenCity = undefined;
    tag.rewardPkr = undefined;
    tag.lostMessage = undefined;
    await tag.save();

    return ok({ tag: { id: tag.id, status: tag.status, foundAt: tag.foundAt } });
  });
}
