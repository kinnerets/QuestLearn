'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { CoinIcon, FlameIcon, ChevronIcon } from '@/components/icons';
import type { AvatarConfig } from '@/lib/types';

interface Kid {
  id: string;
  name: string;
  grade: string | null;
  coins: number;
  streak: number;
  avatar: AvatarConfig;
  goalMinutes: number;
}

const GRADE_LABEL: Record<string, string> = { grade_3: 'כיתה ג׳', grade_5: 'כיתה ה׳' };

export function ParentDashboard({ kids }: { kids: Kid[] }) {
  const router = useRouter();

  async function lock() {
    await fetch('/api/parent/lock', { method: 'POST' }).catch(() => {});
    router.push('/');
    router.refresh();
  }

  return (
    <main className="app-shell">
      <div className="screen-body parent">
        <div className="parent-head">
          <h1>אזור הורים</h1>
          <button className="lock-btn" onClick={lock}>נעילה</button>
        </div>

        <div className="parent-kids">
          {kids.length === 0 && <div className="parent-empty">עדיין אין פרופילים במאגר.</div>}
          {kids.map((k) => (
            <div key={k.id} className="parent-kid">
              <div className="parent-av"><Avatar config={k.avatar} crop size={54} /></div>
              <div className="parent-kid-main">
                <div className="parent-kid-name">{k.name}</div>
                <div className="parent-kid-sub">
                  {GRADE_LABEL[k.grade ?? ''] ?? '—'} · יעד ~{k.goalMinutes} דק׳
                </div>
              </div>
              <div className="parent-kid-stats">
                <span><CoinIcon /> {k.coins}</span>
                <span><FlameIcon /> {k.streak}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="parent-soon">
          <div className="parent-soon-title">בקרוב כאן</div>
          <ul>
            <li>הכוונה יזומה — לבקש דגש על נושא מסוים לילדה</li>
            <li>דוח שבועי — התקדמות, טעויות נפוצות והמלצות</li>
            <li>ניהול חנות הפרסים ואישור מימושים</li>
          </ul>
        </div>

        <Link href="/" className="cta ghost" style={{ textAlign: 'center' }}>חזרה לאפליקציה</Link>
      </div>
    </main>
  );
}
