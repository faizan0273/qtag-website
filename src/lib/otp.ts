import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import { OtpSessionModel } from '@/models/OtpSession';
import { sendOtpTemplate } from './whatsapp';
import { sendSms } from './sms';
import { env } from './env';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const BCRYPT_ROUNDS = 8;

/**
 * Generate a cryptographically random 6-digit OTP.
 * `Math.random` is intentionally NOT used — it's not random enough for security.
 */
function generateCode(): string {
  // Use Web Crypto (works in both Node 20+ and Edge)
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0]! % 1_000_000).padStart(6, '0');
}

interface StartOtpResult {
  ok: boolean;
  channel: 'whatsapp' | 'sms';
  /** Returned only in development to help testing — never in production. */
  devCode?: string;
}

/**
 * Start an OTP flow:
 *  1. Generate a code.
 *  2. Hash it and persist the session.
 *  3. Send via WhatsApp; fall back to SMS if WhatsApp fails.
 */
export async function startOtp(phoneE164: string): Promise<StartOtpResult> {
  await connectDB();

  // Invalidate any prior unconsumed sessions for this phone
  await OtpSessionModel.updateMany(
    { phone: phoneE164, consumedAt: null },
    { $set: { consumedAt: new Date() } },
  );

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await OtpSessionModel.create({
    phone: phoneE164,
    codeHash,
    attempts: 0,
    channel: 'whatsapp',
    expiresAt,
  });

  // Send via WhatsApp first
  const wa = await sendOtpTemplate(phoneE164, code, 5);
  if (wa.ok) {
    return {
      ok: true,
      channel: 'whatsapp',
      ...(env.NODE_ENV !== 'production' ? { devCode: code } : {}),
    };
  }

  // Fall back to SMS
  const sms = await sendSms(phoneE164, `Your ${env.NEXT_PUBLIC_BRAND_NAME} code is ${code}. Valid for 5 minutes.`);
  if (sms.ok) {
    return {
      ok: true,
      channel: 'sms',
      ...(env.NODE_ENV !== 'production' ? { devCode: code } : {}),
    };
  }

  // Both failed — surface the dev code to make local debugging possible
  return {
    ok: false,
    channel: 'whatsapp',
    ...(env.NODE_ENV !== 'production' ? { devCode: code } : {}),
  };
}

interface VerifyOtpResult {
  ok: boolean;
  reason?: 'INVALID_CODE' | 'EXPIRED' | 'TOO_MANY_ATTEMPTS' | 'NO_SESSION';
}

/** Verify an OTP code against the most recent unconsumed session for this phone. */
export async function verifyOtp(phoneE164: string, code: string): Promise<VerifyOtpResult> {
  await connectDB();

  const session = await OtpSessionModel.findOne({
    phone: phoneE164,
    consumedAt: null,
  }).sort({ createdAt: -1 });

  if (!session) return { ok: false, reason: 'NO_SESSION' };

  if (session.expiresAt < new Date()) {
    return { ok: false, reason: 'EXPIRED' };
  }

  if (session.attempts >= MAX_VERIFY_ATTEMPTS) {
    return { ok: false, reason: 'TOO_MANY_ATTEMPTS' };
  }

  const match = await bcrypt.compare(code, session.codeHash);
  if (!match) {
    session.attempts += 1;
    await session.save();
    return { ok: false, reason: 'INVALID_CODE' };
  }

  session.consumedAt = new Date();
  await session.save();
  return { ok: true };
}
