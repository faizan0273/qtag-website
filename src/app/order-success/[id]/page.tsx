import Link from 'next/link';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPkr, orderLineTitleFromSku } from '@/lib/constants';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; payment?: string; reason?: string; code?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) notFound();
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDB();
  const order = await OrderModel.findById(id).lean();
  if (!order) notFound();
  if (String(order.userId) !== user.id && user.role !== 'ADMIN') notFound();

  const lineTitle = orderLineTitleFromSku(order.shopSku);
  const tagsReserved =
    typeof order.reservedTagCount === 'number' ? order.reservedTagCount : order.quantity;

  const paymentFailed = sp.payment === 'failed';
  const paymentJustPaid =
    sp.paid === '1' || order.paymentStatus === 'PAID';
  const isJazzCash = order.paymentMethod === 'JAZZCASH';

  return (
    <div className="container-page py-12 md:py-20 max-w-3xl">
      {paymentFailed ? (
        <div className="mb-8 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          <div className="font-medium">Payment didn&apos;t go through.</div>
          <div className="mt-1 text-danger/90">
            {order.paymentResponseMessage
              ? order.paymentResponseMessage
              : 'JazzCash couldn\'t complete the transaction.'}
            {sp.code ? ` (code ${sp.code})` : ''}
          </div>
          <a
            href={`/payments/jazzcash/${String(order._id)}`}
            className="inline-block mt-3 underline font-medium"
          >
            Retry payment →
          </a>
        </div>
      ) : null}

      {/* Success header */}
      <div className="text-center">
        <div className="inline-grid place-items-center h-16 w-16 rounded-full bg-success/10 text-success mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-display text-display-lg text-ink">
          {isJazzCash && paymentJustPaid ? 'Payment received!' : 'Order placed!'}
        </h1>
        <p className="mt-3 text-ink-soft text-lg">
          {isJazzCash && paymentJustPaid ? (
            <>Thanks, your JazzCash payment is confirmed. </>
          ) : null}
          We&apos;re preparing{' '}
          <span className="font-medium text-ink">{lineTitle}</span>
          {order.quantity > 1 ? ` (${order.quantity} units)` : ''}.{' '}
          <span className="tnum">{tagsReserved}</span> QR tag UID{tagsReserved === 1 ? '' : 's'} reserved.
          Expected delivery in 2 to 3 working days.
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
            <div className="text-sm text-ink-muted">
              Total ({isJazzCash ? 'JazzCash' : 'COD'})
            </div>
            <div className="font-display text-2xl tnum mt-1">{formatPkr(order.totalPkr)}</div>
            {isJazzCash ? (
              <div className="mt-1 text-xs">
                {order.paymentStatus === 'PAID' ? (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-success/10 text-success font-medium uppercase tracking-wider">
                    Paid
                  </span>
                ) : order.paymentStatus === 'PENDING' ? (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-brand-soft text-brand font-medium uppercase tracking-wider">
                    Awaiting payment
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-danger/10 text-danger font-medium uppercase tracking-wider">
                    {order.paymentStatus ?? 'Failed'}
                  </span>
                )}
              </div>
            ) : null}
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
            <div className="text-ink-muted mb-1">Lines</div>
            <div className="text-ink">
              {lineTitle}
              <div className="mt-1 text-ink-soft text-xs">
                {order.quantity} pack{order.quantity > 1 ? 's' : ''} · {tagsReserved} tag UID
                {tagsReserved === 1 ? '' : 's'}
              </div>
            </div>
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
            [
              '1',
              'We prepare your order',
              `Your items ship with unique QR codes, ${tagsReserved} tag UID${tagsReserved === 1 ? '' : 's'} linked to this order.`,
            ],
            [
              '2',
              'Courier delivers in 2 to 3 days',
              isJazzCash
                ? 'No payment due on delivery, your order is already paid.'
                : `Pay the rider ${formatPkr(order.totalPkr)} when it arrives.`,
            ],
            [
              '3',
              'Activate each tag',
              'Scan with your camera and finish activation from your dashboard.',
            ],
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
          <h2 className="font-display text-xl text-ink">Your QR tag codes</h2>
          <p className="mt-2 text-ink-soft">
            Each tag has a unique code printed on it. After delivery, scan it to activate. You don&apos;t need
            to memorise these.
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
          <Button size="lg" variant="secondary">Shop more tags</Button>
        </Link>
      </div>
    </div>
  );
}
