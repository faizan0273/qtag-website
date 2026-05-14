import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { env } from './env';
import { connectDB } from './db';
import { UserModel, type UserDoc } from '@/models/User';

/* -------------------------------------------------------------------------- */
/*  JWT helpers                                                               */
/* -------------------------------------------------------------------------- */

const SESSION_COOKIE = 'qrs_session';
const secret = new TextEncoder().encode(env.JWT_SECRET);

export interface SessionPayload extends JWTPayload {
  uid: string;          // user id
  phone: string;        // E.164
  role: 'USER' | 'ADMIN';
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_TTL)
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.uid !== 'string' || typeof payload.phone !== 'string') return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Cookie helpers (server components & route handlers)                       */
/* -------------------------------------------------------------------------- */

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  path: '/',
  // ~30 days, matches a generous JWT TTL
  maxAge: 60 * 60 * 24 * 30,
};

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions);
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function readSessionFromCookies(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** For middleware (Edge runtime) — reads from the request directly. */
export async function readSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  const cookie = req.headers.get('cookie') ?? '';
  const match = cookie.match(/qrs_session=([^;]+)/);
  if (!match) return null;
  return verifySession(match[1]!);
}

/* -------------------------------------------------------------------------- */
/*  Higher-level helpers                                                      */
/* -------------------------------------------------------------------------- */

/** Returns the current authenticated user document, or null. Hits the DB. */
export async function getCurrentUser(): Promise<UserDoc | null> {
  const session = await readSessionFromCookies();
  if (!session) return null;
  await connectDB();
  return UserModel.findById(session.uid);
}

/** Returns the current session payload (no DB hit), or null. */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  return readSessionFromCookies();
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
