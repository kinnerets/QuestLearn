import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { Greeting } from '@/components/Greeting';
import { Capi } from '@/components/Capi';
import { BottomNav } from '@/components/BottomNav';
import { ChevronIcon, CheckIcon, STATION_ICON, SUBJECT_ICON, SparkIcon, CompassIcon, SwapIcon } from '@/components/icons';
import { HomeTasks } from './HomeTasks';
import { mili, todayStations } from '@/lib/mockData';
import { getChildren, getDailyLesson, getTodaySubjects, getSeasonalHighlight } from '@/lib/db';
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
  const [dbLesson, doneSubjects, seasonal] = await Promise.all([
    getDailyLesson(child?.grade ?? 'grade_3', child?.id),
    child ? getTodaySubjects(child.id) : Promise.resolve([]),
    getSeasonalHighlight(),
  ]);

  const name = child?.name ?? mili.display_name;
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
        order: s.kind === 'lead' ? s.order : undefined,
        topicId: s.kind === 'lead' ? s.topicId : undefined,
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
  const needsPlacement = !!child && child.xp === 0;

  return (
    <main className="app-shell">
      <div className="screen-body">
        <section className="hero">
          <div className="hero-row">
            <Link href="/profiles" className="hero-avatar switchable" aria-label="החלפת פרופיל ואזור הורים">
              <Avatar config={avatar} crop size={52} />
              <span className="hero-avatar-swap"><SwapIcon /></span>
            </Link>
            <div style={{ flex: 1 }}>
              <div className="hero-title"><Greeting name={name} /></div>
              <div className="hero-sub">
                {doneCount}/{stations.length} נושאים היום · יעד ~{goalMinutes} דק׳
              </div>
              {multiProfile && (
                <Link href="/profiles" className="hero-switch"><SwapIcon /> החלפת פרופיל</Link>
              )}
            </div>
            <GoalRing done={doneCount} total={stations.length} />
          </div>
        </section>

        {seasonal && (
          <Link href={`/exercise?focus=seasonal&topic=${seasonal.topicId}`} className="season-banner">
            <span className="season-emoji"><SparkIcon /></span>
            <span className="place-banner-txt">
              <b>מיוחד לעונה: {seasonal.label}</b>
              <small>כמה שאלות חגיגיות — בונוס</small>
            </span>
            <span className="place-banner-go">›</span>
          </Link>
        )}

        {needsPlacement && (
          <Link href="/placement" className="place-banner">
            <span className="place-banner-emoji"><CompassIcon /></span>
            <span className="place-banner-txt">
              <b>מסע ההיכרות</b>
              <small>כמה שאלות קצרות כדי להתחיל מהמקום המתאים לך</small>
            </span>
            <span className="place-banner-go">›</span>
          </Link>
        )}

        <div className="mission-list">
          {stations.map((s, i) => {
            const Icon = SUBJECT_ICON[s.subject] ?? STATION_ICON[s.kind];
            const active = s.status === 'active';
            const done = s.status === 'done';
            const href = s.subject === 'leadership'
              ? `/exercise?focus=leadership&topic=${s.topicId ?? ''}`  // play the daily world inline
              : `/exercise?focus=${s.subject}`;
            return (
              <Link key={`${s.subject}-${i}`} href={href} className={`mission${active ? ' active' : ''}${done ? ' done' : ''}`}>
                <span className={`mission-ico ico-${s.kind}`}><Icon /></span>
                <span className="mission-txt">
                  <span className="mission-title">{s.subtitle}</span>
                </span>
                {done
                  ? <span className="mission-done"><CheckIcon /></span>
                  : active
                    ? <span className="mission-cta pulse">קדימה ›</span>
                    : <span className="mission-chevron"><ChevronIcon /></span>}
              </Link>
            );
          })}
        </div>

        <HomeTasks />

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
      </div>

      <BottomNav active="/" />
    </main>
  );
}
