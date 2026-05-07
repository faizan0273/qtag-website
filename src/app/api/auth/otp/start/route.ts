import type { NextRequest } from 'next/server';
import { ok, bad, fromZod, getClientIp, safe } from '@/lib/api-helpers';
import { otpStartSchema } from '@/lib/validation';
import { normalizePkPhone } from '@/lib/phone';
import { rateLimit } from '@/lib/rate-limit';
import { startOtp } from '@/lib/otp';
import { env } from '@/lib/env';
export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  return safe(async () => {
    const json = await req.json().catch(() => null);
    const parsed = otpStartSchema.safeParse(json);
    if (!parsed.success) return fromZod(parsed.error);

    const phone = normalizePkPhone(parsed.data.phone);
    if (!phone) {
      return bad('VALIDATION_ERROR', 'Please enter a valid Pakistani phone number.');
    }

    // Rate limits
    const ip = getClientIp(req);
    if (!rateLimit(`otp:start:phone:${phone}`, env.RATE_LIMIT_OTP_PER_PHONE_PER_15M, 15 * 60_000)) {
      return bad('RATE_LIMITED', 'Too many requests for this number. Try again in 15 minutes.');
    }
    if (!rateLimit(`otp:start:ip:${ip}`, env.RATE_LIMIT_OTP_PER_IP_PER_HOUR, 60 * 60_000)) {
      return bad('RATE_LIMITED', 'Too many requests from your network. Try again in an hour.');
    }

    const result = await startOtp(phone);
    if (!result.ok) {
      return bad('INTERNAL_ERROR', 'We could not send the code right now. Please try again.');
    }

    return ok({
      sent: true,
      channel: result.channel,
      // Dev or OTP_TEST_EXPOSE_CODE staging: return the code for easier testing
      ...(result.devCode ? { devCode: result.devCode } : {}),
    });
  });
}
