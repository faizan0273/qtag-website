import 'server-only';
import { z } from 'zod';

/**
 * Validate environment variables at boot.
 *
 * If a required variable is missing or malformed, the process throws BEFORE
 * any request is served. This is intentional — we'd rather fail loudly at
 * startup than ship a half-broken build to production.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_BRAND_NAME: z.string().default('Scano'),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_TTL: z.string().default('7d'),
  /**
   * If true, OTP responses include `devCode` even when NODE_ENV=production.
   * Use only on Netlify/staging for testing — never on a public production site.
   */
  OTP_TEST_EXPOSE_CODE: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),

  // WhatsApp (optional in dev)
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_OTP_TEMPLATE: z.string().default('qrsaathi_otp'),
  WHATSAPP_SCAN_ALERT_TEMPLATE: z.string().default('qrsaathi_scan_alert'),
  WHATSAPP_TEMPLATE_LANG: z.string().default('en'),

  // SMS (optional)
  SMS_PROVIDER: z.string().optional(),
  SMS_API_KEY: z.string().optional(),
  SMS_SENDER_ID: z.string().optional(),

  // Pricing
  PRODUCT_PRICE_PKR: z.coerce.number().int().positive().default(599),
  SHIPPING_FEE_PKR: z.coerce.number().int().nonnegative().default(200),
  FREE_SHIPPING_THRESHOLD_PKR: z.coerce.number().int().nonnegative().default(1500),
  COD_FEE_PKR: z.coerce.number().int().nonnegative().default(50),

  // Rate limits
  RATE_LIMIT_OTP_PER_PHONE_PER_15M: z.coerce.number().int().positive().default(3),
  RATE_LIMIT_OTP_PER_IP_PER_HOUR: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_CONTACT_PER_IP_PER_HOUR: z.coerce.number().int().positive().default(20),
  /** Minimum ms between owner push notifications for beacon scans (same tag). 0 = every scan. */
  SCAN_NOTIFY_COOLDOWN_MS: z.coerce.number().int().nonnegative().default(600_000),

  // Admin bootstrap
  ADMIN_PHONES: z.string().default(''),
});

/**
 * During `next build`, Next may load API route modules before all Production env vars
 * are available (or Vercel omits secrets from the build environment). Supply inert
 * placeholders only for that phase so compilation succeeds; runtime uses real values.
 */
function withBuildTimeEnvDefaults(): NodeJS.ProcessEnv {
  const envCopy = { ...process.env } as NodeJS.ProcessEnv;
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    return envCopy;
  }

  if (!envCopy.MONGODB_URI) {
    envCopy.MONGODB_URI = 'mongodb://127.0.0.1:27017/__next_build_placeholder__';
  }
  if (!envCopy.JWT_SECRET || envCopy.JWT_SECRET.length < 32) {
    envCopy.JWT_SECRET = '00000000000000000000000000000000';
  }
  if (!envCopy.NEXT_PUBLIC_APP_URL) {
    envCopy.NEXT_PUBLIC_APP_URL = 'https://example.com';
  }
  return envCopy;
}

const parsed = EnvSchema.safeParse(withBuildTimeEnvDefaults());

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables. See .env.example.');
}

export const env = parsed.data;

/** True if WhatsApp credentials are configured (i.e. we should send real messages). */
export const isWhatsAppConfigured = Boolean(
  env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID,
);

/** Phones that should be elevated to ADMIN on first login. */
export const adminPhones = env.ADMIN_PHONES.split(',')
  .map((p) => p.trim())
  .filter(Boolean);
