'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { CloseIcon, CheckIcon } from '@/components/icons';
import { miliAvatar } from '@/lib/mockData';
import type { AvatarConfig } from '@/lib/types';

const SKIN = ['#FCE0C8', '#F1C9A5', '#E8B98F', '#C68642', '#8D5524'];
const HAIR = ['#1F1B18', '#3B2A1E', '#7A4B2B', '#B5651D', '#E4A11B', '#C0C0C0'];
const TOP = ['#FF2A85', '#38BDF8', '#2FBF8F', '#FACC15', '#8B5CF6', '#F97316'];

const HAIRSTYLES = [
  { id: 'long', label: 'ארוך' },
  { id: 'short', label: 'קצר' },
];
const ACCESSORIES: { id: string | null; label: string }[] = [
  { id: null, label: 'ללא' },
  { id: 'bow', label: 'סרט' },
  { id: 'glasses', label: 'משקפיים' },
];
const BASES = [
  { id: 'girl', label: 'ילדה' },
  { id: 'boy', label: 'ילד' },
];

type Status = 'idle' | 'saving' | 'saved' | 'error';

export default function AvatarPage() {
  const router = useRouter();
  const [cfg, setCfg] = useState<AvatarConfig>(miliAvatar);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    let alive = true;
    fetch('/api/profile')
      .then((r) => r.json())
      .then((j) => { if (alive && j?.child?.avatar) setCfg(j.child.avatar as AvatarConfig); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const set = (patch: Partial<AvatarConfig>) => { setCfg((c) => ({ ...c, ...patch })); setStatus('idle'); };

  async function save() {
    setStatus('saving');
    try {
      const r = await fetch('/api/avatar', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ config: cfg }),
      });
      const j = await r.json();
      if (j?.ok) { setStatus('saved'); router.refresh(); setTimeout(() => router.push('/'), 650); }
      else setStatus('error');
    } catch { setStatus('error'); }
  }

  return (
    <main className="app-shell">
      <div className="ex-bar">
        <Link href="/" className="ex-back" aria-label="חזרה"><CloseIcon /></Link>
        <div className="ex-head-title">האולפן שלי</div>
        <div style={{ width: 34 }} />
      </div>

      <div className="screen-body av-edit">
        <div className="av-stage"><Avatar config={cfg} size={168} /></div>

        <Swatches label="גוון עור" values={SKIN} current={cfg.skin_tone}
          onPick={(v) => set({ skin_tone: v })} />
        <Swatches label="צבע שיער" values={HAIR} current={cfg.hair_color}
          onPick={(v) => set({ hair_color: v })} />
        <Swatches label="צבע חולצה" values={TOP} current={cfg.top_color}
          onPick={(v) => set({ top_color: v })} />

        <Chips label="תסרוקת" options={HAIRSTYLES} current={cfg.hairstyle_id}
          onPick={(id) => set({ hairstyle_id: id })} />
        <Chips label="אקססורי" options={ACCESSORIES} current={cfg.accessory_id}
          onPick={(id) => set({ accessory_id: id })} />
        <Chips label="דמות" options={BASES} current={cfg.base}
          onPick={(id) => set({ base: id as AvatarConfig['base'] })} />

        <div className="foot">
          <button className="cta" onClick={save} disabled={status === 'saving'}>
            {status === 'saving' ? 'שומר…' : status === 'saved' ? 'נשמר ✓' : 'שמירה'}
          </button>
          {status === 'error' && <p className="av-err">לא הצלחנו לשמור. נסי שוב.</p>}
        </div>
      </div>
    </main>
  );
}

function Swatches({ label, values, current, onPick }: {
  label: string; values: string[]; current: string; onPick: (v: string) => void;
}) {
  return (
    <div className="av-group">
      <div className="av-label">{label}</div>
      <div className="av-row">
        {values.map((v) => (
          <button key={v} className={`swatch${current === v ? ' on' : ''}`}
            style={{ background: v }} onClick={() => onPick(v)} aria-label={v}>
            {current === v && <CheckIcon />}
          </button>
        ))}
      </div>
    </div>
  );
}

function Chips<T extends string | null>({ label, options, current, onPick }: {
  label: string; options: { id: T; label: string }[]; current: T; onPick: (id: T) => void;
}) {
  return (
    <div className="av-group">
      <div className="av-label">{label}</div>
      <div className="av-row">
        {options.map((o) => (
          <button key={o.id ?? 'none'} className={`chip${current === o.id ? ' on' : ''}`}
            onClick={() => onPick(o.id)}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}
