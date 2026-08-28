'use client';

import { useState } from 'react';
import { SUBJECT_LABEL } from '@/lib/constants';
import type { TopicOverview } from '@/lib/db';

const GRADE_SHORT: Record<string, string> = { grade_3: 'ג׳', grade_5: 'ה׳', enrichment: 'העשרה' };

const REASON: Record<string, string> = {
  'no-api-key': 'לא מוגדר מפתח Anthropic ב‑Vercel',
  'api-error': 'שגיאת AI — בדקי מפתח/מכסה',
  'all-duplicates': 'הכל כבר קיים',
  'insert-failed': 'שגיאת שמירה',
  'no-db': 'אין חיבור למסד',
  'no-topic': 'אין נושא',
};

export function ContentPanel({ topics }: { topics: TopicOverview[] }) {
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(topics.map((t) => [t.id, t.count])),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  async function generate(id: string) {
    if (busy) return;
    setBusy(id);
    setNote((n) => ({ ...n, [id]: 'מייצר…' }));
    try {
      const r = await fetch('/api/parent/generate', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topicId: id }),
      });
      const j = await r.json();
      if (j?.ok && j.inserted > 0) {
        setCounts((c) => ({ ...c, [id]: (c[id] ?? 0) + j.inserted }));
        setNote((n) => ({ ...n, [id]: `נוספו ${j.inserted} שאלות` }));
      } else {
        setNote((n) => ({ ...n, [id]: REASON[j?.reason] ?? 'לא נוספו שאלות' }));
      }
    } catch {
      setNote((n) => ({ ...n, [id]: 'שגיאה — נסי שוב' }));
    }
    setBusy(null);
  }

  // Group topics by subject.
  const groups = new Map<string, TopicOverview[]>();
  for (const t of topics) {
    const arr = groups.get(t.subject) ?? [];
    arr.push(t);
    groups.set(t.subject, arr);
  }

  return (
    <section className="content-panel">
      <div className="parent-head" style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: '1.15rem' }}>בנק השאלות</h2>
      </div>
      <p className="content-hint">כמה שאלות יש בכל נושא. לחצי "צור" כדי להוסיף שאלות חדשות (AI). דורש מפתח Anthropic ב‑Vercel.</p>

      {[...groups.entries()].map(([subject, list]) => (
        <div key={subject} className="content-group">
          <div className="content-subject">{SUBJECT_LABEL[subject] ?? subject}</div>
          {list.map((t) => (
            <div key={t.id} className="content-row">
              <span className="content-main">
                <span className="content-name">{t.subTopic} <em>· {GRADE_SHORT[t.grade] ?? t.grade}</em></span>
                <span className="content-count">{counts[t.id] ?? 0} שאלות {note[t.id] ? `· ${note[t.id]}` : ''}</span>
              </span>
              <button className="content-btn" disabled={busy === t.id} onClick={() => generate(t.id)}>
                {busy === t.id ? '…' : 'צור'}
              </button>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
