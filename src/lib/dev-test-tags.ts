import type { ProductType } from '@/lib/product-type';
import { isValidUid } from '@/lib/uid';
import { TagModel } from '@/models/Tag';

export interface DevTestTagSpec {
  uid: string;
  productType: ProductType;
  /** Shown on activate screen — e.g. Baby uses ITEM type */
  categoryLabel: string;
  presetTitle?: string;
}

/**
 * Stable dev UIDs — must match `isValidUid()` (8 chars, no 0/1/i/l/o/c).
 * Legacy IDs like devcar01 were invalid and caused "Tag does not exist".
 */
export const DEV_TEST_TAG_SPECS: DevTestTagSpec[] = [
  { uid: 'devar7kp', productType: 'CAR', categoryLabel: 'Car' },
  { uid: 'devpet7k', productType: 'PET', categoryLabel: 'Pet', presetTitle: 'Pet tag (test)' },
  { uid: 'devbag7k', productType: 'BAG', categoryLabel: 'Bag', presetTitle: 'Bag tag (test)' },
  { uid: 'devhme7k', productType: 'PROPERTY', categoryLabel: 'Home', presetTitle: 'Home / property tag (test)' },
  { uid: 'devbyb7k', productType: 'ITEM', categoryLabel: 'Baby', presetTitle: 'Baby safety tag (test)' },
];

/** Old dev QR codes (invalid format) → current valid UIDs. */
export const DEV_UID_ALIASES: Record<string, string> = {
  devcar01: 'devar7kp',
  devpet01: 'devpet7k',
  devbag01: 'devbag7k',
  devhom01: 'devhme7k',
  devbaby1: 'devbyb7k',
};

const LEGACY_DEV_UIDS = Object.keys(DEV_UID_ALIASES);

/** Map legacy dev sticker codes to valid UIDs (dev only). */
export function resolveDevTagUid(uid: string): string {
  if (process.env.NODE_ENV !== 'development') return uid;
  return DEV_UID_ALIASES[uid] ?? uid;
}

export function isDevTestTag(metadata: unknown): boolean {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    (metadata as Record<string, unknown>).devTest === true
  );
}

/** Create or reset PRINTED dev stickers (any logged-in user may activate). */
export async function seedDevTestTags(): Promise<DevTestTagSpec[]> {
  await TagModel.deleteMany({ uid: { $in: LEGACY_DEV_UIDS } });

  for (const spec of DEV_TEST_TAG_SPECS) {
    if (!isValidUid(spec.uid)) {
      throw new Error(`Dev test UID "${spec.uid}" is not a valid tag code.`);
    }
    await TagModel.findOneAndUpdate(
      { uid: spec.uid },
      {
        $set: {
          uid: spec.uid,
          status: 'PRINTED',
          origin: 'ORDER',
          productType: spec.productType,
          title: spec.presetTitle,
          metadata: { devTest: true, categoryLabel: spec.categoryLabel },
          ownerId: null,
          orderId: null,
          vehicle: undefined,
          publicName: undefined,
          activatedAt: undefined,
          lostAt: undefined,
          foundAt: undefined,
        },
        $unset: { createdByUserId: '' },
      },
      { upsert: true, new: true },
    );
  }
  return DEV_TEST_TAG_SPECS;
}

export function devSpecForUid(uid: string): DevTestTagSpec | undefined {
  return DEV_TEST_TAG_SPECS.find((s) => s.uid === uid);
}
