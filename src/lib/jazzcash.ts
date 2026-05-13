import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';
import { env, isJazzCashConfigured } from './env';

/**
 * JazzCash — HTTP Post (Page Redirection) integration.
 *
 * Flow:
 *   1. We build a signed form payload (`buildJazzCashRequest`) and render an
 *      auto-submitting form pointing at `getJazzCashPostUrl()`.
 *   2. The customer completes payment on JazzCash's hosted page.
 *   3. JazzCash POSTs the result back to `pp_ReturnURL`. We verify the
 *      `pp_SecureHash` using `verifyJazzCashResponse` and update the order.
 *
 * Integrity hash spec (per JazzCash HTTP Post integration guide):
 *   - Take all `pp_*` and `ppmpf_*` fields with non-empty string values,
 *     excluding `pp_SecureHash`.
 *   - Sort by key, case-insensitive ascending.
 *   - Build:  hashData = IntegritySalt + '&' + value1 + '&' + value2 + ...
 *   - secureHash = HMAC_SHA256(hashData, IntegritySalt) as hex (uppercase).
 */

export const JAZZCASH_SANDBOX_URL =
  'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';
export const JAZZCASH_PRODUCTION_URL =
  'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';

export type JazzCashFields = Record<string, string>;

/** The hosted-checkout endpoint to POST to. */
export function getJazzCashPostUrl(): string {
  if (env.JAZZCASH_POST_URL && env.JAZZCASH_POST_URL.trim() !== '') {
    return env.JAZZCASH_POST_URL.trim();
  }
  return env.JAZZCASH_USE_SANDBOX ? JAZZCASH_SANDBOX_URL : JAZZCASH_PRODUCTION_URL;
}

/** The URL JazzCash should POST the result back to. */
export function getJazzCashReturnUrl(): string {
  if (env.JAZZCASH_RETURN_URL && env.JAZZCASH_RETURN_URL.trim() !== '') {
    return env.JAZZCASH_RETURN_URL.trim();
  }
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  return `${base}/api/payments/jazzcash/return`;
}

