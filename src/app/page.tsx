import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import {
  QtagProductMockup,
  type QtagMockupVariant,
} from '@/components/marketing/QtagProductMockup';
import {
  HeroGlow,
  MagneticButton,
  Reveal,
  RevealText,
  Stagger,
  StaggerItem,
} from '@/components/motion';
import { PRODUCT, formatPkr } from '@/lib/constants';
import { BRAND_NAME } from '@/lib/brand';

const HOW_STEPS = [
  {
    n: '01',
    title: 'Tag what matters',
    body: `Pick the ${BRAND_NAME} tag that fits, bag, car, door, pet, or hard surface. Stick it on, hook it on, or iron it on.`,
  },
  {
    n: '02',
    title: 'They scan to contact',
    body: 'Anyone with a phone camera scans the QR. It opens your public page with the right info for that scan moment.',
  },
  {
    n: '03',
    title: 'Message privately',
    body: `Replies land in your ${BRAND_NAME} inbox and forward to your WhatsApp. Your phone number never appears on the public page.`,
  },
];

type ProductCard = {
  slug: string;
  variant: QtagMockupVariant;
  category: string;
  title: string;
  tagline: string;
  pricePkr: number;
  compareAtPkr: number | null;
  badge?: 'sale' | 'sold-out' | 'new' | null;
};

const PROTECT_GROUPS: { tag: string; title: string; lead: string; items: ProductCard[] }[] = [
  {
    tag: 'For your gear',
    title: 'Protect your gear.',
    lead: 'Bags, luggage, items, and keys, scan returns to you without printing your phone number on any of it.',
    items: [
      { slug: 'luggage-tags', variant: 'luggage', category: 'Luggage Tags', title: 'Luggage Tags', tagline: 'For bags and large items', pricePkr: 999, compareAtPkr: 1499, badge: 'sale' },
      { slug: 'item-labels', variant: 'item-label', category: 'Item Labels', title: 'Item Labels', tagline: 'For hard surfaces', pricePkr: 599, compareAtPkr: 899, badge: 'sale' },
      { slug: 'keychain-tags', variant: 'keychain', category: 'Keychain Tags', title: 'Keychain Tags', tagline: 'For keys and small bags', pricePkr: 499, compareAtPkr: 799, badge: 'sale' },
    ],
  },
  {
    tag: 'For your loved ones',
    title: 'Protect your loved ones.',
    lead: 'Pets, kids, elders, anyone who can wander or get lost. A scan reaches you in seconds, anywhere in Pakistan.',
    items: [
      { slug: 'pet-tags', variant: 'pet', category: 'Pet Tags', title: 'Pet Tags', tagline: 'For dogs and cats', pricePkr: 799, compareAtPkr: 1199, badge: 'sale' },
      { slug: 'wristband-tags', variant: 'wristband', category: 'Wristband Tags', title: 'Wristband Tags', tagline: 'For family & nursing home', pricePkr: 899, compareAtPkr: 1299, badge: 'sold-out' },
    ],
  },
  {
    tag: 'For your property',
    title: 'Protect your property.',
    lead: 'Car, gate, front door, mailbox, or anywhere visitors and finders need to reach you, without ringing every neighbour.',
    items: [
      { slug: 'car-tags', variant: 'car', category: 'Car Tags', title: 'Car Tags', tagline: 'For car windows and doors', pricePkr: 399, compareAtPkr: 749, badge: 'sale' },
      { slug: 'doorbell-tags', variant: 'doorbell', category: 'Doorbell Tags', title: 'Doorbell Tags', tagline: 'For doors, mailboxes, etc.', pricePkr: 499, compareAtPkr: 899, badge: 'sale' },
      { slug: 'iron-on-tags', variant: 'iron-on', category: 'Iron-on Tags', title: 'Iron-on Tags', tagline: 'For fabric surfaces', pricePkr: 699, compareAtPkr: 1099, badge: 'new' },
    ],
  },
];

