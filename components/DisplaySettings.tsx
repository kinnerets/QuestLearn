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

interface Voice { uri: string; label: string }

export function DisplaySettings() {
  const [theme, setTheme] = useState<Theme>('system');
  const [scale, setScale] = useState<Scale>('100%');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voice, setVoice] = useState('');

  // Load saved choices once, on the client.
  useEffect(() => {
    try {
      const t = localStorage.getItem('ql_theme') as Theme | null;
      if (t === 'light' || t === 'dark' || t === 'system') setTheme(t);
      const s = localStorage.getItem('ql_textscale') as Scale | null;
      if (s === '100%' || s === '112%' || s === '125%') setScale(s);
      setVoice(localStorage.getItem('ql_voice') || '');
    } catch { /* storage may be blocked */ }
  }, []);

  // Load Hebrew voices (the list can arrive asynchronously).
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const read = () => {
      try {
        const he = window.speechSynthesis.getVoices()
          .filter((v) => (v.lang || '').toLowerCase().startsWith('he'))
          .map((v) => ({ uri: v.voiceURI, label: v.name || v.voiceURI }));
        setVoices(he);
      } catch { /* ignore */ }
    };
    read();
    window.speechSynthesis.onvoiceschanged = read;
    return () => { try { window.speechSynthesis.onvoiceschanged = null; } catch { /* ignore */ } };
  }, []);

  function chooseVoice(uri: string) {
    setVoice(uri);
    try { uri ? localStorage.setItem('ql_voice', uri) : localStorage.removeItem('ql_voice'); } catch { /* ignore */ }
    // Small preview so the choice is audible.
    try {
      const synth = window.speechSynthesis; synth.cancel();
      const u = new SpeechSynthesisUtterance('שלום, זה הקול שלי');
      u.lang = 'he-IL';
      const v = synth.getVoices().find((x) => x.voiceURI === uri);
      if (v) u.voice = v;
      synth.speak(u);
    } catch { /* ignore */ }
  }

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

      {voices.length > 0 && (
        <div className="setting-row">
          <div className="setting-label">קול ההקראה</div>
          <select className="voice-select" value={voice} onChange={(e) => chooseVoice(e.target.value)}>
            <option value="">ברירת מחדל של המכשיר</option>
            {voices.map((v) => <option key={v.uri} value={v.uri}>{v.label}</option>)}
          </select>
        </div>
      )}

      <p className="setting-hint">ההגדרות נשמרות במכשיר הזה ותקפות לכל האפליקציה.{voices.length === 0 ? ' (אפשר להוסיף קולות עבריים בהגדרות המכשיר.)' : ''}</p>
    </section>
  );
}