function assertConfigured(): void {
  if (!isJazzCashConfigured) {
    throw new Error(
      'JazzCash is not configured. Set JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, and JAZZCASH_INTEGRITY_SALT.',
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  Hashing                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Compute the JazzCash `pp_SecureHash` for the given fields.
 * Caller may include or omit `pp_SecureHash` — it is ignored either way.
 */
export function computeSecureHash(fields: JazzCashFields, salt: string): string {
  const keys = Object.keys(fields)
    .filter((k) => k !== 'pp_SecureHash')
    .filter((k) => k.startsWith('pp_') || k.startsWith('ppmpf_'))
    .filter((k) => {
      const v = fields[k];
      return typeof v === 'string' && v.trim() !== '';
    })
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const concat = keys.map((k) => fields[k]).join('&');
  const hashData = `${salt}&${concat}`;
  return createHmac('sha256', salt).update(hashData, 'utf8').digest('hex').toUpperCase();
}

/* -------------------------------------------------------------------------- */
/*  Date helpers (Asia/Karachi)                                               */
/* -------------------------------------------------------------------------- */

const KARACHI_TZ = 'Asia/Karachi';

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0');
}

/** Format a Date as yyyyMMddHHmmss in Asia/Karachi (JazzCash expectation). */
export function formatJazzCashDateTime(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: KARACHI_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  // en-GB sometimes gives hour "24" at midnight — coerce to "00".
  const hour = get('hour') === '24' ? '00' : get('hour');
  return `${get('year')}${get('month')}${get('day')}${hour}${get('minute')}${get('second')}`;
}

/* -------------------------------------------------------------------------- */
/*  Reference number                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Generate a JazzCash transaction reference. Format: "T" + yyMMddHHmmss + 6 hex chars.
 * Total length 19, within JazzCash's 20-char limit.
 */
export function generateJazzCashTxnRef(now: Date = new Date()): string {
  const ts = formatJazzCashDateTime(now).slice(2); // yyMMddHHmmss (12)
  const rand = randomBytes(3).toString('hex'); // 6 chars
  return `T${ts}${rand}`;
}

/* -------------------------------------------------------------------------- */
/*  Build the request payload                                                 */
/* -------------------------------------------------------------------------- */

export interface BuildJazzCashRequestInput {
  /** Order total in PKR (integer rupees). Converted to paisas internally. */
  amountPkr: number;
  /** Unique transaction reference for this attempt (max 20 chars, starts with 'T'). */
  txnRefNo: string;
  /** Short human-readable description shown on JazzCash's page. */
  description: string;
  /** A bill reference (e.g. our internal order id). Max ~20 chars. */
  billReference: string;
  /** Where JazzCash should POST the result. Defaults to env-configured URL. */
  returnUrl?: string;
  /** Optional 5 merchant-defined fields (`ppmpf_1` .. `ppmpf_5`). */
  extra?: Partial<Record<'ppmpf_1' | 'ppmpf_2' | 'ppmpf_3' | 'ppmpf_4' | 'ppmpf_5', string>>;
  /** Time after which the txn link should not be accepted. Default: +1h. */
  expiresAt?: Date;
}

export interface JazzCashRequestPayload {
  /** The POST endpoint (sandbox or production). */
  actionUrl: string;
  /** The fields to render as `<input type="hidden">` in the form. */
  fields: JazzCashFields;
}

export function buildJazzCashRequest(input: BuildJazzCashRequestInput): JazzCashRequestPayload {
  assertConfigured();

  const now = new Date();
  const expiry = input.expiresAt ?? new Date(now.getTime() + 60 * 60 * 1000);

  const description = sanitizeDescription(input.description);
  const billRef = input.billReference.slice(0, 20);

  // JazzCash takes paisas as a plain integer string (no decimals, no commas).
  const amountPaisas = String(Math.round(input.amountPkr * 100));

  const fields: JazzCashFields = {
    pp_Version: '1.1',
    pp_TxnType: '',
    pp_Language: 'EN',
    pp_MerchantID: env.JAZZCASH_MERCHANT_ID!,
    pp_SubMerchantID: '',
    pp_Password: env.JAZZCASH_PASSWORD!,
    pp_BankID: '',
    pp_ProductID: '',
    pp_TxnRefNo: input.txnRefNo,
    pp_Amount: amountPaisas,
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: formatJazzCashDateTime(now),
    pp_BillReference: billRef || 'order',
    pp_Description: description,
    pp_TxnExpiryDateTime: formatJazzCashDateTime(expiry),
    pp_ReturnURL: input.returnUrl ?? getJazzCashReturnUrl(),
    ppmpf_1: input.extra?.ppmpf_1 ?? '',
    ppmpf_2: input.extra?.ppmpf_2 ?? '',
    ppmpf_3: input.extra?.ppmpf_3 ?? '',
    ppmpf_4: input.extra?.ppmpf_4 ?? '',
    ppmpf_5: input.extra?.ppmpf_5 ?? '',
  };

  fields.pp_SecureHash = computeSecureHash(fields, env.JAZZCASH_INTEGRITY_SALT!);

  return { actionUrl: getJazzCashPostUrl(), fields };
}

/** JazzCash description must be alphanumeric (plus spaces). Keep it short. */
function sanitizeDescription(desc: string): string {
  const cleaned = desc.replace(/[^A-Za-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  return (cleaned || 'Order').slice(0, 60);
}

/* -------------------------------------------------------------------------- */
/*  Verify a response from JazzCash                                           */
/* -------------------------------------------------------------------------- */

export interface JazzCashVerifiedResponse {
  ok: boolean;
  /** True iff the response signature is valid. */
  signatureValid: boolean;
  /** True iff JazzCash reports a successful transaction (pp_ResponseCode === '000'). */
  paid: boolean;
  responseCode: string;
  responseMessage: string;
  txnRefNo: string;
  /** JazzCash's own transaction identifier (`pp_RetreivalReferenceNo`). */
  providerTxnId: string;
  amountPkr: number;
  raw: JazzCashFields;
}

/**
 * Verify a JazzCash return-URL POST. Returns a structured result; never throws on
 * invalid signature so callers can log & handle gracefully.
 */
export function verifyJazzCashResponse(raw: JazzCashFields): JazzCashVerifiedResponse {
  assertConfigured();
  const salt = env.JAZZCASH_INTEGRITY_SALT!;

  const provided = (raw.pp_SecureHash ?? '').toUpperCase();
  const expected = computeSecureHash(raw, salt);
  const signatureValid = provided !== '' && timingSafeEqualStr(provided, expected);

  const responseCode = raw.pp_ResponseCode ?? '';
  const paid = signatureValid && responseCode === '000';

  const amountPaisas = parseInt(raw.pp_Amount ?? '0', 10);
  const amountPkr = Number.isFinite(amountPaisas) ? Math.round(amountPaisas / 100) : 0;

  return {
    ok: signatureValid,
    signatureValid,
    paid,
    responseCode,
    responseMessage: raw.pp_ResponseMessage ?? '',
    txnRefNo: raw.pp_TxnRefNo ?? '',
    providerTxnId: raw.pp_RetreivalReferenceNo ?? raw.pp_AuthCode ?? '',
  amountPkr,
    raw,
  };
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
