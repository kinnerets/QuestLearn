'use client';

import { useState } from 'react';
import { SUBJECT_ICON, STATION_ICON, ChevronIcon } from './icons';
import type { SubjectBreakdown } from '@/lib/db';

function tier(m: number) { return m >= 0.7 ? 'good' : m >= 0.4 ? 'mid' : 'low'; }

/** Subject mastery bars that expand to show each sub-topic's standing.
 *  Sub-topics not practised yet are shown but not counted in the score. */
export function SubjectBars({ subjects }: { subjects: SubjectBreakdown[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const sorted = [...subjects].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="kbars">
      {sorted.map((s) => {
        const Icon = SUBJECT_ICON[s.subject] ?? STATION_ICON[s.kind];
        const pct = Math.round(s.accuracy * 100);
        const isOpen = open === s.subject;
        return (
          <div key={s.subject} className={`kbar-item${isOpen ? ' open' : ''}`}>
            <button className="kbar-row" onClick={() => setOpen(isOpen ? null : s.subject)} aria-expanded={isOpen}>
              <span className={`kbar-ico ico-${s.kind}`}><Icon /></span>
              <span className="kbar-main">
                <span className="kbar-name">{s.label}</span>
                <span className="kbar-bar"><i className={tier(s.accuracy)} style={{ width: `${Math.max(s.answered ? 5 : 0, pct)}%` }} /></span>
              </span>
              <span className="kbar-pct">{s.answered > 0 ? `${pct}%` : '-'}</span>
              <span className={`kbar-chev${isOpen ? ' up' : ''}`}><ChevronIcon /></span>
            </button>

            {isOpen && (
              <div className="kbar-sub">
                {s.sub.map((t) => (
                  <div key={t.id} className="ksub-row">
                    <span className="ksub-name">{t.subTopic}</span>
                    {t.answered > 0 ? (
                      <>
                        <span className="ksub-bar"><i className={tier(t.accuracy)} style={{ width: `${Math.max(5, Math.round(t.accuracy * 100))}%` }} /></span>
                        <span className="ksub-pct">{Math.round(t.accuracy * 100)}%</span>
                      </>
                    ) : (
                      <span className="ksub-untrained">טרם תורגל</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
