'use client';

import { useEffect, useState } from 'react';
import { Section } from './Section';

/** Pre-fill the question bank before launch: each tap generates a batch into the
 *  thinnest topics. Tap until it reports everything is ready. */
export function SeedContentPanel() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastInserted, setLastInserted] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/parent/seed-content')
      .then((r) => r.json())
      .then((j) => { if (typeof j?.remaining === 'number') setRemaining(j.remaining); })
      .catch(() => {});
  }, []);

  async function fillBatch() {
    setBusy(true);
    setLastInserted(null);
    try {
      const j = await fetch('/api/parent/seed-content', { method: 'POST' }).then((r) => r.json());
      if (typeof j?.remaining === 'number') setRemaining(j.remaining);
      if (typeof j?.inserted === 'number') setLastInserted(j.inserted);
    } catch { /* ignore */ }
    setBusy(false);
  }

  const done = remaining === 0;

  return (
    <Section title="מילוי תוכן להשקה"
      hint="ממלא מראש שאלות בנושאים חדשים כדי שיהיו מוכנים לבנות. כל לחיצה ממלאת אצווה (עד דקותיים). לוחצים שוב ושוב עד שהכול מוכן. אפשר גם פשוט לתת לזה להתמלא לבד תוך כדי שימוש.">
      <div className="seed-box">
        {remaining === null && <div className="seed-line">בודק מצב תוכן…</div>}
        {remaining !== null && !done && (
          <div className="seed-line"><b>{remaining}</b> נושאים עדיין מחכים למילוי</div>
        )}
        {done && <div className="seed-line seed-done">כל התוכן מוכן ✓</div>}
        {lastInserted !== null && !busy && (
          <div className="seed-sub">נוספו {lastInserted} שאלות באצווה האחרונה</div>
        )}
        {!done && (
          <button className="cta" onClick={fillBatch} disabled={busy}>
            {busy ? 'ממלא… (רגע)' : 'מלא אצווה'}
          </button>
        )}
      </div>
    </Section>
  );
}
