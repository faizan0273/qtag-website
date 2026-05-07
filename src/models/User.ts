import { Schema, model, models, type Model, type HydratedDocument } from 'mongoose';

export interface IUser {
  phone: string;            // E.164, e.g. +923001234567
  phoneVerified: boolean;
  name?: string;
  email?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  locale: 'en' | 'ur';
  createdAt: Date;
  updatedAt: Date;
}

export type UserDoc = HydratedDocument<IUser>;

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    phoneVerified: { type: Boolean, default: false },
    name: { type: String, trim: true, maxlength: 80 },
    email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER', index: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE', index: true },
    locale: { type: String, enum: ['en', 'ur'], default: 'en' },
  },
  { timestamps: true },
);

export const UserModel: Model<IUser> =
  (models.User as Model<IUser>) ?? model<IUser>('User', UserSchema);
