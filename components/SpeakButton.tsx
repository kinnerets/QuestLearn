'use client';

import { useEffect, useRef, useState } from 'react';
import { SpeakerIcon } from './icons';

/**
 * Reads a question aloud in Hebrew via the browser's speech synthesis - a big
 * help for a younger reader (Mili, grade 3). Hidden when the browser has no
 * speech support. Stops itself when the text changes or the view unmounts.
 */
export function SpeakButton({ text, className = '' }: { text: string; className?: string }) {
  const [ok, setOk] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const textRef = useRef(text);
  textRef.current = text;

  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    setOk(supported);
    if (supported) {
      // Prime the voice list (some browsers load it lazily).
      try { window.speechSynthesis.getVoices(); } catch { /* ignore */ }
    }
  }, []);

  // Any change of question, or leaving the screen, halts an in-progress reading.
  useEffect(() => {
    setSpeaking(false);
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    return () => { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } };
  }, [text]);

  if (!ok) return null;

  function hebrewVoice() {
    try {
      const voices = window.speechSynthesis.getVoices();
      let chosen = '';
      try { chosen = localStorage.getItem('ql_voice') || ''; } catch { /* ignore */ }
      // Prefer the parent's chosen voice, if it's still available.
      if (chosen) {
        const match = voices.find((v) => v.voiceURI === chosen);
        if (match) return match;
      }
      return voices.find((v) => (v.lang || '').toLowerCase().startsWith('he'));
    } catch { return undefined; }
  }

  function toggle() {
    try {
      const synth = window.speechSynthesis;
      if (speaking) { synth.cancel(); setSpeaking(false); return; }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(textRef.current);
      u.lang = 'he-IL';
      const v = hebrewVoice();
      if (v) u.voice = v;
      u.rate = 0.95;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      synth.speak(u);
    } catch { setSpeaking(false); }
  }

  return (
    <button type="button" className={`speak-btn${speaking ? ' on' : ''}${className ? ' ' + className : ''}`}
      onClick={toggle} aria-label={speaking ? 'עצירת הקראה' : 'הקראת השאלה'} aria-pressed={speaking}>
      <SpeakerIcon />
    </button>
  );
}
