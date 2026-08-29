'use client';

import { useEffect, useState } from 'react';
import { SUBJECT_LABEL } from '@/lib/constants';
import { CheckIcon, CloseIcon } from '@/components/icons';
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
    <section className="content-panel">
      <div className="parent-head" style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: '1.15rem' }}>שאלות לבדיקה <span className="flag-count">{items.length}</span></h2>
      </div>
      <p className="content-hint">שאלות שה‑AI סימן כדורשות עין שנייה. אישור → הילדות יראו אותן; דחייה → נמחקות.</p>

      {items.map((q) => (
        <div key={q.id} className="flag-card">
          <div className="flag-meta">{SUBJECT_LABEL[q.subject] ?? q.subject} · {GRADE_SHORT[q.grade] ?? q.grade}</div>
          <div className="flag-stem">{q.stem}</div>
          <div className="flag-answer">תשובה מסומנת: <b>{q.correctText || '—'}</b></div>
          <div className="flag-reason">{q.reason}</div>
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
    </section>
  );
}
