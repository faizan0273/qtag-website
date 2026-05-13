import { NextResponse, type NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { verifyJazzCashResponse, type JazzCashFields } from '@/lib/jazzcash';
import { env, isJazzCashConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * JazzCash POSTs the transaction result back here as
 * `application/x-www-form-urlencoded`. We verify the secure hash, update the
 * matching order, and 303-redirect the browser to a friendly status page.
 */
async function handle(req: NextRequest): Promise<NextResponse> {
  const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');

  const fields = await readFields(req);
  const ref = fields.pp_TxnRefNo ?? '';
  // `ppmpf_1` carries our internal order id (sent in buildJazzCashRequest).
  const orderIdFromExtras = fields.ppmpf_1 ?? '';

  if (!isJazzCashConfigured) {
    return redirectTo(appUrl, '/checkout?error=jazzcash_not_configured');
  }

  const verified = verifyJazzCashResponse(fields);

  await connectDB();

  // Look up by our reference first (most reliable); fall back to embedded order id.
  let order = ref ? await OrderModel.findOne({ paymentRef: ref }) : null;
  if (!order && orderIdFromExtras) {
    try {
      order = await OrderModel.findById(orderIdFromExtras);
    } catch {
      order = null;
    }
  }

  if (!order) {
    // Can't reconcile — log & bounce the user back to checkout.
    // eslint-disable-next-line no-console
    console.error('[jazzcash] return: no matching order', { ref, orderIdFromExtras });
    return redirectTo(appUrl, '/checkout?error=jazzcash_unknown_order');
  }

  if (!verified.signatureValid) {
    // eslint-disable-next-line no-console
    console.error('[jazzcash] return: signature invalid', { ref, orderId: String(order._id) });
    order.paymentStatus = 'FAILED';
    order.paymentResponseCode = verified.responseCode || 'SIG_INVALID';
    order.paymentResponseMessage = verified.responseMessage || 'Invalid signature';
    order.paymentRawResponse = stripSecrets(fields);
    order.markModified('paymentRawResponse');
    await order.save();
    return redirectTo(appUrl, `/order-success/${order.id}?payment=failed&reason=signature`);
  }

  // Record the raw response for audit either way.
  order.paymentResponseCode = verified.responseCode;
  order.paymentResponseMessage = verified.responseMessage;
  order.paymentProviderTxnId = verified.providerTxnId || order.paymentProviderTxnId;
  order.paymentRawResponse = stripSecrets(fields);
  order.markModified('paymentRawResponse');

  if (verified.paid) {
    // Sanity check: amount returned matches order total.
    if (verified.amountPkr !== order.totalPkr) {
      // eslint-disable-next-line no-console
      console.error('[jazzcash] amount mismatch', {
        orderId: String(order._id),
        expected: order.totalPkr,
        got: verified.amountPkr,
      });
      order.paymentStatus = 'FAILED';
      order.paymentResponseMessage = `Amount mismatch (got ${verified.amountPkr}, expected ${order.totalPkr})`;
      await order.save();
      return redirectTo(appUrl, `/order-success/${order.id}?payment=failed&reason=amount`);
    }

    order.paymentStatus = 'PAID';
    order.paidAt = new Date();
    if (order.status === 'PENDING') order.status = 'PAID';
    await order.save();
    return redirectTo(appUrl, `/order-success/${order.id}?paid=1`);
  }

  // Signature valid but payment did not succeed.
  order.paymentStatus = verified.responseCode === '121' ? 'CANCELLED' : 'FAILED';
  await order.save();
  return redirectTo(
    appUrl,
    `/order-success/${order.id}?payment=failed&code=${encodeURIComponent(verified.responseCode)}`,
  );
}

export async function POST(req: NextRequest) {
  return handle(req);
}

// Some flows return via GET with query params (older JazzCash configs).
export async function GET(req: NextRequest) {
  return handle(req);
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

async function readFields(req: NextRequest): Promise<JazzCashFields> {
  const out: JazzCashFields = {};

  // GET path: query string only.
  if (req.method === 'GET') {
    req.nextUrl.searchParams.forEach((v, k) => {
      out[k] = v;
    });
    return out;
  }

  // POST: prefer form data; fall back to JSON or query string.
  const ct = req.headers.get('content-type') ?? '';
  try {
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData();
      form.forEach((v, k) => {
        if (typeof v === 'string') out[k] = v;
      });
    } else if (ct.includes('application/json')) {
      const json = (await req.json()) as Record<string, unknown> | null;
      if (json && typeof json === 'object') {
        for (const [k, v] of Object.entries(json)) {
          out[k] = v == null ? '' : String(v);
        }
      }
    } else {
      // Best-effort: try formData anyway.
      try {
        const form = await req.formData();
        form.forEach((v, k) => {
          if (typeof v === 'string') out[k] = v;
        });
      } catch {
        /* ignore */
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[jazzcash] failed to parse return body', err);
  }

  // Also merge any query-string params (just in case).
  req.nextUrl.searchParams.forEach((v, k) => {
    if (!(k in out)) out[k] = v;
  });
  return out;
}

function redirectTo(base: string, path: string): NextResponse {
  // 303 forces the browser to switch POST -> GET when following the redirect.
  return NextResponse.redirect(`${base}${path}`, { status: 303 });
}

/** Remove fields we don't want to persist on the order (passwords, hashes). */
function stripSecrets(fields: JazzCashFields): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (k === 'pp_Password') continue;
    out[k] = v;
  }
  return out;
}
