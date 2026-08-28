import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { BottomNav } from '@/components/BottomNav';
import { CoinIcon, FlameIcon, StarIcon, CheckIcon, STATION_ICON } from '@/components/icons';
import { getChildren, getChildStatus, type SubjectCard, type ChildStatus } from '@/lib/db';
import { selectedChildId } from '@/lib/session';
import { mili } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

function Radar({ subjects }: { subjects: SubjectCard[] }) {
  const n = subjects.length;
  const cx = 150, cy = 130, R = 92;
  const pt = (i: number, r: number) => {
    const a = (-90 + (i * 360) / n) * (Math.PI / 180);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const ring = (f: number) =>
    subjects.map((_, i) => pt(i, R * f).join(',')).join(' ');
  const shape = subjects.map((s, i) => pt(i, R * Math.max(0.06, s.accuracy)).join(',')).join(' ');

  return (
    <svg viewBox="0 0 300 260" role="img" aria-label="רדאר ידע" className="radar">
      {[0.33, 0.66, 1].map((f) => (
        <polygon key={f} points={ring(f)} className="radar-grid" />
      ))}
      {subjects.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="radar-grid" />;
      })}
      <polygon points={shape} className="radar-shape" />
      {subjects.map((s, i) => {
        const [x, y] = pt(i, R + 16);
        return (
          <text key={i} x={x} y={y} className="radar-label"
            textAnchor="middle" dominantBaseline="middle">{s.label}</text>
        );
      })}
    </svg>
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

        {subjects.length >= 3 && (
          <section className="status-card">
            <div className="status-title">רדאר הידע שלך</div>
            <Radar subjects={subjects} />
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
                    <Link href={`/exercise?focus=${s.subject}`} className="train-btn">אימון 2 דק׳</Link>
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
