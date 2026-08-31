'use client';

import { useEffect, useState } from 'react';
import { Section } from './Section';

interface SubjScore { subject: string; label: string; correct: number; total: number }
interface Rec { id: string; grade: string; score: number; correct: number; total: number; when: string; subjects: SubjScore[] }

function whenLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' });
}

export function AssessmentsPanel({ childId }: { childId?: string }) {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!childId) return;
    setLoaded(false);
    fetch(`/api/parent/assessments?childId=${encodeURIComponent(childId)}`)
      .then((r) => r.json())
      .then((j) => { if (Array.isArray(j?.assessments)) setRecs(j.assessments); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [childId]);

  if (!childId || !loaded || recs.length === 0) return null;

  return (
    <Section title="מבדקי סוף שנה" count={recs.length}
      hint="תוצאות המבדקים שהבת עשתה, כולל פירוט לפי מקצוע.">
      <div className="assess-log">
        {recs.map((r) => (
          <div key={r.id} className="assess-log-item">
            <div className="assess-log-top">
              <span className="assess-log-score">{r.score}%</span>
              <span className="assess-log-meta">{r.correct}/{r.total} · {whenLabel(r.when)}</span>
            </div>
            {r.subjects.length > 0 && (
              <div className="assess-log-subs">
                {r.subjects.map((s) => (
                  <span key={s.subject} className="assess-log-chip">{s.label} {s.correct}/{s.total}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
