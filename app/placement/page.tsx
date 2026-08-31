'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Capi } from '@/components/Capi';
import { CloseIcon, CheckIcon } from '@/components/icons';
import type { DbStation, DbAcademicStation } from '@/lib/db';

type Q = DbAcademicStation;

export default function PlacementPage() {
  const router = useRouter();
  const [qs, setQs] = useState<Q[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/placement/questions')
      .then((r) => r.json())
      .then((j) => {
        const list = (Array.isArray(j?.questions) ? j.questions : []) as DbStation[];
        setQs(list.filter((s): s is Q => s.kind !== 'lead'));
      })
      .catch(() => setQs([]));
  }, []);

  async function finish(finalCorrect: number, total: number) {
    try {
      const r = await fetch('/api/placement', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ correct: finalCorrect, total }),
      });
      const j = await r.json();
      setResult(typeof j?.level === 'number' ? j.level : 1);
      router.refresh();
    } catch { setResult(1); }
  }

  function answer(q: Q, id: string) {
    if (chosen) return;
    setChosen(id);
    const isRight = id === q.correctId;
    const nextCorrect = correct + (isRight ? 1 : 0);
    if (isRight) setCorrect(nextCorrect);
    // Record the answer so practice won't re-serve a question seen in placement.
    if (q.questionId && q.topicId) {
      fetch('/api/attempt', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ questionId: q.questionId, topicId: q.topicId, isCorrect: isRight, hintsUsed: 0, misconception: null }),
      }).catch(() => {});
    }
    setTimeout(() => {
      if (idx + 1 >= (qs?.length ?? 0)) finish(nextCorrect, qs?.length ?? 1);
      else { setIdx(idx + 1); setChosen(null); }
    }, 700);
  }

  return (
    <main className="app-shell">
      <div className="ex-bar">
        <Link href="/" className="ex-back" aria-label="חזרה"><CloseIcon /></Link>
        <div className="ex-head-title">מסע ההיכרות</div>
        <div style={{ width: 34 }} />
      </div>

      <div className="screen-body ex-body">
        {qs === null && <div className="compass-loading">טוען…</div>}

        {result !== null ? (
          <div className="place-done">
            <Capi mood="cheer" size={96} />
            <h2>יאללה, נעים להכיר!</h2>
            <p>לפי מסע ההיכרות נתחיל אותך מ<b>רמה {result}</b> - לא קל מדי, לא קשה מדי.</p>
            <Link href="/" className="cta" style={{ maxWidth: 280 }}>למסע שלי</Link>
          </div>
        ) : qs && qs.length > 0 ? (
          <>
            <div className="place-progress">שאלה {idx + 1} מתוך {qs.length}</div>
            <div className="qcard">
              <div className="qtag">{qs[idx].subtitle} · {qs[idx].tag}</div>
              <div className="qtext">{qs[idx].stem}</div>
            </div>
            <div className="answers">
              {qs[idx].choices.map((c) => {
                const picked = chosen === c.id;
                const showRight = chosen && c.id === qs[idx].correctId;
                const showWrong = picked && c.id !== qs[idx].correctId;
                const cls = `ans${showRight ? ' correct' : ''}${showWrong ? ' wrong' : ''}`;
                return (
                  <button key={c.id} className={cls} disabled={!!chosen} onClick={() => answer(qs[idx], c.id)}>
                    <span>{c.text}</span>
                    {showRight && <CheckIcon />}
                    {showWrong && <CloseIcon />}
                  </button>
                );
              })}
            </div>
            <p className="place-hint">אין לחץ - זה רק כדי להתחיל מהמקום הנכון בשבילך.</p>
          </>
        ) : qs && qs.length === 0 ? (
          <div className="place-done">
            <Capi mood="chill" size={90} />
            <p>עדיין אין מספיק שאלות למסע ההיכרות. אפשר פשוט להתחיל לתרגל!</p>
            <Link href="/" className="cta" style={{ maxWidth: 280 }}>למסע שלי</Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
