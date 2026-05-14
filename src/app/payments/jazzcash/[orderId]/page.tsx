import { notFound, redirect } from 'next/navigation';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { getCurrentUser } from '@/lib/auth';
import { buildJazzCashRequest, generateJazzCashTxnRef } from '@/lib/jazzcash';
import { formatPkr, orderLineTitleFromSku } from '@/lib/constants';
import { isJazzCashConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * Server-rendered redirect page: builds & signs the JazzCash payload, then
 * auto-submits a hidden POST form to JazzCash's hosted checkout.
 *
 * We re-mint the `pp_TxnRefNo` (and refresh expiry) on every visit so that
 * resuming/retrying a pending order generates a fresh transaction.
 */
export default async function JazzCashRedirectPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  if (!isJazzCashConfigured) {
    redirect('/checkout?error=jazzcash_not_configured');
  }

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/payments/jazzcash/${orderId}`);
  if (!mongoose.isValidObjectId(orderId)) notFound();

  await connectDB();
  const order = await OrderModel.findById(orderId);
  if (!order) notFound();
  if (String(order.userId) !== user.id) notFound();

  if (order.paymentMethod !== 'JAZZCASH') {
    redirect(`/order-success/${order.id}`);
  }
  if (order.paymentStatus === 'PAID' || order.status === 'PAID') {
    redirect(`/order-success/${order.id}?paid=1`);
  }

  const txnRef = generateJazzCashTxnRef();
  order.paymentRef = txnRef;
  order.paymentStatus = 'PENDING';
  await order.save();

  const lineTitle = orderLineTitleFromSku(order.shopSku);
  const { actionUrl, fields } = buildJazzCashRequest({
    amountPkr: order.totalPkr,
    txnRefNo: txnRef,
    description: `${lineTitle} Order`,
    billReference: String(order.id).slice(-12),
    extra: { ppmpf_1: String(order.id) },
  });

  // Debug: log the payload (password redacted) so we can verify what JazzCash sees.
  // Disable by setting JAZZCASH_DEBUG_LOG=false.
  if (process.env.JAZZCASH_DEBUG_LOG !== 'false') {
    const redacted: Record<string, string> = { ...fields };
    if (redacted.pp_Password) redacted.pp_Password = '*'.repeat(redacted.pp_Password.length);
    // eslint-disable-next-line no-console
    console.log('[jazzcash] outbound payload', { actionUrl, fields: redacted });
  }

  return (
    <div className="container-page py-20 max-w-md text-center">
      <div className="inline-grid place-items-center h-14 w-14 rounded-full bg-brand-soft text-brand mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <h1 className="font-display text-display-md text-ink">Redirecting to JazzCash…</h1>
      <p className="mt-3 text-ink-soft">
        We&apos;re sending you to JazzCash to pay{' '}
        <span className="tnum font-medium text-ink">{formatPkr(order.totalPkr)}</span>{' '}
        for order <span className="font-mono text-xs">{String(order.id)}</span>.
      </p>

      <form
        id="jazzcash-form"
        method="POST"
        action={actionUrl}
        className="mt-8"
      >
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} readOnly />
        ))}
        <noscript>
          <p className="text-sm text-ink-muted mb-3">
            JavaScript is disabled. Tap the button to continue.
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-ink text-paper px-5 py-2.5 font-medium"
          >
            Continue to JazzCash
          </button>
        </noscript>
      </form>

      <p className="mt-8 text-xs text-ink-muted">
        Do not refresh this page. You&apos;ll be redirected automatically.
      </p>

      {/* Auto-submit on load. */}
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              try {
                var f = document.getElementById('jazzcash-form');
                if (f) { setTimeout(function(){ f.submit(); }, 50); }
              } catch (e) { /* fallthrough to noscript button */ }
            })();
          `,
        }}
      />
    </div>
  );
}
