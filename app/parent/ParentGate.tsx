'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Capi } from '@/components/Capi';
import { CloseIcon } from '@/components/icons';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function ParentGate() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(code: string) {
    setBusy(true);
    try {
      const r = await fetch('/api/parent/unlock', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pin: code }),
      });
      const j = await r.json();
      if (j?.ok) { router.refresh(); return; }
      setError(true); setPin('');
    } catch { setError(true); setPin(''); }
    setBusy(false);
  }

  function press(k: string) {
    if (busy) return;
    if (k === '⌫') { setPin((p) => p.slice(0, -1)); setError(false); return; }
    if (!k) return;
    const next = (pin + k).slice(0, 4);
    setPin(next);
    setError(false);
    if (next.length === 4) submit(next);
  }

  return (
    <main className="app-shell">
      <div className="ex-bar">
        <Link href="/" className="ex-back" aria-label="חזרה"><CloseIcon /></Link>
        <div className="ex-head-title">אזור הורים</div>
        <div style={{ width: 34 }} />
      </div>

      <div className="screen-body pin-screen">
        <Capi mood="chill" size={82} />
        <h2>קוד הורים</h2>
        <p>קוד בן 4 ספרות כדי להיכנס</p>

        <div className={`pin-dots${error ? ' err' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`dot${i < pin.length ? ' fill' : ''}`} />
          ))}
        </div>
        {error && <div className="pin-err">קוד שגוי, נסו שוב</div>}

        <div className="pin-pad">
          {KEYS.map((k, i) => (
            <button key={i} className={`pin-key${k ? '' : ' ghost'}`}
              onClick={() => press(k)} disabled={!k || busy}>{k}</button>
          ))}
        </div>
      </div>
    </main>
  );
}
