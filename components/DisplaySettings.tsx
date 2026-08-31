'use client';

import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';
type Scale = '100%' | '112%' | '125%';

const THEMES: { id: Theme; label: string }[] = [
  { id: 'light', label: 'בהיר' },
  { id: 'dark', label: 'כהה' },
  { id: 'system', label: 'לפי המכשיר' },
];
const SCALES: { id: Scale; label: string }[] = [
  { id: '100%', label: 'רגיל' },
  { id: '112%', label: 'גדול' },
  { id: '125%', label: 'גדול מאוד' },
];

function applyTheme(t: Theme) {
  const el = document.documentElement;
  if (t === 'system') el.removeAttribute('data-theme');
  else el.setAttribute('data-theme', t);
}
function applyScale(s: Scale) {
  document.documentElement.style.fontSize = s === '100%' ? '' : s;
}

export function DisplaySettings() {
  const [theme, setTheme] = useState<Theme>('system');
  const [scale, setScale] = useState<Scale>('100%');

  // Load saved choices once, on the client.
  useEffect(() => {
    try {
      const t = localStorage.getItem('ql_theme') as Theme | null;
      if (t === 'light' || t === 'dark' || t === 'system') setTheme(t);
      const s = localStorage.getItem('ql_textscale') as Scale | null;
      if (s === '100%' || s === '112%' || s === '125%') setScale(s);
    } catch { /* storage may be blocked */ }
  }, []);

  function chooseTheme(t: Theme) {
    setTheme(t);
    applyTheme(t);
    try { localStorage.setItem('ql_theme', t); } catch { /* ignore */ }
  }
  function chooseScale(s: Scale) {
    setScale(s);
    applyScale(s);
    try { localStorage.setItem('ql_textscale', s); } catch { /* ignore */ }
  }

  return (
    <section className="status-card">
      <div className="status-title">תצוגה</div>

      <div className="setting-row">
        <div className="setting-label">ערכת צבעים</div>
        <div className="seg">
          {THEMES.map((o) => (
            <button key={o.id} className={`seg-btn${theme === o.id ? ' on' : ''}`}
              onClick={() => chooseTheme(o.id)} aria-pressed={theme === o.id}>{o.label}</button>
          ))}
        </div>
      </div>

      <div className="setting-row">
        <div className="setting-label">גודל טקסט</div>
        <div className="seg">
          {SCALES.map((o) => (
            <button key={o.id} className={`seg-btn${scale === o.id ? ' on' : ''}`}
              onClick={() => chooseScale(o.id)} aria-pressed={scale === o.id}>{o.label}</button>
          ))}
        </div>
      </div>

      <p className="setting-hint">ההגדרות נשמרות במכשיר הזה ותקפות לכל האפליקציה.</p>
    </section>
  );
}
