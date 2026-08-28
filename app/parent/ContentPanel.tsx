'use client';

import { useState } from 'react';
import { SUBJECT_LABEL } from '@/lib/constants';
import type { TopicOverview } from '@/lib/db';

const GRADE_SHORT: Record<string, string> = { grade_3: 'ג׳', grade_5: 'ה׳', enrichment: 'העשרה' };
const THIN = 6; // topics below this many questions are considered "thin"

const REASON: Record<string, string> = {
  'no-api-key': 'לא מוגדר מפתח Anthropic ב‑Vercel',
  'api-error': 'שגיאת AI — בדקי מפתח/מכסה',
  'no-output': 'ה‑AI לא החזיר שאלות — נסי שוב',
  'timeout': 'לקח יותר מדי זמן — ייתכן שצריך זמן ריצה ארוך יותר ב‑Vercel',
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
  const [bulk, setBulk] = useState(false);
  const [note, setNote] = useState<Record<string, string>>({});

  // Generate one topic; returns how many were inserted (for the bulk runner).
  async function generateOne(id: string): Promise<number> {
    setNote((n) => ({ ...n, [id]: 'מייצר…' }));
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 70_000); // never spin forever
    try {
      const r = await fetch('/api/parent/generate', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topicId: id }), signal: ctrl.signal,
      });
      const j = await r.json();
      if (j?.ok && j.inserted > 0) {
        setCounts((c) => ({ ...c, [id]: (c[id] ?? 0) + j.inserted }));
        setNote((n) => ({ ...n, [id]: `נוספו ${j.inserted} שאלות` }));
        return j.inserted;
      }
      setNote((n) => ({ ...n, [id]: REASON[j?.reason] ?? 'לא נוספו שאלות' }));
      return 0;
    } catch (e) {
      const aborted = e instanceof DOMException && e.name === 'AbortError';
      setNote((n) => ({ ...n, [id]: aborted ? REASON['timeout'] : 'שגיאה — נסי שוב' }));
      return 0;
    } finally {
      clearTimeout(timer);
    }
  }

  async function generate(id: string) {
    if (busy || bulk) return;
    setBusy(id);
    await generateOne(id);
    setBusy(null);
  }

  // One click fills every thin topic, one after another (stays within fn budget).
  async function fillThin() {
    if (busy || bulk) return;
    const thin = topics.filter((t) => (counts[t.id] ?? 0) < THIN);
    if (!thin.length) return;
    setBulk(true);
    for (const t of thin) {
      setBusy(t.id);
      await generateOne(t.id);
    }
    setBusy(null);
    setBulk(false);
  }

  // Group topics by subject.
  const groups = new Map<string, TopicOverview[]>();
  for (const t of topics) {
    const arr = groups.get(t.subject) ?? [];
    arr.push(t);
    groups.set(t.subject, arr);
  }
  const thinCount = topics.filter((t) => (counts[t.id] ?? 0) < THIN).length;

  return (
    <section className="content-panel">
      <div className="parent-head" style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: '1.15rem' }}>בנק השאלות</h2>
        {thinCount > 0 && (
          <button className="content-btn bulk" disabled={busy !== null || bulk} onClick={fillThin}>
            {bulk ? `ממלא… (${thinCount})` : `מלא ${thinCount} נושאים דלילים`}
          </button>
        )}
      </div>
      <p className="content-hint">
        הבנק מתמלא לבד ברקע כשהבנות מתרגלות מקצוע. כאן אפשר להשלים ידנית — "מלא נושאים דלילים" ממלא
        הכל בזה אחר זה. דורש מפתח Anthropic ב‑Vercel.
      </p>

      {[...groups.entries()].map(([subject, list]) => (
        <div key={subject} className="content-group">
          <div className="content-subject">{SUBJECT_LABEL[subject] ?? subject}</div>
          {list.map((t) => (
            <div key={t.id} className="content-row">
              <span className="content-main">
                <span className="content-name">{t.subTopic} <em>· {GRADE_SHORT[t.grade] ?? t.grade}</em></span>
                <span className="content-count">{counts[t.id] ?? 0} שאלות {note[t.id] ? `· ${note[t.id]}` : ''}</span>
              </span>
              <button className="content-btn" disabled={busy !== null || bulk} onClick={() => generate(t.id)}>
                {busy === t.id ? '…' : 'צור'}
              </button>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
