import { ok, bad, safe } from '@/lib/api-helpers';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import mongoose from 'mongoose';
export const dynamic = 'force-dynamic';


export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return safe(async () => {
    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'Please sign in.');

    if (!mongoose.isValidObjectId(id)) {
      return bad('NOT_FOUND', 'Order not found.');
    }

    await connectDB();
    const order = await OrderModel.findById(id).lean();
    if (!order) return bad('NOT_FOUND', 'Order not found.');

    // Authorization: only the buyer or an admin can view this
    if (String(order.userId) !== user.id && user.role !== 'ADMIN') {
      return bad('FORBIDDEN', 'You do not have access to this order.');
    }

    return ok({
      order: {
        id: String(order._id),
        quantity: order.quantity,
        subtotalPkr: order.subtotalPkr,
        shippingPkr: order.shippingPkr,
        codFeePkr: order.codFeePkr,
        totalPkr: order.totalPkr,
        paymentMethod: order.paymentMethod,
        status: order.status,
        shipping: order.shipping,
        tagUids: order.tagUids,
        trackingCode: order.trackingCode ?? null,
        courier: order.courier ?? null,
        createdAt: order.createdAt,
        shippedAt: order.shippedAt ?? null,
        deliveredAt: order.deliveredAt ?? null,
      },
    });
  });
}
