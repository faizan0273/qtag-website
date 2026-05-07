import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { TagModel, type ITag, type TagStatus } from '@/models/Tag';
import { OrderModel } from '@/models/Order';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { env } from '@/lib/env';
import { generateTagQrDataUrl } from '@/lib/qr';
import type { Types } from 'mongoose';
import { deriveTagTitle } from '@/lib/services/qr-product.service';
import { normalizeProductType, productTypeLabel } from '@/lib/product-type';

export const dynamic = 'force-dynamic';

const STATUS_STYLE: Record<TagStatus, string> = {
  PRINTED: 'bg-paper-line/60 text-ink-muted',
  ACTIVE: 'bg-success/10 text-success',
  LOST: 'bg-danger/10 text-danger',
  FOUND: 'bg-brand-soft text-brand',
  DISABLED: 'bg-paper-line text-ink-muted',
};

export default async function DashboardHome() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dashboard');

  await connectDB();

  // User's activated tags
  const tags = await TagModel.find({ ownerId: user._id })
    .sort({ createdAt: -1 })
    .lean<(ITag & { _id: Types.ObjectId })[]>();

  // Pending tags from delivered/paid orders that haven't been activated yet
  const recentOrders = await OrderModel.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const pendingActivationUids: string[] = [];
  for (const order of recentOrders) {
    for (const uid of order.tagUids ?? []) {
      const has = tags.find((t) => t.uid === uid && t.status !== 'PRINTED');
      if (!has) pendingActivationUids.push(uid);
    }
  }

  const pendingPreview = pendingActivationUids.slice(0, 6);
  const pendingQr = await Promise.all(
    pendingPreview.map(async (uid) => ({
      uid,
      qrSrc: await generateTagQrDataUrl(uid, { width: 200 }),
    })),
  );

  return (
    <div>
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">My stickers</h1>
          <p className="mt-1 text-ink-soft">
            {tags.length === 0
              ? "You don't have any active stickers yet."
              : `${tags.filter((t) => t.status !== 'PRINTED').length} active, ${tags.filter((t) => t.status === 'LOST').length} lost`}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2 justify-end">
          <Link href="/dashboard/tags/new">
            <Button variant="secondary">Create tag</Button>
          </Link>
          <Link href="/shop">
            <Button>Buy a sticker</Button>
          </Link>
        </div>
      </div>

      {/* Pending activation banner */}
      {pendingActivationUids.length > 0 ? (
        <Card padding="md" className="mb-6 border-brand/30 bg-brand-soft/40">
          <div className="flex flex-wrap items-start gap-4 justify-between">
            <div>
              <h2 className="font-display text-lg text-ink">
                You have {pendingActivationUids.length} sticker
                {pendingActivationUids.length > 1 ? 's' : ''} ready to activate
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Scan the QR with your phone (same as on the physical sticker), or open “Activate” from a code
                below. Your sticker may still be on the way — you can activate early using the QR on this page.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {pendingQr.map(({ uid, qrSrc }) => (
              <Link
                key={uid}
                href={`/t/${uid}/activate`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-paper-line bg-paper-card p-3 hover:border-brand hover:shadow-card transition-shadow"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- data URL from server */}
                <img
                  src={qrSrc}
                  alt={`QR for tag ${uid}`}
                  width={200}
                  height={200}
                  className="w-full max-w-[140px] aspect-square object-contain rounded-md border border-paper-line bg-paper"
                />
                <span className="font-mono text-[11px] tnum text-ink-muted group-hover:text-ink text-center break-all">
                  {uid}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-brand font-medium">
                  Activate →
                </span>
              </Link>
            ))}
          </div>

          {pendingActivationUids.length > 6 ? (
            <p className="mt-4 text-xs text-ink-muted">
              +{pendingActivationUids.length - 6} more sticker{pendingActivationUids.length - 6 > 1 ? 's' : ''} — codes:{' '}
              {pendingActivationUids.slice(6).join(', ')}
            </p>
          ) : null}
        </Card>
      ) : null}

      {/* Tags grid */}
      {tags.filter((t) => t.status !== 'PRINTED').length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {tags
            .filter((t) => t.status !== 'PRINTED')
            .map((t) => (
              <Link
                key={String(t._id)}
                href={`/dashboard/tags/${String(t._id)}`}
                className="group"
              >
                <Card padding="md" className="hover:shadow-cardHover transition-shadow h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-0.5">
                        {productTypeLabel(normalizeProductType(t.productType))}
                      </div>
                      <div className="font-display text-lg text-ink truncate">
                        {deriveTagTitle(t)}
                      </div>
                      {t.productType === 'CAR' && t.vehicle?.plate ? (
                        <div className="mt-1 inline-block px-2 py-0.5 rounded bg-ink text-paper font-mono tnum text-xs tracking-wider">
                          {t.vehicle.plate}
                        </div>
                      ) : null}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${STATUS_STYLE[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-paper-line text-xs text-ink-muted flex justify-between">
                    <span>Code: <span className="font-mono">{t.uid}</span></span>
                    <span className="group-hover:text-brand">Manage →</span>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      )}

      <p className="mt-8 text-xs text-ink-muted">
        Stickers use <span className="font-mono">{env.NEXT_PUBLIC_APP_URL}/t/&lt;code&gt;</span> · digital tags use{' '}
        <span className="font-mono">/scan/&lt;code&gt;</span> (same code, richer profile shells).
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <Card padding="lg" className="text-center">
      <div className="text-5xl mb-3">🚗</div>
      <h2 className="font-display text-xl text-ink">No active stickers yet</h2>
      <p className="mt-2 text-ink-soft">Buy a sticker for your car, or create a digital tag for pets, bags, and more.</p>
      <div className="flex flex-wrap gap-3 justify-center mt-5">
        <Link href="/dashboard/tags/new">
          <Button variant="secondary">Create tag</Button>
        </Link>
        <Link href="/shop">
          <Button>Buy a sticker</Button>
        </Link>
      </div>
    </Card>
  );
}
