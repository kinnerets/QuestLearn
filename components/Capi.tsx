export type CapiMood = 'chill' | 'hint' | 'cheer';

/**
 * קפי — the Chill & Smart capybara guide, redrawn in a soft claymation / Pixar
 * key: rounded huggable proportions, warm radial shading, big kind eyes with a
 * catch-light, a gentle smile and a little flower for charm. Three moods.
 */
export function Capi({ mood = 'chill', size = 74, still = false }: { mood?: CapiMood; size?: number; still?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="קפי"
      className={still ? `capi-still capi-${mood}` : `capi capi-${mood}`}>
      <defs>
        <radialGradient id="capiBody" cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#D8B489" />
          <stop offset="58%" stopColor="#C39B6E" />
          <stop offset="100%" stopColor="#A97E52" />
        </radialGradient>
        <radialGradient id="capiMuzzle" cx="50%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#FBF3DF" />
          <stop offset="100%" stopColor="#EBD9B4" />
        </radialGradient>
        <radialGradient id="capiHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE7F1" />
          <stop offset="100%" stopColor="#FFE7F1" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft warm halo + ground shadow for depth */}
      <circle cx="60" cy="58" r="52" fill="url(#capiHalo)" />
      <ellipse cx="60" cy="108" rx="30" ry="6" fill="#000" opacity="0.08" />

      {/* ears (behind head) with inner shading */}
      <circle cx="28" cy="36" r="10" fill="url(#capiBody)" />
      <circle cx="92" cy="36" r="10" fill="url(#capiBody)" />
      <circle cx="28" cy="37" r="4.5" fill="#8A6238" opacity="0.55" />
      <circle cx="92" cy="37" r="4.5" fill="#8A6238" opacity="0.55" />

      {/* head — rounded, soft-shaded */}
      <ellipse cx="60" cy="56" rx="37" ry="34" fill="url(#capiBody)" />
      {/* gentle ambient occlusion under the chin */}
      <ellipse cx="60" cy="74" rx="26" ry="12" fill="#8A6238" opacity="0.16" />
      {/* top-left specular highlight (claymation sheen) */}
      <ellipse cx="44" cy="36" rx="14" ry="9" fill="#FFF6E8" opacity="0.5" transform="rotate(-22 44 36)" />

      {/* little flower for charm */}
      <g transform="translate(84 24)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-5.5" rx="3.4" ry="5" fill="#FF6FB5" transform={`rotate(${a})`} />
        ))}
        <circle r="3" fill="#FFD23F" />
      </g>

      {/* thought bubble on hint mood */}
      {mood === 'hint' && (
        <g>
          <rect x="36" y="20" width="48" height="10" rx="5" fill="#38BDF8" opacity="0.9" />
          <rect x="38" y="22" width="20" height="6" rx="3" fill="#8FDcff" />
        </g>
      )}

      {/* muzzle */}
      <ellipse cx="60" cy="66" rx="22" ry="16" fill="url(#capiMuzzle)" />

      {/* brows / eyes by mood — big, kind, with catch-lights */}
      {mood === 'cheer' ? (
        <>
          <path d="M40 48 q7 -8 14 0" fill="none" stroke="#2A1D1A" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M66 48 q7 -8 14 0" fill="none" stroke="#2A1D1A" strokeWidth="3.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="46" cy="50" r="6.5" fill="#2A1D1A" />
          <circle cx="74" cy="50" r="6.5" fill="#2A1D1A" />
          <circle cx="48" cy="47.5" r="2.1" fill="#fff" />
          <circle cx="76" cy="47.5" r="2.1" fill="#fff" />
          <circle cx="44.5" cy="52" r="1" fill="#fff" opacity="0.7" />
          <circle cx="72.5" cy="52" r="1" fill="#fff" opacity="0.7" />
        </>
      )}

      {/* soft cheeks */}
      <ellipse cx="38" cy="62" rx="6" ry="4" fill="#FF7FA8" opacity="0.35" />
      <ellipse cx="82" cy="62" rx="6" ry="4" fill="#FF7FA8" opacity="0.35" />

      {/* nose + gentle smile */}
      <ellipse cx="60" cy="60" rx="8.5" ry="5.5" fill="#5A3D2E" />
      <ellipse cx="57" cy="58.5" rx="2.2" ry="1.4" fill="#7a5540" />
      {mood === 'cheer' ? (
        <path d="M50 66 q10 10 20 0" fill="none" stroke="#2A1D1A" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d="M53 66 q7 6 14 0" fill="none" stroke="#2A1D1A" strokeWidth="2.8" strokeLinecap="round" />
      )}

      {/* rounded little paws */}
      <ellipse cx="26" cy="60" rx="7.5" ry="10" fill="url(#capiBody)" />
      <ellipse cx="94" cy="60" rx="7.5" ry="10" fill="url(#capiBody)" />
    </svg>
  );
}
