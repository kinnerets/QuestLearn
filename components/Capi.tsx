export type CapiMood = 'chill' | 'hint' | 'cheer';

/** קפי — the Chill & Smart capybara guide. Three expression moods. */
export function Capi({ mood = 'chill', size = 74 }: { mood?: CapiMood; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 114 114" role="img" aria-label="קפי">
      <path d="M22 52 a35 35 0 0 1 70 0" fill="none" stroke="#F2F5FA" strokeWidth="7" />
      <path d="M18 104 q0 -30 39 -30 q39 0 39 30 z" fill="#FF2A85" />
      <path d="M18 104 q0 -30 39 -30 l0 30 z" fill="#E01f72" />
      <ellipse cx="57" cy="52" rx="34" ry="31" fill="#C49A6C" />
      <ellipse cx="57" cy="52" rx="34" ry="31" fill="none" stroke="#A67C52" strokeWidth="2" />
      <circle cx="27" cy="34" r="8" fill="#C49A6C" stroke="#A67C52" strokeWidth="2" />
      <circle cx="87" cy="34" r="8" fill="#C49A6C" stroke="#A67C52" strokeWidth="2" />
      {mood === 'hint' && (
        <g>
          <rect x="34" y="24" width="46" height="9" rx="4" fill="#38BDF8" opacity="0.85" />
          <rect x="34" y="26" width="20" height="7" rx="3" fill="#7ad4ff" />
        </g>
      )}
      <ellipse cx="57" cy="63" rx="20" ry="15" fill="#FDF6E3" />
      {mood === 'cheer' ? (
        <>
          <path d="M40 46 q6 -7 12 0" fill="none" stroke="#2A1D1A" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M62 46 q6 -7 12 0" fill="none" stroke="#2A1D1A" strokeWidth="3.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M40 47 q6 4 12 0" fill="none" stroke="#2A1D1A" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M62 47 q6 4 12 0" fill="none" stroke="#2A1D1A" strokeWidth="3.4" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="57" cy="55" rx="8" ry="5" fill="#5A3D2E" />
      {mood === 'cheer' ? (
        <path d="M50 60 q7 9 14 0" fill="none" stroke="#2A1D1A" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d="M52 60 q5 4 10 0" fill="none" stroke="#2A1D1A" strokeWidth="2.8" strokeLinecap="round" />
      )}
      <rect x="16" y="46" width="13" height="18" rx="6" fill="#FF2A85" stroke="#fff" strokeWidth="2" />
      <rect x="85" y="46" width="13" height="18" rx="6" fill="#FF2A85" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}
