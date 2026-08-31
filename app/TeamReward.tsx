'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoinIcon } from '@/components/icons';

/** Claim button for the weekly sisters-challenge reward (shown only when done). */
export function TeamReward({ claimed, reward }: { claimed: boolean; reward: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(claimed);
  const [err, setErr] = useState(false);

  if (done) {
    return (
      <div className="team-reward-got">
        <CoinIcon /> הפרס נאסף - {reward} מטבעות לכל אחת
      </div>
    );
  }

  async function claim() {
    setBusy(true);
    setErr(false);
    const r = await fetch('/api/team/claim', { method: 'POST' }).then((x) => x.json()).catch(() => null);
    // Only mark collected on a real grant, or when it was already claimed this
    // week (coins already given). A real error must NOT look like success.
    if (r?.ok || r?.reason === 'already') { setDone(true); router.refresh(); }
    else { setErr(true); }
    setBusy(false);
  }

  return (
    <>
      <button className="team-reward-btn" onClick={claim} disabled={busy}>
        <CoinIcon /> {busy ? 'אוספים…' : `אספו את הפרס - ${reward} מטבעות לכל אחת`}
      </button>
      {err && <div className="team-reward-err">לא הצלחנו לגבות את הפרס כרגע. נסו שוב עוד רגע.</div>}
    </>
  );
}
