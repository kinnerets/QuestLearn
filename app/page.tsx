import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import { Capi } from '@/components/Capi';
import { BottomNav } from '@/components/BottomNav';
import { CoinIcon, FlameIcon, ChevronIcon, STATION_ICON } from '@/components/icons';
import { mili, todayStations, completedToday } from '@/lib/mockData';

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

export default function HomePage() {
  const totalMinutes = todayStations.reduce((s, st) => s + st.minutes, 0);
  const firstActive = todayStations.find((s) => s.status === 'active') ?? todayStations[0];

  return (
    <main className="app-shell">
      <div className="screen-body">
        <section className="hero">
          <div className="hero-row">
            <div className="hero-avatar">
              <Avatar config={mili.avatar_config} crop size={52} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="hero-title">בוקר טוב, {mili.display_name}</div>
              <div className="hero-sub">{todayStations.length} תחנות היום · בערך {totalMinutes} דקות</div>
            </div>
            <GoalRing done={completedToday} total={todayStations.length} />
          </div>
        </section>

        <div className="stat-row">
          <div className="stat-card coins">
            <CoinIcon />
            <div><div className="val">{mili.quest_coins}</div><div className="lbl">מטבעות</div></div>
          </div>
          <div className="stat-card streak">
            <FlameIcon />
            <div><div className="val">{mili.current_streak}</div><div className="lbl">ימי רצף</div></div>
          </div>
        </div>

        <div className="mission-list">
          {todayStations.map((s) => {
            const Icon = STATION_ICON[s.kind];
            const active = s.status === 'active';
            return (
              <Link key={s.kind} href="/exercise" className={`mission${active ? ' active' : ''}`}>
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
          <div className="bubble">אהלן {mili.display_name}. נתחיל ב<b>{firstActive.title.split(' — ')[0]}</b>?</div>
        </div>
      </div>

      <BottomNav active="/" />
    </main>
  );
}
