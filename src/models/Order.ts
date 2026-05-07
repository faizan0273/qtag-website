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

export interface IOrder {
  userId: Types.ObjectId;
  quantity: number;
  subtotalPkr: number;
  shippingPkr: number;
  codFeePkr: number;
  totalPkr: number;
  paymentMethod: 'COD';
  status: OrderStatus;
  shipping: IShippingAddress;
  notes?: string;
  // Tag UIDs reserved for this order (length === quantity)
  tagUids: string[];
  // Courier / tracking — populated later when shipped
  courier?: string;
  trackingCode?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
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
    subtotalPkr: { type: Number, required: true, min: 0 },
    shippingPkr: { type: Number, required: true, min: 0 },
    codFeePkr: { type: Number, required: true, min: 0 },
    totalPkr: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
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
  },
  { timestamps: true },
);

OrderSchema.index({ userId: 1, createdAt: -1 });

export const OrderModel: Model<IOrder> =
  (models.Order as Model<IOrder>) ?? model<IOrder>('Order', OrderSchema);
