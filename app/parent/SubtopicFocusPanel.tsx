'use client';

import { useEffect, useState } from 'react';
import { ChevronIcon } from '@/components/icons';
import { Section } from './Section';

interface SubStat { id: string; subTopic: string; accuracy: number; answered: number; solved: number; total: number }
interface Subj { subject: string; label: string; kind: string; accuracy: number; answered: number; sub: SubStat[] }

export function SubtopicFocusPanel({ childId, childName }: { childId?: string; childName?: string }) {
  const [data, setData] = useState<Subj[]>([]);
  const [focus, setFocus] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<Record<string, string[]>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!childId) return;
    setLoaded(false);
    fetch(`/api/parent/breakdown?childId=${encodeURIComponent(childId)}`)
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j?.breakdown)) setData(j.breakdown);
        if (Array.isArray(j?.focusTopics)) setFocus(new Set(j.focusTopics));
        if (j?.recentWrong && typeof j.recentWrong === 'object') setWrong(j.recentWrong);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [childId]);

  if (!childId || !loaded || data.length === 0) return null;

  async function toggle(topicId: string) {
    const on = !focus.has(topicId);
    const next = new Set(focus);
    if (on) next.add(topicId); else next.delete(topicId);
    setFocus(next);
    await fetch('/api/parent/focus-topic', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId, topicId, on }),
    }).catch(() => {});
  }

  return (
    <Section title="חיזוק לפי תת-נושא" count={focus.size || undefined}
      hint={`בחרי תת-נושא לחיזוק${childName ? ` של ${childName}` : ''} - הוא יופיע יותר במסע היומי. נושא שעדיין לא תורגל אין לו ציון.`}>
      <div className="pfocus">
        {data.map((s) => {
          const isOpen = open === s.subject;
          return (
            <div key={s.subject} className={`pfocus-subj${isOpen ? ' open' : ''}`}>
              <button className="pfocus-head" onClick={() => setOpen(isOpen ? null : s.subject)} aria-expanded={isOpen}>
                <span className="pfocus-name">{s.label}</span>
                <span className="pfocus-score">{s.answered > 0 ? `${Math.round(s.accuracy * 100)}%` : '-'}</span>
                <span className={`pfocus-chev${isOpen ? ' up' : ''}`}><ChevronIcon /></span>
              </button>
              {isOpen && (
                <div className="pfocus-list">
                  {s.sub.map((t) => {
                    const on = focus.has(t.id);
                    const misses = wrong[t.id] ?? [];
                    return (
                      <div key={t.id} className="pfocus-item">
                        <div className="pfocus-row">
                          <span className="pfocus-tname">{t.subTopic}</span>
                          <span className="pfocus-tstat">{t.answered > 0 ? `${Math.round(t.accuracy * 100)}%` : 'טרם תורגל'}</span>
                          <button className={`pfocus-btn${on ? ' on' : ''}`} onClick={() => toggle(t.id)}>
                            {on ? 'מחוזק' : 'חיזוק'}
                          </button>
                        </div>
                        {misses.length > 0 && (
                          <div className="pfocus-wrong">
                            <span className="pfocus-wrong-tag">טעויות מהשבוע</span>
                            {misses.map((m, i) => <div key={i} className="pfocus-wrong-q">{m}</div>)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
