'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BRAND_NAME } from '@/lib/brand';

type Role = 'CALLER' | 'OWNER';
type CallStatus = 'RINGING' | 'ACTIVE' | 'ENDED' | 'EXPIRED' | 'MISSED';
type Phase = 'loading' | 'incoming' | 'calling' | 'connecting' | 'connected' | 'ended' | 'error';

interface CallSessionView {
  id: string;
  uid: string;
  role: Role;
  status: CallStatus;
  expiresAt: string;
  iceServers: RTCIceServer[];
}

interface SignalMessage {
  messageId: string;
  from: Role;
  type: 'offer' | 'answer' | 'ice';
  payload: unknown;
}

interface ApiOk<T> {
  ok: true;
  data: T;
}

interface ApiErr {
  ok: false;
  error?: { message?: string };
}

interface Props {
  sessionId: string;
  token: string;
}

function microphoneErrorMessage(action: 'start' | 'answer', err?: unknown): string {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return `Private browser calls need HTTPS on phones. Open this ${action === 'start' ? 'caller' : 'answer'} link with an HTTPS URL such as ngrok.`;
  }
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotAllowedError') return 'Microphone permission was blocked. Allow microphone access and try again.';
  if (name === 'NotFoundError') return 'No microphone was found on this device.';
  return `Microphone access is required to ${action} the call.`;
}