const FEATURE_TRIO = [
  {
    title: 'Protect your bags',
    body: 'Travel, daily commute, school. A scan returns lost luggage without exposing your number.',
    variant: 'luggage' as QtagMockupVariant,
    bullets: ['Messaging for item recovery', 'Privacy protection', 'Ultra durable tag'],
  },
  {
    title: 'Protect your valuables',
    body: 'Passports, wallets, laptops. Quiet relay routes any scan straight into your inbox.',
    variant: 'item-label' as QtagMockupVariant,
    bullets: ['No subscription fee', 'Privacy protection', 'Fast set-up'],
  },
  {
    title: 'Protect your garments',
    body: 'Jackets, uniforms, kids’ backpacks. Iron-on tags survive the wash and the world.',
    variant: 'iron-on' as QtagMockupVariant,
    bullets: ['Messaging for key recovery', 'Privacy protection', 'Fast set-up'],
  },
];

const RISK_POINTS = [
  { title: 'Strangers see your number', body: 'A sticker with your phone number means anyone, scammers, telemarketers, prank callers, can dial you directly.' },
  { title: 'Old contacts never expire', body: 'Once your number is on a windshield or bag tag, it stays there forever, you cannot rotate it without replacing the sticker.' },
  { title: 'No rate limits, no filters', body: 'A scribbled number gives finders unlimited reach. There is no mute switch when one person decides to spam you.' },
];

const ADVANTAGES = [
  { title: 'Number stays hidden', body: 'Your real phone never shows on the public page. People reach you through our relay, built for safety first.' },
  { title: 'No app required', body: 'Anyone with a phone camera can open your tag. Works on everyday Android and iPhone, nothing to install.' },
  { title: 'WhatsApp first relay', body: 'Messages land in your WhatsApp inbox. No new app to babysit, just the chat thread you already use.' },
  { title: 'Lost mode in one tap', body: 'Flip a switch in your dashboard. The public page becomes a clear lost signal with optional reward.' },
  { title: 'Rate limits and bans', body: 'We rate-limit messages per tag and block abusive numbers. You stay in control even when scans spike.' },
  { title: 'Built for Pakistan', body: 'Local couriers, local numbers, and the way people actually use WhatsApp day to day.' },
];

const FAQ = [
  { q: 'Will people see my real phone number?', a: `No. Never. The public page shows a masked number. All calls and WhatsApp messages route through ${BRAND_NAME}, and finders see our number, not yours.` },
  { q: 'Do I need to install an app?', a: 'No. The owner uses our website to manage tags. The finder opens their phone camera, scans the QR, and a WhatsApp link opens. Nothing to install.' },
  { q: 'What if someone misuses the QR?', a: 'You can mute or disable the tag from your dashboard in one tap. We rate-limit messages on every tag, and we ban abusive numbers from the system.' },
  { q: 'How long does delivery take?', a: '2 to 3 working days in major cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad). Up to 5 days elsewhere via TCS or Leopards.' },
  { q: 'Can one tag cover more than one thing?', a: 'No, each QR is tied to one profile so scans always reach the right context. Need another bike, car, or bag covered? Add another tag from the shop or create a digital tag in your dashboard.' },
];

const FAQ_ACCORDION_ITEMS = FAQ.map((f, i) => ({ id: `faq-${i}`, q: f.q, a: f.a }));

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureTrioSection />
      <HowItWorksSection />
      {PROTECT_GROUPS.map((g) => (
        <ProtectSection key={g.title} group={g} />
      ))}
      <RiskSection />
      <AdvantageSection />
      <WhatIsCallout />
      <FinalCta />
      <NewsletterBand />
      <FaqSection />
    </>
  );
}

/* ---------------------------------------- HERO -------------------- */

