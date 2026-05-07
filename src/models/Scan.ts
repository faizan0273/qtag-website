import { Schema, model, models, type Model, Types } from 'mongoose';
import { PRODUCT_TYPES, type ProductType } from '@/lib/product-type';

export interface IScan {
  tagId: Types.ObjectId;
  ownerId?: Types.ObjectId;
  productType?: ProductType;
  ip?: string;
  userAgent?: string;
  geoCity?: string;
  geoCountry?: string;
  lat?: number;
  lng?: number;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScanSchema = new Schema<IScan>(
  {
    tagId: { type: Schema.Types.ObjectId, ref: 'Tag', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    productType: { type: String, enum: [...PRODUCT_TYPES], index: true },
    ip: String,
    userAgent: String,
    geoCity: String,
    geoCountry: String,
    lat: Number,
    lng: Number,
    isFlagged: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

ScanSchema.index({ tagId: 1, createdAt: -1 });
ScanSchema.index({ ownerId: 1, createdAt: -1 });
ScanSchema.index({ ip: 1, createdAt: -1 });

export const ScanModel: Model<IScan> =
  (models.Scan as Model<IScan>) ?? model<IScan>('Scan', ScanSchema);
