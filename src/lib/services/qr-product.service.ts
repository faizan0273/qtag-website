import type { HydratedDocument, Types } from 'mongoose';
import type { IUser } from '@/models/User';
import type { ITag, TagStatus } from '@/models/Tag';
import { TagModel } from '@/models/Tag';
import { OrderModel } from '@/models/Order';
import { UserModel } from '@/models/User';
import { ScanModel } from '@/models/Scan';
import { generateTagUid, isValidUid } from '@/lib/uid';
import { maskPhone } from '@/lib/phone';
import { tagScanUrl } from '@/lib/qr';
import {
  normalizeProductType,
  productTypeAlertFragment,
  productTypeIcon,
  type ProductType,
} from '@/lib/product-type';
import { env } from '@/lib/env';
import { rateLimit } from '@/lib/rate-limit';
import { notifyOwnerQrScan } from '@/lib/whatsapp';
import { sendSms } from '@/lib/sms';
import type { NextRequest } from 'next/server';
import { getClientIp } from '@/lib/api-helpers';
import { isDevTestTag } from '@/lib/dev-test-tags';

export interface CurrentUserLite {
  _id: Types.ObjectId;
}

export type PublicScanState = Exclude<TagStatus, never>;

export interface PublicScanView {
  state: PublicScanState;
  slug: string;
  productType: ProductType;
  title: string;
  description?: string | null;
  typeIcon: string;
  publicName?: string;
  vehicle?: {
    plate: string;
    make: string;
    model?: string | null;
    color: string;
  };
  ownerPhoneMasked?: string;
  /** Owner opted in — finder may open WhatsApp to contact them directly */
  isPhoneNumberAllow?: boolean;
  whatsappHref?: string | null;
  rewardPkr?: number | null;
  lastSeenCity?: string | null;
  lostMessage?: string | null;
  metadata?: Record<string, unknown>;
}

export function deriveTagTitle(tag: Pick<ITag, 'productType' | 'title' | 'vehicle'>): string {
  if (typeof tag.title === 'string' && tag.title.trim()) return tag.title.trim();
  const pt = normalizeProductType(tag.productType);
  if (pt === 'CAR' && tag.vehicle) {
    const m = tag.vehicle.model?.trim();
    return `${tag.vehicle.color} ${tag.vehicle.make}${m ? ` ${m}` : ''}`;
  }
  return productTypeAlertFragment(pt) + ' tag';
}

export function contactMessageItemLabel(tag: Pick<ITag, 'productType' | 'title' | 'vehicle'>): string {
  const pt = normalizeProductType(tag.productType);
  if (pt === 'CAR') {
    if (tag.vehicle) {
      return `${tag.vehicle.color} ${tag.vehicle.make} (${tag.vehicle.plate})`;
    }
    return 'your tag';
  }
  return deriveTagTitle(tag);
}

/** True when the QR has an active-looking public profile */
export function isPublicProfileLive(status: TagStatus, ownerId?: Types.ObjectId): boolean {
  if (!ownerId) return false;
  return status !== 'PRINTED' && status !== 'DISABLED';
}

function ownerWhatsAppHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const text = encodeURIComponent('Hello, I scanned your Qtag tag.');
  return `https://wa.me/${digits}?text=${text}`;
}

function userAllowsDirectPhone(owner: IUser): boolean {
  return Boolean(owner.isPhoneNumberAllow);
}

async function allocateUniqueUid(): Promise<string> {
  for (let tries = 0; tries < 8; tries++) {
    const uid = generateTagUid();
    const exists = await TagModel.exists({ uid });
    if (!exists) return uid;
  }
  throw new Error('Could not allocate a unique tag id');
}

/** Load tag document by public slug (uid). */
export async function getTagByPublicSlug(uid: string) {
  if (!isValidUid(uid)) return null;
  return TagModel.findOne({ uid }).exec();
}

/**
 * Server-side public projection for `/scan/[slug]` and `/t/[uid]` (never expose raw phone beyond optional contact links).
 */
