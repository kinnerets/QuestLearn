'use client';

import { useEffect, useState } from 'react';
import { SUBJECT_LABEL } from '@/lib/constants';
import { CheckIcon, CloseIcon } from '@/components/icons';
import { Section } from './Section';
import type { FlaggedQuestion } from '@/lib/db';

const GRADE_SHORT: Record<string, string> = { grade_3: 'ג׳', grade_5: 'ה׳', enrichment: 'העשרה' };

export function FlagsPanel() {
  const [items, setItems] = useState<FlaggedQuestion[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    try {
      const r = await fetch('/api/parent/flags');
      const j = await r.json();
      if (Array.isArray(j?.flagged)) setItems(j.flagged);
    } catch { /* ignore */ }
    setLoaded(true);
  }
  useEffect(() => { load(); }, []);

  async function review(id: string, action: 'approve' | 'reject') {
    setBusy(id);
    setItems((xs) => xs.filter((x) => x.id !== id));
    try {
      await fetch('/api/parent/flags', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
    } catch { /* ignore */ }
    setBusy(null);
  }

  if (!loaded || items.length === 0) return null; // only appears when there's something to review

  return (
    <Section title="שאלות לבדיקה" count={items.length}
      hint="שאלות שה‑AI סימן כדורשות עין שנייה — כבר מוסתרות מהילדות, אז הבדיקה לא דחופה. אישור → הן יראו אותן; דחייה → נמחקות.">
      {items.map((q) => (
        <div key={q.id} className="flag-card">
          <div className="flag-meta">{SUBJECT_LABEL[q.subject] ?? q.subject} · {GRADE_SHORT[q.grade] ?? q.grade}</div>
          <div className="flag-stem">{q.stem}</div>
          {q.choices.length > 0 && (
            <ul className="flag-choices">
              {q.choices.map((c) => (
                <li key={c.id} className={c.id === q.correctId ? 'right' : ''}>
                  {c.id === q.correctId && <CheckIcon />}
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flag-reason"><span className="flag-reason-tag">למה סומן</span>{q.reason}</div>
          <div className="flag-actions">
            <button className="flag-btn approve" disabled={busy === q.id} onClick={() => review(q.id, 'approve')}>
              <CheckIcon /> אישור
            </button>
            <button className="flag-btn reject" disabled={busy === q.id} onClick={() => review(q.id, 'reject')}>
              <CloseIcon /> מחיקה
            </button>
          </div>
        </div>
      ))}
    </Section>
  );
}
