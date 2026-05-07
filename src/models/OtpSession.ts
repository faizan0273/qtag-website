import { Schema, model, models, type Model } from 'mongoose';

export interface IOtpSession {
  phone: string;          // E.164
  codeHash: string;       // bcrypt
  attempts: number;
  channel: 'whatsapp' | 'sms';
  expiresAt: Date;
  consumedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSessionSchema = new Schema<IOtpSession>(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0, min: 0 },
    channel: { type: String, enum: ['whatsapp', 'sms'], default: 'whatsapp' },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Mongo TTL: deletes documents 1 hour after expiresAt (covers grace period).
OtpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
// "Most recent unconsumed for this phone" query
OtpSessionSchema.index({ phone: 1, consumedAt: 1, createdAt: -1 });

export const OtpSessionModel: Model<IOtpSession> =
  (models.OtpSession as Model<IOtpSession>) ??
  model<IOtpSession>('OtpSession', OtpSessionSchema);
