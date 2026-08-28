import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { Greeting } from '@/components/Greeting';
import { Capi } from '@/components/Capi';
import { BottomNav } from '@/components/BottomNav';
import { CoinIcon, FlameIcon, ChevronIcon, CheckIcon, CompassIcon, STATION_ICON } from '@/components/icons';
import { mili, todayStations } from '@/lib/mockData';
import { getChildren, getDailyLesson, getTodaySubjects } from '@/lib/db';
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
  const [dbLesson, doneSubjects] = await Promise.all([
    getDailyLesson(child?.grade ?? 'grade_3'),
    child ? getTodaySubjects(child.id) : Promise.resolve([]),
  ]);

  const name = child?.name ?? mili.display_name;
  const coins = child?.coins ?? mili.quest_coins;
  const streak = child?.streak ?? mili.current_streak;
  const avatar = child?.avatar ?? mili.avatar_config;
  const goalMinutes = child?.goalMinutes ?? mili.daily_goal_minutes;
  const multiProfile = (children?.length ?? 0) > 1;

  const base: DailyStation[] = dbLesson
    ? dbLesson.map((s) => ({
        kind: s.kind,
        subject: s.subject as DailyStation['subject'],
        title: s.title,
        subtitle: s.subtitle,
        minutes: s.minutes,
        status: 'upcoming',
      }))
    : todayStations;

  // Mark subjects already practised today as done; first undone is "active".
  let markedActive = false;
  const stations: DailyStation[] = base.map((s) => {
    if (doneSubjects.includes(s.subject)) return { ...s, status: 'done' };
    if (!markedActive) { markedActive = true; return { ...s, status: 'active' }; }
    return { ...s, status: 'upcoming' };
  });

  const doneCount = stations.filter((s) => s.status === 'done').length;
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
              <div className="hero-title"><Greeting name={name} /></div>
              <div className="hero-sub">
                {doneCount}/{stations.length} נושאים היום · יעד ~{goalMinutes} דק׳
              </div>
              {multiProfile && (
                <Link href="/profiles" className="hero-switch">החלפת פרופיל</Link>
              )}
            </div>
            <GoalRing done={doneCount} total={stations.length} />
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
            const done = s.status === 'done';
            return (
              <Link key={`${s.subject}-${i}`} href={`/exercise?focus=${s.subject}`} className={`mission${active ? ' active' : ''}${done ? ' done' : ''}`}>
                <span className={`mission-ico ico-${s.kind}`}><Icon /></span>
                <span className="mission-txt">
                  <span className="mission-title">{s.title}</span>
                  <span className="mission-sub" style={{ display: 'block' }}>{s.subtitle} · {s.minutes} דקות</span>
                </span>
                {done
                  ? <span className="mission-done"><CheckIcon /></span>
                  : active
                    ? <span className="mission-cta">התחילי</span>
                    : <span className="mission-chevron"><ChevronIcon /></span>}
              </Link>
            );
          })}
        </div>

        <Link href="/compass" className="compass-cta">
          <span className="compass-cta-ico"><CompassIcon /></span>
          <span className="compass-cta-txt">
            <b>אי המצפן</b>
            <small>מנהיגות אישית — 4 עולמות</small>
          </span>
          <ChevronIcon />
        </Link>

        <Link href="/map" className="map-cta">
          <span>רוצה נושא אחר? כל הנושאים</span>
          <ChevronIcon />
        </Link>

        <div className="capi-row">
          <Capi mood="chill" size={70} />
          <div className="bubble">
            {doneCount >= stations.length
              ? <>כל הכבוד {name}, סיימת את כל הנושאים להיום!</>
              : <>אהלן {name}. נתחיל ב<b>{firstActive.title}</b>?</>}
          </div>
        </div>

        <Link href="/parent" className="parent-link">אזור הורים</Link>
      </div>

      <BottomNav active="/" />
    </main>
  );
}
