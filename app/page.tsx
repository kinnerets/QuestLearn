import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { Capi } from '@/components/Capi';
import { BottomNav } from '@/components/BottomNav';
import { CoinIcon, FlameIcon, ChevronIcon, STATION_ICON } from '@/components/icons';
import { mili, todayStations } from '@/lib/mockData';
import { getChildren, getDailyLesson } from '@/lib/db';
import { selectedChildId } from '@/lib/session';
import type { DailyStation } from '@/lib/types';

export const dynamic = 'force-dynamic';

function GoalRing({ done, total }: { done: number; total: number }) {
  const c = 2 * Math.PI * 17;
  const offset = c * (1 - done / total);
  return (
    <div className="goal-ring">
      <svg width={54} height={54} viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="17" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="5" />
        <circle
          cx="21" cy="21" r="17" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} transform="rotate(-90 21 21)"
        />
      </svg>
      <span>{done}/{total}</span>
    </div>
  );
}

export default async function HomePage() {
  const selectedId = selectedChildId();
  const children = await getChildren();

  // With a live DB, always run through the profile picker so Mili and Lia stay separate.
  if (children && children.length && (!selectedId || !children.some((c) => c.id === selectedId))) {
    redirect('/profiles');
  }
  const child = children?.find((c) => c.id === selectedId) ?? children?.[0] ?? null;
  const dbLesson = await getDailyLesson(child?.grade ?? 'grade_3');

  const name = child?.name ?? mili.display_name;
  const coins = child?.coins ?? mili.quest_coins;
  const streak = child?.streak ?? mili.current_streak;
  const avatar = child?.avatar ?? mili.avatar_config;
  const goalMinutes = child?.goalMinutes ?? mili.daily_goal_minutes;
  const multiProfile = (children?.length ?? 0) > 1;

  const stations: DailyStation[] = dbLesson
    ? dbLesson.map((s, i) => ({
        kind: s.kind,
        subject: 'math',
        title: s.title,
        subtitle: s.subtitle,
        minutes: s.minutes,
        status: i === 0 ? 'active' : 'upcoming',
      }))
    : todayStations;

  const firstActive = stations.find((s) => s.status === 'active') ?? stations[0];

  return (
    <main className="app-shell">
      <div className="screen-body">
        <section className="hero">
          <div className="hero-row">
            <Link href="/avatar" className="hero-avatar switchable" aria-label="עריכת אווטאר">
              <Avatar config={avatar} crop size={52} />
            </Link>
            <div style={{ flex: 1 }}>
              <div className="hero-title">בוקר טוב, {name}</div>
              <div className="hero-sub">
                {stations.length} תחנות · יעד יומי ~{goalMinutes} דקות
              </div>
              {multiProfile && (
                <Link href="/profiles" className="hero-switch">החלפת פרופיל</Link>
              )}
            </div>
            <GoalRing done={0} total={stations.length} />
          </div>
        </section>

        <div className="stat-row">
          <div className="stat-card coins">
            <CoinIcon />
            <div><div className="val">{coins}</div><div className="lbl">מטבעות</div></div>
          </div>
          <div className="stat-card streak">
            <FlameIcon />
            <div><div className="val">{streak}</div><div className="lbl">ימי רצף</div></div>
          </div>
        </div>

        <div className="mission-list">
          {stations.map((s, i) => {
            const Icon = STATION_ICON[s.kind];
            const active = s.status === 'active';
            return (
              <Link key={`${s.kind}-${i}`} href="/exercise" className={`mission${active ? ' active' : ''}`}>
                <span className={`mission-ico ico-${s.kind}`}><Icon /></span>
                <span className="mission-txt">
                  <span className="mission-title">{s.title}</span>
                  <span className="mission-sub" style={{ display: 'block' }}>{s.subtitle} · {s.minutes} דקות</span>
                </span>
                {active
                  ? <span className="mission-cta">התחילי</span>
                  : <span className="mission-chevron"><ChevronIcon /></span>}
              </Link>
            );
          })}
        </div>

        <div className="capi-row">
          <Capi mood="chill" size={70} />
          <div className="bubble">אהלן {name}. נתחיל ב<b>{firstActive.title.split(' — ')[0]}</b>?</div>
        </div>

        <Link href="/parent" className="parent-link">אזור הורים</Link>
      </div>

      <BottomNav active="/" />
    </main>
  );
}
