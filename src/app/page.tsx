import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PRODUCT, formatPkr } from '@/lib/constants';
import { BRAND_NAME } from '@/lib/brand';

const HOW_STEPS = [
  {
    n: '01',
    title: 'Buy a sticker',
    body: 'One product, one job. Order online, pay cash on delivery, get it in 2–3 days.',
  },
  {
    n: '02',
    title: 'Stick it on your windshield',
    body: 'Scan it once with your phone to activate. Add your plate, make, and a display name. 30 seconds.',
  },
  {
    n: '03',
    title: 'You stay private',
    body: 'When anyone scans your sticker, they can WhatsApp you — but they never see your number. Ever.',
  },
];

const FEATURES = [
  { title: 'Number always hidden', body: 'Your phone is never visible on the public page. Strangers reach you through us.' },
  { title: 'No app needed', body: 'Anyone with a phone camera can contact you. Works on the most basic Android.' },
  { title: 'Lost mode', body: 'Tap a switch. The sticker turns into a “Lost — please contact owner” page.' },
  { title: 'WhatsApp-first', body: 'Messages land in your WhatsApp. No new inbox to check.' },
  { title: 'Cash on delivery', body: 'Pay when it arrives. Standard for every Pakistani.' },
  { title: '7-day returns', body: 'Don’t like it? Send it back, no questions.' },
];