export function WebRtcCallRoom({ sessionId, token }: Props) {
  const [session, setSession] = useState<CallSessionView | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [message, setMessage] = useState('Preparing private call...');
  const [muted, setMuted] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const processedSignalsRef = useRef(new Set<string>());
  const acceptedRef = useRef(false);
  const callerStartedRef = useRef(false);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);

  const cleanupMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
  }, []);

  const postSignal = useCallback(
    async (type: SignalMessage['type'], payload: unknown) => {
      await fetch(`/api/calls/${sessionId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, type, payload }),
      });
    },
    [sessionId, token],
  );

  const flushPendingIce = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc?.remoteDescription) return;
    const pending = pendingIceRef.current.splice(0);
    for (const candidate of pending) {
      await pc.addIceCandidate(candidate).catch(() => undefined);
    }
  }, []);

  const createPeerConnection = useCallback(
    async (iceServers: RTCIceServer[]) => {
      if (pcRef.current) return pcRef.current;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          void postSignal('ice', event.candidate.toJSON());
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteAudioRef.current && remoteStream) {
          remoteAudioRef.current.srcObject = remoteStream;
          void remoteAudioRef.current.play().catch(() => undefined);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setPhase('connected');
          setMessage('Connected privately in the browser.');
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setPhase('error');
          setMessage('Call connection dropped. You can try again from the scan page.');
        }
      };

      return pc;
    },
    [postSignal],
  );

  const startCaller = useCallback(
    async (view: CallSessionView) => {
      if (callerStartedRef.current) return;
      callerStartedRef.current = true;
      setPhase('calling');
      setMessage('Calling owner... keep this page open.');

      try {
        const pc = await createPeerConnection(view.iceServers);
        const offer = await pc.createOffer({ offerToReceiveAudio: true });
        await pc.setLocalDescription(offer);
        await postSignal('offer', offer);
      } catch (err) {
        setPhase('error');
        setMessage(microphoneErrorMessage('start', err));
      }
    },
    [createPeerConnection, postSignal],
  );

  const acceptOwnerCall = useCallback(async () => {
    if (!session) return;
    acceptedRef.current = true;
    setPhase('connecting');
    setMessage('Connecting to caller...');
    try {
      await createPeerConnection(session.iceServers);
    } catch (err) {
      setPhase('error');
      setMessage(microphoneErrorMessage('answer', err));
    }
  }, [createPeerConnection, session]);

  const handleSignal = useCallback(
    async (signal: SignalMessage, view: CallSessionView) => {
      if (signal.type === 'offer' && view.role === 'OWNER' && !acceptedRef.current) {
        return;
      }

      if (processedSignalsRef.current.has(signal.messageId)) return;
      processedSignalsRef.current.add(signal.messageId);

      if (signal.type === 'offer' && view.role === 'OWNER') {
        const pc = await createPeerConnection(view.iceServers);
        await pc.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
        await flushPendingIce();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await postSignal('answer', answer);
        setPhase('connecting');
        setMessage('Answer sent. Waiting for connection...');
      }

      if (signal.type === 'answer' && view.role === 'CALLER') {
        const pc = pcRef.current;
        if (!pc || pc.remoteDescription) return;
        await pc.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
        await flushPendingIce();
        setPhase('connecting');
        setMessage('Owner answered. Connecting audio...');
      }

      if (signal.type === 'ice') {
        const candidate = signal.payload as RTCIceCandidateInit;
        const pc = pcRef.current;
        if (!pc?.remoteDescription) {
          pendingIceRef.current.push(candidate);
          return;
        }
        await pc.addIceCandidate(candidate).catch(() => undefined);
      }
    },
    [createPeerConnection, flushPendingIce, postSignal],
  );

  const pollSignals = useCallback(async () => {
    const res = await fetch(`/api/calls/${sessionId}/signal?token=${encodeURIComponent(token)}`, {
      cache: 'no-store',
    });
    const json = (await res.json()) as ApiOk<{ session: CallSessionView; signals: SignalMessage[] }> | ApiErr;
    if (!json.ok) {
      setPhase('ended');
      setMessage(json.error?.message ?? 'This call link is invalid or expired.');
      cleanupMedia();
      return;
    }

    setSession(json.data.session);
    if (json.data.session.status === 'ENDED' || json.data.session.status === 'EXPIRED' || json.data.session.status === 'MISSED') {
      setPhase('ended');
      setMessage('This call has ended.');
      cleanupMedia();
      return;
    }

    for (const signal of json.data.signals) {
      await handleSignal(signal, json.data.session);
    }
  }, [cleanupMedia, handleSignal, sessionId, token]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/calls/${sessionId}?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
        const json = (await res.json()) as ApiOk<CallSessionView> | ApiErr;
        if (cancelled) return;
        if (!json.ok) {
          setPhase('error');
          setMessage(json.error?.message ?? 'This call link is invalid or expired.');
          return;
        }

        setSession(json.data);
        if (json.data.role === 'CALLER') {
          await startCaller(json.data);
        } else {
          setPhase('incoming');
          setMessage('Incoming private Qtag call. Tap accept to answer.');
        }
      } catch {
        if (!cancelled) {
          setPhase('error');
          setMessage('Could not load this call. Check your connection.');
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [sessionId, startCaller, token]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void pollSignals();
    }, 1500);
    void pollSignals();
    return () => window.clearInterval(id);
  }, [pollSignals]);

  useEffect(() => cleanupMedia, [cleanupMedia]);

  function toggleMute() {
    const next = !muted;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
    setMuted(next);
  }

  async function endCall() {
    await fetch(`/api/calls/${sessionId}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).catch(() => undefined);
    cleanupMedia();
    setPhase('ended');
    setMessage('Call ended.');
  }

  const isOwnerIncoming = session?.role === 'OWNER' && phase === 'incoming';
  const canControl = phase === 'calling' || phase === 'connecting' || phase === 'connected';

  return (
    <div className="container-page py-10 md:py-16 max-w-md">
      <Card padding="lg">
        <div className="text-center">
          <div className="text-sm uppercase tracking-widest text-ink-muted">Private browser call</div>
          <h1 className="mt-2 font-display text-display-md text-ink">
            {session?.role === 'OWNER' ? 'Qtag call for you' : 'Calling owner'}
          </h1>
          <p className="mt-3 text-ink-soft">{message}</p>
          <p className="mt-3 text-xs text-ink-muted">
            Audio stays inside the browser using WebRTC. {BRAND_NAME} does not show either SIM number on this page.
          </p>
        </div>

        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

        <div className="mt-8 grid gap-3">
          {isOwnerIncoming ? (
            <Button size="lg" fullWidth onClick={acceptOwnerCall}>
              Accept call
            </Button>
          ) : null}

          {canControl ? (
            <>
              <Button variant="secondary" size="lg" fullWidth onClick={toggleMute}>
                {muted ? 'Unmute mic' : 'Mute mic'}
              </Button>
              <Button variant="danger" size="lg" fullWidth onClick={endCall}>
                End call
              </Button>
            </>
          ) : null}

          {phase === 'ended' || phase === 'error' ? (
            <Button variant="secondary" size="lg" fullWidth onClick={() => window.close()}>
              Close
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
