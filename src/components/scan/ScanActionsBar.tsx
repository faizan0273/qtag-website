'use client';

const btnBase =
  'inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 h-14 px-7 text-base rounded-xl w-full select-none';
const primary = 'bg-brand text-ink hover:bg-brand-dark active:bg-brand-dark';
const secondary =
  'bg-paper-card text-ink border border-paper-line hover:bg-paper hover:border-ink/20';

interface Props {
  telHref?: string;
  whatsappHref?: string;
}

export function ScanActionsBar({ telHref, whatsappHref }: Props) {
  if (!telHref && !whatsappHref) return null;

  function reportFoundClick() {
    const el = document.getElementById('qtag-contact');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      const ta = document.getElementById('qtag-contact-body');
      ta?.focus();
    }, 400);
  }

  return (
    <div className="mt-8 space-y-3">
      <p className="text-xs uppercase tracking-widest text-ink-muted text-center">Reach the owner</p>
      <div className="grid grid-cols-1 gap-2">
        {telHref ? (
          <a href={telHref} className={`${btnBase} ${secondary} tnum`}>
            Call owner
          </a>
        ) : null}
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBase} ${primary}`}
          >
            WhatsApp owner
          </a>
        ) : null}
        <button type="button" className={`${btnBase} ${secondary}`} onClick={reportFoundClick}>
          Report found item
        </button>
      </div>
      <p className="text-xs text-ink-muted text-center">
        Tap call or WhatsApp only if you're comfortable reaching out directly, your number stays private unless you choose to share it below.
      </p>
    </div>
  );
}
