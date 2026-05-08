import type { ProductType } from '@/lib/product-type';

/**
 * Catalogue SKUs — checkout resolves price & tag count server-side only.
 */
export const SHOP_SKUS = [
  'car-parking-tag',
  'car-sampark-tag',
  'bike-helmet-2-pack',
  'smart-business-card',
  'qr-video-door-2-pack',
  'lost-found-ring-4-stickers',
] as const;

export type ShopSku = (typeof SHOP_SKUS)[number];

export type ShopCatalogEntry = {
  id: ShopSku;
  /** Small category pill (e.g. Vehicle, Home). */
  categoryLabel: string;
  title: string;
  subtitle: string;
  summary: string;
  pricePkr: number;
  compareAtPkr: number | null;
  offers: string[];
  matrixRows: { title: string; cells: readonly [string, string, string, string] }[];
  specs: { label: string; value: string }[];
  highlights: string[];
  story: string[];
  tagsPerPack: number;
  defaultTagProductType: ProductType;
  unitLabel: string;
};

const SPEC_MATERIAL = 'Premium waterproof PVC';

/** Scano-aligned capability grid (privacy-first QR relay). */
const STANDARD_MATRIX: ShopCatalogEntry['matrixRows'] = [
  {
    title: 'How finders reach you',
    cells: ['WhatsApp relay', 'Short message', 'Masked on page', 'Dashboard inbox'],
  },
  {
    title: 'You stay in control',
    cells: ['Mute / disable tag', 'Lost mode', 'Rate limits', 'COD checkout'],
  },
  {
    title: 'Built for daily use',
    cells: ['Weatherproof print', 'Strong adhesive', '1 yr warranty', 'Quick setup'],
  },
];

