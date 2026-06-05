import { BRAND_NAME } from '@/lib/brand';

export function EmbedFooter() {
  return (
    <footer className="mt-auto border-t border-paper-line py-6 text-center text-xs text-ink-muted">
      {BRAND_NAME} · tag activation
    </footer>
  );
}
