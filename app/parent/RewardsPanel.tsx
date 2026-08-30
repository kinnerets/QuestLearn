'use client';

import { useEffect, useState } from 'react';
import { CoinIcon, CloseIcon, CheckIcon } from '@/components/icons';
import { Section } from './Section';

interface Reward { id: string; title: string; cost: number }

export function RewardsPanel() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(30);
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editCost, setEditCost] = useState(0);

  async function load() {
    try {
      const r = await fetch('/api/parent/rewards');
      const j = await r.json();
      if (Array.isArray(j?.rewards)) setRewards(j.rewards);
    } catch { /* ignore */ }
  }
  useEffect(() => { load(); }, []);

  async function post(body: object) {
    await fetch('/api/parent/rewards', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    }).catch(() => {});
  }

  async function add() {
    const t = title.trim();
    if (!t || busy) return;
    setBusy(true);
    await post({ action: 'add', title: t, cost });
    setTitle('');
    await load();
    setBusy(false);
  }

  async function remove(id: string) {
    setRewards((xs) => xs.filter((x) => x.id !== id));
    await post({ action: 'remove', id });
  }

  async function saveCost(id: string) {
    setRewards((xs) => xs.map((x) => (x.id === id ? { ...x, cost: editCost } : x)));
    setEditId(null);
    await post({ action: 'update', id, cost: editCost });
  }

  return (
    <Section title="ניהול פרסים" count={rewards.length}
      hint="הפרסים שהבנות יכולות לממש במטבעות. אפשר להוסיף, לשנות מחיר או להסיר.">
      <div className="task-add">
        <input className="task-input" value={title} placeholder="פרס חדש (למשל: ערב סרט)"
          onChange={(e) => setTitle(e.target.value)} maxLength={60} />
        <div className="task-add-row">
          <label className="task-coins-pick">
            <CoinIcon />
            <input type="number" min={1} max={500} value={cost}
              onChange={(e) => setCost(Math.min(500, Math.max(1, Number(e.target.value) || 1)))} />
          </label>
          <button className="content-btn" disabled={busy || !title.trim()} onClick={add}>הוספה</button>
        </div>
      </div>

      <div className="task-manage-list">
        {rewards.map((r) => (
          <div key={r.id} className="task-manage-row">
            <span className="task-title">{r.title}</span>
            {editId === r.id ? (
              <>
                <label className="task-coins-pick sm">
                  <CoinIcon />
                  <input type="number" min={1} max={500} value={editCost} autoFocus
                    onChange={(e) => setEditCost(Math.min(500, Math.max(1, Number(e.target.value) || 1)))} />
                </label>
                <button className="task-del ok" aria-label="שמירה" onClick={() => saveCost(r.id)}><CheckIcon /></button>
              </>
            ) : (
              <button className="task-coins as-btn" onClick={() => { setEditId(r.id); setEditCost(r.cost); }}>
                <CoinIcon /> {r.cost}
              </button>
            )}
            <button className="task-del" aria-label="הסרה" onClick={() => remove(r.id)}><CloseIcon /></button>
          </div>
        ))}
        {rewards.length === 0 && <div className="report-empty">אין עדיין פרסים — הוסיפי אחד למעלה.</div>}
      </div>
    </Section>
  );
}
