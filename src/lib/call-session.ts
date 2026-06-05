import 'server-only';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'crypto';
import type { HydratedDocument } from 'mongoose';
import { env } from '@/lib/env';
import {
  CallSessionModel,
  type CallRole,
  type ICallSession,
  type SignalMessageType,
} from '@/models/CallSession';

const RINGING_TTL_MS = 5 * 60_000;
const ACTIVE_TTL_MS = 30 * 60_000;
const MAX_SIGNAL_MESSAGES = 80;

export interface CallTokens {
  callerToken: string;
  ownerToken: string;
  callerTokenHash: string;
  ownerTokenHash: string;
}

export interface VerifiedCallSession {
  session: HydratedDocument<ICallSession>;
  role: CallRole;
}

export function createCallTokens(): CallTokens {
  const callerToken = randomBytes(32).toString('base64url');
  const ownerToken = randomBytes(32).toString('base64url');
  return {
    callerToken,
    ownerToken,
    callerTokenHash: hashCallToken(callerToken),
    ownerTokenHash: hashCallToken(ownerToken),
  };
}

export function hashCallToken(token: string): string {
  return createHash('sha256')
    .update(`${process.env.JWT_SECRET ?? 'qtag'}:${token}`)
    .digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function ringingExpiresAt(): Date {
  return new Date(Date.now() + RINGING_TTL_MS);
}

export function activeExpiresAt(): Date {
  return new Date(Date.now() + ACTIVE_TTL_MS);
}

export function isCallExpired(session: Pick<ICallSession, 'expiresAt' | 'status'>): boolean {
  if (session.status === 'ENDED' || session.status === 'EXPIRED' || session.status === 'MISSED') {
    return true;
  }
  return session.expiresAt.getTime() <= Date.now();
}

export async function verifyCallSessionAccess(
  sessionId: string,
  token: string | null | undefined,
): Promise<VerifiedCallSession | null> {
  if (!token || !/^[a-f\d]{24}$/i.test(sessionId)) return null;

  const session = await CallSessionModel.findById(sessionId);
  if (!session) return null;

  if (isCallExpired(session)) {
    if (session.status === 'RINGING' || session.status === 'ACTIVE') {
      session.status = session.status === 'RINGING' ? 'MISSED' : 'EXPIRED';
      session.endedAt = new Date();
      await session.save();
    }
    return null;
  }

  const tokenHash = hashCallToken(token);
  if (safeEqualHex(tokenHash, session.callerTokenHash)) return { session, role: 'CALLER' };
  if (safeEqualHex(tokenHash, session.ownerTokenHash)) return { session, role: 'OWNER' };
  return null;
}

export function buildJoinUrl(sessionId: string, token: string): string {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  return `${base}/call/${sessionId}?token=${encodeURIComponent(token)}`;
}

export function callIceServers(): RTCIceServer[] {
  const iceServers: RTCIceServer[] = [
    { urls: process.env.NEXT_PUBLIC_WEBRTC_STUN_URL || 'stun:stun.l.google.com:19302' },
  ];

  if (env.WEBRTC_TURN_URL && env.WEBRTC_TURN_USERNAME && env.WEBRTC_TURN_CREDENTIAL) {
    iceServers.push({
      urls: env.WEBRTC_TURN_URL,
      username: env.WEBRTC_TURN_USERNAME,
      credential: env.WEBRTC_TURN_CREDENTIAL,
    });
  }

  return iceServers;
}

export function publicCallSessionView(session: ICallSession, role: CallRole) {
  const withId = session as ICallSession & { _id?: unknown };
  return {
    id: String(withId._id ?? ''),
    uid: session.uid,
    role,
    status: session.status,
    provider: session.provider,
    expiresAt: session.expiresAt.toISOString(),
    startedAt: session.startedAt.toISOString(),
    answeredAt: session.answeredAt?.toISOString() ?? null,
    iceServers: callIceServers(),
  };
}

export function newSignalMessage(input: {
  from: CallRole;
  type: SignalMessageType;
  payload: unknown;
}) {
  return {
    messageId: randomUUID(),
    from: input.from,
    type: input.type,
    payload: input.payload,
    createdAt: new Date(),
  };
}

export function trimSignalMessages<T>(messages: T[]): T[] {
  return messages.slice(-MAX_SIGNAL_MESSAGES);
}
