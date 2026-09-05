'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Capi } from '@/components/Capi';
import { CloseIcon, ChevronIcon } from '@/components/icons';

interface Msg { role: 'user' | 'assistant'; text: string }

const STARTERS = ['ספר לי עובדה מגניבה', 'איך זוכרים את לוח הכפל?', 'למה השמיים כחולים?', 'תן לי חידה'];

export default function CapiChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', text: 'היי! אני קפי. אפשר לשאול אותי כל דבר שמסקרן אותך - או לבקש עזרה בלימודים. על מה בא לך לדבר?' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const history = msgs.slice(-6);
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setBusy(true);
    try {
      const r = await fetch('/api/capi', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: q, history }),
      });
      const j = await r.json();
      setMsgs((m) => [...m, { role: 'assistant', text: j?.reply ?? 'ננסה שוב עוד רגע?' }]);
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', text: 'משהו השתבש - ננסה שוב עוד רגע?' }]);
    }
    setBusy(false);
  }

  return (
    <main className="app-shell">
      <div className="ex-bar">
        <Link href="/" className="ex-back" aria-label="חזרה"><CloseIcon /></Link>
        <div className="ex-head-title">קפי</div>
        <div style={{ width: 34 }} />
      </div>

      <div className="screen-body capi-chat">
        {msgs.map((m, i) => (
          <div key={i} className={`chat-row ${m.role}`}>
            {m.role === 'assistant' && <span className="chat-capi"><Capi mood="chill" size={44} /></span>}
            <div className={`chat-bubble ${m.role}`}>{m.text}</div>
          </div>
        ))}
        {busy && (
          <div className="chat-row assistant">
            <span className="chat-capi"><Capi mood="chill" size={44} /></span>
            <div className="chat-bubble assistant typing"><i /><i /><i /></div>
          </div>
        )}
        {msgs.length <= 1 && (
          <div className="chat-starters">
            {STARTERS.map((s) => (
              <button key={s} className="chat-starter" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input-bar">
        <input
          className="chat-input" value={input} disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
          onFocus={() => setTimeout(() => endRef.current?.scrollIntoView({ block: 'end' }), 300)}
          placeholder="כתבי לקפי…" autoComplete="off"
        />
        <button className="chat-send" onClick={() => send(input)} disabled={busy || !input.trim()} aria-label="שליחה">
          <ChevronIcon />
        </button>
      </div>
    </main>
  );
}
