'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoinIcon, CheckIcon } from '@/components/icons';
import type { HomeTask } from '@/lib/db';

export function HomeTasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState<HomeTask[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pop, setPop] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tasks').then((r) => r.json())
      .then((j) => setTasks(Array.isArray(j?.tasks) ? j.tasks : []))
      .catch(() => setTasks([]));
  }, []);

  async function done(t: HomeTask) {
    if (t.doneToday || busy) return;
    setBusy(t.id);
    try {
      const r = await fetch('/api/tasks/done', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ taskId: t.id }),
      });
      const j = await r.json();
      if (j?.ok) {
        setTasks((ts) => (ts ?? []).map((x) => (x.id === t.id ? { ...x, doneToday: true } : x)));
        setPop(t.id);
        setTimeout(() => setPop(null), 900);
        router.refresh();
      }
    } catch { /* ignore */ }
    setBusy(null);
  }

  if (!tasks || tasks.length === 0) return null;

  return (
    <section className="tasks-home">
      <div className="tasks-home-head">מטלות בית</div>
      <div className="tasks-home-list">
        {tasks.map((t) => (
          <button key={t.id} className={`task-row${t.doneToday ? ' done' : ''}`}
            onClick={() => done(t)} disabled={t.doneToday || busy === t.id}>
            <span className={`task-check${t.doneToday ? ' on' : ''}`}>{t.doneToday && <CheckIcon />}</span>
            <span className="task-title">{t.title}</span>
            <span className={`task-coins${pop === t.id ? ' pop' : ''}`}><CoinIcon /> {t.coins}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