function HeroSection() {
  return (
    <section className="relative overflow-hidden grain bg-brand">
      <HeroGlow />
      <div className="container-page relative pt-12 md:pt-16 pb-12 md:pb-16">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-6">
            <Stagger immediate stagger={0.12} delayChildren={0.1}>
              <StaggerItem>
                <div className="inline-flex items-center gap-2 mb-6 text-xs font-medium tracking-wide uppercase text-ink bg-paper px-3 py-1.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink animate-pulse" />
                  Smart safety, Made in Pakistan
                </div>
              </StaggerItem>

              <RevealText
                as="h1"
                immediate
                delay={0.18}
                className="font-display text-display-xl text-ink"
                lines={['Get found.', 'Stay private.']}
              />

              <StaggerItem>
                <p className="mt-6 text-lg md:text-xl text-ink/80 max-w-readable leading-relaxed">
                  {BRAND_NAME} sells physical QR safety tags. Each scan opens a page you control, vehicle context,
                  medical notes, lost mode, or a WhatsApp relay, without printing your phone number anywhere.
                </p>
              </StaggerItem>

              <StaggerItem>
                <div className="mt-8 flex flex-wrap gap-3">
                  <MagneticButton>
                    <Link href="/shop">
                      <Button size="lg" className="bg-ink text-paper hover:bg-ink-soft">
                        Shop tags, from {formatPkr(PRODUCT.pricePkr)}
                      </Button>
                    </Link>
                  </MagneticButton>
                  <MagneticButton>
                    <Link href="#how">
                      <Button size="lg" variant="secondary" className="bg-paper border-paper hover:bg-paper/90">
                        See how it works
                      </Button>
                    </Link>
                  </MagneticButton>
                </div>
              </StaggerItem>
            </Stagger>
          </div>

          <div className="md:col-span-6">
            <Reveal direction="up" delay={0.4} blur>
              <HeroCollage />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCollage() {
  return (
    <div className="relative mx-auto aspect-square max-w-md md:max-w-lg">
      {/* Backdrop passport-style card */}
      <div className="absolute inset-y-6 left-0 right-16 rounded-[26px] bg-paper-card border border-ink/10 shadow-cardHover rotate-[-5deg] overflow-hidden">
        <div className="h-full p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink">{BRAND_NAME} Passport</p>
            <div className="h-6 w-6 rounded-full border-2 border-ink/40" />
          </div>
          <div className="mt-3 flex-1 grid place-items-center">
            <svg viewBox="0 0 200 120" className="w-full max-w-[180px] opacity-90">
              <circle cx="100" cy="60" r="46" fill="none" stroke="#0E1116" strokeWidth="2" />
              <ellipse cx="100" cy="60" rx="46" ry="18" fill="none" stroke="#0E1116" strokeWidth="2" />
              <line x1="54" y1="60" x2="146" y2="60" stroke="#0E1116" strokeWidth="2" />
              <line x1="100" y1="14" x2="100" y2="106" stroke="#0E1116" strokeWidth="2" />
              <path d="M70 36 Q100 50 130 36" fill="none" stroke="#0E1116" strokeWidth="2" />
              <path d="M70 84 Q100 70 130 84" fill="none" stroke="#0E1116" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">Holder</p>
            <p className="text-sm font-semibold text-ink">Owner unknown · ID 79QP4XJR</p>
          </div>
        </div>
      </div>

      {/* Phone-style chat card */}
      <div className="absolute top-2 right-0 w-[58%] rounded-[24px] bg-ink text-paper shadow-cardHover rotate-[6deg] p-4">
        <div className="flex items-center justify-between text-[10px] text-paper/60">
          <span>{BRAND_NAME} relay</span>
          <span>now</span>
        </div>
        <div className="mt-3 space-y-2 text-[11px] leading-snug">
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-brand text-ink px-3 py-2">
            I scanned the tag on your lost passport, will leave it at the hotel desk.
          </div>
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-paper/10 px-3 py-2">
            You’re a lifesaver! Thank you so much.
          </div>
          <div className="ml-auto max-w-[60%] rounded-2xl rounded-br-sm bg-brand text-ink px-3 py-2">
            Glad I could do a good deed 🙌
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[9px] text-paper/55">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Number stays hidden
        </div>
      </div>

      {/* Front: luggage tag mockup */}
      <div className="absolute -bottom-2 left-2 w-[46%] rotate-[-9deg]">
        <div className="rounded-[20px] border border-ink/10 bg-paper-card shadow-cardHover overflow-hidden">
          <div className="aspect-[5/6]">
            <QtagProductMockup variant="luggage" />
          </div>
        </div>
      </div>

      {/* QTag chip overlay */}
      <div className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-ink text-paper px-3 py-1.5 text-[10px] font-semibold tracking-wide shadow-cardHover">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        {BRAND_NAME} contact tag
      </div>
    </div>
  );
}

/* ---------------------------------------- FEATURE TRIO ------------ */

function FeatureTrioSection() {
  return (
    <section className="bg-paper">
      <div className="container-page py-14 md:py-16">
        <Stagger className="grid gap-5 sm:grid-cols-2 md:grid-cols-3" stagger={0.1}>
          {FEATURE_TRIO.map((f) => (
            <StaggerItem key={f.title} blur>
              <FeatureCard {...f} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  body,
  variant,
  bullets,
}: {
  title: string;
  body: string;
  variant: QtagMockupVariant;
  bullets: string[];
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-paper-line bg-brand shadow-card">
      <div className="relative aspect-[5/3]">
        <QtagProductMockup variant={variant} />
      </div>
      <div className="p-6 bg-brand text-ink">
        <h3 className="font-display text-xl leading-tight">{title}</h3>
        <p className="mt-2 text-sm text-ink/80 leading-relaxed">{body}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <Check />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Check() {
  return (
    <span className="mt-0.5 grid place-items-center h-4 w-4 rounded-full bg-ink text-brand shrink-0">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

/* ---------------------------------------- HOW IT WORKS ------------ */

function HowItWorksSection() {
  return (
    <section id="how" className="bg-paper-card border-y border-paper-line">
      <div className="container-page py-16 md:py-20 scroll-mt-24">
        <Reveal as="div" className="max-w-3xl text-center mx-auto">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">How {BRAND_NAME} works</div>
          <h2 className="mt-3 font-display text-display-lg text-ink">Three steps. That&apos;s it.</h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-8 md:gap-10 md:grid-cols-3 max-w-5xl mx-auto" stagger={0.12}>
          {HOW_STEPS.map((s) => (
            <StaggerItem key={s.n} blur>
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-ink text-brand font-display text-lg">
                  {s.n}
                </div>
                <h3 className="mt-5 font-display text-xl text-ink">{s.title}</h3>
                <p className="mt-3 text-ink-soft leading-relaxed">{s.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------------------------------- PROTECT GROUPS --------- */

function ProtectSection({ group }: { group: (typeof PROTECT_GROUPS)[number] }) {
  return (
    <section className="bg-paper">
      <div className="container-page py-14 md:py-20 border-b border-paper-line">
        <Reveal as="div" className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{group.tag}</div>
          <h2 className="mt-3 font-display text-display-lg text-ink">{group.title}</h2>
          <p className="mt-4 text-ink-soft leading-relaxed">{group.lead}</p>
        </Reveal>

        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {group.items.map((p) => (
            <StaggerItem key={p.slug} blur>
              <ProductTile product={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function ProductTile({ product: p }: { product: ProductCard }) {
  const off = p.compareAtPkr ? Math.round(((p.compareAtPkr - p.pricePkr) / p.compareAtPkr) * 100) : null;
  return (
    <Link
      href="/shop"
      className="group relative block overflow-hidden rounded-[22px] border border-paper-line bg-paper-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cardHover"
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        <QtagProductMockup variant={p.variant} />
        {/* QTag brand overlay chip */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-paper-card/95 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink shadow-card">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          {BRAND_NAME}
        </div>
        {/* Status badge */}
        {p.badge === 'sale' && off ? (
          <span className="absolute top-3 right-3 rounded-full bg-ink text-paper px-2.5 py-1 text-[11px] font-semibold tracking-wide">
            {off}% off
          </span>
        ) : null}
        {p.badge === 'sold-out' ? (
          <span className="absolute top-3 right-3 rounded-full bg-ink text-paper px-2.5 py-1 text-[11px] font-semibold tracking-wide">
            Sold out
          </span>
        ) : null}
        {p.badge === 'new' ? (
          <span className="absolute top-3 right-3 rounded-full bg-brand text-ink px-2.5 py-1 text-[11px] font-semibold tracking-wide">
            New
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">{p.category}</p>
        <h3 className="mt-1 font-display text-lg leading-tight text-ink">{p.title}</h3>
        <p className="mt-1.5 text-sm text-ink-muted line-clamp-2 leading-relaxed">{p.tagline}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="font-display text-xl text-ink tnum">{formatPkr(p.pricePkr)}</div>
            {p.compareAtPkr ? (
              <div className="text-xs text-ink-muted line-through tnum">{formatPkr(p.compareAtPkr)}</div>
            ) : null}
          </div>
          <span className="text-xs font-medium text-brand group-hover:text-brand-dark transition-colors">
            Shop →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------------------------------------- RISK / PAIN ------------- */

function RiskSection() {
  return (
    <section className="bg-ink text-paper">
      <div className="container-page py-16 md:py-24">
        <Reveal as="div" className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Without {BRAND_NAME}</div>
          <h2 className="mt-3 font-display text-display-lg">
            Your phone number is putting you at risk.
          </h2>
          <p className="mt-4 text-paper/70 text-lg leading-relaxed">
            A sticker with your real number works once, then it sits there forever, on every car park, gate, and lost
            bag, where anyone can copy it down.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3" stagger={0.1}>
          {RISK_POINTS.map((r) => (
            <StaggerItem key={r.title}>
              <div className="border-t border-white/15 pt-5">
                <h3 className="font-display text-lg">{r.title}</h3>
                <p className="mt-2 text-paper/70 leading-relaxed">{r.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------------------------------- ADVANTAGE ---------------- */

function AdvantageSection() {
  return (
    <section id="advantage" className="bg-ink-soft text-paper scroll-mt-24">
      <div className="container-page py-16 md:py-24">
        <Reveal as="div" className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">The {BRAND_NAME} advantage</div>
          <h2 className="mt-3 font-display text-display-lg">
            A privacy relay built around your everyday phone.
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3" stagger={0.08}>
          {ADVANTAGES.map((f) => (
            <StaggerItem key={f.title}>
              <div className="flex gap-4">
                <CheckPill />
                <div>
                  <h3 className="font-display text-lg">{f.title}</h3>
                  <p className="mt-2 text-paper/70 leading-relaxed">{f.body}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function CheckPill() {
  return (
    <span className="mt-1 grid place-items-center h-6 w-6 rounded-full bg-brand text-ink shrink-0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

/* ---------------------------------------- WHAT IS QTAG ----------- */

function WhatIsCallout() {
  return (
    <section className="bg-ink text-paper border-t border-white/5">
      <div className="container-page py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
        <Reveal as="div" className="md:col-span-7">
          <h2 className="font-display text-display-2xl leading-[0.95] tracking-tighter">
            WHAT IS <span className="text-brand">{BRAND_NAME.toUpperCase()}</span>?
          </h2>
        </Reveal>
        <Reveal as="div" className="md:col-span-5">
          <p className="text-paper/75 text-lg leading-relaxed">
            A physical QR tag, plus a privacy-first relay. Stick it on your car, bag, gate, or pet collar. When someone
            scans, they reach you on WhatsApp through {BRAND_NAME}, your real number never appears.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <MagneticButton>
              <Link href="/about">
                <Button size="lg" className="bg-brand text-ink hover:bg-brand-dark">
                  Learn more about {BRAND_NAME}
                </Button>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link href="/shop">
                <Button size="lg" variant="secondary" className="bg-transparent border-white/30 text-paper hover:bg-white/10">
                  Browse shop
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------- FINAL CTA --------------- */

function FinalCta() {
  return (
    <section className="bg-brand">
      <div className="container-page py-16 md:py-20 text-center">
        <Reveal>
          <h2 className="font-display text-display-lg text-ink max-w-3xl mx-auto">
            Get protection for your gear and privacy now.
          </h2>
          <p className="mt-4 text-ink/80 max-w-xl mx-auto">
            Order tags, activate in seconds, and put a private relay between your phone and the world.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <MagneticButton>
              <Link href="/shop">
                <Button size="lg" className="bg-ink text-paper hover:bg-ink-soft">
                  Shop {BRAND_NAME} tags
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------- NEWSLETTER -------------- */

function NewsletterBand() {
  return (
    <section className="bg-brand/40 border-y border-brand/40">
      <div className="container-page py-12 md:py-14 grid md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6">
          <h2 className="font-display text-display-md text-ink">Get 10% off your first order.</h2>
          <p className="mt-2 text-ink/75">Drop your email, we&apos;ll send a one-time code. No spam, ever.</p>
        </div>
        <form className="md:col-span-6 flex flex-col sm:flex-row gap-3" action="#" method="post">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="flex-1 h-14 px-5 rounded-xl border border-ink/15 bg-paper-card text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
          <Button type="submit" size="lg" className="bg-ink text-paper hover:bg-ink-soft">
            Get my 10% off
          </Button>
        </form>
      </div>
    </section>
  );
}

/* ---------------------------------------- FAQ --------------------- */

function FaqSection() {
  return (
    <section id="faq" className="container-page py-20 scroll-mt-24">
      <Reveal as="div" className="max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">FAQ</div>
        <h2 className="mt-3 font-display text-display-lg text-ink">Common questions.</h2>
      </Reveal>
      <FaqAccordion items={FAQ_ACCORDION_ITEMS} />
    </section>
  );
}

