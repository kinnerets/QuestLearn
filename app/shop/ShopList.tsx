'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CoinIcon, GiftIcon, CheckIcon } from '@/components/icons';
import type { Reward, AvatarItem } from '@/lib/db';

const CATEGORY_LABEL: Record<string, string> = {
  screen_time: 'זמן מסך',
  experience: 'חוויה',
  privilege: 'פריבילגיה',
  physical_item: 'פריט',
  family_activity: 'פעילות משפחתית',
};

export function ShopList({ rewards, coins: initialCoins, avatarItems = [] }: {
  rewards: Reward[]; coins: number; avatarItems?: AvatarItem[];
}) {
  const router = useRouter();
  const [coins, setCoins] = useState(initialCoins);
  const [busy, setBusy] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState(avatarItems);

  async function buy(it: AvatarItem) {
    if (it.owned || coins < it.cost || busy) return;
    setBusy(it.id); setError(null);
    try {
      const res = await fetch('/api/avatar/buy', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ itemId: it.id }),
      });
      const j = await res.json();
      if (j?.ok) {
        if (typeof j.coins === 'number') setCoins(j.coins);
        setItems((arr) => arr.map((x) => (x.id === it.id ? { ...x, owned: true } : x)));
        router.refresh();
      } else if (j?.reason === 'not-enough') {
        setError('אין מספיק מטבעות');
      } else if (j?.reason === 'owned') {
        setItems((arr) => arr.map((x) => (x.id === it.id ? { ...x, owned: true } : x)));
      } else {
        setError('לא הצלחנו לקנות, ננסה שוב');
      }
    } catch { setError('לא הצלחנו לקנות, ננסה שוב'); }
    setBusy(null);
  }

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
        setSent(r.title);
        router.refresh();
      } else if (j?.reason === 'not-enough') {
        setError('אין מספיק מטבעות');
      } else {
        setError('לא הצלחנו לממש, ננסה שוב');
      }
    } catch { setError('לא הצלחנו לממש, ננסה שוב'); }
    setBusy(null);
  }

  if (sent) {
    return (
      <div className="screen-body shop">
        <div className="voucher">
          <div className="voucher-badge"><GiftIcon /></div>
          <h2>הבקשה נשלחה! ✨</h2>
          <p>{sent}</p>
          <p className="voucher-note">ההורה יראה את הבקשה באזור הורים ויאשר אותה 💛</p>
          <button className="cta" onClick={() => setSent(null)}>חזרה לחנות</button>
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

      {items.length > 0 && (
        <>
          <div className="shop-head" style={{ marginTop: 22 }}>
            <h2 style={{ fontSize: '1.15rem' }}>פריטי אווטאר</h2>
            <Link href="/avatar" className="shop-editlink">האולפן שלי ›</Link>
          </div>
          <div className="av-shop-grid">
            {items.map((it) => {
              const affordable = coins >= it.cost;
              return (
                <div key={it.id} className={`av-item${it.owned ? ' owned' : affordable ? '' : ' locked'}`}>
                  <span className="av-item-emoji">{it.emoji}</span>
                  <span className="av-item-name">{it.label}</span>
                  {it.owned ? (
                    <span className="av-item-owned"><CheckIcon /> ברשותך</span>
                  ) : (
                    <button className="av-item-btn" disabled={!affordable || busy === it.id}
                      onClick={() => buy(it)}>
                      {busy === it.id ? '…' : <><CoinIcon /> {it.cost}</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="content-hint" style={{ textAlign: 'center' }}>
            פריטים שקנית מחכים לך ב“האולפן שלי” כדי להלביש את האווטאר
          </p>
        </>
      )}
    </div>
  );
}
