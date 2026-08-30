'use client';

import { useEffect, useState } from 'react';
import { Section } from './Section';

interface Chat { id: string; childName: string; question: string; reply: string; when: string }

function whenLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }) + ' ' +
    d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

export function CapiLogPanel({ childId }: { childId?: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!childId) return;
    setLoaded(false);
    fetch(`/api/parent/capi-log?childId=${encodeURIComponent(childId)}`)
      .then((r) => r.json())
      .then((j) => { if (Array.isArray(j?.chats)) setChats(j.chats); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [childId]);

  if (!childId || !loaded || chats.length === 0) return null;

  return (
    <Section title="שיחות עם קפי" count={chats.length}
      hint="מה הבת שאלה את קפי לאחרונה. קפי מכוון ללמידה ולא מוסר תשובות לשיעורי בית.">
      <div className="capi-log">
        {chats.map((c) => (
          <div key={c.id} className="capi-log-item">
            <div className="capi-log-when">{whenLabel(c.when)}</div>
            <div className="capi-log-q">{c.question}</div>
            <div className="capi-log-a">{c.reply}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
