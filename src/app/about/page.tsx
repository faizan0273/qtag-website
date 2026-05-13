import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BRAND_NAME } from '@/lib/brand';
import { env } from '@/lib/env';

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

export default function AboutPage() {
  return (
    <div className="bg-paper">
      <section className="container-page pt-12 md:pt-20 pb-16 md:pb-24">
        <p className="text-sm font-medium uppercase tracking-wide text-brand">About {BRAND_NAME}</p>
        <h1 className="mt-3 font-display text-display-xl text-ink max-w-3xl">
          Smart safety for everyone, everywhere.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-ink-soft max-w-3xl leading-relaxed">
          {BRAND_NAME} is about one thing: <strong className="text-ink font-medium">QR tags</strong> that put the right
          information in the right hands, medical notes, vehicle context, lost mode, a quiet WhatsApp relay, while you
          stay in control of your privacy. We design, sell, and support tags for{' '}
          <strong className="text-ink font-medium">Pakistan</strong> with nationwide delivery.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/shop">
            <Button size="lg">Shop QR tags</Button>
          </Link>
          <Link href="/#how">
            <Button size="lg" variant="secondary">
              How tags work
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((s) => (
            <Card key={s.label} padding="lg" className="text-center md:text-left">
              <div className="font-display text-3xl md:text-4xl text-brand">{s.value}</div>
              <div className="mt-2 text-sm text-ink-muted leading-snug">{s.label}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-paper-line bg-paper-card/50">
        <div className="container-page py-16 md:py-24 max-w-3xl">
          <h2 className="font-display text-display-lg text-ink">Our mission</h2>
          <p className="mt-6 text-ink-soft text-lg leading-relaxed">
            We started {BRAND_NAME} with a simple observation: in moments that matter most, accidents, medical
            emergencies, lost children, or a stranger trying to reach you about something you own, the right information
            in the right hands can change everything. Yet sharing that information safely and instantly was harder than it
            should be.
          </p>
          <p className="mt-6 text-ink-soft text-lg leading-relaxed">
            Our mission is to make personal safety information instantly accessible to those who need it, while giving
            people complete control over their privacy, through durable QR tags and a relay you can turn on, tune, or
            mute from your dashboard.
          </p>
        </div>
      </section>

      <section className="container-page py-16 md:py-24">
        <h2 className="font-display text-display-lg text-ink">What we offer</h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <Card padding="lg">
            <h3 className="font-display text-2xl text-ink">Smart QR tags</h3>
            <p className="mt-4 text-ink-soft leading-relaxed">
              Each tag is a scannable code that opens a page you manage, medical data, emergency contacts, vehicle or
              item details, lost item recovery, and more. The physical tag never changes; the page behind it always does.
            </p>
            <ul className="mt-6 space-y-3 text-ink-soft">
              <li className="flex gap-2">
                <span className="text-brand shrink-0">✓</span>
                <span>Works on any smartphone, no app needed</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand shrink-0">✓</span>
                <span>Edit content anytime; changes go live instantly</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand shrink-0">✓</span>
                <span>Real time scan notifications with location</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand shrink-0">✓</span>
                <span>Public or private, you control access</span>
              </li>
            </ul>
          </Card>

          <Card padding="lg">
            <h3 className="font-display text-2xl text-ink">Shop and activate</h3>
            <p className="mt-4 text-ink-soft leading-relaxed">
              Order physical tags from the catalogue, or create digital tags in your dashboard. Every UID is reserved
              for you; activation binds the tag to your profile so scans always reach the right inbox.
            </p>
            <ul className="mt-6 space-y-3 text-ink-soft">
              <li className="flex gap-2">
                <span className="text-brand shrink-0">✓</span>
                <span>Multiple SKUs for vehicles, bags, entryways, pets, and more</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand shrink-0">✓</span>
                <span>Checkout and fulfilment tuned for Pakistan</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand shrink-0">✓</span>
                <span>Lost mode, rewards, and rate limits from one dashboard</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand shrink-0">✓</span>
                <span>WhatsApp first relay, your SIM stays off the public page</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="border-t border-paper-line bg-ink text-paper py-16 md:py-24">
        <div className="container-page max-w-2xl">
          <h2 className="font-display text-display-lg">Tag use cases</h2>
          <p className="mt-4 text-paper/75">
            One product line, many situations, pick the tag type that matches what you are protecting.
          </p>
          <ul className="mt-8 space-y-2 text-paper/80">
            {QR_TAG_TYPES.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-brand-soft shrink-0">·</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-16 md:py-24">
        <h2 className="font-display text-display-lg text-ink">Our values</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <Card key={v.title} padding="lg">
              <h3 className="font-display text-xl text-ink">{v.title}</h3>
              <p className="mt-3 text-ink-soft leading-relaxed">{v.body}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
