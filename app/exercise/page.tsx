'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Capi, type CapiMood } from '@/components/Capi';
import { BottomNav } from '@/components/BottomNav';
import {
  CoinIcon, FlameIcon, CheckIcon, CloseIcon, HeartIcon, LEAD_ICON, GridIcon,
} from '@/components/icons';
import {
  lesson as bundledLesson, PRAISE, GENTLE, HEART, pick,
  type Station, type AcademicStation, type LeadStation,
} from '@/lib/lessonData';
import type { DbStation } from '@/lib/db';
import { mili } from '@/lib/mockData';

type Phase = 'playing' | 'done';

function mapDbLesson(db: DbStation[]): Station[] {
  const n = db.length;
  return db.map((s, i): Station => {
    const position = s.kind === 'lead' ? 'אי המצפן · מנהיגות' : `שאלה ${i + 1} מתוך ${n}`;
    if (s.kind === 'lead') {
      return { kind: 'lead', title: s.title, position, subjectLabel: s.subtitle, prompt: s.prompt, note: s.note,
        choices: s.choices, topicId: s.topicId, questionId: s.questionId, coins: 5 };
    }
    return {
      kind: s.kind, title: s.title, position, subjectLabel: s.subtitle, tag: s.tag, stem: s.stem,
      choices: s.choices.map((c) => ({ id: c.id, text: c.text, misconception: c.misconception })),
      correctId: s.correctId, hint: s.hint, hint2: s.hint2, explanation: s.explanation,
      difficulty: s.difficulty, coins: s.coins,
      questionId: s.questionId, topicId: s.topicId,
    };
  });
}

