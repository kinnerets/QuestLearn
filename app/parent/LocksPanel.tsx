'use client';

import { useEffect, useState } from 'react';

interface Lock { subject: string; label: string; locked: boolean }

export function LocksPanel() {
  const [locks, setLocks] = useState<Lock[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    try {
      const r = await fetch('/api/parent/locks');
      const j = await r.json();
      if (Array.isArray(j?.locks)) setLocks(j.locks);
    } catch { /* ignore */ }
    setLoaded(true);
  }
  useEffect(() => { load(); }, []);

  async function toggle(subject: string, locked: boolean) {
    setLocks((xs) => xs.map((x) => (x.subject === subject ? { ...x, locked } : x)));
    try {
      await fetch('/api/parent/locks', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subject, locked }),
      });
    } catch { /* ignore */ }
  }

  if (!loaded || locks.length === 0) return null;

  return (
    <section className="content-panel">
      <div className="parent-head" style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: '1.15rem' }}>נושאים רגישים</h2>
      </div>
      <p className="content-hint">נושאים שכדאי לשקול לפני פתיחה. כשנעול — הילדות לא רואות אותו. פתחי כשמתאים.</p>

      {locks.map((l) => (
        <label key={l.subject} className="lock-row">
          <span className="lock-name">{l.label}</span>
          <span className={`lock-state${l.locked ? ' locked' : ''}`}>{l.locked ? 'נעול' : 'פתוח'}</span>
          <button
            className={`switch${l.locked ? '' : ' on'}`}
            role="switch" aria-checked={!l.locked} aria-label={l.label}
            onClick={() => toggle(l.subject, !l.locked)}
          >
            <span className="switch-knob" />
          </button>
        </label>
      ))}
    </section>
  );
}
