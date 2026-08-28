'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Capi, type CapiMood } from '@/components/Capi';
import { BottomNav } from '@/components/BottomNav';
import {
  COMPASS_ICON, CompassIcon, BookIcon, CoinIcon, StarIcon, HeartIcon, CheckIcon, CloseIcon, ChevronIcon,
} from '@/components/icons';
import type { CompassWorld } from '@/lib/db';

const WORLD_ICON = [BookIcon, CoinIcon, StarIcon, HeartIcon];
const WORLD_TONE = ['w-vision', 'w-time', 'w-ceo', 'w-heart'];
const METAPHOR = ['חותמות', 'בחירות חכמות', 'שריר ה‑לא', 'יתרת הלב'];

const IDENTITY_CARDS = ['אני אמיצה', 'אני יוצרת', 'אני חברה טובה', 'אני לומדת סקרנית', 'אני מנהיגה'];

const COACH: Record<string, string[]> = {
  reflection: [
    'חותמת נהדרת. את בונה את מי שאת נעשית — צעד קטן בכל פעם.',
    'יפה. כל פעולה קטנה כזו היא לבנה בזהות שלך.',
    'זה בדיוק זה. המצפן שלך מצביע קדימה.',
  ],
  budget: [
    'בחירה חכמה. אי אפשר הכל — ובחרת בכוונה.',
    'לבחור משהו זה גם להגיד "כן" לעצמך. יופי.',
    'ניהלת את הזמן שלך במקום שהוא ינהל אותך. מנהיגה.',
  ],
  scenario: [
    'הפקדה יפה. הקשרים שלך מרגישים את זה.',
    'זה מה שממלא את בנק הלב. כל הכבוד.',
    'להגיד "לא" יפה זה שריר — והרגע חיזקת אותו.',
  ],
};

function pick(a: string[]) { return a[Math.floor(Math.random() * a.length)]; }

export default function CompassPage() {
  const [worlds, setWorlds] = useState<CompassWorld[] | null>(null);
  const [active, setActive] = useState<CompassWorld | null>(null);

  function load() {
    fetch('/api/compass').then((r) => r.json())
      .then((j) => setWorlds(Array.isArray(j?.worlds) ? j.worlds : []))
      .catch(() => setWorlds([]));
  }
  useEffect(load, []);

  function onDone(updated: CompassWorld) {
    setWorlds((ws) => (ws ?? []).map((w) => (w.topicId === updated.topicId ? { ...w, deposits: w.deposits + 1 } : w)));
    setActive(null);
  }

  if (active) return <Mission world={active} onBack={() => setActive(null)} onDone={onDone} />;

  return (
    <main className="app-shell">
      <div className="screen-body compass">
        <div className="compass-head">
          <span className="compass-badge"><CompassIcon /></span>
          <div>
            <h1>אי המצפן</h1>
            <p>ארבעה עולמות של מנהיגות — כאן אין תשובה נכונה, יש רק את מי שאת נעשית.</p>
          </div>
        </div>

        <div className="world-list">
          {worlds === null && <div className="compass-loading">טוען…</div>}
          {worlds?.map((w, i) => {
            const Icon = WORLD_ICON[(w.order - 1) % 4] ?? WORLD_ICON[i % 4];
            const toNext = 5 - (w.deposits % 5 || (w.deposits ? 5 : 0));
            const pct = w.deposits ? Math.round(((w.deposits % 5 || 5) / 5) * 100) : 0;
            return (
              <button key={w.topicId} className={`world-card ${WORLD_TONE[(w.order - 1) % 4]}`} onClick={() => setActive(w)}>
                <span className="world-ico"><Icon /></span>
                <span className="world-main">
                  <span className="world-name">{w.name}</span>
                  <span className="world-meta">{METAPHOR[(w.order - 1) % 4]} · {w.deposits} הפקדות</span>
                  <span className="world-bar"><i style={{ width: `${pct}%` }} /></span>
                </span>
                <span className="world-go"><ChevronIcon /></span>
              </button>
            );
          })}
        </div>

        <Link href="/" className="map-back">חזרה למסע היומי</Link>
      </div>
      <BottomNav active="/compass" />
    </main>
  );
}

