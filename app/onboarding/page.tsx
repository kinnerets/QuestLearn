'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { Capi } from '@/components/Capi';
import { CheckIcon } from '@/components/icons';
import { INTERESTS, CHILD_COOKIE } from '@/lib/constants';
import type { AvatarConfig } from '@/lib/types';

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<AvatarConfig | null>(null);
  const [childId, setChildId] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = readCookie(CHILD_COOKIE);
    setChildId(id);
    fetch('/api/children')
      .then((r) => r.json())
      .then((j) => {
        const kid = (j?.children ?? []).find((k: { id: string }) => k.id === id) ?? j?.children?.[0];
        if (kid) { setName(kid.name ?? ''); setAvatar(kid.avatar ?? null); }
      })
      .catch(() => {});
  }, []);

  function markDone() {
    try { if (childId) localStorage.setItem('ql_onboarded_' + childId, '1'); } catch { /* ignore */ }
  }

  function toggle(id: string) {
    setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  async function saveInterests() {
    try {
      await fetch('/api/interests', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ interests: [...picked] }),
      });
    } catch { /* best-effort */ }
  }

  function finish(dest: string) {
    markDone();
    router.push(dest);
  }

  return (
    <main className="app-shell">
      <div className="screen-body onboard">
        <div className="onboard-dots">
          {[0, 1, 2].map((i) => <span key={i} className={`ob-dot${i <= step ? ' on' : ''}`} />)}
        </div>

        {step === 0 && (
          <div className="onboard-step">
            <Capi mood="cheer" size={120} />
            <h1>{name ? `היי ${name}!` : 'היי!'}</h1>
            <p>אני קפי, המדריך שלך במסע. נכיר קצת ואז נצא לדרך יחד.</p>
            <button className="cta onboard-cta" onClick={() => setStep(1)}>יאללה, מתחילים</button>
          </div>
        )}

        {step === 1 && (
          <div className="onboard-step">
            <Capi mood="chill" size={84} />
            <h2>מה מעניין אותך?</h2>
            <p>בחרי כמה דברים שאת אוהבת - ואתאים לך יותר תרגולים בכיוון.</p>
            <div className="interest-grid">
              {INTERESTS.map((it) => {
                const on = picked.has(it.id);
                return (
                  <button key={it.id} className={`interest-chip${on ? ' on' : ''}`} onClick={() => toggle(it.id)}>
                    <span className="interest-check">{on && <CheckIcon />}</span>
                    <span>{it.label}</span>
                  </button>
                );
              })}
            </div>
            <button className="cta onboard-cta" onClick={async () => { await saveInterests(); setStep(2); }}>
              המשך
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboard-step">
            {avatar && <div className="onboard-av"><Avatar config={avatar} crop size={110} /></div>}
            {!avatar && <Capi mood="cheer" size={100} />}
            <h2>{name ? `זו את, ${name}` : 'הכול מוכן'}</h2>
            <p>אפשר לשנות את האווטאר בכל רגע בלחיצה על התמונה. עכשיו כמה שאלות קצרות כדי להתחיל מהמקום המתאים לך.</p>
            <button className="cta onboard-cta" onClick={() => finish('/placement')}>בואי נמצא את הרמה שלי</button>
            <button className="onboard-skip" onClick={() => finish('/avatar')}>קודם לעצב את האווטאר</button>
          </div>
        )}
      </div>
    </main>
  );
}
