import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import { isMongoConnectionError } from '@/lib/db';

/* -------------------------------------------------------------------------- */
/*  Uniform response shape                                                    */
/* -------------------------------------------------------------------------- */

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR';

const STATUS: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  VALIDATION_ERROR: 422,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data }, init);
}

export function bad(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    { ok: false, error: { code, message, details } },
    { status: STATUS[code] },
  );
}

export function fromZod(error: ZodError): NextResponse {
  return bad('VALIDATION_ERROR', 'Some fields are invalid.', error.flatten());
}

/* -------------------------------------------------------------------------- */
/*  Request helpers                                                           */
/* -------------------------------------------------------------------------- */

/** Best-effort client IP for rate limiting (works on Vercel & most reverse proxies). */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return '0.0.0.0';
}

/** Generic safe wrapper — catches anything and returns 500 instead of crashing. */
export async function safe<T>(fn: () => Promise<T>): Promise<T | NextResponse> {
  try {
    return await fn();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api] unhandled error:', err);
    if (isMongoConnectionError(err)) {
      return bad(
        'INTERNAL_ERROR',
        'Database is unavailable. Start MongoDB (`docker compose up -d` in qtag-website) or set MONGODB_URI to a running cluster (e.g. MongoDB Atlas).',
      );
    }
    return bad('INTERNAL_ERROR', 'Something went wrong on our side.');
  }
}
