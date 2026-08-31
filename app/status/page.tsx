import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { Capi } from '@/components/Capi';
import { BottomNav } from '@/components/BottomNav';
import { CoinIcon, FlameIcon, StarIcon, LevelIcon, BADGE_ICON, STATION_ICON, SUBJECT_ICON } from '@/components/icons';
import { SubjectBars } from '@/components/SubjectBars';
import { getChildren, getChildStatus, getSubjectBreakdown, type ChildStatus } from '@/lib/db';
import { selectedChildId } from '@/lib/session';
import { mili } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  const selectedId = selectedChildId();
  const children = await getChildren();
  if (children && children.length && (!selectedId || !children.some((c) => c.id === selectedId))) {
    redirect('/profiles');
  }
  const child = children?.find((c) => c.id === selectedId) ?? children?.[0] ?? null;
  const [status, breakdown] = child
    ? await Promise.all([
        getChildStatus(child.id, child.grade ?? 'grade_3'),
        getSubjectBreakdown(child.grade ?? 'grade_3', child.id),
      ])
    : [null as ChildStatus | null, null];

  const name = status?.name ?? child?.name ?? mili.display_name;
  const level = status?.level ?? 1;
  const inLevel = status?.inLevel ?? 0;
  const need = status?.need ?? 120;
  const coins = status?.coins ?? child?.coins ?? mili.quest_coins;
  const streak = status?.streak ?? child?.streak ?? mili.current_streak;
  const avatar = child?.avatar ?? mili.avatar_config;
  const subjectBars = breakdown ?? [];
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
            <div className="xp-num">{inLevel}/{need} עד הרמה הבאה</div>
          </div>
        </section>

        <div className="status-stats">
          <div className="status-stat"><CoinIcon /><b>{coins}</b><span>מטבעות</span></div>
          <div className="status-stat"><FlameIcon /><b>{streak}</b><span>ימי רצף</span></div>
          <div className="status-stat"><LevelIcon /><b>{level}</b><span>רמה</span></div>
        </div>

        <div className="capi-row capi-top">
          <Capi mood="chill" size={64} />
          <div className="bubble">
            {streak >= 3
              ? <>{streak} ימים ברצף, {name}! ההתמדה הקטנה של כל יום היא הכוח הכי גדול.</>
              : <>כל תרגול קטן בונה משהו גדול, {name}. תראי כמה כבר התקדמת.</>}
          </div>
        </div>

        {subjectBars.length > 0 && (
          <section className="status-card">
            <div className="status-title">מפת הכוחות שלך</div>
            <p className="status-hint">הקישי על מקצוע כדי לראות את תתי-הנושאים. נושא שעדיין לא תורגל לא נספר בציון.</p>
            {subjectBars.some((s) => s.answered > 0)
              ? <SubjectBars subjects={subjectBars} />
              : <p className="status-empty">עדיין אין נתונים · אחרי כמה תרגולים כאן תופיע רמת השליטה בכל מקצוע - באחוזים.</p>}
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
                const Icon = SUBJECT_ICON[s.subject] ?? STATION_ICON[s.kind];
                return (
                  <div key={s.subject} className="train-row">
                    <span className={`mission-ico ico-${s.kind}`}><Icon /></span>
                    <span className="train-main">
                      <span className="train-name">{s.label}</span>
                      <span className="train-sub">
                        {s.answered > 0 ? `${Math.round(s.accuracy * 100)}% הצלחה` : 'טרם התחלת'}
                      </span>
                    </span>
                    <Link href={`/exercise?focus=${s.subject}&from=status`} className="train-btn">בואו נתאמן</Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="status-card">
          <div className="status-title">תגי הישג</div>
          <div className="badge-grid">
            {badges.map((b) => {
              const Icon = BADGE_ICON[b.key] ?? StarIcon;
              return (
                <div key={b.key} className={`badge${b.earned ? ' earned' : ''}`}>
                  <span className="badge-ico"><Icon /></span>
                  <span className="badge-label">{b.label}</span>
                  <span className="badge-desc">{b.desc}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <BottomNav active="/status" />
    </main>
  );
}
