'use client';

import { useEffect, useState } from 'react';
import { SUBJECT_LABEL } from '@/lib/constants';
import { CheckIcon, CloseIcon } from '@/components/icons';
import { Section } from './Section';
import type { FlaggedQuestion } from '@/lib/db';

const GRADE_SHORT: Record<string, string> = { grade_3: 'ג׳', grade_5: 'ה׳', enrichment: 'העשרה' };

/** Questions already approved — so a parent can undo an accidental approval:
 *  delete the question, or send it back to the review queue. */
export function ApprovedPanel() {
  const [items, setItems] = useState<FlaggedQuestion[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [loaded, setLoaded] = useState(false);

  async function load() {
    try {
      const [a, kids] = await Promise.all([
        fetch('/api/parent/flags?status=approved').then((r) => r.json()),
        fetch('/api/children').then((r) => r.json()).catch(() => null),
      ]);
      if (Array.isArray(a?.approved)) setItems(a.approved);
      const map: Record<string, string> = {};
      for (const k of kids?.children ?? []) if (k.grade) map[k.grade] = k.name;
      setNames(map);
    } catch { /* ignore */ }
    setLoaded(true);
  }
  useEffect(() => { load(); }, []);

  function whose(grade: string) { return names[grade] || `כיתה ${GRADE_SHORT[grade] ?? grade}`; }

  async function act(id: string, action: 'reject' | 'unapprove') {
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

  if (!loaded || items.length === 0) return null;

  const grades = [...new Set(items.map((i) => i.grade))];
  const shown = filter === 'all' ? items : items.filter((i) => i.grade === filter);

  return (
    <Section title="שאלות שאישרת" count={items.length}
      hint="שאלות שכבר אישרת והילדות רואות. אם אישרת משהו בטעות - אפשר למחוק אותו, או להחזיר אותו לבדיקה כדי שיוסתר.">
      {grades.length > 1 && (
        <div className="flag-filter">
          <button className={`flag-chip${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>הכל</button>
          {grades.map((g) => (
            <button key={g} className={`flag-chip${filter === g ? ' on' : ''}`} onClick={() => setFilter(g)}>{whose(g)}</button>
          ))}
        </div>
      )}
      {shown.map((q) => (
        <div key={q.id} className="flag-card">
          <div className="flag-meta">{whose(q.grade)} · {SUBJECT_LABEL[q.subject] ?? q.subject}{q.subTopic ? ` · ${q.subTopic}` : ''}</div>
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
          <div className="flag-actions">
            <button className="flag-btn reject" disabled={busy === q.id} onClick={() => act(q.id, 'reject')}>
              <CloseIcon /> מחיקה
            </button>
            <button className="flag-btn" disabled={busy === q.id} onClick={() => act(q.id, 'unapprove')}>
              החזרה לבדיקה
            </button>
          </div>
        </div>
      ))}
    </Section>
  );
}
