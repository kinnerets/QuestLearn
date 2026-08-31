'use client';

import { useEffect, useState } from 'react';
import { Section } from './Section';
import { SUBJECT_LABEL } from '@/lib/constants';

// Subjects a parent can emphasize (core + safe enrichment).
const FOCUS_SUBJECTS = [
  'math', 'geometry', 'hebrew', 'bible', 'arabic', 'english',
  'science', 'geography', 'future_skills', 'economics', 'fashion', 'philosophy',
];

export function FocusPanel({ childId, childName }: { childId?: string; childName?: string }) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    if (!childId) return;
    setSavedNote(false);
    fetch(`/api/parent/focus?childId=${encodeURIComponent(childId)}`)
      .then((r) => r.json())
      .then((j) => { if (Array.isArray(j?.focus)) setPicked(new Set(j.focus as string[])); })
      .catch(() => {});
  }, [childId]);

  async function toggle(subject: string) {
    if (!childId) return;
    const next = new Set(picked);
    if (next.has(subject)) next.delete(subject); else next.add(subject);
    setPicked(next);
    setSavedNote(false);
    try {
      await fetch('/api/parent/focus', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ childId, subjects: [...next] }),
      });
      setSavedNote(true);
    } catch { /* ignore */ }
  }

  if (!childId) return null;

  return (
    <Section title={`דגש בלמידה${childName ? ` · ${childName}` : ''}`} count={picked.size || undefined}
      hint="בחרי נושאים שתרצי להדגיש עכשיו - הם יופיעו יותר במסע היומי שלה. אפשר לשנות מתי שרוצים.">
      <div className="focus-grid">
        {FOCUS_SUBJECTS.map((s) => {
          const on = picked.has(s);
          return (
            <button key={s} className={`focus-chip${on ? ' on' : ''}`} onClick={() => toggle(s)}>
              {SUBJECT_LABEL[s] ?? s}
            </button>
          );
        })}
      </div>
      {savedNote && <p className="focus-saved">נשמר - המסע יתעדכן בתרגול הבא.</p>}
    </Section>
  );
}
