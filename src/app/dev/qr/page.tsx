import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { seedDevTestTags, DEV_TEST_TAG_SPECS } from '@/lib/dev-test-tags';
import { generateTagQrDataUrl } from '@/lib/qr';
import { tagPublicProfileUrl, tagActivateUrl, getPublicAppBaseUrl } from '@/lib/qr-base-url';
import { TagModel } from '@/models/Tag';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DevQrSeedButton } from '@/components/dev/DevQrSeedButton';

export const dynamic = 'force-dynamic';

export default async function DevQrLabPage() {
  if (process.env.NODE_ENV !== 'development') redirect('/login');

  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dev/qr');

  await connectDB();

  const existing = await TagModel.countDocuments({
    uid: { $in: DEV_TEST_TAG_SPECS.map((s) => s.uid) },
  });
  if (existing < DEV_TEST_TAG_SPECS.length) {
    await seedDevTestTags();
  }

  const tags = await TagModel.find({
    uid: { $in: DEV_TEST_TAG_SPECS.map((s) => s.uid) },
  }).lean();

  const cards = await Promise.all(
    DEV_TEST_TAG_SPECS.map(async (spec) => {
      const row = tags.find((t) => t.uid === spec.uid);
      return {
        ...spec,
        status: row?.status ?? 'PRINTED',
        scanUrl: tagPublicProfileUrl(spec.uid),
        activateUrl: tagActivateUrl(spec.uid),
        qrDataUrl: await generateTagQrDataUrl(spec.uid, { width: 240, urlVariant: 'legacy' }),
      };
    }),
  );

  const base = getPublicAppBaseUrl();

  return (
    <div className="container-page py-10 md:py-14 max-w-3xl">
      <div className="mb-8">
        <div className="text-sm text-brand font-medium uppercase tracking-wide">Development</div>
        <h1 className="mt-1 font-display text-display-lg text-ink">Test QR stickers</h1>
        <p className="mt-2 text-ink-soft">
          Scan with another phone on the same Wi‑Fi. Each QR uses production URLs ({' '}
          <span className="font-mono">/t/&#123;uid&#125;</span>): PRINTED tags show “not active” or send
          owners to activate; after activation, the same QR shows the public contact page.
        </p>
        <p className="mt-2 text-sm font-mono text-ink bg-paper-line/40 rounded-lg px-3 py-2 break-all">
          QR base URL: {base}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          Set in <span className="font-mono">.env.local</span> as NEXT_PUBLIC_QR_BASE_URL, then restart{' '}
          <span className="font-mono">npm run dev</span>.
        </p>
      </div>

      <Card padding="lg" className="mb-8">
        <p className="text-sm text-ink-soft">
          Signed in as <span className="font-mono text-ink">{user.phone}</span>. Use a different phone to
          test OTP again. If a sticker is already active on this number, you will see the success screen.
        </p>
        <div className="mt-4">
          <DevQrSeedButton />
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.uid} padding="lg">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm text-brand font-medium uppercase tracking-wide">
                  {card.categoryLabel} tag
                </div>
                <div className="text-xs text-ink-muted mt-1 font-mono">{card.uid}</div>
              </div>
              <span
                className={[
                  'text-xs px-2 py-0.5 rounded-full',
                  card.status === 'PRINTED'
                    ? 'bg-brand-soft text-brand'
                    : 'bg-success/10 text-success',
                ].join(' ')}
              >
                {card.status}
              </span>
            </div>

            <div className="mt-4 flex justify-center bg-white rounded-xl p-3">
              <Image src={card.qrDataUrl} alt={`QR ${card.categoryLabel}`} width={200} height={200} unoptimized />
            </div>

            <p className="mt-3 text-xs text-ink-muted break-all font-mono">{card.scanUrl}</p>

            <div className="mt-4 grid gap-2">
              <Link href={`/t/${card.uid}`} className="block">
                <Button variant="primary" fullWidth size="sm">
                  Open scan page
                </Button>
              </Link>
              <Link href={`/t/${card.uid}/activate`} className="block">
                <Button variant="secondary" fullWidth size="sm">
                  Open activate (owner)
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
