'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Stagger, StaggerItem } from '@/components/motion';
import { EASE, SPRING } from '@/lib/motion';

export type FaqItem = { id: string; q: string; a: string };

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.span
      className="mt-0.5 grid place-items-center h-8 w-8 shrink-0 rounded-lg border border-paper-line bg-paper text-ink-soft"
      aria-hidden
      animate={{ rotate: open ? 180 : 0 }}
      transition={SPRING.snappy}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </motion.span>
  );
}

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const baseId = useId();
  const reduceMotion = useReducedMotion();
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

      <Stagger className="mt-6 grid md:grid-cols-2 md:items-start gap-4 md:gap-6" stagger={0.07}>
        {items.map((item) => {
          const panelId = `${baseId}-panel-${item.id}`;
          const buttonId = `${baseId}-btn-${item.id}`;
          const isOpen = openIds.has(item.id);

          return (
            <StaggerItem key={item.id} blur>
              <Card
                padding="none"
                className="h-fit min-w-0 overflow-hidden shadow-card transition-shadow duration-300 hover:shadow-cardHover"
              >
              <h3 className="font-display text-lg text-ink leading-snug">
                <button
                  type="button"
                  id={buttonId}
                  className="w-full text-left flex items-start justify-between gap-3 px-5 py-4 md:px-6 md:py-5 transition-colors hover:bg-paper-line/30"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(item.id)}
                >
                  <span className="pr-2">{item.q}</span>
                  <Chevron open={isOpen} />
                </button>
              </h3>

              {/*
                AnimatePresence drives a height + opacity transition.
                `initial={false}` so cards already-closed on mount don't
                animate. The panel keeps its region role + aria wiring.
              */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.38, ease: EASE.outSoft }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.32,
                        ease: EASE.outSoft,
                        delay: reduceMotion ? 0 : 0.05,
                      }}
                      className="border-t border-paper-line px-5 pb-5 pt-4 md:px-6"
                    >
                      <p className="text-ink-soft leading-relaxed">{item.a}</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
