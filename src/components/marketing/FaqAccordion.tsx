'use client';

import { useCallback, useId, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export type FaqItem = { id: string; q: string; a: string };

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={[
        'mt-0.5 grid place-items-center h-8 w-8 shrink-0 rounded-lg border border-paper-line bg-paper text-ink-soft transition-transform',
        open ? 'rotate-180' : '',
      ].join(' ')}
      aria-hidden
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  );
}

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const baseId = useId();
  const [open, setOpen] = useState<boolean[]>(() => items.map(() => false));

  const expandAll = useCallback(() => {
    setOpen(items.map(() => true));
  }, [items]);

  const collapseAll = useCallback(() => {
    setOpen(items.map(() => false));
  }, [items]);

  const toggle = useCallback((index: number) => {
    setOpen((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const allOpen = open.length > 0 && open.every(Boolean);
  const allClosed = open.length === 0 || open.every((o) => !o);

  return (
    <div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted max-w-xl">
          Expand or collapse each question. Use the buttons to open or close every answer at once.
        </p>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button type="button" variant="secondary" size="sm" onClick={expandAll} disabled={allOpen}>
            Expand all
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={collapseAll} disabled={allClosed}>
            Collapse all
          </Button>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4 md:gap-6">
        {items.map((item, i) => {
          const panelId = `${baseId}-panel-${i}`;
          const isOpen = open[i] ?? false;
          return (
            <Card key={item.id} padding="none" className="overflow-hidden shadow-card">
              <h3 className="font-display text-lg text-ink leading-snug">
                <button
                  type="button"
                  id={`${baseId}-btn-${i}`}
                  className="w-full text-left flex items-start justify-between gap-3 px-5 py-4 md:px-6 md:py-5 hover:bg-paper-line/30 transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(i)}
                >
                  <span className="pr-2">{item.q}</span>
                  <Chevron open={isOpen} />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={`${baseId}-btn-${i}`}
                hidden={!isOpen}
                className={isOpen ? 'border-t border-paper-line px-5 pb-5 pt-4 md:px-6' : undefined}
              >
                <p className="text-ink-soft leading-relaxed">{item.a}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
