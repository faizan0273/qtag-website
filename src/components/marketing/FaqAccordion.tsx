'use client';

import { useCallback, useId, useMemo, useState } from 'react';
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
  const allIds = useMemo(() => items.map((it) => it.id), [items]);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  const toggleAll = useCallback(() => {
    setOpenIds((prev) => {
      const anyOpen = allIds.some((id) => prev.has(id));
      if (anyOpen) return new Set();
      return new Set(allIds);
    });
  }, [allIds]);

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const anyOpen = allIds.some((id) => openIds.has(id));

  return (
    <div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted max-w-xl">
          Expand or collapse each question. Use the button to open or close every answer at once.
        </p>
        <div className="shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={toggleAll}
            disabled={allIds.length === 0}
          >
            {anyOpen ? 'Collapse all' : 'Expand all'}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 md:items-start gap-4 md:gap-6">
        {items.map((item) => {
          const panelId = `${baseId}-panel-${item.id}`;
          const isOpen = openIds.has(item.id);
          return (
            <Card key={item.id} padding="none" className="h-fit min-w-0 overflow-hidden shadow-card">
              <h3 className="font-display text-lg text-ink leading-snug">
                <button
                  type="button"
                  id={`${baseId}-btn-${item.id}`}
                  className="w-full text-left flex items-start justify-between gap-3 px-5 py-4 md:px-6 md:py-5 hover:bg-paper-line/30 transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(item.id)}
                >
                  <span className="pr-2">{item.q}</span>
                  <Chevron open={isOpen} />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={`${baseId}-btn-${item.id}`}
                className={
                  isOpen
                    ? 'border-t border-paper-line px-5 pb-5 pt-4 md:px-6'
                    : 'hidden'
                }
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
