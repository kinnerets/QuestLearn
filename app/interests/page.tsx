'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Capi } from '@/components/Capi';
import { CloseIcon, CheckIcon } from '@/components/icons';
import { INTERESTS } from '@/lib/constants';

export default function InterestsPage() {
  const router = useRouter();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    fetch('/api/interests')
      .then((r) => r.json())
      .then((j) => { if (Array.isArray(j?.interests)) setPicked(new Set(j.interests as string[])); })
      .catch(() => {});
  }, []);

  function toggle(id: string) {
    setStatus('idle');
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  async function save() {
    setStatus('saving');
    try {
      await fetch('/api/interests', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ interests: [...picked] }),
      });
      setStatus('saved');
      router.refresh();
      setTimeout(() => router.push('/'), 550);
    } catch { setStatus('idle'); }
  }

  return (
    <main className="app-shell">
      <div className="ex-bar">
        <Link href="/" className="ex-back" aria-label="חזרה"><CloseIcon /></Link>
        <div className="ex-head-title">מה מעניין אותך?</div>
        <div style={{ width: 34 }} />
      </div>

      <div className="screen-body interests">
        <div className="interests-head">
          <Capi mood="cheer" size={78} />
          <p>בחרי כמה דברים שאת אוהבת - ונתאים לך יותר תרגולים בכיוון!</p>
        </div>

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
      </div>

      <div className="parent-foot">
        <button className="cta" onClick={save} disabled={status === 'saving'}>
          {status === 'saving' ? 'שומר…' : status === 'saved' ? 'נשמר' : 'שמירה'}
        </button>
      </div>
    </main>
  );
}