export default function ExercisePage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [allSolved, setAllSolved] = useState(false);
  const [coins, setCoins] = useState(mili.quest_coins);
  const [earned, setEarned] = useState(0);
  const [finished, setFinished] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);

  // Adaptive difficulty: pick the next question near the current level.
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [doneIdx, setDoneIdx] = useState<Set<number>>(new Set());
  const [level, setLevel] = useState(1);
  const [startLevel, setStartLevel] = useState(1);
  const [cleanStreak, setCleanStreak] = useState(0);

  // per-station state
  const [tries, setTries] = useState(0);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState<Phase>('playing');
  const [mood, setMood] = useState<CapiMood>('chill');
  const [message, setMessage] = useState<string>('');
  const [heartFilled, setHeartFilled] = useState(false);

  const diffOf = (s: Station) => (s.kind === 'lead' ? 3 : (s.difficulty ?? 2));
  function pickNext(done: Set<number>, target: number): number {
    let best = -1, bestDist = Infinity;
    stations.forEach((s, i) => {
      if (done.has(i)) return;
      const dist = Math.abs(diffOf(s) - target);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  }

  // Start near the child's placement level, clamped to what this pool offers.
  useEffect(() => {
    if (stations.length && currentIdx === -1) {
      const minD = Math.min(...stations.map(diffOf));
      const maxD = Math.max(...stations.map(diffOf));
      const target = Math.min(maxD, Math.max(minD, startLevel));
      setLevel(target);
      setCurrentIdx(pickNext(new Set(), target));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stations]);

  // Load this session's questions (a focused subject, or the daily journey).
  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams(window.location.search);
    const focus = params.get('focus');
    const topic = params.get('topic');
    let url = '/api/lesson';
    if (focus) {
      url += `?focus=${encodeURIComponent(focus)}`;
      if (topic) url += `&topic=${encodeURIComponent(topic)}`;
    }
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        const lesson = Array.isArray(j?.lesson) ? (j.lesson as DbStation[]) : null;
        if (lesson && lesson.length) setStations(mapDbLesson(lesson));
        else if (focus && lesson && lesson.length === 0) { setAllSolved(true); fireRefill(); } // solved everything → make more
        else setStations(bundledLesson); // mock / no DB
        if (typeof j?.coins === 'number') setCoins(j.coins);
        if (typeof j?.level === 'number') setStartLevel(j.level);
        setLoading(false);
      })
      .catch(() => { if (alive) { setStations(bundledLesson); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const station = stations[currentIdx];

  function logAttempt(st: AcademicStation, isCorrect: boolean, hintsUsed: number, misconception?: string) {
    if (!st.questionId || !st.topicId) return; // bundled fallback has no ids
    fetch('/api/attempt', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        questionId: st.questionId, topicId: st.topicId,
        isCorrect, hintsUsed, misconception: misconception ?? null,
      }),
    }).catch(() => {});
  }

  function resetStation() {
    setTries(0); setChosenId(null); setWrongIds([]); setEliminated([]); setRevealed(false);
    setPhase('playing'); setMood('chill'); setMessage(''); setHeartFilled(false);
  }

  // Ask the server to top up this subject's question bank (fire-and-forget).
  function fireRefill() {
    const focus = new URLSearchParams(window.location.search).get('focus');
    if (!focus) return;
    fetch('/api/refill', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ subject: focus }), keepalive: true,
    }).catch(() => {});
  }

  function next() {
    const done = new Set(doneIdx);
    done.add(currentIdx);
    if (done.size >= stations.length) {
      fetch('/api/quest/complete', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ coins: earned, xp: correct * 10 }),
      }).catch(() => {});
      fireRefill();
      setFinished(true);
      return;
    }
    setDoneIdx(done);
    setCurrentIdx(pickNext(done, level)); // level already reflects the last outcome
    resetStation();
  }

  function answer(st: AcademicStation, choiceId: string) {
    if (phase === 'done') return;
    if (choiceId === st.correctId) {
      setChosenId(choiceId);
      setCoins((c) => c + st.coins);
      setEarned((e) => e + st.coins);
      setCorrect((n) => n + 1);
      setAnswered((n) => n + 1);
      setMood('cheer');
      setMessage(`${pick(PRAISE)} +${st.coins} מטבעות.`);
      setPhase('done');
      logAttempt(st, true, tries);
      // Adaptive: a clean first-try correct builds a streak → step difficulty up.
      if (tries === 0) {
        setCleanStreak((s) => { const ns = s + 1; if (ns >= 2) { setLevel((l) => Math.min(5, l + 1)); return 0; } return ns; });
      } else setCleanStreak(0);
    } else {
      const t = tries + 1;
      setTries(t);
      setWrongIds((w) => [...w, choiceId]);
      if (t === 1) {
        // Hint 1 — a gentle direction.
        setMood('hint');
        setMessage('כיוון: ' + st.hint);
      } else if (t === 2) {
        // Hint 2 — narrow the field: remove one more wrong option, plus a stronger hint.
        const gone = st.choices.find((c) => c.id !== st.correctId && c.id !== choiceId
          && !eliminated.includes(c.id) && !wrongIds.includes(c.id));
        if (gone) setEliminated((e) => [...e, gone.id]);
        setMood('hint');
        setMessage(st.hint2 ? ('רמז נוסף: ' + st.hint2) : 'כמעט! הורדתי אפשרות שגויה — ננסה שוב.');
      } else {
        // Reveal — the answer with an explanation. No punishment.
        setRevealed(true);
        setAnswered((n) => n + 1);
        setMood('chill');
        setCleanStreak(0);
        setLevel((l) => Math.max(1, l - 1)); // struggled → ease difficulty down
        const mis = st.choices.find((c) => c.id === choiceId)?.misconception;
        setMessage(pick(GENTLE) + (st.explanation ? ' ' + st.explanation : ''));
        setPhase('done');
        logAttempt(st, false, 2, mis);
      }
    }
  }

  function chooseLead(id: string) {
    if (phase === 'done') return;
    const st = station as LeadStation;
    setChosenId(id);
    setHeartFilled(true);
    setMood('cheer');
    const reward = st.coins ?? 5;               // a small fixed reward — reflective, never scored
    setCoins((c) => c + reward);
    setEarned((e) => e + reward);
    setMessage(`${pick(HEART)} +${reward} מטבעות.`);
    setPhase('done');
    // Record the deposit (counts leadership engagement, excluded from accuracy).
    if (st.topicId && st.questionId) {
      fetch('/api/compass/deposit', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topicId: st.topicId, questionId: st.questionId, choice: { choice: id } }),
      }).catch(() => {});
    }
  }

  if (loading) return <Loader />;
  if (allSolved) return <SubjectDone />;
  if (finished) return <Celebration earned={earned} correct={correct} answered={answered} xp={correct * 10} />;
  if (!station) return <Loader />;

  return (
    <main className="app-shell">
      <div className="ex-bar">
        <Link href="/" className="ex-back" aria-label="חזרה"><CloseIcon /></Link>
        <div className="ex-progress">
          {stations.map((_, i) => (
            <span key={i} className={`pip${doneIdx.has(i) ? ' fill' : ''}${i === currentIdx ? ' cur' : ''}`} />
          ))}
        </div>
        <div className="ex-coins"><CoinIcon /><span>{coins}</span></div>
      </div>

      <div className="screen-body ex-body">
        <div className="ex-head">
          {station.subjectLabel && <span className="ex-subject">{station.subjectLabel}</span>}
          <span className="ex-title">{station.kind === 'lead' ? 'בנק הלב' : station.title}</span>
          <span className="ex-pos">
            {station.kind === 'lead' ? station.position : `שאלה ${doneIdx.size + 1} מתוך ${stations.length}`}
          </span>
        </div>

        {station.kind === 'lead'
          ? <LeadView st={station} picked={chosenId} heartFilled={heartFilled} onPick={chooseLead} />
          : <AcademicView st={station} chosenId={chosenId} wrongIds={wrongIds} eliminated={eliminated}
              revealed={revealed} locked={phase === 'done'} onAnswer={(id) => answer(station, id)} />}

        {message && (
          <div className="capi-row" style={{ marginTop: 14 }}>
            <Capi mood={mood} size={70} />
            <div className="bubble" dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        )}

        <div className="foot">
          {phase === 'done' && (
            <button className="cta" onClick={next}>
              {doneIdx.size + 1 >= stations.length ? 'סיום' : 'ממשיכים'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Loader() {
  return (
    <main className="app-shell">
      <div className="screen-body loader">
        <Capi mood="chill" size={92} />
        <div className="loader-dots"><i /><i /><i /></div>
        <p>מכינות לך תרגול…</p>
      </div>
    </main>
  );
}

function AcademicView({
  st, chosenId, wrongIds, eliminated, revealed, locked, onAnswer,
}: {
  st: AcademicStation; chosenId: string | null; wrongIds: string[]; eliminated: string[];
  revealed: boolean; locked: boolean; onAnswer: (id: string) => void;
}) {
  return (
    <>
      <div className="qcard">
        <div className="qtag">{st.tag}</div>
        <div className="qtext">{st.stem}</div>
      </div>
      <div className="answers">
        {st.choices.map((c) => {
          const isCorrectPick = chosenId === c.id && c.id === st.correctId;
          const isWrong = wrongIds.includes(c.id);
          const isGone = eliminated.includes(c.id);
          const showCorrect = isCorrectPick || (revealed && c.id === st.correctId);
          const cls = `ans${showCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}${isGone ? ' gone' : ''}`;
          const disabled = locked || isWrong || isGone;
          return (
            <button key={c.id} className={cls} onClick={() => onAnswer(c.id)} disabled={disabled}>
              <span>{c.text}</span>
              {showCorrect && <CheckIcon />}
              {isWrong && <CloseIcon />}
            </button>
          );
        })}
      </div>
    </>
  );
}

function LeadView({
  st, picked, heartFilled, onPick,
}: {
  st: LeadStation; picked: string | null; heartFilled: boolean; onPick: (id: string) => void;
}) {
  return (
    <>
      <div className="heartbank">
        <span className="hlabel"><HeartIcon /> יתרת הלב שלך</span>
        <div className="heartbar"><i style={{ width: heartFilled ? '78%' : '60%' }} /></div>
      </div>
      <div className="qcard">
        <div className="qtag">ההפקדה של היום</div>
        <div className="qtext" style={{ fontSize: '1.12rem' }}>{st.prompt}</div>
        <div className="qnote">{st.note}</div>
      </div>
      <div className="choices">
        {st.choices.map((c) => {
          const Icon = LEAD_ICON[c.icon];
          return (
            <button key={c.id} className={`choice${picked === c.id ? ' picked' : ''}`} onClick={() => onPick(c.id)}>
              <span className="choice-ico"><Icon /></span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Confetti() {
  const bits = useMemo(
    () => Array.from({ length: 60 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 1.6 + Math.random() * 1.8,
      color: ['#FF2A85', '#FACC15', '#38BDF8', '#2FBF8F', '#C49A6C'][i % 5],
    })),
    [],
  );
  return (
    <div className="confetti">
      {bits.map((c, i) => (
        <i key={i} style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }} />
      ))}
    </div>
  );
}

function ScoreRing({ pct }: { pct: number }) {
  const c = 2 * Math.PI * 32;
  const offset = c * (1 - pct / 100);
  const tier = pct >= 70 ? '#2FBF8F' : pct >= 40 ? '#FACC15' : '#FF2A85';
  return (
    <div className="score-ring">
      <svg width={92} height={92} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="32" fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle cx="40" cy="40" r="32" fill="none" stroke={tier} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} transform="rotate(-90 40 40)" />
      </svg>
      <span>{pct}%</span>
    </div>
  );
}

function Celebration({ earned, correct, answered, xp }: { earned: number; correct: number; answered: number; xp: number }) {
  const pct = answered ? Math.round((correct / answered) * 100) : 100;
  return (
    <main className="app-shell">
      <div className="screen-body cele">
        <Confetti />
        <div className="wow">וואו!</div>
        <Capi mood="cheer" size={120} />
        <h2>סיימת את הנושא!</h2>
        {answered > 0 && (
          <>
            <ScoreRing pct={pct} />
            <p className="cele-score">ענית נכון על {correct} מתוך {answered}</p>
          </>
        )}
        <div className="rewardrow">
          <div className="rw"><b><CoinIcon /> +{earned}</b><span>מטבעות</span></div>
          <div className="rw"><b>+{xp}</b><span>XP לאווטאר</span></div>
          <div className="rw"><b><FlameIcon /></b><span>שמרת על הרצף</span></div>
        </div>
        <div className="cele-actions">
          <Link href="/map" className="cta"><span className="cta-ico"><GridIcon /></span> לכל הנושאים</Link>
        </div>
      </div>
      <BottomNav active="/map" />
    </main>
  );
}

function SubjectDone() {
  return (
    <main className="app-shell">
      <div className="screen-body cele">
        <Confetti />
        <div className="wow">כל הכבוד!</div>
        <Capi mood="cheer" size={120} />
        <h2>סיימת את כל השאלות בנושא הזה</h2>
        <p>בואו נבחר נושא חדש להיום</p>
        <div className="cele-actions">
          <Link href="/map" className="cta"><span className="cta-ico"><GridIcon /></span> לכל הנושאים</Link>
        </div>
      </div>
      <BottomNav active="/map" />
    </main>
  );
}
