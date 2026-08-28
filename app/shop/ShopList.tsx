'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoinIcon, GiftIcon, CheckIcon } from '@/components/icons';
import type { Reward } from '@/lib/db';

const CATEGORY_LABEL: Record<string, string> = {
  screen_time: 'זמן מסך',
  experience: 'חוויה',
  privilege: 'פריבילגיה',
  physical_item: 'פריט',
  family_activity: 'פעילות משפחתית',
};

export function ShopList({ rewards, coins: initialCoins }: { rewards: Reward[]; coins: number }) {
  const router = useRouter();
  const [coins, setCoins] = useState(initialCoins);
  const [busy, setBusy] = useState<string | null>(null);
  const [voucher, setVoucher] = useState<{ title: string; code: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function redeem(r: Reward) {
    if (coins < r.cost || busy) return;
    setBusy(r.id); setError(null);
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rewardId: r.id }),
      });
      const j = await res.json();
      if (j?.ok) {
        if (typeof j.coins === 'number') setCoins(j.coins);
        setVoucher({ title: r.title, code: j.voucher });
        router.refresh();
      } else if (j?.reason === 'not-enough') {
        setError('אין מספיק מטבעות');
      } else if (j?.reason === 'already-today') {
        setError('כבר מימשת את הפרס הזה היום — אפשר שוב מחר');
      } else {
        setError('לא הצלחנו לממש, נסי שוב');
      }
    } catch { setError('לא הצלחנו לממש, נסי שוב'); }
    setBusy(null);
  }

  if (voucher) {
    return (
      <div className="screen-body shop">
        <div className="voucher">
          <div className="voucher-badge"><GiftIcon /></div>
          <h2>הפרס שלך מוכן!</h2>
          <p>{voucher.title}</p>
          <div className="voucher-code">{voucher.code}</div>
          <p className="voucher-note">הראי את הקוד להורה כדי לממש</p>
          <button className="cta" onClick={() => setVoucher(null)}>חזרה לחנות</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-body shop">
      <div className="shop-head">
        <h1>חנות הפרסים</h1>
        <div className="shop-coins"><CoinIcon /><span>{coins}</span></div>
      </div>

      <div className="reward-list">
        {rewards.map((r) => {
          const affordable = coins >= r.cost;
          return (
            <div key={r.id} className={`reward${affordable ? '' : ' locked'}`}>
              <span className="reward-ico"><GiftIcon /></span>
              <span className="reward-txt">
                <span className="reward-title">{r.title}</span>
                <span className="reward-cat">{CATEGORY_LABEL[r.category] ?? r.category}</span>
              </span>
              <span className="reward-cost"><CoinIcon /> {r.cost}</span>
              <button className="reward-btn" disabled={!affordable || busy === r.id}
                onClick={() => redeem(r)}>
                {busy === r.id ? '…' : affordable ? 'מימוש' : 'חסר'}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="shop-err">{error}</p>}

      <div className="shop-soon">
        <span className="reward-ico soon"><CheckIcon /></span>
        פריטי אווטאר לחנות — בקרוב
      </div>
    </div>
  );
}
