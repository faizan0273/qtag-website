import type { NextRequest } from 'next/server';
import { ok, bad, fromZod, safe } from '@/lib/api-helpers';
import { createOrderSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { TagModel } from '@/models/Tag';
import { generateTagUid } from '@/lib/uid';
import {
  orderDefaultTagProductType,
  orderTagsPerPack,
  quoteOrder,
} from '@/lib/constants';
import { normalizePkPhone } from '@/lib/phone';
import { isShopSku } from '@/lib/shop-products';
export const dynamic = 'force-dynamic';


/* ---------------------------- POST: create order ------------------------- */

export async function POST(req: NextRequest) {
  return safe(async () => {
    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'Please sign in to place an order.');
    if (user.status !== 'ACTIVE') {
      return bad('FORBIDDEN', 'Your account is suspended. Contact support.');
    }

    const json = await req.json().catch(() => null);
    const parsed = createOrderSchema.safeParse(json);
    if (!parsed.success) return fromZod(parsed.error);

    const { quantity, shipping, paymentMethod, notes, shopSku: rawSku } = parsed.data;

    const shopSku =
      rawSku != null && rawSku !== '' && isShopSku(rawSku) ? rawSku : undefined;

    const tagsPerPack = orderTagsPerPack(shopSku);
    const totalTags = quantity * tagsPerPack;
    if (totalTags > 100) {
      return bad('VALIDATION_ERROR', 'Reduce quantity — this product reserves many tags per pack.');
    }

    const phone = normalizePkPhone(shipping.phone);
    if (!phone) return bad('VALIDATION_ERROR', 'Shipping phone is invalid.');

    const quote = quoteOrder(quantity, paymentMethod, shopSku);

    await connectDB();

    // Reserve unique tag UIDs for this order. Try a few times if there's a
    // collision (extremely unlikely at 32^8 keyspace).
    const tagUids: string[] = [];
    for (let i = 0; i < totalTags; i++) {
      let attempts = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const uid = generateTagUid();
        const exists = await TagModel.exists({ uid });
        if (!exists) {
          tagUids.push(uid);
          break;
        }
        attempts += 1;
        if (attempts > 5) {
          return bad('INTERNAL_ERROR', 'Could not generate unique tag IDs. Please retry.');
        }
      }
    }

    const order = await OrderModel.create({
      userId: user._id,
      quantity,
      shopSku,
      reservedTagCount: totalTags,
      subtotalPkr: quote.subtotalPkr,
      shippingPkr: quote.shippingPkr,
      codFeePkr: quote.codFeePkr,
      totalPkr: quote.totalPkr,
      paymentMethod,
      status: 'PENDING',
      shipping: { ...shipping, phone },
      notes: notes || undefined,
      tagUids,
    });

    const tagProductType = orderDefaultTagProductType(shopSku);

    // Create the corresponding Tag rows in PRINTED state
    await TagModel.insertMany(
      tagUids.map((uid) => ({
        uid,
        origin: 'ORDER' as const,
        productType: tagProductType,
        orderId: order._id,
        status: 'PRINTED' as const,
      })),
    );

    return ok(
      {
        order: {
          id: order.id,
          quantity: order.quantity,
          totalPkr: order.totalPkr,
          status: order.status,
          tagUids: order.tagUids,
        },
      },
      { status: 201 },
    );
  });
}

/* ---------------------------- GET: list my orders ------------------------ */

export async function GET() {
  return safe(async () => {
    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'Please sign in.');

    await connectDB();
    const orders = await OrderModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return ok({
      orders: orders.map((o) => ({
        id: String(o._id),
        quantity: o.quantity,
        totalPkr: o.totalPkr,
        status: o.status,
        createdAt: o.createdAt,
        trackingCode: o.trackingCode ?? null,
      })),
    });
  });
}
