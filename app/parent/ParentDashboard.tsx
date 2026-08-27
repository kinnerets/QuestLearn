'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { CoinIcon, FlameIcon } from '@/components/icons';
import type { AvatarConfig } from '@/lib/types';
import type { ChildReport } from '@/lib/db';

interface Kid {
  id: string;
  name: string;
  grade: string | null;
  coins: number;
  streak: number;
  avatar: AvatarConfig;
  goalMinutes: number;
  report: ChildReport | null;
}

const GRADE_LABEL: Record<string, string> = { grade_3: 'כיתה ג׳', grade_5: 'כיתה ה׳' };

const SUBJECT_LABEL: Record<string, string> = {
  math: 'חשבון', geometry: 'גאומטריה', hebrew: 'עברית', bible: 'תנ״ך',
  science: 'מדע', arabic: 'ערבית', english: 'אנגלית', geography: 'גאוגרפיה',
  future_skills: 'שער העתיד', leadership: 'מנהיגות',
};

const MISCONCEPTION_LABEL: Record<string, string> = {
  off_by_one_multiple: 'טעות בלוח הכפל (קפיצה אחת יותר/פחות)',
  bigger_denominator_bigger_fraction: 'חושבת ששבר עם מכנה גדול = גדול יותר',
  add_denominators: 'מחברת מכנים במקום למצוא מכנה משותף',
  confuse_pen_book: 'בלבול בין "עט" ל"ספר" בערבית',
  confuse_water_sun: 'בלבול בין "מים" ל"שמש" בערבית',
};

function pct(x: number) { return Math.round(x * 100); }
function masteryClass(m: number) { return m >= 0.7 ? 'good' : m >= 0.4 ? 'mid' : 'low'; }

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

        {kids.length === 0 && <div className="parent-empty">עדיין אין פרופילים במאגר.</div>}

        <div className="parent-reports">
          {kids.map((k) => (
            <ReportCard key={k.id} kid={k} />
          ))}
        </div>

        <Link href="/" className="cta ghost" style={{ textAlign: 'center' }}>חזרה לאפליקציה</Link>
      </div>
    </main>
  );
}

function ReportCard({ kid }: { kid: Kid }) {
  const r = kid.report;
  const hasData = r && r.answered > 0;

  return (
    <div className="report-card">
      <div className="report-top">
        <div className="parent-av"><Avatar config={kid.avatar} crop size={48} /></div>
        <div className="report-id">
          <div className="parent-kid-name">{kid.name}</div>
          <div className="parent-kid-sub">
            {GRADE_LABEL[kid.grade ?? ''] ?? '—'} · יעד ~{kid.goalMinutes} דק׳
          </div>
        </div>
        <div className="report-coins">
          <span><CoinIcon /> {kid.coins}</span>
          <span><FlameIcon /> {kid.streak}</span>
        </div>
      </div>

      {!hasData && (
        <div className="report-empty">אין עדיין נתונים השבוע — הדוח יתמלא אחרי כמה תרגולים.</div>
      )}

      {hasData && r && (
        <>
          <div className="report-stats">
            <Stat value={`${pct(r.accuracy)}%`} label="דיוק" />
            <Stat value={String(r.answered)} label="שאלות השבוע" />
            <Stat value={`${r.activeDays}/7`} label="ימים פעילים" />
          </div>

          {r.subjects.length > 0 && (
            <div className="report-section">
              <div className="report-section-title">שליטה לפי נושא</div>
              {r.subjects.map((s, i) => (
                <div key={i} className="mastery-row">
                  <span className="mastery-name">
                    {SUBJECT_LABEL[s.subject] ?? s.subject}
                    <em>{s.subTopic}</em>
                  </span>
                  <span className="mastery-bar">
                    <i className={masteryClass(s.mastery)} style={{ width: `${pct(s.mastery)}%` }} />
                  </span>
                  <span className="mastery-pct">{pct(s.mastery)}%</span>
                </div>
              ))}
            </div>
          )}

          {r.misconceptions.length > 0 && (
            <div className="report-section">
              <div className="report-section-title">לתת עליו את הדעת</div>
              <ul className="misc-list">
                {r.misconceptions.map((m) => (
                  <li key={m}>{MISCONCEPTION_LABEL[m] ?? 'טעות חוזרת בנושא'}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="report-stat">
      <div className="report-stat-val">{value}</div>
      <div className="report-stat-lbl">{label}</div>
    </div>
  );
}
