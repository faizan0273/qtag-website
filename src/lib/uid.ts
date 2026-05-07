import { customAlphabet } from 'nanoid';

/**
 * Tag UID generator.
 *
 * - 8 characters from a Crockford-like alphabet (no I, O, 1, 0 to avoid OCR
 *   confusion when printed on a tiny sticker).
 * - Lowercase + dash-friendly.
 * - 32^8 ≈ 1.1 trillion possibilities; collisions are practically impossible
 *   at our scale, but we still validate uniqueness via a unique index in Mongo.
 *
 * Example: "k7q2x9fp"
 */
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';
const generate = customAlphabet(ALPHABET, 8);

export function generateTagUid(): string {
  return generate();
}

/** Validate a UID string. */
export function isValidUid(uid: string): boolean {
  return /^[2-9a-hjkmnp-z]{8}$/.test(uid);
}
