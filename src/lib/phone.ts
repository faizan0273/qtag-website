/**
 * Pakistan phone number utilities.
 *
 * Canonical format we store everywhere: E.164 (+92XXXXXXXXXX, exactly 13 chars).
 * UI may render it as "+92 3XX XXXXXXX" — formatting is presentation, never storage.
 */

const PK_E164 = /^\+923\d{9}$/;

/** Normalize various user inputs into E.164 (+923XXXXXXXXX) or return null. */
export function normalizePkPhone(input: string): string | null {
  if (!input) return null;
  // Strip spaces, dashes, parens
  const digits = input.replace(/[\s\-()]/g, '');

  // Already E.164 PK
  if (PK_E164.test(digits)) return digits;

  // 03001234567 -> +923001234567
  if (/^03\d{9}$/.test(digits)) return '+92' + digits.slice(1);

  // 3001234567 -> +923001234567
  if (/^3\d{9}$/.test(digits)) return '+92' + digits;

  // 923001234567 -> +923001234567
  if (/^923\d{9}$/.test(digits)) return '+' + digits;

  return null;
}

/** Validate that a string is a normalized PK E.164 number. */
export function isValidPkPhone(input: string): boolean {
  return PK_E164.test(input);
}

/**
 * Mask a phone number for display to strangers on public pages.
 * +923001234567 -> "+92 3** *** **67"
 */
export function maskPhone(e164: string): string {
  if (!isValidPkPhone(e164)) return '+92 *** *** ****';
  const last2 = e164.slice(-2);
  const networkPrefix = e164.slice(3, 4); // the leading 3
  return `+92 ${networkPrefix}** *** **${last2}`;
}

/** Format E.164 PK phone for friendly display to the OWNER (their own number). */
export function formatPkPhone(e164: string): string {
  if (!isValidPkPhone(e164)) return e164;
  // +923001234567 -> "+92 300 1234567"
  return `+92 ${e164.slice(3, 6)} ${e164.slice(6)}`;
}
