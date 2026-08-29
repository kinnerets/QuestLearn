'use client';

import { useState, type ReactNode } from 'react';
import { ChevronIcon } from '@/components/icons';

/** A collapsible parent-area section: a tappable header (with an optional count)
 *  that expands to reveal its body. Keeps the dashboard tidy — management lives
 *  behind a tap, not stacked inline. */
export function Section({
  title, count, hint, defaultOpen = false, children,
}: {
  title: string; count?: number; hint?: string; defaultOpen?: boolean; children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="content-panel">
      <button className="section-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="section-title">
          {title}
          {count ? <span className="flag-count">{count}</span> : null}
        </span>
        <span className={`section-chev${open ? ' open' : ''}`}><ChevronIcon /></span>
      </button>
      {open && (
        <div className="section-body">
          {hint && <p className="content-hint">{hint}</p>}
          {children}
        </div>
      )}
    </section>
  );
}
