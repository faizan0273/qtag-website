/**
 * Rate limiter (in-memory).
 *
 * ⚠️  In-memory only — does NOT survive process restart and does NOT scale
 *     across multiple Next.js instances. Replace with Redis (Upstash recommended)
 *     before going to production.
 *
 *     The interface below stays the same; only this file changes.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Returns true if the request is ALLOWED and increments the counter.
 * Returns false if the limit has been exceeded.
 *
 * @param key   unique identifier (e.g. "otp:start:+923001234567")
 * @param limit max requests in the window
 * @param windowMs window length in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) return false;

  existing.count += 1;
  return true;
}

/** Returns time-to-reset for a key in seconds, or 0 if no bucket. */
export function resetIn(key: string): number {
  const b = buckets.get(key);
  if (!b) return 0;
  return Math.max(0, Math.ceil((b.resetAt - Date.now()) / 1000));
}

// Periodic cleanup (every 5 minutes) to keep memory bounded.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }, 5 * 60 * 1000).unref?.();
}
