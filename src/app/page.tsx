import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import { PRODUCT, formatPkr } from '@/lib/constants';
import { BRAND_NAME } from '@/lib/brand';

const HOW_STEPS = [
  {
    n: '01',
    title: 'Choose your tag',
    body: 'Browse physical QR tags in the shop, vehicles, bags, doorways, pets, and more. Complete checkout online; most cities see delivery in 2 to 3 days.',
  },
  {
    n: '02',
    title: 'Mount it, then activate',
    body: 'Place the tag where it should live. Scan once with your phone to link the right details to that code, plate and make for a car, or notes for anything else.',
  },
  {
    n: '03',
    title: 'You stay private',
    body: 'When someone scans your tag, they can reach you on WhatsApp through us, and they never see your personal number unless you choose to share it.',
  },
];

const FEATURES = [
  { title: 'Number stays hidden', body: 'Your phone is not shown on the public page. People contact you through our relay, built for safety first.' },
  { title: 'No app needed', body: 'Anyone with a phone camera can open your tag. Works on everyday Android and iPhone.' },
  { title: 'Lost mode', body: 'Flip a switch in your dashboard. The public page becomes a clear “needs help / lost” signal with optional reward.' },
  { title: 'WhatsApp first', body: 'Messages land in your WhatsApp. No new inbox to babysit.' },
];

const HOME_STATS = [
  { value: '10K+', label: 'Active QR tags' },
  { value: '6+', label: 'Tag lines in the shop' },
  { value: 'Pakistan', label: 'Our focus, nationwide' },
  { value: '< 2s', label: 'Typical tag load' },
] as const;

const FAQ = [
  {
    q: 'Will people see my real phone number?',
    a: `No. Never. The public page shows a masked number. All calls and WhatsApp messages route through ${BRAND_NAME}, and finders see our number, not yours.`,
  },
  {
    q: 'Do I need to install an app?',
    a: 'No. The owner uses our website to manage tags. The finder opens their phone camera, scans the QR, and a WhatsApp link opens. Nothing to install.',
  },
  {
    q: 'What if someone misuses the QR?',
    a: 'You can mute or disable the tag from your dashboard in one tap. We rate-limit messages on every tag, and we ban abusive numbers from the system.',
  },
  {
    q: 'How long does delivery take?',
    a: '2 to 3 working days in major cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad). Up to 5 days elsewhere via TCS or Leopards.',
  },
  {
    q: 'Can one tag cover more than one thing?',
    a: 'No, each QR is tied to one profile so scans always reach the right context. Need another bike, car, or bag covered? Add another tag from the shop or create a digital tag in your dashboard.',
  },
];

const FAQ_ACCORDION_ITEMS = FAQ.map((f, i) => ({
  id: `faq-${i}`,
  q: f.q,
  a: f.a,
}));

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
                Smart safety for everyone,
                <br />
                <span className="text-brand">everywhere.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-ink-soft max-w-readable leading-relaxed">
                {BRAND_NAME} sells physical and digital QR safety tags for Pakistan. Each code opens a page you control,
                medical notes, vehicle context, lost mode, or a WhatsApp relay, without putting your private number on
                the tag. We ship nationwide with local support.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/shop">
                  <Button size="lg">Shop tags, from {formatPkr(PRODUCT.pricePkr)}</Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="secondary">
                    About {BRAND_NAME}
                  </Button>
                </Link>
                <Link href="#how">
                  <Button size="lg" variant="secondary">
                    See how it works
                  </Button>
                </Link>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="relative aspect-[4/5] max-w-md mx-auto">
                {/* Decorative hero: QR tag on a simple surface */}
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-brand/10 via-paper-card to-paper-line/40 border border-paper-line shadow-card overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-ink/5 to-transparent" />
                  {/* Hint of a surface the tag sits on */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-ink to-ink-soft" />
                  {/* QR tag card */}
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

      <section className="border-y border-paper-line bg-paper-card/40">
        <div className="container-page py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {HOME_STATS.map((s) => (
              <Card key={s.label} padding="md" className="text-center md:text-left">
                <div className="font-display text-2xl md:text-3xl text-brand">{s.value}</div>
                <div className="mt-1 text-xs md:text-sm text-ink-muted leading-snug">{s.label}</div>
              </Card>
            ))}
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
              Built for safety in Pakistan, not a generic import.
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
                Shop tags from {formatPkr(PRODUCT.pricePkr)}, more SKUs in the catalogue.
              </h2>
              <p className="mt-4 text-ink-soft text-lg leading-relaxed max-w-readable">
                Checkout shows the exact line you picked. Add units for every place that needs a code.
              </p>
              <div className="mt-8">
                <Link href="/shop">
                  <Button size="lg">Browse shop</Button>
                </Link>
              </div>
            </div>
            <div>
              <ul className="space-y-3 text-ink-soft">
                {[
                  'Weatherproof materials for outdoor and daily carry',
                  'Unique QR per unit, go live in seconds after activation',
                  'Personal numbers stay off the public page',
                  `WhatsApp and call relay through ${BRAND_NAME}`,
                  'Lost mode with optional reward',
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
        <FaqAccordion items={FAQ_ACCORDION_ITEMS} />
      </section>
    </>
  );
}

/* ---------- tiny inline SVG helpers for the hero --------------- */

function QRBlock() {
  // A stylized QR-looking pattern (decorative only, not a real QR)
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
