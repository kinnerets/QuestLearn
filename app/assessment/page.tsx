'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Capi } from '@/components/Capi';
import { CloseIcon, CheckIcon } from '@/components/icons';

interface Q { id: string; subject: string; subjectLabel: string; tag: string; stem: string; choices: { id: string; text: string }[] }
interface SubjScore { subject: string; label: string; correct: number; total: number }
interface Report { score: number; correct: number; total: number; subjects: SubjScore[] }

type Phase = 'intro' | 'loading' | 'quiz' | 'submitting' | 'done';

export default function AssessmentPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<Report | null>(null);

  async function start() {
    setPhase('loading');
    try {
      const j = await fetch('/api/assessment').then((r) => r.json());
      if (Array.isArray(j?.questions) && j.questions.length) {
        setQuestions(j.questions); setIdx(0); setAnswers({}); setPhase('quiz');
      } else { setPhase('intro'); }
    } catch { setPhase('intro'); }
  }

  function pick(qid: string, cid: string) {
    setAnswers((a) => ({ ...a, [qid]: cid }));
  }

  function next() {
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else submit();
  }

  async function submit() {
    setPhase('submitting');
    const payload = { answers: questions.map((q) => ({ questionId: q.id, choiceId: answers[q.id] ?? '' })) };
    try {
      const j = await fetch('/api/assessment', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
      }).then((r) => r.json());
      setReport(j?.report ?? null); setPhase('done');
    } catch { setPhase('done'); }
  }

  const q = questions[idx];
  const answered = q ? answers[q.id] : undefined;

  return (
    <main className="app-shell">
      <div className="ex-bar">
        <Link href="/status" className="ex-back" aria-label="יציאה"><CloseIcon /></Link>
        <div className="ex-head-title">מבדק סוף שנה</div>
        <div style={{ width: 34 }} />
      </div>

      <div className="screen-body assess">
        {phase === 'intro' && (
          <div className="assess-intro">
            <Capi mood="chill" size={104} />
            <h1>מבדק סוף שנה</h1>
            <p>כ-20 שאלות מכל המקצועות, בלי רמזים - כדי לראות מה כבר יודעים. אין לחץ, זה רק תמונת מצב. אפשר לעשות אותו מתי שרוצים.</p>
            <button className="cta" onClick={start}>מתחילים את המבדק</button>
          </div>
        )}

        {(phase === 'loading' || phase === 'submitting') && (
          <div className="assess-intro">
            <Capi mood="chill" size={92} />
            <p>{phase === 'loading' ? 'מכינים את המבדק…' : 'בודקים את התשובות…'}</p>
          </div>
        )}

        {phase === 'quiz' && q && (
          <>
            <div className="assess-prog">שאלה {idx + 1} מתוך {questions.length}</div>
            <div className="assess-bar"><i style={{ width: `${Math.round(((idx + 1) / questions.length) * 100)}%` }} /></div>
            <div className="qcard">
              <div className="qtag">{q.subjectLabel}{q.tag ? ` · ${q.tag}` : ''}</div>
              <div className="qtext">{q.stem}</div>
            </div>
            <div className="answers">
              {q.choices.map((c) => (
                <button key={c.id} className={`ans${answered === c.id ? ' picked' : ''}`} onClick={() => pick(q.id, c.id)}>
                  <span>{c.text}</span>
                  {answered === c.id && <CheckIcon />}
                </button>
              ))}
            </div>
            <div className="foot">
              <button className="cta" onClick={next} disabled={!answered}>
                {idx + 1 < questions.length ? 'לשאלה הבאה' : 'סיום ובדיקה'}
              </button>
            </div>
          </>
        )}

        {phase === 'done' && (
          <div className="assess-report">
            <Capi mood="cheer" size={92} />
            <div className="assess-score">{report?.score ?? 0}%</div>
            <p>{report ? `ענית נכון על ${report.correct} מתוך ${report.total}` : 'המבדק הסתיים.'}</p>
            {report && report.subjects.length > 0 && (
              <div className="assess-subjects">
                {report.subjects.map((s) => (
                  <div key={s.subject} className="assess-srow">
                    <span className="assess-sname">{s.label}</span>
                    <span className="assess-sbar">
                      <i className={s.correct / s.total >= 0.7 ? 'good' : s.correct / s.total >= 0.4 ? 'mid' : 'low'}
                        style={{ width: `${Math.round((s.correct / s.total) * 100)}%` }} />
                    </span>
                    <span className="assess-spct">{s.correct}/{s.total}</span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/status" className="cta">חזרה</Link>
          </div>
        )}
      </div>
    </main>
  );
}
