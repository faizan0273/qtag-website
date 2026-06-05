import { notFound, redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { TagModel } from '@/models/Tag';
import { UserModel } from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { normalizeProductType, productTypeLabel } from '@/lib/product-type';
import { devSpecForUid, isDevTestTag, resolveDevTagUid, seedDevTestTags } from '@/lib/dev-test-tags';
import { ActivateTagForm } from '@/components/activate/ActivateTagForm';
import { tagPublicProfileUrl } from '@/lib/qr-base-url';

export default async function ActivatePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid: rawUid } = await params;
  const uid = resolveDevTagUid(rawUid);
  if (rawUid !== uid) redirect(`/t/${uid}/activate`);

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/t/${uid}/activate`)}`);

  await connectDB();
  let tag = await TagModel.findOne({ uid }).lean();

  if (!tag && process.env.NODE_ENV === 'development' && devSpecForUid(uid)) {
    await seedDevTestTags();
    tag = await TagModel.findOne({ uid }).lean();
  }

  if (!tag) notFound();

  const origin = tag.origin ?? 'ORDER';
  if (origin === 'DASHBOARD' && !isDevTestTag(tag.metadata)) {
    if (!tag.createdByUserId || String(tag.createdByUserId) !== user.id) {
      notFound();
    }
  }

  const productType = normalizeProductType(tag.productType);
  const devSpec = devSpecForUid(uid);
  const categoryLabel =
    devSpec?.categoryLabel ??
    (typeof tag.metadata === 'object' &&
    tag.metadata &&
    typeof (tag.metadata as Record<string, unknown>).categoryLabel === 'string'
      ? String((tag.metadata as Record<string, unknown>).categoryLabel)
      : productTypeLabel(productType));

  const publicScanUrl = tagPublicProfileUrl(tag.uid);

  if (tag.status !== 'PRINTED' && tag.ownerId) {
    const isOwner = String(tag.ownerId) === user.id;

    if (!isOwner) {
      return (
        <ActivateTagForm
          slug={tag.uid}
          productType={productType}
          categoryLabel={categoryLabel}
          origin={origin}
          claimedByOther
          publicScanUrl={publicScanUrl}
        />
      );
    }

    return (
      <ActivateTagForm
        slug={tag.uid}
        productType={productType}
        categoryLabel={categoryLabel}
        origin={origin}
        alreadyActive
        publicScanUrl={publicScanUrl}
        tagSummary={{
          title:
            typeof tag.title === 'string' && tag.title.trim()
              ? tag.title
              : tag.vehicle
                ? `${tag.vehicle.color} ${tag.vehicle.make}`
                : 'Your tag',
          plate: tag.vehicle?.plate,
        }}
        ownerPhone={user.phone}
      />
    );
  }

  return (
    <ActivateTagForm
      slug={tag.uid}
      productType={productType}
      categoryLabel={categoryLabel}
      origin={origin}
      initialTitle={typeof tag.title === 'string' ? tag.title : devSpec?.presetTitle ?? ''}
      initialDescription={typeof tag.description === 'string' ? tag.description : ''}
      publicScanUrl={publicScanUrl}
    />
  );
}
