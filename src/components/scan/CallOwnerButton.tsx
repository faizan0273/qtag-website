'use client';

import { useState, useTransition } from 'react';

const btnBase =
  'inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 h-14 px-7 text-base rounded-xl w-full select-none';
const primary = 'bg-brand text-ink hover:bg-brand-dark active:bg-brand-dark';

interface Props {
  uid: string;
}

function audioSupportMessage(): string | null {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return 'Private browser calls need HTTPS on phones. Open this site with an HTTPS URL such as ngrok; the LAN http://192.168... URL can still test QR/login, but not microphone calls.';
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'This browser does not expose microphone access. Try Chrome/Safari over HTTPS, or send a message instead.';
  }
  return null;
}

export function CallOwnerButton({ uid }: Props) {
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  function startCall() {
    setStatus('idle');
    setMessage('');
    startTransition(async () => {
      try {
        const supportError = audioSupportMessage();
        if (supportError) {
          setStatus('err');
          setMessage(supportError);
          return;
        }

        const warmupStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        warmupStream.getTracks().forEach((track) => track.stop());

        const res = await fetch(`/api/contact/call/${uid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const json = (await res.json()) as {
          ok?: boolean;
          data?: { joinUrl?: string; message?: string };
          error?: { message?: string };
        };
        if (res.ok && json.ok && json.data?.joinUrl) {
          setStatus('ok');
          setMessage(json.data.message ?? 'Opening private browser call...');
          window.location.assign(json.data.joinUrl);
        } else {
          setStatus('err');
          setMessage(json.error?.message ?? 'Could not start the call.');
        }
      } catch (err) {
        setStatus('err');
        const name = err instanceof DOMException ? err.name : '';
        setMessage(
          name === 'NotAllowedError'
            ? 'Microphone permission was blocked. Allow microphone access and try again.'
            : 'Could not access the microphone. Private browser calls need HTTPS and mic permission.',
        );
      }
    });
  }

  return (
    <>
      <button type="button" className={`${btnBase} ${primary}`} onClick={startCall} disabled={pending}>
        {pending ? 'Starting private call...' : 'Call owner'}
      </button>

      {status === 'ok' ? (
        <p className="text-sm text-success text-center" role="status">
          {message}
        </p>
      ) : null}
      {status === 'err' ? (
        <p className="text-sm text-danger text-center" role="alert">
          {message}
        </p>
      ) : null}
    </>
  );
}
