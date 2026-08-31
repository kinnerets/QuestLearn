'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoinIcon } from '@/components/icons';

/** Claim button for the weekly sisters-challenge reward (shown only when done). */
export function TeamReward({ claimed, reward }: { claimed: boolean; reward: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(claimed);

  if (done) {
    return (
      <div className="team-reward-got">
        <CoinIcon /> הפרס נאסף - {reward} מטבעות לכל אחת
      </div>
    );
  }

  async function claim() {
    setBusy(true);
    const r = await fetch('/api/team/claim', { method: 'POST' }).then((x) => x.json()).catch(() => null);
    if (r?.ok || r?.reason === 'claimed') { setDone(true); router.refresh(); }
    setBusy(false);
  }

  return (
    <button className="team-reward-btn" onClick={claim} disabled={busy}>
      <CoinIcon /> אספו את הפרס - {reward} מטבעות לכל אחת
    </button>
  );
}
