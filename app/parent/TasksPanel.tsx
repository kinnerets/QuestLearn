'use client';

import { useEffect, useState } from 'react';
import { CoinIcon, CloseIcon } from '@/components/icons';
import { Section } from './Section';

interface Task { id: string; title: string; coins: number }

export function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [coins, setCoins] = useState(8);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const r = await fetch('/api/parent/tasks');
      const j = await r.json();
      if (Array.isArray(j?.tasks)) setTasks(j.tasks);
    } catch { /* ignore */ }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    const t = title.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      await fetch('/api/parent/tasks', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'add', title: t, coins }),
      });
      setTitle('');
      await load();
    } catch { /* ignore */ }
    setBusy(false);
  }

  async function remove(id: string) {
    setTasks((ts) => ts.filter((x) => x.id !== id));
    try {
      await fetch('/api/parent/tasks', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'remove', id }),
      });
    } catch { /* ignore */ }
  }

  return (
    <Section title="ניהול מטלות בית" count={tasks.length}
      hint="מטלות שהבנות יכולות לסמן כבוצעו פעם ביום. אחרי אישור שלך — נזקפות מטבעות.">
      <div className="task-add">
        <input className="task-input" value={title} placeholder="מטלה חדשה (למשל: להוציא את הכלב)"
          onChange={(e) => setTitle(e.target.value)} maxLength={80} />
        <div className="task-add-row">
          <label className="task-coins-pick">
            <CoinIcon />
            <input type="number" min={1} max={50} value={coins}
              onChange={(e) => setCoins(Math.min(50, Math.max(1, Number(e.target.value) || 1)))} />
          </label>
          <button className="content-btn" disabled={busy || !title.trim()} onClick={add}>הוספה</button>
        </div>
      </div>

      <div className="task-manage-list">
        {tasks.map((t) => (
          <div key={t.id} className="task-manage-row">
            <span className="task-title">{t.title}</span>
            <span className="task-coins"><CoinIcon /> {t.coins}</span>
            <button className="task-del" aria-label="מחיקה" onClick={() => remove(t.id)}><CloseIcon /></button>
          </div>
        ))}
        {tasks.length === 0 && <div className="report-empty">אין עדיין מטלות — הוסיפי אחת למעלה.</div>}
      </div>
    </Section>
  );
}