export const SHOP_CATALOG: ShopCatalogEntry[] = [
  {
    id: 'car-parking-tag',
    categoryLabel: 'Vehicle · parking',
    title: 'Windshield parking tag',
    subtitle: 'Let someone contact you about wrong parking — without showing your number.',
    summary:
      'Camera scan opens your Scano relay page. They message you on WhatsApp; your phone stays private.',
    pricePkr: 399,
    compareAtPkr: 749,
    offers: [
      'Privacy-first WhatsApp relay',
      'Works with any phone camera',
      'Activate in seconds after delivery',
      'Cash on delivery · nationwide',
    ],
    matrixRows: STANDARD_MATRIX,
    specs: [
      { label: 'Material', value: SPEC_MATERIAL },
      { label: 'Fit', value: 'Standard — all windshields' },
      { label: 'Warranty', value: '1 year replacement' },
    ],
    highlights: [
      'Outdoor-grade print and laminate',
      'Corner-friendly 6×6 cm footprint',
      'Lost mode from your dashboard',
      '7-day returns on unused tags (see policy)',
      'Free shipping over threshold at checkout',
    ],
    story: [
      'Designed for apartment lots, street parking, and malls — when someone needs you about your car, they scan once and reach you safely.',
      'Works with the same Scano activation flow you already use: scan, verify, and your tag is live.',
    ],
    tagsPerPack: 1,
    defaultTagProductType: 'CAR',
    unitLabel: 'tag',
  },
  {
    id: 'car-sampark-tag',
    categoryLabel: 'Vehicle · contact',
    title: 'Car contact tag',
    subtitle: 'Emergency notes, neighbour reach-out, or quick help at the curb.',
    summary:
      'Same privacy relay as our parking line — tuned for “need the owner now” moments without exposing your digits.',
    pricePkr: 399,
    compareAtPkr: 699,
    offers: [
      'Relay via WhatsApp — number hidden',
      'Optional display name on scan page',
      'One tag per order unit',
      'Cash on delivery',
    ],
    matrixRows: STANDARD_MATRIX,
    specs: [
      { label: 'Material', value: SPEC_MATERIAL },
      { label: 'Fit', value: 'Universal vehicle apply' },
      { label: 'Warranty', value: '1 year replacement' },
    ],
    highlights: [
      'Pairs with Scano dashboard controls',
      'Road-friendly adhesive',
      'Readable QR in dim light',
      'Printed UID matches your order',
    ],
    story: [
      'Keep a second tag for a second vehicle, or stash one in the glove box for a spare mount — each tag has its own UID and activation.',
    ],
    tagsPerPack: 1,
    defaultTagProductType: 'CAR',
    unitLabel: 'tag',
  },
  {
    id: 'bike-helmet-2-pack',
    categoryLabel: 'Bike · 2-pack',
    title: 'Bike + helmet duo pack',
    subtitle: 'Two tags: one for the bike, one for the helmet.',
    summary:
      'If the bike is moved or the helmet is left behind, a scan still opens the Scano relay — helpful in cities and campus parking.',
    pricePkr: 499,
    compareAtPkr: 899,
    offers: [
      'Two unique QR tags in one pack',
      'Separate activation per tag',
      'Lightweight, weatherproof',
      'Cash on delivery',
    ],
    matrixRows: STANDARD_MATRIX,
    specs: [
      { label: 'Material', value: SPEC_MATERIAL },
      { label: 'Fit', value: 'Bike frame + helmet' },
      { label: 'Warranty', value: '1 year replacement' },
    ],
    highlights: [
      'Smaller footprint for tubes and helmets',
      'Same Scano privacy guarantees',
      'Ideal for students and daily riders',
    ],
    story: [
      'Reserve two UIDs on order: activate each from your phone when they arrive. Perfect if you ride with a passenger helmet or a second bike.',
    ],
    tagsPerPack: 2,
    defaultTagProductType: 'CAR',
    unitLabel: 'pack (2 tags)',
  },
  {
    id: 'smart-business-card',
    categoryLabel: 'Business',
    title: 'QR smart card',
    subtitle: 'Share your line, WhatsApp, or landing link with one scan.',
    summary:
      'A physical card people can photograph — your Scano-backed profile keeps the conversation organized and your personal number optional.',
    pricePkr: 599,
    compareAtPkr: 1299,
    offers: [
      'Professional scan-to-contact flow',
      'Great for shops, riders, and freelancers',
      'Editable from Scano dashboard',
      'Cash on delivery',
    ],
    matrixRows: STANDARD_MATRIX,
    specs: [
      { label: 'Material', value: SPEC_MATERIAL },
      { label: 'Format', value: 'Card / tag slot' },
      { label: 'Warranty', value: '1 year replacement' },
    ],
    highlights: [
      'Keeps work and personal boundaries clear',
      'Hand out at events, counters, or deliveries',
      'High-contrast QR for quick focus',
    ],
    story: [
      'Use it where a paper card beats typing a long number: counter displays, bike delivery boxes, or a lanyard at expos.',
    ],
    tagsPerPack: 1,
    defaultTagProductType: 'ITEM',
    unitLabel: 'card',
  },
  {
    id: 'qr-video-door-2-pack',
    categoryLabel: 'Home · entryway',
    title: 'Entryway QR duo',
    subtitle: 'Visitors and couriers reach you without ringing every neighbour.',
    summary:
      'Two tags for gate + door — scan opens your relay so guests or riders can WhatsApp you quietly with context.',
    pricePkr: 499,
    compareAtPkr: 999,
    offers: [
      'Pack of two linked UIDs',
      'Courier-friendly messaging',
      'No app download for visitors',
      'Cash on delivery',
    ],
    matrixRows: STANDARD_MATRIX,
    specs: [
      { label: 'Material', value: SPEC_MATERIAL },
      { label: 'Use', value: 'Gate / door / intercom adj.' },
      { label: 'Warranty', value: '1 year replacement' },
    ],
    highlights: [
      'Acrylic-ready outdoor finish',
      'Share delivery notes in one tap',
      'Great for townhouse lanes',
    ],
    story: [
      'Mount one at the street gate and one at the door — each scan is a discrete thread in your dashboard if you split flows later.',
    ],
    tagsPerPack: 2,
    defaultTagProductType: 'PROPERTY',
    unitLabel: 'pack (2 tags)',
  },
  {
    id: 'lost-found-ring-4-stickers',
    categoryLabel: 'Lost & found',
    title: 'Ring + four stickers',
    subtitle: 'Tag bags, pets, passports, laptops — scan returns your item thread.',
    summary:
      'One keyring tag plus four sticker labels: same Scano relay, optimised for whatever moves with you every day.',
    pricePkr: 499,
    compareAtPkr: 999,
    offers: [
      'Five unique codes in one order',
      'Travel and daily-carry friendly',
      'Private relay keeps your SIM hidden',
      'Cash on delivery',
    ],
    matrixRows: STANDARD_MATRIX,
    specs: [
      { label: 'Material', value: SPEC_MATERIAL },
      { label: 'Kit', value: '1 ring + 4 adhesives' },
      { label: 'Warranty', value: '1 year replacement' },
    ],
    highlights: [
      'Split across pets, kids’ bags, and tech',
      'Peel-and-stick backups for luggage',
      'Ring fits keychains and zipper pulls',
    ],
    story: [
      'You get five QR UIDs reserved at checkout — activate each when you assign it so the right nickname shows on each scan page.',
    ],
    tagsPerPack: 5,
    defaultTagProductType: 'BAG',
    unitLabel: 'set',
  },
];

export function shopCatalogById(id: string): ShopCatalogEntry | undefined {
  return SHOP_CATALOG.find((p) => p.id === id);
}

export function isShopSku(id: string): id is ShopSku {
  return (SHOP_SKUS as readonly string[]).includes(id);
}

export function discountPercent(price: number, compareAt: number | null): number | null {
  if (compareAt == null || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
