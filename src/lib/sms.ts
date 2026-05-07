import { env } from './env';

/**
 * SMS — fallback channel when WhatsApp delivery fails.
 *
 * This is a stub. To wire up a real provider:
 *   1. Set SMS_PROVIDER, SMS_API_KEY, SMS_SENDER_ID in your .env
 *   2. Add a case for your provider below.
 *
 * Recommended for Pakistan: Branded.com.pk, Veevotech, Bizsms.pk, or Twilio.
 */

interface SmsResult {
  ok: boolean;
  providerRef?: string;
  error?: string;
}

export async function sendSms(toE164: string, body: string): Promise<SmsResult> {
  if (!env.SMS_PROVIDER || !env.SMS_API_KEY) {
    // eslint-disable-next-line no-console
    console.log('\n💬 [SMS:dev] →', toE164, '\n   ', body, '\n');
    return { ok: true, providerRef: 'dev-stub' };
  }

  switch (env.SMS_PROVIDER) {
    case 'branded':
    case 'veevotech':
    case 'bizsms':
      // TODO: implement provider-specific HTTP call.
      // The provider returns a unique ID; store it as providerRef.
      // eslint-disable-next-line no-console
      console.warn(`[sms] provider "${env.SMS_PROVIDER}" not yet implemented`);
      return { ok: false, error: 'SMS provider not implemented' };

    default:
      return { ok: false, error: `Unknown SMS provider: ${env.SMS_PROVIDER}` };
  }
}