export async function getPublicProfile(rawSlug: string): Promise<PublicScanView | null> {
  const { resolveDevTagUid } = await import('@/lib/dev-test-tags');
  const slug = resolveDevTagUid(rawSlug);
  if (!isValidUid(slug)) return null;

  const tag = await TagModel.findOne({ uid: slug }).lean<ITag>();
  if (!tag) return null;

  const pt = normalizeProductType(tag.productType);

  if (tag.status === 'DISABLED') {
    return { state: 'DISABLED', slug, productType: pt, title: 'Unavailable', typeIcon: productTypeIcon(pt) };
  }

  if (tag.status === 'PRINTED' || !tag.ownerId) {
    const fallback =
      typeof tag.title === 'string' && tag.title.trim()
        ? tag.title.trim()
        : 'Not activated yet';
    return {
      state: 'PRINTED',
      slug,
      productType: pt,
      title: fallback,
      typeIcon: productTypeIcon(pt),
    };
  }

  const owner = await UserModel.findById(tag.ownerId).lean<IUser>();
  if (!owner || owner.status !== 'ACTIVE') {
    return { state: 'DISABLED', slug, productType: pt, title: 'Unavailable', typeIcon: productTypeIcon(pt) };
  }

  const title = deriveTagTitle(tag);
  const isLost = tag.status === 'LOST';

  return {
    state: tag.status,
    slug: tag.uid,
    productType: pt,
    title,
    description: tag.description ?? null,
    typeIcon: productTypeIcon(pt),
    publicName: tag.publicName ?? owner.name ?? 'Owner',
    vehicle: tag.vehicle
      ? {
          plate: tag.vehicle.plate,
          make: tag.vehicle.make,
          model: tag.vehicle.model ?? null,
          color: tag.vehicle.color,
        }
      : undefined,
    ownerPhoneMasked: maskPhone(owner.phone),
    isPhoneNumberAllow: userAllowsDirectPhone(owner),
    whatsappHref: userAllowsDirectPhone(owner) ? ownerWhatsAppHref(owner.phone) : null,
    rewardPkr: tag.rewardPkr ?? null,
    lastSeenCity: tag.lastSeenCity ?? null,
    lostMessage: tag.lostMessage ?? null,
    metadata: (tag.metadata && typeof tag.metadata === 'object' ? tag.metadata : {}) as Record<string, unknown>,
  };
}

