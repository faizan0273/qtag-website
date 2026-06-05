/** DISABLED — Shopify embed mode. See src/lib/shopify-embed.ts */
import type { NextRequest } from 'next/server';
import { SHOPIFY_EMBED_MODE } from '@/lib/shopify-embed';
import { embedApiDisabled } from '@/lib/embed-api-disabled';
import { ok, bad, fromZod, safe } from '@/lib/api-helpers';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import { updateTagSchema } from '@/lib/validation';
import { updateProductDetails } from '@/lib/services/qr-product.service';
export const dynamic = 'force-dynamic';


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (SHOPIFY_EMBED_MODE) return embedApiDisabled();
  const { id } = await params;
  return safe(async () => {
    const user = await getCurrentUser();
    if (!user) return bad('UNAUTHORIZED', 'Please sign in.');

    if (!mongoose.isValidObjectId(id)) {
      return bad('NOT_FOUND', 'Tag not found.');
    }

    const json = await req.json().catch(() => null);
    const parsed = updateTagSchema.safeParse(json ?? {});
    if (!parsed.success) return fromZod(parsed.error);

    await connectDB();
    const result = await updateProductDetails(id, user, {
      title: parsed.data.title,
      description: parsed.data.description,
      metadata: parsed.data.metadata,
      publicName: parsed.data.publicName,
    });

    if (!result.ok) {
      return bad(result.code, result.message);
    }

    return ok({ tag: result.tag });
  });
}
