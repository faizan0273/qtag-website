import 'server-only';
import { connectDB } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { TagModel } from '@/models/Tag';
import { OrderModel } from '@/models/Order';
import { isValidUid } from '@/lib/uid';
import {
  devSpecForUid,
  isDevTestTag,
  resolveDevTagUid,
  seedDevTestTags,
} from '@/lib/dev-test-tags';
import type { ITag } from '@/models/Tag';

export type ScanRouteDecision =
  | { kind: 'not_found' }
  | { kind: 'public'; uid: string }
  | { kind: 'go_activate'; uid: string };

async function canUserActivateTag(
  tag: Pick<ITag, 'origin' | 'orderId' | 'createdByUserId' | 'metadata'>,
  userId: string,
): Promise<boolean> {
  if (isDevTestTag(tag.metadata)) return true;

  if (tag.origin === 'DASHBOARD') {
    return Boolean(tag.createdByUserId && String(tag.createdByUserId) === userId);
  }

  if (tag.origin === 'ORDER' && tag.orderId) {
    const order = await OrderModel.findById(tag.orderId).lean();
    return Boolean(order && String(order.userId) === userId);
  }

  return false;
}

function isUnactivated(tag: Pick<ITag, 'status' | 'ownerId'>): boolean {
  return tag.status === 'PRINTED' || !tag.ownerId;
}

/**
 * Decide what happens when someone opens /t/{uid} or /scan/{uid}.
 * - PRINTED + eligible owner (logged in) → activate flow
 * - PRINTED + everyone else → public "not active" page
 * - ACTIVE / LOST / FOUND → public contact page (no login required)
 */
export async function resolveScanRoute(rawUid: string): Promise<ScanRouteDecision> {
  const uid = resolveDevTagUid(rawUid);
  if (!isValidUid(uid)) return { kind: 'not_found' };

  await connectDB();

  let tag = await TagModel.findOne({ uid }).lean<ITag>();
  if (!tag && process.env.NODE_ENV === 'development' && devSpecForUid(uid)) {
    await seedDevTestTags();
    tag = await TagModel.findOne({ uid }).lean<ITag>();
  }
  if (!tag) return { kind: 'not_found' };

  if (isUnactivated(tag)) {
    const session = await getCurrentSession();
    if (session && (await canUserActivateTag(tag, session.uid))) {
      return { kind: 'go_activate', uid };
    }
    return { kind: 'public', uid };
  }

  return { kind: 'public', uid };
}