export interface CreateProductInput {
  productType: ProductType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export async function createProduct(user: CurrentUserLite, input: CreateProductInput) {
  const uid = await allocateUniqueUid();

  const tag = await TagModel.create({
    uid,
    status: 'PRINTED',
    origin: 'DASHBOARD',
    createdByUserId: user._id,
    productType: input.productType,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    metadata: input.metadata ?? {},
  });

  return {
    tag,
    publicSlug: tag.uid,
    qrCodeUrl: tagScanUrl(tag.uid),
  };
}

export interface ActivateInput {
  productType?: ProductType;
  vehicle?: ITag['vehicle'];
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  publicName: string;
}

export async function activateQR(
  tag: HydratedDocument<ITag>,
  user: CurrentUserLite,
  input: ActivateInput,
) {
  if (tag.status !== 'PRINTED') {
    return { ok: false as const, code: 'CONFLICT' as const, message: 'This tag has already been activated.' };
  }

  const devTest = isDevTestTag(tag.metadata);

  if (!devTest && tag.origin === 'ORDER') {
    if (!tag.orderId) {
      return { ok: false as const, code: 'FORBIDDEN' as const, message: 'This tag is not linked to any order.' };
    }
    const order = await OrderModel.findById(tag.orderId).lean();
    if (!order) {
      return { ok: false as const, code: 'FORBIDDEN' as const, message: 'Order not found for this tag.' };
    }
    if (String(order.userId) !== String(user._id)) {
      return {
        ok: false as const,
        code: 'FORBIDDEN' as const,
        message: 'This tag belongs to another order. If you bought it, contact support.',
      };
    }
  } else if (!devTest) {
    if (!tag.createdByUserId || String(tag.createdByUserId) !== String(user._id)) {
      return { ok: false as const, code: 'FORBIDDEN' as const, message: 'You can only activate tags you created.' };
    }
  }

  const pt = input.productType ?? normalizeProductType(tag.productType);

  tag.ownerId = user._id;
  tag.status = 'ACTIVE';
  tag.activatedAt = new Date();
  tag.publicName = input.publicName.trim();
  tag.productType = pt;

  if (pt === 'CAR') {
    if (!input.vehicle) {
      return { ok: false as const, code: 'VALIDATION_ERROR' as const, message: 'Vehicle details are required.' };
    }
    tag.vehicle = input.vehicle;
    tag.title =
      input.title?.trim() ||
      `${input.vehicle.color} ${input.vehicle.make}${input.vehicle.model ? ` ${input.vehicle.model}` : ''}`;
  } else {
    const t = input.title?.trim() || tag.title;
    if (!t) {
      return { ok: false as const, code: 'VALIDATION_ERROR' as const, message: 'Title is required.' };
    }
    tag.title = t;
    if (input.description !== undefined) tag.description = input.description?.trim() || undefined;
    if (input.metadata !== undefined) tag.metadata = input.metadata ?? {};
  }

  if (input.description !== undefined && pt === 'CAR') {
    tag.description = input.description?.trim() || undefined;
  }
  if (input.metadata !== undefined && pt === 'CAR') {
    tag.metadata = { ...(typeof tag.metadata === 'object' && tag.metadata ? tag.metadata : {}), ...input.metadata };
  }

  await tag.save();

  return {
    ok: true as const,
    tag: {
      id: tag.id,
      uid: tag.uid,
      status: tag.status,
      productType: tag.productType,
      vehicle: tag.vehicle ?? null,
      title: tag.title ?? null,
      publicName: tag.publicName,
      activatedAt: tag.activatedAt,
    },
  };
}

export async function updateProductDetails(
  tagId: string,
  user: CurrentUserLite,
  updates: {
    title?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    publicName?: string;
  },
) {
  const tag = await TagModel.findById(tagId);
  if (!tag) return { ok: false as const, code: 'NOT_FOUND' as const, message: 'Tag not found.' };
  if (String(tag.ownerId) !== String(user._id)) {
    return { ok: false as const, code: 'FORBIDDEN' as const, message: 'This tag does not belong to you.' };
  }

  if (updates.title !== undefined) tag.title = updates.title.trim();
  if (updates.description !== undefined) tag.description = updates.description?.trim() || undefined;
  if (updates.publicName !== undefined) tag.publicName = updates.publicName.trim();
  if (updates.metadata !== undefined) {
    tag.metadata = {
      ...(typeof tag.metadata === 'object' && tag.metadata ? tag.metadata : {}),
      ...updates.metadata,
    };
  }
  await tag.save();

  return {
    ok: true as const,
    tag: {
      id: tag.id,
      uid: tag.uid,
      title: tag.title,
      description: tag.description ?? null,
      metadata: tag.metadata ?? {},
      publicName: tag.publicName ?? null,
    },
  };
}

/**
 * Beacon: log scan + optional owner ping (WhatsApp, SMS fallback on WA failure within attempt).
 */
export async function scanQRHandler(req: NextRequest, slug: string) {
  if (!isValidUid(slug)) return { logged: false as const };

  const tag = await TagModel.findOne({ uid: slug }).select('_id ownerId status productType').lean();
  if (!tag || tag.status === 'PRINTED' || tag.status === 'DISABLED' || !tag.ownerId) {
    return { logged: false as const };
  }

  const owner = await UserModel.findById(tag.ownerId).select('phone status').lean();
  if (!owner || owner.status !== 'ACTIVE') return { logged: false as const };

  const pt = normalizeProductType(tag.productType);

  await ScanModel.create({
    tagId: tag._id,
    ownerId: tag.ownerId,
    productType: pt,
    ip: getClientIp(req),
    userAgent: req.headers.get('user-agent') ?? undefined,
  });

  const throttleMs = env.SCAN_NOTIFY_COOLDOWN_MS;
  if (
    throttleMs > 0 &&
    !rateLimit(`scan-notify:${String(tag._id)}`, 1, throttleMs)
  ) {
    return { logged: true as const, notified: false as const };
  }

  const productWord = productTypeAlertFragment(pt);
  const smsBody = `Qtag: Someone scanned your ${productWord} QR.`;

  let notified = false;
  const wa = await notifyOwnerQrScan(owner.phone, productWord);
  notified = wa.ok;

  if (!wa.ok && env.SMS_PROVIDER && env.SMS_API_KEY) {
    const sms = await sendSms(owner.phone, smsBody);
    notified = sms.ok;
  }

  return { logged: true as const, notified };
}
