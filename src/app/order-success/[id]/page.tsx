import Link from 'next/link';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPkr } from '@/lib/constants';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function OrderSuccessPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) notFound();
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectDB();
  const order = await OrderModel.findById(params.id).lean();
  if (!order) notFound();
  if (String(order.userId) !== user.id && user.role !== 'ADMIN') notFound();

  return (
    <div className="container-page py-12 md:py-20 max-w-3xl">
      {/* Success header */}
      <div className="text-center">
        <div className="inline-grid place-items-center h-16 w-16 rounded-full bg-success/10 text-success mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-display text-display-lg text-ink">Order placed!</h1>
        <p className="mt-3 text-ink-soft text-lg">
          We're preparing your sticker{order.quantity > 1 ? 's' : ''}. Expected delivery in
          2–3 working days.
        </p>
      </div>

      {/* Summary card */}
      <Card padding="lg" className="mt-10">
        <div className="flex justify-between items-start gap-4 pb-5 border-b border-paper-line">
          <div>
            <div className="text-sm text-ink-muted">Order ID</div>
            <div className="font-mono text-ink mt-1 break-all">{String(order._id)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-ink-muted">Total (COD)</div>
            <div className="font-display text-2xl tnum mt-1">{formatPkr(order.totalPkr)}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-5 text-sm">
          <div>
            <div className="text-ink-muted mb-1">Shipping to</div>
            <div className="text-ink leading-relaxed">
              <div className="font-medium">{order.shipping.fullName}</div>
              <div>{order.shipping.address1}</div>
              {order.shipping.address2 ? <div>{order.shipping.address2}</div> : null}
              <div>{order.shipping.city}, {order.shipping.province}</div>
              <div className="tnum">{order.shipping.phone}</div>
            </div>
          </div>
          <div>
            <div className="text-ink-muted mb-1">Quantity</div>
            <div className="text-ink">{order.quantity} sticker{order.quantity > 1 ? 's' : ''}</div>
            <div className="text-ink-muted mt-3 mb-1">Status</div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-soft text-brand text-xs font-medium uppercase tracking-wider">
              {order.status}
            </span>
          </div>
        </div>
      </Card>

      {/* What's next */}
      <Card padding="lg" className="mt-6">
        <h2 className="font-display text-xl text-ink">What happens next</h2>
        <ol className="mt-5 space-y-4 text-ink-soft">
          {[
            ['1', 'We print your sticker', 'Your sticker comes pre-printed with a unique QR code linked to this order.'],
            ['2', 'Courier delivers in 2–3 days', `Pay the rider ${formatPkr(order.totalPkr)} when it arrives.`],
            ['3', 'Stick it & scan it', 'Open your phone camera, point at the sticker, and follow the activation steps. Takes 30 seconds.'],
          ].map(([n, title, body]) => (
            <li key={n} className="flex gap-4">
              <span className="grid place-items-center h-8 w-8 rounded-full bg-ink text-paper text-sm font-display shrink-0">{n}</span>
              <div>
                <div className="font-medium text-ink">{title}</div>
                <div className="mt-0.5">{body}</div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Tag UIDs (for the user's reference) */}
      {order.tagUids?.length ? (
        <Card padding="lg" className="mt-6">
          <h2 className="font-display text-xl text-ink">Your sticker codes</h2>
          <p className="mt-2 text-ink-soft">
            Each sticker has a unique code printed on it. After delivery, just scan the sticker — you don't need to memorise these.
          </p>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {order.tagUids.map((uid) => (
              <div
                key={uid}
                className="px-3 py-2.5 rounded-lg bg-paper border border-paper-line font-mono text-sm tnum text-ink-soft text-center"
              >
                {uid}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-muted">
            Public link format:{' '}
            <span className="font-mono">{env.NEXT_PUBLIC_APP_URL}/t/&lt;code&gt;</span>
          </p>
        </Card>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link href="/dashboard">
          <Button size="lg">Go to dashboard</Button>
        </Link>
        <Link href="/shop">
          <Button size="lg" variant="secondary">Buy another</Button>
        </Link>
      </div>
    </div>
  );
}
