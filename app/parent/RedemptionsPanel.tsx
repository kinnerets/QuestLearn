'use client';

import { useEffect, useState } from 'react';
import { CoinIcon, CheckIcon, CloseIcon } from '@/components/icons';
import type { Redemption } from '@/lib/db';

export function RedemptionsPanel() {
  const [items, setItems] = useState<Redemption[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    try {
      const r = await fetch('/api/parent/redemptions');
      const j = await r.json();
      if (Array.isArray(j?.pending)) setItems(j.pending);
    } catch { /* ignore */ }
    setLoaded(true);
  }
  useEffect(() => { load(); }, []);

  async function resolve(id: string, action: 'fulfill' | 'refund') {
    setBusy(id);
    setItems((xs) => xs.filter((x) => x.id !== id));
    try {
      await fetch('/api/parent/redemptions', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
    } catch { /* ignore */ }
    setBusy(null);
  }

  if (!loaded || items.length === 0) return null;

  return (
    <section className="content-panel">
      <div className="parent-head" style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: '1.15rem' }}>בקשות פרס <span className="flag-count">{items.length}</span></h2>
      </div>
      <p className="content-hint">הבנות מימשו מטבעות על פרסים. "בוצע" מסמן שנתת את הפרס; "ביטול" מחזיר להן את המטבעות.</p>

      {items.map((r) => (
        <div key={r.id} className="redeem-card">
          <span className="redeem-main">
            <span className="redeem-title">{r.rewardTitle}</span>
            <span className="redeem-sub">{r.childName} · <CoinIcon /> {r.cost}</span>
          </span>
          <span className="redeem-actions">
            <button className="flag-btn approve" disabled={busy === r.id} onClick={() => resolve(r.id, 'fulfill')}>
              <CheckIcon /> בוצע
            </button>
            <button className="flag-btn reject" disabled={busy === r.id} onClick={() => resolve(r.id, 'refund')}>
              <CloseIcon /> ביטול
            </button>
          </span>
        </div>
      ))}
    </section>
  );
}