function Mission({ world, onBack, onDone }: {
  world: CompassWorld; onBack: () => void; onDone: (w: CompassWorld) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [alloc, setAlloc] = useState<Record<string, number>>({});
  const [mood, setMood] = useState<CapiMood>('chill');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [milestone, setMilestone] = useState<string | null>(null);

  const spent = Object.values(alloc).reduce((a, b) => a + b, 0);
  const remaining = (world.coins ?? 0) - spent;

  async function deposit(choice: unknown) {
    await fetch('/api/compass/deposit', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topicId: world.topicId, questionId: world.questionId, choice }),
    }).catch(() => {});
    setMood('cheer');
    setMessage(pick(COACH[world.kind] ?? COACH.scenario));
    const n = world.deposits + 1;
    if (world.kind === 'reflection' && n % 5 === 0) {
      setMilestone(IDENTITY_CARDS[(n / 5 - 1) % IDENTITY_CARDS.length]);
    } else if (world.kind === 'scenario' && world.order === 4) {
      setMilestone('יתרת הלב שלך גדלה');
    }
    setDone(true);
  }

  function choosePick(id: string) {
    if (done) return;
    setPicked(id);
    deposit({ choice: id });
  }
  function bump(id: string) {
    if (done) return;
    setAlloc((a) => {
      const cur = a[id] ?? 0;
      if (remaining <= 0 && cur === 0) return a;
      if (remaining <= 0) return a;
      return { ...a, [id]: cur + 1 };
    });
  }
  function clearAlloc() { if (!done) setAlloc({}); }

  return (
    <main className="app-shell">
      <div className="ex-bar">
        <button className="ex-back" aria-label="חזרה" onClick={onBack}><CloseIcon /></button>
        <div className="ex-head-title">{world.name}</div>
        <div style={{ width: 34 }} />
      </div>

      <div className="screen-body ex-body">
        <div className="qcard">
          <div className="qtag">המשימה של היום</div>
          <div className="qtext" style={{ fontSize: '1.15rem' }}>{world.prompt}</div>
          <div className="qnote">{world.note}</div>
        </div>

        {world.kind === 'budget' ? (
          <>
            <div className="budget-bar">
              <span>נשארו לך</span>
              <span className="budget-coins">
                {Array.from({ length: world.coins ?? 0 }).map((_, i) => (
                  <i key={i} className={i < remaining ? 'on' : ''}><CoinIcon /></i>
                ))}
              </span>
            </div>
            <div className="choices">
              {world.options.map((o) => {
                const Icon = COMPASS_ICON[o.icon as keyof typeof COMPASS_ICON] ?? StarIcon;
                const c = alloc[o.id] ?? 0;
                return (
                  <button key={o.id} className={`choice${c ? ' picked' : ''}`} onClick={() => bump(o.id)} disabled={done}>
                    <span className="choice-ico"><Icon /></span>
                    <span style={{ flex: 1 }}>{o.label}</span>
                    <span className="alloc-count">{c > 0 ? `×${c}` : ''}</span>
                  </button>
                );
              })}
            </div>
            {!done && (
              <div className="foot" style={{ display: 'flex', gap: 10 }}>
                <button className="cta ghost" onClick={clearAlloc}>איפוס</button>
                <button className="cta" disabled={remaining !== 0} onClick={() => deposit({ alloc })}>
                  {remaining === 0 ? 'לאשר את היום שלי' : `חלקי עוד ${remaining}`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="choices">
            {world.options.map((o) => {
              const Icon = COMPASS_ICON[o.icon as keyof typeof COMPASS_ICON] ?? StarIcon;
              return (
                <button key={o.id} className={`choice${picked === o.id ? ' picked' : ''}`} onClick={() => choosePick(o.id)} disabled={done}>
                  <span className="choice-ico"><Icon /></span>
                  <span>{o.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {message && (
          <div className="capi-row" style={{ marginTop: 14 }}>
            <Capi mood={mood} size={70} />
            <div className="bubble">{message}</div>
          </div>
        )}

        {milestone && (
          <div className="milestone">
            <span className="milestone-ico">{world.order === 4 ? <HeartIcon /> : <StarIcon />}</span>
            <span>{world.kind === 'reflection' ? `עמוד מלא! גילית קלף זהות: "${milestone}"` : milestone}</span>
          </div>
        )}

        {done && (
          <div className="foot">
            <button className="cta" onClick={() => onDone(world)}>
              <span className="cta-ico"><CheckIcon /></span> חזרה לאי המצפן
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
