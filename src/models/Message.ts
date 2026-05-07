import { Schema, model, models, type Model, Types } from 'mongoose';

export interface IMessage {
  tagId: Types.ObjectId;
  ownerId: Types.ObjectId;
  scanId?: Types.ObjectId;
  direction: 'FINDER_TO_OWNER' | 'OWNER_TO_FINDER';
  body: string;
  // Finder's phone — kept hashed so we can re-block abusers without storing plaintext
  finderPhoneHash?: string;
  // Whether the WhatsApp/SMS was successfully dispatched to the owner
  delivered: boolean;
  deliveryError?: string;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    tagId: { type: Schema.Types.ObjectId, ref: 'Tag', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scanId: { type: Schema.Types.ObjectId, ref: 'Scan' },
    direction: {
      type: String,
      enum: ['FINDER_TO_OWNER', 'OWNER_TO_FINDER'],
      default: 'FINDER_TO_OWNER',
    },
    body: { type: String, required: true, maxlength: 2000 },
    finderPhoneHash: String,
    delivered: { type: Boolean, default: false },
    deliveryError: String,
    ip: String,
  },
  { timestamps: true },
);

MessageSchema.index({ tagId: 1, createdAt: -1 });
MessageSchema.index({ ownerId: 1, createdAt: -1 });

export const MessageModel: Model<IMessage> =
  (models.Message as Model<IMessage>) ?? model<IMessage>('Message', MessageSchema);