const FAQ = [
  {
    q: 'Will people see my real phone number?',
    a: `No. Never. The public page shows a masked number. All calls and WhatsApp messages route through ${BRAND_NAME} — finders see our number, not yours.`,
  },
  {
    q: 'Do I need to install an app?',
    a: 'No. The owner uses our website to manage tags. The finder just opens their phone camera, points at the sticker, and a WhatsApp link opens. Nothing to install.',
  },
  {
    q: 'What if someone misuses the QR?',
    a: 'You can mute or disable the tag from your dashboard in one tap. We rate-limit messages on every tag, and we ban abusive numbers from the system.',
  },
  {
    q: 'How long does delivery take?',
    a: '2–3 working days in major cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad). Up to 5 days elsewhere via TCS or Leopards.',
  },
  {
    q: 'Can I use one sticker for multiple cars?',
    a: 'No — each sticker is bound to one vehicle. If you have two cars, buy two stickers.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------- HERO -------------------- */}
      <section className="relative overflow-hidden grain bg-paper">
        <div className="container-page pt-12 md:pt-20 pb-20 md:pb-28">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            <div className="md:col-span-7">
              <div className="inline-flex items-center gap-2 mb-6 text-xs font-medium tracking-wide uppercase text-brand bg-brand-soft px-3 py-1.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Made in Pakistan
              </div>
              <h1 className="font-display text-display-xl text-ink">
                A QR sticker
                <br />
                <span className="text-brand">for your car.</span>
                <br />
                Your number stays private.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-ink-soft max-w-readable leading-relaxed">
                Stick it on your windshield. If anyone needs to reach you — about a misparked car, an
                accident, anything — they tap one button and message you on WhatsApp. They never see
                your phone number.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/shop">
                  <Button size="lg">Buy a sticker — {formatPkr(PRODUCT.pricePkr)}</Button>
                </Link>
                <Link href="#how">
                  <Button size="lg" variant="secondary">
                    See how it works
                  </Button>
                </Link>
              </div>
              <div className="mt-6 text-sm text-ink-muted flex flex-wrap items-center gap-x-6 gap-y-2">
                <span>✓ Cash on delivery</span>
                <span>✓ Free shipping over Rs 1,500</span>
                <span>✓ 7-day returns</span>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="relative aspect-[4/5] max-w-md mx-auto">
                {/* Decorative SVG illustration of a QR sticker on a windshield */}
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-brand/10 via-paper-card to-paper-line/40 border border-paper-line shadow-card overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-ink/5 to-transparent" />
                  {/* Faux dashboard */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-ink to-ink-soft" />
                  {/* The "sticker" */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper-card border border-paper-line rounded-2xl p-4 w-44 shadow-cardHover rotate-[-3deg]">
                    <div className="aspect-square bg-ink rounded-md grid place-items-center">
                      <QRBlock />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-[10px] uppercase tracking-widest text-ink-muted">Scan me</div>
                      <div className="font-display text-sm">{BRAND_NAME}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------- HOW IT WORKS ------------ */}
      <section id="how" className="container-page py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="text-sm font-medium text-brand uppercase tracking-wide">How it works</div>
          <h2 className="mt-2 font-display text-display-lg text-ink">Three steps. That's it.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {HOW_STEPS.map((s) => (
            <Card key={s.n} padding="lg" className="relative">
              <div className="font-display text-5xl text-brand/20">{s.n}</div>
              <h3 className="mt-4 font-display text-xl text-ink">{s.title}</h3>
              <p className="mt-3 text-ink-soft leading-relaxed">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------------------------------------- FEATURES ---------------- */}
      <section className="bg-ink text-paper py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-2xl">
            <div className="text-sm font-medium text-brand-soft uppercase tracking-wide">Why {BRAND_NAME}</div>
            <h2 className="mt-2 font-display text-display-lg">
              Built for Pakistani drivers, not Silicon Valley.
            </h2>
          </div>
          <div className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-t border-white/15 pt-5">
                <h3 className="font-display text-lg">{f.title}</h3>
                <p className="mt-2 text-paper/70 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------- PRICING ----------------- */}
      <section className="container-page py-20 md:py-28">
        <Card padding="lg" className="md:p-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-sm font-medium text-brand uppercase tracking-wide">Pricing</div>
              <h2 className="mt-2 font-display text-display-lg text-ink">
                One sticker. {formatPkr(PRODUCT.pricePkr)}.
              </h2>
              <p className="mt-4 text-ink-soft text-lg leading-relaxed max-w-readable">
                That's it. Buy as many as you have cars. Free shipping over Rs 1,500. Cash on
                delivery is standard.
              </p>
              <div className="mt-8">
                <Link href="/shop">
                  <Button size="lg">Buy now</Button>
                </Link>
              </div>
            </div>
            <div>
              <ul className="space-y-3 text-ink-soft">
                {[
                  'Weatherproof, dashboard-grade adhesive',
                  'Pre-printed unique QR — activate in 30 seconds',
                  'Owner phone number always hidden',
                  `WhatsApp + call relay through ${BRAND_NAME}`,
                  'Lost mode with optional reward',
                  '7-day no-questions returns',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <Check />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* ---------------------------------------- FAQ --------------------- */}
      <section id="faq" className="container-page pb-24">
        <div className="max-w-2xl">
          <div className="text-sm font-medium text-brand uppercase tracking-wide">FAQ</div>
          <h2 className="mt-2 font-display text-display-lg text-ink">Common questions.</h2>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {FAQ.map((f) => (
            <Card key={f.q} padding="md">
              <h3 className="font-display text-lg text-ink">{f.q}</h3>
              <p className="mt-2 text-ink-soft leading-relaxed">{f.a}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

/* ---------- tiny inline SVG helpers for the hero --------------- */

function QRBlock() {
  // A stylized QR-looking pattern (decorative only — not a real QR)
  const cells = Array.from({ length: 49 }, (_, i) => {
    // deterministic pseudo pattern
    const on = ((i * 7 + (i % 5) + ((i / 7) | 0)) % 3) !== 0;
    return on;
  });
  return (
    <div className="grid grid-cols-7 gap-[2px] p-3">
      {cells.map((on, i) => (
        <div key={i} className={on ? 'aspect-square bg-paper-card' : 'aspect-square bg-ink'} />
      ))}
    </div>
  );
}

function Check() {
  return (
    <span className="mt-1 grid place-items-center h-5 w-5 rounded-full bg-brand-soft text-brand shrink-0">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}
