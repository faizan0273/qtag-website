import { redirect, notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { TagModel } from '@/models/Tag';
import { ScanModel } from '@/models/Scan';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { PRODUCT_TYPES, productTypeLabel, type ProductType } from '@/lib/product-type';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dashboard/admin');
  if (user.role !== 'ADMIN') notFound();

  await connectDB();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const activeByProduct = await TagModel.aggregate<{
    _id: ProductType;
    active: number;
  }>([
    {
      $match: {
        status: { $in: ['ACTIVE', 'LOST', 'FOUND'] },
        ownerId: { $exists: true },
      },
    },
    {
      $group: {
        _id: '$productType',
        active: { $sum: 1 },
      },
    },
  ]);

  const scansLast30Days = await ScanModel.aggregate<{ _id: ProductType | null; scans: number }>([
    { $match: { createdAt: { $gte: since }, productType: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$productType',
        scans: { $sum: 1 },
      },
    },
    { $sort: { scans: -1 } },
  ]);

  const totalActiveQr = activeByProduct.reduce((s, row) => s + row.active, 0);

  const activeMap = new Map(activeByProduct.map((r) => [r._id ?? 'CAR', r.active]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-display-md text-ink">Admin · Qtag analytics</h1>
        <p className="mt-2 text-ink-soft text-sm">
          Thirty-day rolling scan counts (after model upgrade) grouped by QR product type plus currently active identities.
        </p>
      </header>

      <Card padding="md">
        <h2 className="font-display text-lg text-ink mb-4">Active QR totals</h2>
        <p className="text-sm text-ink-muted mb-4">
          Activated tags excluding <strong>PRINTED</strong>/<strong>DISABLED</strong>:{' '}
          <strong className="text-ink tnum">{totalActiveQr}</strong>
        </p>
        <ul className="divide-y divide-paper-line text-sm">
          {PRODUCT_TYPES.map((pt) => (
            <li key={pt} className="py-3 flex justify-between items-center gap-4">
              <span className="text-ink-soft">{productTypeLabel(pt)}</span>
              <span className="font-mono tnum text-ink">{activeMap.get(pt) ?? 0}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card padding="md">
        <h2 className="font-display text-lg text-ink mb-2">Recent scans · 30 days</h2>
        <p className="text-xs text-ink-muted mb-4">
          Legacy scans before the platform upgrade may omit product type analytics.
        </p>
        {scansLast30Days.length === 0 ? (
          <p className="text-ink-muted text-sm">No categorised scans in this window yet.</p>
        ) : (
          <ul className="divide-y divide-paper-line text-sm">
            {scansLast30Days.map((row) => (
              <li key={String(row._id)} className="py-3 flex justify-between gap-4">
                <span className="text-ink-soft">
                  {row._id ? productTypeLabel(row._id) : 'Unknown'}
                </span>
                <span className="font-mono tnum text-ink">{row.scans}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
