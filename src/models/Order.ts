import { Schema, model, models, type Model, type HydratedDocument, Types } from 'mongoose';

export type OrderStatus =
  | 'PENDING'        // just placed, awaiting payment if applicable
  | 'PAID'           // for COD this becomes PAID on delivery; we set it here for now (MVP)
  | 'FULFILLED'      // tags generated, ready to ship
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface IShippingAddress {
  fullName: string;
  phone: string;        // E.164
  address1: string;
  address2?: string;
  city: string;
  province: string;
}

export type PaymentMethod = 'COD' | 'JAZZCASH';

export type PaymentStatus =
  | 'NOT_REQUIRED' // COD orders — paid on delivery, no online step
  | 'PENDING'     // JazzCash payment initiated, awaiting result
  | 'PAID'        // JazzCash transaction succeeded
  | 'FAILED'      // JazzCash transaction declined / failed verification
  | 'CANCELLED';  // User abandoned or JazzCash signalled cancellation

export interface IOrder {
  userId: Types.ObjectId;
  quantity: number;
  /** Catalogue SKU when ordering from /shop; omit for legacy Vehicle QR Sticker checkout. */
  shopSku?: string;
  /** QR tag count reserved (quantity × catalog tags-per-pack). Omitted on older orders. */
  reservedTagCount?: number;
  subtotalPkr: number;
  shippingPkr: number;
  codFeePkr: number;
  totalPkr: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  shipping: IShippingAddress;
  notes?: string;
  // Tag UIDs reserved for this order (length === reservedTagCount ?? quantity for legacy)
  tagUids: string[];
  // Courier / tracking — populated later when shipped
  courier?: string;
  trackingCode?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  // ---- Online payment tracking (JazzCash etc.) ----
  paymentStatus?: PaymentStatus;
  paymentRef?: string;          // Our outbound `pp_TxnRefNo`
  paymentProviderTxnId?: string; // JazzCash's `pp_RetreivalReferenceNo`
  paymentResponseCode?: string;
  paymentResponseMessage?: string;
  paidAt?: Date;
  paymentRawResponse?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDoc = HydratedDocument<IOrder>;

const ShippingSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    address1: { type: String, required: true, trim: true, maxlength: 200 },
    address2: { type: String, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    province: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quantity: { type: Number, required: true, min: 1, max: 100 },
    shopSku: { type: String, trim: true, index: true },
    reservedTagCount: { type: Number, min: 1 },
    subtotalPkr: { type: Number, required: true, min: 0 },
    shippingPkr: { type: Number, required: true, min: 0 },
    codFeePkr: { type: Number, required: true, min: 0 },
    totalPkr: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['COD', 'JAZZCASH'], default: 'COD' },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FULFILLED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    shipping: { type: ShippingSchema, required: true },
    notes: { type: String, trim: true, maxlength: 500 },
    tagUids: { type: [String], default: [] },
    courier: String,
    trackingCode: String,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    paymentStatus: {
      type: String,
      enum: ['NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED', 'CANCELLED'],
      default: 'NOT_REQUIRED',
      index: true,
    },
    paymentRef: { type: String, index: true, sparse: true },
    paymentProviderTxnId: { type: String },
    paymentResponseCode: { type: String },
    paymentResponseMessage: { type: String },
    paidAt: { type: Date },
    paymentRawResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

OrderSchema.index({ userId: 1, createdAt: -1 });

export const OrderModel: Model<IOrder> =
  (models.Order as Model<IOrder>) ?? model<IOrder>('Order', OrderSchema);
