import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { BottomNav } from '@/components/BottomNav';
import { CoinIcon, FlameIcon, StarIcon, CheckIcon, STATION_ICON } from '@/components/icons';
import { getChildren, getChildStatus, type SubjectCard, type ChildStatus } from '@/lib/db';
import { selectedChildId } from '@/lib/session';
import { mili } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

function tier(m: number) { return m >= 0.7 ? 'good' : m >= 0.4 ? 'mid' : 'low'; }

function KnowledgeBars({ subjects }: { subjects: SubjectCard[] }) {
  const sorted = [...subjects].sort((a, b) => b.accuracy - a.accuracy);
  return (
    <div className="kbars">
      {sorted.map((s) => {
        const Icon = STATION_ICON[s.kind];
        const pct = Math.round(s.accuracy * 100);
        return (
          <div key={s.subject} className="kbar-row">
            <span className={`kbar-ico ico-${s.kind}`}><Icon /></span>
            <span className="kbar-main">
              <span className="kbar-name">{s.label}</span>
              <span className="kbar-bar"><i className={tier(s.accuracy)} style={{ width: `${Math.max(s.answered ? 5 : 0, pct)}%` }} /></span>
            </span>
            <span className="kbar-pct">{s.answered > 0 ? `${pct}%` : '—'}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function StatusPage() {
  const selectedId = selectedChildId();
  const children = await getChildren();
  if (children && children.length && (!selectedId || !children.some((c) => c.id === selectedId))) {
    redirect('/profiles');
  }
  const child = children?.find((c) => c.id === selectedId) ?? children?.[0] ?? null;
  const status: ChildStatus | null = child ? await getChildStatus(child.id, child.grade ?? 'grade_3') : null;

  const name = status?.name ?? child?.name ?? mili.display_name;
  const level = status?.level ?? 1;
  const inLevel = status?.inLevel ?? 0;
  const need = status?.need ?? 120;
  const coins = status?.coins ?? child?.coins ?? mili.quest_coins;
  const streak = status?.streak ?? child?.streak ?? mili.current_streak;
  const avatar = child?.avatar ?? mili.avatar_config;
  const subjects = status?.subjects ?? [];
  const strengths = status?.strengths ?? [];
  const toTrain = status?.toTrain ?? [];
  const badges = status?.badges ?? [];

  return (
    <main className="app-shell">
      <div className="screen-body status">
        <section className="level-hero">
          <div className="level-av"><Avatar config={avatar} crop size={58} /></div>
          <div className="level-main">
            <div className="level-name">{name}</div>
            <div className="level-tag">רמה {level}</div>
            <div className="xp-bar"><i style={{ width: `${Math.round((inLevel / need) * 100)}%` }} /></div>
            <div className="xp-num">{inLevel}/{need} XP לרמה הבאה</div>
          </div>
        </section>

        <div className="status-stats">
          <div className="status-stat"><CoinIcon /><b>{coins}</b><span>מטבעות</span></div>
          <div className="status-stat"><FlameIcon /><b>{streak}</b><span>ימי רצף</span></div>
          <div className="status-stat"><StarIcon /><b>{status?.xp ?? 0}</b><span>XP סה״כ</span></div>
        </div>

        {subjects.length > 0 && (
          <section className="status-card">
            <div className="status-title">מפת הכוחות שלך</div>
            {subjects.some((s) => s.answered > 0)
              ? <KnowledgeBars subjects={subjects} />
              : <p className="status-empty">עדיין אין נתונים 🌱 אחרי כמה תרגולים כאן תופיע רמת השליטה בכל מקצוע — באחוזים.</p>}
          </section>
        )}

        {strengths.length > 0 && (
          <section className="status-card">
            <div className="status-title">חוזקות בולטות</div>
            <div className="chip-row">
              {strengths.map((s) => (
                <span key={s.subject} className="strength-chip">
                  {s.label} · {Math.round(s.accuracy * 100)}%
                </span>
              ))}
            </div>
          </section>
        )}

        {toTrain.length > 0 && (
          <section className="status-card">
            <div className="status-title">תחומים לאימון</div>
            <div className="train-list">
              {toTrain.map((s) => {
                const Icon = STATION_ICON[s.kind];
                return (
                  <div key={s.subject} className="train-row">
                    <span className={`mission-ico ico-${s.kind}`}><Icon /></span>
                    <span className="train-main">
                      <span className="train-name">{s.label}</span>
                      <span className="train-sub">
                        {s.answered > 0 ? `${Math.round(s.accuracy * 100)}% הצלחה` : 'טרם התחלת'}
                      </span>
                    </span>
                    <Link href={`/exercise?focus=${s.subject}`} className="train-btn">בואו נתאמן</Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="status-card">
          <div className="status-title">תגי הישג</div>
          <div className="badge-grid">
            {badges.map((b) => (
              <div key={b.key} className={`badge${b.earned ? ' earned' : ''}`}>
                <span className="badge-ico">{b.earned ? <CheckIcon /> : <StarIcon />}</span>
                <span className="badge-label">{b.label}</span>
                <span className="badge-desc">{b.desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav active="/status" />
    </main>
  );
}
