import { Schema, model, models, type Model, type HydratedDocument, Types } from 'mongoose';
import { PRODUCT_TYPES, TAG_ORIGINS, type ProductType, type TagOrigin } from '@/lib/product-type';

export type TagStatus = 'PRINTED' | 'ACTIVE' | 'LOST' | 'FOUND' | 'DISABLED';

export interface IVehicle {
  plate: string;        // uppercase, e.g. "LEC-1234"
  make: string;
  model?: string;
  color: string;
  year?: number;
}

export interface ITag {
  uid: string;          // 8 chars, see lib/uid.ts — public slug for URLs
  status: TagStatus;
  ownerId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  /** ORDER = physical shop sticker; DASHBOARD = user-created digital tag */
  origin?: TagOrigin;
  /** Who created a DASHBOARD tag (must activate while signed in as this user) */
  createdByUserId?: Types.ObjectId;
  productType: ProductType;
  /** Primary display title (vehicle summary for CAR if unset on legacy rows) */
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;

  vehicle?: IVehicle;
  publicName?: string;  // owner-defined display name (first name + initial)

  // Lost-mode fields
  lastSeenCity?: string;
  rewardPkr?: number;
  lostMessage?: string;
  lostAt?: Date;
  foundAt?: Date;

  activatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TagDoc = HydratedDocument<ITag>;

const VehicleSchema = new Schema<IVehicle>(
  {
    plate: { type: String, trim: true, uppercase: true, maxlength: 15, required: true },
    make: { type: String, trim: true, maxlength: 40, required: true },
    model: { type: String, trim: true, maxlength: 40 },
    color: { type: String, trim: true, maxlength: 30, required: true },
    year: { type: Number, min: 1950, max: 2100 },
  },
  { _id: false },
);

const TagSchema = new Schema<ITag>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['PRINTED', 'ACTIVE', 'LOST', 'FOUND', 'DISABLED'],
      default: 'PRINTED',
      index: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    origin: {
      type: String,
      enum: [...TAG_ORIGINS],
      default: 'ORDER',
      index: true,
    },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    productType: {
      type: String,
      enum: [...PRODUCT_TYPES],
      default: 'CAR',
      index: true,
    },
    title: { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    vehicle: VehicleSchema,
    publicName: { type: String, trim: true, maxlength: 40 },

    lastSeenCity: { type: String, trim: true, maxlength: 80 },
    rewardPkr: { type: Number, min: 0 },
    lostMessage: { type: String, trim: true, maxlength: 280 },
    lostAt: Date,
    foundAt: Date,

    activatedAt: Date,
  },
  { timestamps: true },
);

// Composite index for the dashboard "my tags, newest first" query
TagSchema.index({ ownerId: 1, createdAt: -1 });

export const TagModel: Model<ITag> =
  (models.Tag as Model<ITag>) ?? model<ITag>('Tag', TagSchema);
