import { BRAND_NAME } from '@/lib/brand';

const ITEMS = [
  'Free shipping over PKR 999',
  `${BRAND_NAME} privacy relay`,
  'Made in Pakistan',
  'Activate in seconds',
];

export function PromoBar() {
  return (
    <div className="bg-ink text-paper text-[12px]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-9 flex items-center justify-between gap-6 overflow-hidden">
        <div className="flex items-center gap-6 whitespace-nowrap overflow-hidden">
          {ITEMS.map((t, i) => (
            <span key={t} className={i === 0 ? '' : 'hidden sm:inline-flex items-center gap-6 text-paper/70'}>
              {i !== 0 ? <span aria-hidden className="h-1 w-1 rounded-full bg-brand/70" /> : null}
              {t}
            </span>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3 text-paper/70">
          <a href="mailto:hello@qtag.pk" className="hover:text-paper transition-colors">hello@qtag.pk</a>
          <span aria-hidden>·</span>
          <a href="https://wa.me/" className="hover:text-paper transition-colors">WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
