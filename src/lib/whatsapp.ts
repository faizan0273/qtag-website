import { env, isWhatsAppConfigured } from './env';

/**
 * WhatsApp client — wraps Meta's Cloud API.
 *
 * In development, if WHATSAPP_ACCESS_TOKEN isn't set, messages are logged to
 * the server console instead of sent. This means you can run the app locally
 * with zero WhatsApp setup and still complete OTP login: read the code from
 * the terminal.
 *
 * The rest of the codebase only imports `sendWhatsAppMessage()` and
 * `sendWhatsAppTemplate()` — provider can be swapped without changes elsewhere.
 */

const META_API_VERSION = 'v21.0';

interface SendResult {
  ok: boolean;
  providerRef?: string;
  error?: string;
}

/* -------------------------------------------------------------------------- */
/*  Free-form message (only valid inside a 24h customer-care window)          */
/* -------------------------------------------------------------------------- */

export async function sendWhatsAppMessage(
  toE164: string,
  body: string,
): Promise<SendResult> {
  if (!isWhatsAppConfigured) {
    // eslint-disable-next-line no-console
    console.log('\n📱 [WhatsApp:dev] →', toE164, '\n   ', body, '\n');
    return { ok: true, providerRef: 'dev-stub' };
  }

  const to = toE164.replace(/^\+/, ''); // Meta wants no leading +
  const url = `https://graph.facebook.com/${META_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      }),
    });

    const json = (await res.json()) as { messages?: Array<{ id: string }>; error?: { message: string } };
    if (!res.ok) return { ok: false, error: json.error?.message ?? 'Unknown error' };
    return { ok: true, providerRef: json.messages?.[0]?.id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/* -------------------------------------------------------------------------- */
/*  Template message (always allowed, required outside 24h window)            */
/*                                                                            */
/*  Templates must be approved in Meta Business Manager beforehand.           */
/*  We expose two: the OTP template and the scan-alert template.              */
/* -------------------------------------------------------------------------- */

interface TemplateParams {
  /** Body parameters in order, inserted into {{1}}, {{2}}, ... */
  body?: string[];
}

async function sendTemplate(
  toE164: string,
  templateName: string,
  params: TemplateParams,
): Promise<SendResult> {
  if (!isWhatsAppConfigured) {
    // eslint-disable-next-line no-console
    console.log(
      `\n📱 [WhatsApp:dev] template "${templateName}" →`,
      toE164,
      '\n    params:',
      params.body,
      '\n',
    );
    return { ok: true, providerRef: 'dev-stub' };
  }

  const to = toE164.replace(/^\+/, '');
  const url = `https://graph.facebook.com/${META_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const components = params.body?.length
    ? [
        {
          type: 'body',
          parameters: params.body.map((text) => ({ type: 'text', text })),
        },
      ]
    : [];

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: env.WHATSAPP_TEMPLATE_LANG },
          components,
        },
      }),
    });
    const json = (await res.json()) as { messages?: Array<{ id: string }>; error?: { message: string } };
    if (!res.ok) return { ok: false, error: json.error?.message ?? 'Unknown error' };
    return { ok: true, providerRef: json.messages?.[0]?.id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Send the OTP template. Body params: [code, validityMinutes]. */
export async function sendOtpTemplate(toE164: string, code: string, validMin = 5): Promise<SendResult> {
  return sendTemplate(toE164, env.WHATSAPP_OTP_TEMPLATE, {
    body: [code, String(validMin)],
  });
}

/**
 * Send the scan-alert template to the owner.
 * Body params: [vehicleLabel, finderMessage, when].
 */
export async function sendScanAlertTemplate(
  toE164: string,
  vehicleLabel: string,
  finderMessage: string,
  when: string,
): Promise<SendResult> {
  return sendTemplate(toE164, env.WHATSAPP_SCAN_ALERT_TEMPLATE, {
    body: [vehicleLabel, finderMessage, when],
  });
}

/** Owner ping when a public QR landing page fires the scan beacon (unified wording). */
export async function notifyOwnerQrScan(toE164: string, productFragment: string): Promise<SendResult> {
  const when = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
  const body =
    `${env.NEXT_PUBLIC_BRAND_NAME}: Someone scanned your ${productFragment} QR at ${when}.`;
  return sendWhatsAppMessage(toE164, body);
}

/**
 * Best-effort owner notification.
 *
 * When WhatsApp Cloud API is configured, we send the **approved template first**.
 * Business-initiated alerts almost never qualify for free-form session messages
 * (those only work inside a 24h window after the user messaged your number).
 *
 * If the template fails, we try a free-form message as a fallback (e.g. rich
 * text when the window is open).
 */
export async function notifyOwner(
  toE164: string,
  vehicleLabel: string,
  finderMessage: string,
): Promise<SendResult> {
  const when = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
  const body =
    `🔔 ${env.NEXT_PUBLIC_BRAND_NAME}\n\n` +
    `Someone scanned your tag for ${vehicleLabel}.\n\n` +
    `They wrote:\n"${finderMessage}"\n\n` +
    `Time: ${when}\n` +
    `Reply on your dashboard to chat with them.`;

  const finderShort = finderMessage.slice(0, 200);

  if (isWhatsAppConfigured) {
    const tpl = await sendScanAlertTemplate(toE164, vehicleLabel, finderShort, when);
    if (tpl.ok) return tpl;

    // eslint-disable-next-line no-console
    console.warn('[WhatsApp] scan-alert template failed:', tpl.error);

    const direct = await sendWhatsAppMessage(toE164, body);
    if (direct.ok) return direct;

    // eslint-disable-next-line no-console
    console.warn('[WhatsApp] session message failed:', direct.error);

    return {
      ok: false,
      error: [tpl.error, direct.error].filter(Boolean).join(' · '),
    };
  }

  return sendWhatsAppMessage(toE164, body);
}

/**
 * Privacy relay — owner has not allowed direct phone/WhatsApp on the scan page.
 * Delivered from the Qtag business WhatsApp number, not the finder's SIM.
 */
export async function notifyOwnerRelay(
  toE164: string,
  itemLabel: string,
  finderMessage: string,
  finderPhone?: string | null,
): Promise<SendResult> {
  const when = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
  const companyPhone = env.NEXT_PUBLIC_COMPANY_CONTACT_PHONE?.trim();
  const fromLine = companyPhone
    ? `${env.NEXT_PUBLIC_BRAND_NAME} (${companyPhone})`
    : env.NEXT_PUBLIC_BRAND_NAME;

  const finderLine = finderPhone
    ? `\n\nFinder contact (shared with you): ${finderPhone}`
    : '\n\n(Finder did not share their number.)';

  const body =
    `🔔 ${fromLine}\n\n` +
    `Someone scanned your ${itemLabel} tag and sent this message through our relay:\n\n` +
    `"${finderMessage}"` +
    finderLine +
    `\n\nTime: ${when}`;

  const finderShort = finderMessage.slice(0, 200);

  if (isWhatsAppConfigured) {
    const tpl = await sendScanAlertTemplate(toE164, itemLabel, finderShort, when);
    if (tpl.ok) return tpl;

    const direct = await sendWhatsAppMessage(toE164, body);
    if (direct.ok) return direct;

    return {
      ok: false,
      error: [tpl.error, direct.error].filter(Boolean).join(' · '),
    };
  }

  return sendWhatsAppMessage(toE164, body);
}
