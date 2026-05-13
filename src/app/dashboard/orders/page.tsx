import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { OrderModel, type IOrder, type OrderStatus } from '@/models/Order';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { formatPkr } from '@/lib/constants';
import type { Types } from 'mongoose';

export const dynamic = 'force-dynamic';

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: 'bg-warn/10 text-warn',
  PAID: 'bg-success/10 text-success',
  FULFILLED: 'bg-brand-soft text-brand',
  SHIPPED: 'bg-brand-soft text-brand',
  DELIVERED: 'bg-success/10 text-success',
  CANCELLED: 'bg-paper-line text-ink-muted',
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dashboard/orders');

  await connectDB();
  const orders = await OrderModel.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean<(IOrder & { _id: Types.ObjectId })[]>();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-display-md text-ink">Orders</h1>
        <p className="mt-1 text-ink-soft">Everything you've bought from us.</p>
      </div>

      {orders.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="text-4xl mb-3">📦</div>
          <h2 className="font-display text-xl text-ink">No orders yet</h2>
          <p className="mt-2 text-ink-soft">When you place an order, it shows up here.</p>
          <Link
            href="/shop"
            className="inline-block mt-5 px-5 h-11 leading-[44px] rounded-xl bg-brand text-white font-medium hover:bg-brand-dark"
          >
            Shop
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={String(o._id)}
              href={`/order-success/${String(o._id)}`}
              className="block"
            >
              <Card padding="md" className="hover:shadow-cardHover transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs text-ink-muted tnum">
                      #{String(o._id).slice(-8)}
                    </div>
                    <div className="mt-1 font-medium text-ink">
                      {o.quantity} item{o.quantity > 1 ? 's' : ''} · {formatPkr(o.totalPkr)}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted">
                      Placed {new Date(o.createdAt).toLocaleDateString('en-PK')}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${STATUS_STYLE[o.status]}`}
                  >
                    {o.status}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
