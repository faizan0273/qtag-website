import { notFound, redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { TagModel } from '@/models/Tag';
import { getCurrentUser } from '@/lib/auth';
import { normalizeProductType } from '@/lib/product-type';
import { ActivateTagForm } from '@/components/activate/ActivateTagForm';

export default async function ActivatePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/t/${uid}/activate`)}`);

  await connectDB();
  const tag = await TagModel.findOne({ uid }).lean();

  if (!tag) notFound();

  if (tag.status !== 'PRINTED') {
    redirect(`/dashboard/tags/${String(tag._id)}`);
  }

  const origin = tag.origin ?? 'ORDER';
  if (origin === 'DASHBOARD') {
    if (!tag.createdByUserId || String(tag.createdByUserId) !== user.id) {
      redirect('/dashboard');
    }
  }

  const productType = normalizeProductType(tag.productType);

  return (
    <ActivateTagForm
      slug={tag.uid}
      productType={productType}
      origin={origin}
      initialTitle={typeof tag.title === 'string' ? tag.title : ''}
      initialDescription={typeof tag.description === 'string' ? tag.description : ''}
    />
  );
}
