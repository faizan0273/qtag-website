import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BRAND_NAME } from '@/lib/brand';
import { env } from '@/lib/env';
import { MagneticButton, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { QtagProductMockup } from '@/components/marketing/QtagProductMockup';

export const metadata: Metadata = {
  title: 'About',
  description: `${env.NEXT_PUBLIC_BRAND_NAME}, smart QR safety tags for Pakistan. Privacy first scans and WhatsApp relay.`,
};

const STATS = [
  { value: '10K+', label: 'Active QR tags' },
  { value: '6+', label: 'Physical tag lines in the shop' },
  { value: 'Pakistan', label: 'Nationwide, one country we serve' },
  { value: '< 2s', label: 'Typical tag page load' },
] as const;

const QR_TAG_TYPES = [
  'Medical',
  'Vehicle',
  'Lost & Found',
  'Child Safety',
  'Elder Safety',
  'Travel',
  'General',
] as const;

const VALUES = [
  {
    title: 'Safety first',
    body: 'Every feature is designed with one question in mind: does this help keep someone safer? That principle drives every product decision we make.',
  },
  {
    title: 'Privacy by design',
    body: 'You decide exactly what each tag shows and to whom. We never sell your data or share it with advertisers. Your information, your rules.',
  },
  {
    title: 'Speed when it matters',
    body: `In an emergency, seconds count. ${BRAND_NAME} tag pages load in under two seconds on a typical connection across Pakistan.`,
  },
  {
    title: 'Accessible to all',
    body: 'No app to install. No account required to scan. A tag works for anyone with a smartphone camera, by design.',
  },
  {
    title: 'Pakistan first',
    body: 'We optimise for local couriers, local numbers, and the way people actually use WhatsApp day to day.',
  },
  {
    title: 'Continuously improving',
    body: 'We ship improvements based on real user feedback. If something does not work well for you, we want to know.',
  },
] as const;

const OFFERS_LEFT = [
  'Works on any smartphone, no app needed',
  'Edit content anytime; changes go live instantly',
  'Real time scan notifications with location',
  'Public or private, you control access',
];
const OFFERS_RIGHT = [
  'Multiple SKUs for vehicles, bags, entryways, pets, and more',
  'Checkout and fulfilment tuned for Pakistan',
  'Lost mode, rewards, and rate limits from one dashboard',
  'WhatsApp first relay, your SIM stays off the public page',
];

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-brand">
        <div className="container-page pt-12 md:pt-16 pb-16 md:pb-20">
          <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-center">
            <div className="md:col-span-7">
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/80">About {BRAND_NAME}</p>
                <h1 className="mt-3 font-display text-display-xl text-ink max-w-3xl">
                  Smart safety for everyone, everywhere.
                </h1>
                <p className="mt-6 text-lg md:text-xl text-ink/80 max-w-3xl leading-relaxed">
                  {BRAND_NAME} is about one thing: QR tags that put the right information in the right hands, medical
                  notes, vehicle context, lost mode, a quiet WhatsApp relay, while you stay in control of your privacy.
                  We design, sell, and support tags for Pakistan with nationwide delivery.
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <MagneticButton>
                    <Link href="/shop">
                      <Button size="lg" className="bg-ink text-paper hover:bg-ink-soft">
                        Shop QR tags
                      </Button>
                    </Link>
                  </MagneticButton>
                  <MagneticButton>
                    <Link href="/#how" scroll={false}>
                      <Button size="lg" variant="secondary" className="bg-paper border-paper hover:bg-paper/90">
                        How tags work
                      </Button>
                    </Link>
                  </MagneticButton>
                </div>
              </Reveal>
            </div>
            <div className="md:col-span-5">
              <Reveal direction="up" delay={0.2} blur>
                <AboutHeroCluster />
              </Reveal>
            </div>
          </div>

          <Stagger className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" stagger={0.1}>
            {STATS.map((s) => (
              <StaggerItem key={s.label} blur>
                <div className="rounded-2xl bg-paper-card border border-ink/10 p-5 md:p-6 text-center md:text-left">
                  <div className="font-display text-3xl md:text-4xl text-ink">{s.value}</div>
                  <div className="mt-2 text-sm text-ink-muted leading-snug">{s.label}</div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-paper">
        <div className="container-page py-16 md:py-24 max-w-3xl">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Our mission</div>
            <h2 className="mt-3 font-display text-display-lg text-ink">
              Information in the right hands. Privacy in yours.
            </h2>
            <p className="mt-6 text-ink-soft text-lg leading-relaxed">
              We started {BRAND_NAME} with a simple observation: in moments that matter most, accidents, medical
              emergencies, lost children, or a stranger trying to reach you about something you own, the right
              information in the right hands can change everything. Yet sharing that information safely and instantly
              was harder than it should be.
            </p>
            <p className="mt-6 text-ink-soft text-lg leading-relaxed">
              Our mission is to make personal safety information instantly accessible to those who need it, while
              giving people complete control over their privacy, through durable QR tags and a relay you can turn on,
              tune, or mute from your dashboard.
            </p>
          </Reveal>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="bg-paper-card border-y border-paper-line">
        <div className="container-page py-16 md:py-24">
          <Reveal as="div" className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">What we offer</div>
            <h2 className="mt-3 font-display text-display-lg text-ink">Two simple products. One promise.</h2>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="rounded-2xl border border-paper-line bg-paper p-8 md:p-10 h-full">
                <h3 className="font-display text-2xl text-ink">Smart QR tags</h3>
                <p className="mt-4 text-ink-soft leading-relaxed">
                  Each tag is a scannable code that opens a page you manage, medical data, emergency contacts, vehicle
                  or item details, lost item recovery, and more. The physical tag never changes; the page behind it
                  always does.
                </p>
                <ul className="mt-6 space-y-3 text-ink-soft">
                  {OFFERS_LEFT.map((line) => (
                    <li key={line} className="flex gap-3">
                      <Check />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-2xl border border-paper-line bg-paper p-8 md:p-10 h-full">
                <h3 className="font-display text-2xl text-ink">Shop and activate</h3>
                <p className="mt-4 text-ink-soft leading-relaxed">
                  Order physical tags from the catalogue, or create digital tags in your dashboard. Every UID is
                  reserved for you; activation binds the tag to your profile so scans always reach the right inbox.
                </p>
                <ul className="mt-6 space-y-3 text-ink-soft">
                  {OFFERS_RIGHT.map((line) => (
                    <li key={line} className="flex gap-3">
                      <Check />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="bg-ink text-paper">
        <div className="container-page py-16 md:py-24">
          <Reveal as="div" className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Tag use cases</div>
            <h2 className="mt-3 font-display text-display-lg">One product line, many situations.</h2>
            <p className="mt-4 text-paper/70 leading-relaxed">
              Pick the tag type that matches what you are protecting, the page behind every QR can be re-tuned at any
              time from your dashboard.
            </p>
          </Reveal>

          <Stagger className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" stagger={0.05}>
            {QR_TAG_TYPES.map((t) => (
              <StaggerItem key={t}>
                <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-4 text-paper/85">
                  {t}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-paper">
        <div className="container-page py-16 md:py-24">
          <Reveal as="div" className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Our values</div>
            <h2 className="mt-3 font-display text-display-lg text-ink">What we ship is shaped by what we believe.</h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {VALUES.map((v) => (
              <StaggerItem key={v.title} blur>
                <div className="h-full rounded-2xl border border-paper-line bg-paper-card p-7">
                  <h3 className="font-display text-xl text-ink">{v.title}</h3>
                  <p className="mt-3 text-ink-soft leading-relaxed">{v.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand">
        <div className="container-page py-16 md:py-20 text-center">
          <Reveal>
            <h2 className="font-display text-display-lg text-ink max-w-3xl mx-auto">
              Ready to put a private relay between your phone and the world?
            </h2>
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
    </>
  );
}

function Check() {
  return (
    <span className="mt-1 grid place-items-center h-5 w-5 rounded-full bg-brand text-ink shrink-0">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

function AboutHeroCluster() {
  return (
    <div className="relative mx-auto aspect-square max-w-md">
      <div className="absolute inset-y-4 left-0 right-12 rotate-[-6deg]">
        <div className="rounded-[22px] border border-ink/10 bg-paper-card shadow-cardHover overflow-hidden h-full">
          <QtagProductMockup variant="pet" />
        </div>
      </div>
      <div className="absolute top-3 right-0 w-[58%] rotate-[7deg]">
        <div className="rounded-[22px] border border-ink/10 bg-paper-card shadow-cardHover overflow-hidden">
          <div className="aspect-[5/6]">
            <QtagProductMockup variant="luggage" />
          </div>
        </div>
      </div>
      <div className="absolute -bottom-2 left-4 w-[46%] rotate-[-10deg]">
        <div className="rounded-[20px] border border-ink/10 bg-paper-card shadow-cardHover overflow-hidden">
          <div className="aspect-square">
            <QtagProductMockup variant="keychain" />
          </div>
        </div>
      </div>
    </div>
  );
}
