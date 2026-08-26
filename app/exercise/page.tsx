'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Capi, type CapiMood } from '@/components/Capi';
import {
  CoinIcon, FlameIcon, CheckIcon, CloseIcon, HeartIcon, LEAD_ICON,
} from '@/components/icons';
import {
  lesson as bundledLesson, PRAISE, GENTLE, HEART, pick,
  type Station, type AcademicStation, type LeadStation,
} from '@/lib/lessonData';
import type { DbStation } from '@/lib/db';
import { mili } from '@/lib/mockData';

type Phase = 'playing' | 'done';

// Coin multiplier per extra quest of the day — diminishing returns (anti-gaming).
const ROUND_MULT = [1, 0.5, 0.25];
const roundMult = (r: number) => ROUND_MULT[Math.min(r - 1, ROUND_MULT.length - 1)];

function mapDbLesson(db: DbStation[]): Station[] {
  const n = db.length;
  return db.map((s, i): Station => {
    const position = s.kind === 'lead' ? 'אי המצפן · מנהיגות' : `תחנה ${i + 1} מתוך ${n}`;
    if (s.kind === 'lead') {
      return { kind: 'lead', title: s.title, position, prompt: s.prompt, note: s.note, choices: s.choices };
    }
    return {
      kind: s.kind, title: s.title, position, tag: s.tag, stem: s.stem,
      choices: s.choices.map((c) => ({ id: c.id, text: c.text })),
      correctId: s.correctId, hint: s.hint, coins: s.coins,
    };
  });
}

export default function ExercisePage() {
  const [stations, setStations] = useState<Station[]>(bundledLesson);
  const [index, setIndex] = useState(0);
  const [coins, setCoins] = useState(mili.quest_coins);
  const [earned, setEarned] = useState(0);
  const [finished, setFinished] = useState(false);
  const [round, setRound] = useState(1);

  // per-station state
  const [tries, setTries] = useState(0);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState<Phase>('playing');
  const [mood, setMood] = useState<CapiMood>('chill');
  const [message, setMessage] = useState<string>('');
  const [heartFilled, setHeartFilled] = useState(false);

  // Load the day's questions from the DB; fall back to the bundled lesson.
  useEffect(() => {
    let alive = true;
    fetch('/api/lesson')
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (Array.isArray(j?.lesson) && j.lesson.length) setStations(mapDbLesson(j.lesson));
        if (typeof j?.coins === 'number') setCoins(j.coins);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const station = stations[index];

  function resetStation() {
    setTries(0); setChosenId(null); setWrongIds([]); setRevealed(false);
    setPhase('playing'); setMood('chill'); setMessage(''); setHeartFilled(false);
  }

  function next() {
    if (index + 1 >= stations.length) {
      fetch('/api/quest/complete', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ coins: earned }),
      }).catch(() => {});
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    resetStation();
  }

  function answer(st: AcademicStation, choiceId: string) {
    if (phase === 'done') return;
    if (choiceId === st.correctId) {
      const gained = Math.max(2, Math.round(st.coins * roundMult(round)));
      setChosenId(choiceId);
      setCoins((c) => c + gained);
      setEarned((e) => e + gained);
      setMood('cheer');
      setMessage(`${pick(PRAISE)} +${gained} מטבעות.`);
      setPhase('done');
    } else {
      const t = tries + 1;
      setTries(t);
      setWrongIds((w) => [...w, choiceId]);
      if (t >= 2) {
        setRevealed(true);
        setMood('chill');
        setMessage(pick(GENTLE));
        setPhase('done');
      } else {
        setMood('hint');
        setMessage('כמעט. ' + st.hint);
      }
    }
  }

  function chooseLead(id: string) {
    if (phase === 'done') return;
    setChosenId(id);
    setHeartFilled(true);
    setMood('cheer');
    setMessage(pick(HEART));
    setPhase('done');
  }

  if (finished) {
    return (
      <Celebration
        earned={earned}
        round={round}
        nextPct={Math.round(roundMult(round + 1) * 100)}
        onReplay={() => {
          setRound((r) => r + 1);
          setEarned(0);
          setIndex(0);
          setFinished(false);
          resetStation();
        }}
      />
    );
  }

  return (
    <main className="app-shell">
      <div className="ex-bar">
        <Link href="/" className="ex-back" aria-label="חזרה"><CloseIcon /></Link>
        <div className="ex-progress">
          {stations.map((_, i) => (
            <span key={i} className={`pip${i < index ? ' fill' : ''}${i === index ? ' cur' : ''}`} />
          ))}
        </div>
        <div className="ex-coins"><CoinIcon /><span>{coins}</span></div>
      </div>

      <div className="screen-body ex-body">
        <div className="ex-head">
          <span className="ex-title">{station.kind === 'lead' ? 'בנק הלב' : station.title}</span>
          <span className="ex-pos">{station.position}</span>
        </div>

        {station.kind === 'lead'
          ? <LeadView st={station} picked={chosenId} heartFilled={heartFilled} onPick={chooseLead} />
          : <AcademicView st={station} chosenId={chosenId} wrongIds={wrongIds}
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
              {index + 1 >= stations.length ? 'לסיום המסע' : 'ממשיכות'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function AcademicView({
  st, chosenId, wrongIds, revealed, locked, onAnswer,
}: {
  st: AcademicStation; chosenId: string | null; wrongIds: string[];
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
          const showCorrect = isCorrectPick || (revealed && c.id === st.correctId);
          const cls = `ans${showCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}`;
          const disabled = locked || isWrong;
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

function Celebration({
  earned, round, nextPct, onReplay,
}: { earned: number; round: number; nextPct: number; onReplay: () => void }) {
  const confetti = useMemo(
    () => Array.from({ length: 46 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 1.6 + Math.random() * 1.6,
      color: ['#FF2A85', '#FACC15', '#38BDF8', '#2FBF8F', '#C49A6C'][i % 5],
    })),
    [],
  );
  return (
    <main className="app-shell">
      <div className="screen-body cele">
        <div className="confetti">
          {confetti.map((c, i) => (
            <i key={i} style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }} />
          ))}
        </div>
        <Capi mood="cheer" size={120} />
        <h2>{round === 1 ? 'סיימת את המסע היומי' : `כל הכבוד! סבב ${round} הושלם`}</h2>
        <p>שמרת על הרצף שלך <FlameIcon /></p>
        <div className="rewardrow">
          <div className="rw"><b><CoinIcon /> +{earned}</b><span>מטבעות</span></div>
          <div className="rw"><b>+45</b><span>XP לאווטאר</span></div>
          <div className="rw"><b><HeartIcon /></b><span>הפקדה ללב</span></div>
        </div>
        <p className="cele-note">עוד מסע ייתן {nextPct}% מהמטבעות — אבל התרגול שווה בדיוק אותו דבר.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="cta ghost" onClick={onReplay}>עוד מסע</button>
          <Link href="/" className="cta" style={{ textAlign: 'center' }}>לבית</Link>
        </div>
      </div>
    </main>
  );
}
