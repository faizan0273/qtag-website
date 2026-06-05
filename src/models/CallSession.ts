import { Schema, model, models, type Model, type HydratedDocument, Types } from 'mongoose';

export type CallSessionStatus = 'RINGING' | 'ACTIVE' | 'ENDED' | 'EXPIRED' | 'MISSED';
export type CallProvider = 'WEBRTC' | 'CELLULAR_BRIDGE';
export type CallRole = 'CALLER' | 'OWNER';
export type SignalMessageType = 'offer' | 'answer' | 'ice';

export interface ISignalMessage {
  messageId: string;
  from: CallRole;
  type: SignalMessageType;
  payload: unknown;
  createdAt: Date;
}

export interface ICallSession {
  tagId: Types.ObjectId;
  ownerId: Types.ObjectId;
  uid: string;
  provider: CallProvider;
  status: CallSessionStatus;
  callerTokenHash: string;
  ownerTokenHash: string;
  signals: ISignalMessage[];
  ip?: string;
  userAgent?: string;
  startedAt: Date;
  answeredAt?: Date;
  endedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CallSessionDoc = HydratedDocument<ICallSession>;

const SignalMessageSchema = new Schema<ISignalMessage>(
  {
    messageId: { type: String, required: true },
    from: { type: String, enum: ['CALLER', 'OWNER'], required: true },
    type: { type: String, enum: ['offer', 'answer', 'ice'], required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { _id: false },
);

const CallSessionSchema = new Schema<ICallSession>(
  {
    tagId: { type: Schema.Types.ObjectId, ref: 'Tag', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    uid: { type: String, required: true, index: true },
    provider: { type: String, enum: ['WEBRTC', 'CELLULAR_BRIDGE'], default: 'WEBRTC', index: true },
    status: {
      type: String,
      enum: ['RINGING', 'ACTIVE', 'ENDED', 'EXPIRED', 'MISSED'],
      default: 'RINGING',
      index: true,
    },
    callerTokenHash: { type: String, required: true, index: true },
    ownerTokenHash: { type: String, required: true, index: true },
    signals: { type: [SignalMessageSchema], default: [] },
    ip: { type: String },
    userAgent: { type: String },
    startedAt: { type: Date, default: Date.now, required: true },
    answeredAt: { type: Date },
    endedAt: { type: Date },
    expiresAt: { type: Date, required: true, index: { expires: 60 * 60 } },
  },
  { timestamps: true },
);

CallSessionSchema.index({ uid: 1, createdAt: -1 });

export const CallSessionModel: Model<ICallSession> =
  (models.CallSession as Model<ICallSession>) ??
  model<ICallSession>('CallSession', CallSessionSchema);
