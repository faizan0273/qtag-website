import { notFound } from 'next/navigation';
import mongoose, { type Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { TagModel, type ITag } from '@/models/Tag';
import { ScanModel, type IScan } from '@/models/Scan';
import { MessageModel, type IMessage } from '@/models/Message';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { TagActions } from './TagActions';
import { formatPkr } from '@/lib/constants';

import { deriveTagTitle } from '@/lib/services/qr-product.service';
import { normalizeProductType, productTypeLabel } from '@/lib/product-type';
import { tagPublicUrl, tagScanUrl } from '@/lib/qr';

export const dynamic = 'force-dynamic';

export default async function TagDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ activated?: string }>;
}) {
  const { id } = await params;
  const { activated } = await searchParams;
  const user = await getCurrentUser();
  if (!user) notFound();
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDB();
  const tag = await TagModel.findById(id).lean<ITag & { _id: Types.ObjectId }>();
  if (!tag || String(tag.ownerId) !== user.id) notFound();

  const [scans, messages] = await Promise.all([
    ScanModel.find({ tagId: tag._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean<(IScan & { _id: Types.ObjectId })[]>(),
    MessageModel.find({ tagId: tag._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean<(IMessage & { _id: Types.ObjectId })[]>(),
  ]);

  const legacyUrl = tagPublicUrl(tag.uid);
  const scanUrl = tagScanUrl(tag.uid);
  const pt = normalizeProductType(tag.productType);

  const isLost = tag.status === 'LOST';

  return (
    <div>
      {activated ? (
        <div className="mb-6 px-4 py-3 rounded-xl bg-success/10 text-success">
          ✅ Tag activated! Test it by scanning the QR with your phone camera.
        </div>
      ) : null}

      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-brand font-medium">{productTypeLabel(pt)}</p>
        <h1 className="font-display text-display-md text-ink">{deriveTagTitle(tag)}</h1>
        {pt === 'CAR' && tag.vehicle ? (
          <div className="mt-2 inline-block px-3 py-1 rounded bg-ink text-paper font-mono tnum text-sm tracking-wider">
            {tag.vehicle.plate}
          </div>
        ) : null}
      </div>

      {isLost ? (
        <Card padding="md" className="mb-6 border-danger/30 bg-danger/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <div className="font-display text-base text-danger">In lost mode</div>
              <div className="mt-1 text-sm text-ink-soft">
                The public page is showing a red banner. {tag.lastSeenCity ? `Last seen: ${tag.lastSeenCity}.` : ''}
                {tag.rewardPkr ? ` Reward: ${formatPkr(tag.rewardPkr)}.` : ''}
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col: actions */}
        <div className="lg:col-span-1">
          <TagActions
            tagId={String(tag._id)}
            isLost={isLost}
            productType={pt}
            initialLastSeenCity={tag.lastSeenCity ?? ''}
            initialReward={tag.rewardPkr ?? null}
            initialMessage={tag.lostMessage ?? ''}
          />
        </div>

        {/* Right col: details + activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="md">
            <h2 className="font-display text-lg text-ink mb-4">Public links</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">Classic /t (physical tags)</div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-paper border border-paper-line">
                  <code className="text-sm tnum text-ink-soft truncate flex-1">{legacyUrl}</code>
                  <a
                    href={legacyUrl}
                    target="_blank"
                    rel="noopener"
                    className="text-sm text-brand hover:text-brand-dark whitespace-nowrap"
                  >
                    Open ↗
                  </a>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">Profile /scan</div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-paper border border-paper-line">
                  <code className="text-sm tnum text-ink-soft truncate flex-1">{scanUrl}</code>
                  <a
                    href={scanUrl}
                    target="_blank"
                    rel="noopener"
                    className="text-sm text-brand hover:text-brand-dark whitespace-nowrap"
                  >
                    Open ↗
                  </a>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Both URLs resolve the same tag, older printed codes use <span className="font-mono">/t/</span> while
              digital tags prefer <span className="font-mono">/scan/</span>.
            </p>
          </Card>

          <Card padding="md">
            <h2 className="font-display text-lg text-ink mb-4">
              Recent messages
              <span className="ml-2 text-sm font-sans text-ink-muted">({messages.length})</span>
            </h2>
            {messages.length === 0 ? (
              <p className="text-ink-muted text-sm">
                Nobody has scanned and messaged yet. When they do, you'll see it here and on WhatsApp.
              </p>
            ) : (
              <ul className="space-y-3">
                {messages.map((m) => (
                  <li key={String(m._id)} className="border-l-2 border-brand pl-3">
                    <div className="text-sm text-ink leading-relaxed">"{m.body}"</div>
                    <div className="mt-1 text-xs text-ink-muted">
                      {new Date(m.createdAt).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}
                      {' · '}
                      {m.delivered ? 'Delivered to your WhatsApp' : 'Delivery failed, check WhatsApp setup'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card padding="md">
            <h2 className="font-display text-lg text-ink mb-4">
              Recent scans
              <span className="ml-2 text-sm font-sans text-ink-muted">({scans.length})</span>
            </h2>
            {scans.length === 0 ? (
              <p className="text-ink-muted text-sm">No scans yet.</p>
            ) : (
              <ul className="divide-y divide-paper-line text-sm">
                {scans.map((s) => (
                  <li key={String(s._id)} className="py-2 flex justify-between items-center text-ink-soft">
                    <span>
                      {new Date(s.createdAt).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}
                    </span>
                    <span className="text-xs text-ink-muted truncate max-w-[40%] tnum">
                      {s.ip ?? 'n/a'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
