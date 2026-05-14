import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import {
  CountUp,
  HeroGlow,
  HoverDrift,
  MagneticButton,
  Parallax,
  Reveal,
  RevealText,
  ScrollIndicator,
  Stagger,
  StaggerItem,
  TiltCard,
} from '@/components/motion';
import { PRODUCT, formatPkr } from '@/lib/constants';
import { BRAND_NAME } from '@/lib/brand';

/*
 * This page stays a Server Component — all content is server-rendered for
 * SEO. The animation primitives imported above are individually marked
 * 'use client', so only those small wrappers hydrate on the client.
 *
 * Content, copy, and structure are unchanged from the original; the only
 * additions are motion wrappers.
 */

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

const PRICING_POINTS = [
  'Weatherproof materials for outdoor and daily carry',
  'Unique QR per unit, go live in seconds after activation',
  'Personal numbers stay off the public page',
  `WhatsApp and call relay through ${BRAND_NAME}`,
  'Lost mode with optional reward',
];

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------- HERO -------------------- */}
      <section className="relative overflow-hidden grain bg-paper">
        {/* Animated gradient + cursor light. Decorative, sits behind content. */}
        <HeroGlow />

        <div className="container-page relative pt-12 md:pt-20 pb-20 md:pb-28">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            <div className="md:col-span-7">
              {/*
                Hero entrance plays on mount (`immediate`). The badge, copy
                and CTAs stagger in; the headline runs its own line-mask
                reveal, slotted into the sequence via an explicit delay.
              */}
              <Stagger immediate stagger={0.12} delayChildren={0.1}>
                <StaggerItem>
                  <div className="inline-flex items-center gap-2 mb-6 text-xs font-medium tracking-wide uppercase text-brand bg-brand-soft px-3 py-1.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                    Made in Pakistan
                  </div>
                </StaggerItem>

                <RevealText
                  as="h1"
                  immediate
                  delay={0.18}
                  className="font-display text-display-xl text-ink"
                  lines={[
                    'Smart safety for everyone,',
                    <span key="line-2" className="text-brand">
                      everywhere.
                    </span>,
                  ]}
                />

                <StaggerItem>
                  <p className="mt-6 text-lg md:text-xl text-ink-soft max-w-readable leading-relaxed">
                    {BRAND_NAME} sells physical and digital QR safety tags for Pakistan. Each code opens a page you
                    control, medical notes, vehicle context, lost mode, or a WhatsApp relay, without putting your
                    private number on the tag. We ship nationwide with local support.
                  </p>
                </StaggerItem>

                <StaggerItem>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <MagneticButton>
                      <Link href="/shop">
                        <Button size="lg">Shop tags, from {formatPkr(PRODUCT.pricePkr)}</Button>
                      </Link>
                    </MagneticButton>
                    <MagneticButton>
                      <Link href="/about">
                        <Button size="lg" variant="secondary">
                          About {BRAND_NAME}
                        </Button>
                      </Link>
                    </MagneticButton>
                    <MagneticButton>
                      <Link href="#how">
                        <Button size="lg" variant="secondary">
                          See how it works
                        </Button>
                      </Link>
                    </MagneticButton>
                  </div>
                </StaggerItem>
              </Stagger>
            </div>

            <div className="md:col-span-5">
              {/* Image fades in last, then drifts gently on scroll for depth. */}
              <Reveal direction="up" delay={0.5} blur>
                <Parallax speed={28}>
                  <div className="relative aspect-[4/5] max-w-md mx-auto overflow-hidden rounded-[28px] border border-paper-line bg-paper-card shadow-card">
                    <Image
                      src="/herosectionimage.jpg"
                      alt={`${BRAND_NAME} QR safety tag preview`}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 40vw, 90vw"
                      priority
                    />
                  </div>
                </Parallax>
              </Reveal>
            </div>
          </div>

          {/* Scroll cue — desktop only, fades out as the user scrolls. */}
          <div className="mt-14 hidden md:flex justify-center">
            <ScrollIndicator />
          </div>
        </div>
      </section>

      {/* ---------------------------------------- STATS ------------------- */}
      <section className="border-y border-paper-line bg-paper-card/40">
        <div className="container-page py-12 md:py-16">
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" stagger={0.1}>
            {HOME_STATS.map((s) => (
              <StaggerItem key={s.label} blur>
                <TiltCard className="h-full" max={5} lift={5}>
                  <Card
                    padding="md"
                    className="h-full text-center md:text-left transition-shadow duration-300 group-hover:shadow-cardHover"
                  >
                    <div className="font-display text-2xl md:text-3xl text-brand tnum">
                      <CountUp value={s.value} />
                    </div>
                    <div className="mt-1 text-xs md:text-sm text-ink-muted leading-snug">{s.label}</div>
                  </Card>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------------------------------------- HOW IT WORKS ------------ */}
      <section id="how" className="container-page py-20 md:py-28 scroll-mt-24">
        <Reveal as="div" className="max-w-2xl">
          <div className="text-sm font-medium text-brand uppercase tracking-wide">How it works</div>
          <h2 className="mt-2 font-display text-display-lg text-ink">Three steps. That&apos;s it.</h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {HOW_STEPS.map((s) => (
            <StaggerItem key={s.n} blur>
              <TiltCard className="h-full" max={5}>
                <Card
                  padding="lg"
                  className="relative h-full transition-shadow duration-300 group-hover:shadow-cardHover"
                >
                  <div className="font-display text-5xl text-brand/20">{s.n}</div>
                  <h3 className="mt-4 font-display text-xl text-ink">{s.title}</h3>
                  <p className="mt-3 text-ink-soft leading-relaxed">{s.body}</p>
                </Card>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ---------------------------------------- FEATURES ---------------- */}
      <section className="bg-ink text-paper py-20 md:py-28">
        <div className="container-page">
          <Reveal as="div" className="max-w-2xl">
            <div className="text-sm font-medium text-brand-soft uppercase tracking-wide">Why {BRAND_NAME}</div>
            <h2 className="mt-2 font-display text-display-lg">
              Built for safety in Pakistan, not a generic import.
            </h2>
          </Reveal>

          <Stagger className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3" stagger={0.1}>
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <HoverDrift x={6}>
                  <div className="border-t border-white/15 pt-5 transition-colors duration-300 hover:border-brand/60">
                    <h3 className="font-display text-lg">{f.title}</h3>
                    <p className="mt-2 text-paper/70 leading-relaxed">{f.body}</p>
                  </div>
                </HoverDrift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------------------------------------- PRICING ----------------- */}
      <section className="container-page py-20 md:py-28">
        <Reveal blur>
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
                  <MagneticButton>
                    <Link href="/shop">
                      <Button size="lg">Browse shop</Button>
                    </Link>
                  </MagneticButton>
                </div>
              </div>

              <div>
                <Stagger as="ul" className="space-y-3 text-ink-soft" stagger={0.08}>
                  {PRICING_POINTS.map((line) => (
                    <StaggerItem as="li" key={line} direction="left" className="flex items-start gap-3">
                      <Check />
                      <span>{line}</span>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </div>
          </Card>
        </Reveal>
      </section>

      {/* ---------------------------------------- FAQ --------------------- */}
      <section id="faq" className="container-page pb-24 scroll-mt-24">
        <Reveal as="div" className="max-w-2xl">
          <div className="text-sm font-medium text-brand uppercase tracking-wide">FAQ</div>
          <h2 className="mt-2 font-display text-display-lg text-ink">Common questions.</h2>
        </Reveal>
        <FaqAccordion items={FAQ_ACCORDION_ITEMS} />
      </section>
    </>
  );
}

function Check() {
  return (
    <span className="mt-1 grid place-items-center h-5 w-5 rounded-full bg-brand-soft text-brand shrink-0">
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}
