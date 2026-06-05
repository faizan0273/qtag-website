import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicProfile } from '@/lib/services/qr-product.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ScanBeacon } from '@/components/scan/ScanBeacon';
import { ContactForm } from '@/components/scan/ContactForm';
import { ScanActionsBar } from '@/components/scan/ScanActionsBar';
import { env } from '@/lib/env';
import { formatPkr } from '@/lib/constants';
import { BRAND_NAME } from '@/lib/brand';
import { productTypeLabel, type ProductType } from '@/lib/product-type';

function lostBannerLabel(pt: ProductType): { title: string; emoji: string } {
  switch (pt) {
    case 'PET':
      return { title: 'Pet lost?', emoji: '🐾' };
    case 'BAG':
      return { title: 'Lost bag or item', emoji: '🎒' };
    case 'PROPERTY':
      return { title: 'Alert, property', emoji: '🏠' };
    case 'ITEM':
      return { title: 'Lost item', emoji: '🏷️' };
    default:
      return { title: 'Marked as lost', emoji: '🚨' };
  }
}

function TypeDetail({
  productType,
  title,
  vehicle,
  description,
}: {
  productType: ProductType;
  title: string;
  vehicle?: {
    plate: string;
    make: string;
    model?: string | null;
    color: string;
  };
  description?: string | null;
}) {
  if (productType === 'CAR' && vehicle) {
    return (
      <div className="text-center">
        <div className="text-sm uppercase tracking-widest text-ink-muted">Vehicle</div>
        <h1 className="mt-1 font-display text-display-md text-ink">
          {vehicle.color} {vehicle.make}
          {vehicle.model ? ` ${vehicle.model}` : ''}
        </h1>
        <div className="mt-2 inline-block px-3 py-1 rounded-md bg-ink text-paper font-mono tnum text-sm tracking-wider">
          {vehicle.plate}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-sm uppercase tracking-widest text-ink-muted">{productTypeLabel(productType)}</div>
      <h1 className="mt-1 font-display text-display-md text-ink">{title}</h1>
      {description ? <p className="mt-3 text-ink-soft text-sm leading-relaxed">{description}</p> : null}
    </div>
  );
}

export async function ScanPublicPage({ slug }: { slug: string }) {
  const view = await getPublicProfile(slug);
  if (!view) notFound();

  if (view.state === 'PRINTED') {
    return (
      <Frame>
        <div className="text-center">
          <div className="text-5xl mb-3">{view.typeIcon}</div>
          <h1 className="font-display text-display-md text-ink">This tag is not active yet.</h1>
          <p className="mt-3 text-ink-soft">
            {view.title ? (
              <>
                "<span className="font-medium text-ink">{view.title}</span>" is waiting for the owner to finish
                activation.
              </>
            ) : (
              "It hasn't been activated yet. If you're the owner, sign in and complete setup from your dashboard."
            )}
          </p>
          <Link href={`/login?next=${encodeURIComponent(`/t/${slug}/activate`)}`} className="block mt-6">
            <Button size="lg">I'm the owner, activate it</Button>
          </Link>
        </div>
      </Frame>
    );
  }

  if (view.state === 'DISABLED') {
    return (
      <Frame>
        <div className="text-center">
          <h1 className="font-display text-display-md text-ink">This tag is no longer active.</h1>
          <p className="mt-3 text-ink-soft">
            The owner has disabled it, or the account is no longer active.
          </p>
        </div>
      </Frame>
    );
  }

  const isLost = view.state === 'LOST';
  const lost = lostBannerLabel(view.productType);

  return (
    <Frame>
      <ScanBeacon uid={slug} />

      {isLost ? (
        <div className="-mt-2 mb-6 px-4 py-3 rounded-xl bg-danger/10 text-danger flex items-center gap-3">
          <span className="text-xl">{lost.emoji}</span>
          <div>
            <div className="font-display text-base">{lost.title}</div>
            {view.lastSeenCity ? (
              <div className="text-sm">Last seen near {view.lastSeenCity}</div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex justify-center mb-4 text-4xl" aria-hidden>
        {view.typeIcon}
      </div>

      <TypeDetail
        productType={view.productType}
        title={view.title}
        vehicle={view.vehicle}
        description={view.description}
      />

      <div className="mt-8 pt-6 border-t border-paper-line text-center">
        <div className="text-sm text-ink-muted">Safe profile, {productTypeLabel(view.productType)}</div>
        <div className="mt-1 font-display text-xl text-ink">{view.publicName ?? 'Owner'}</div>
        <div className="mt-2 font-mono tnum text-ink-soft">{view.ownerPhoneMasked}</div>
        <p className="mt-2 text-xs text-ink-muted">
          {view.isPhoneNumberAllow
            ? 'This is not the owner&apos;s real number on this page. Use WhatsApp or the message form below.'
            : 'This is not the owner&apos;s real number. Send a message below and we will relay it from our company WhatsApp.'}
        </p>
      </div>

      <ScanActionsBar
        isPhoneNumberAllow={view.isPhoneNumberAllow ?? false}
        whatsappHref={view.whatsappHref}
        companyContactPhone={env.NEXT_PUBLIC_COMPANY_CONTACT_PHONE ?? null}
      />

      {isLost && view.rewardPkr ? (
        <div className="mt-6 px-4 py-3 rounded-xl bg-brand-soft text-brand text-center">
          <div className="text-xs uppercase tracking-widest">Thank you reward</div>
          <div className="font-display text-xl tnum mt-0.5">{formatPkr(view.rewardPkr)}</div>
        </div>
      ) : null}

      {isLost && view.lostMessage ? (
        <p className="mt-6 text-center text-ink-soft italic">"{view.lostMessage}"</p>
      ) : null}

      <div className="mt-8">
        <ContactForm
          uid={slug}
          isLost={isLost}
          productType={view.productType}
          relayMode={!(view.isPhoneNumberAllow ?? false)}
          companyContactPhone={env.NEXT_PUBLIC_COMPANY_CONTACT_PHONE ?? null}
        />
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        Powered by {BRAND_NAME} · Your number stays hidden until you choose to share it
      </p>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-10 md:py-16 max-w-md">
      <Card padding="lg">{children}</Card>
    </div>
  );
}
