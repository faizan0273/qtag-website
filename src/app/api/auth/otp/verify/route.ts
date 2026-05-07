import type { NextRequest } from 'next/server';
import { ok, bad, fromZod, safe } from '@/lib/api-helpers';
import { otpVerifySchema } from '@/lib/validation';
import { normalizePkPhone } from '@/lib/phone';
import { verifyOtp } from '@/lib/otp';
import { connectDB } from '@/lib/db';
import { UserModel } from '@/models/User';
import { signSession, setSessionCookie } from '@/lib/auth';
import { adminPhones } from '@/lib/env';
export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  return safe(async () => {
    const json = await req.json().catch(() => null);
    const parsed = otpVerifySchema.safeParse(json);
    if (!parsed.success) return fromZod(parsed.error);

    const phone = normalizePkPhone(parsed.data.phone);
    if (!phone) return bad('VALIDATION_ERROR', 'Please enter a valid Pakistani phone number.');

    const result = await verifyOtp(phone, parsed.data.code);
    if (!result.ok) {
      switch (result.reason) {
        case 'INVALID_CODE':
          return bad('UNAUTHORIZED', 'That code is not correct. Try again.');
        case 'EXPIRED':
          return bad('UNAUTHORIZED', 'This code has expired. Please request a new one.');
        case 'TOO_MANY_ATTEMPTS':
          return bad('RATE_LIMITED', 'Too many wrong attempts. Please request a new code.');
        case 'NO_SESSION':
        default:
          return bad('UNAUTHORIZED', 'Please request a new code.');
      }
    }

    // Find or create user
    await connectDB();
    let user = await UserModel.findOne({ phone });
    if (!user) {
      const role = adminPhones.includes(phone) ? 'ADMIN' : 'USER';
      user = await UserModel.create({ phone, phoneVerified: true, role });
    } else {
      if (!user.phoneVerified) {
        user.phoneVerified = true;
        await user.save();
      }
    }

    // Sign session and set cookie
    const token = await signSession({
      uid: user.id as string,
      phone: user.phone,
      role: user.role,
    });
    await setSessionCookie(token);

    return ok({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name ?? null,
        role: user.role,
        isNew: !user.name,
      },
    });
  });
}
