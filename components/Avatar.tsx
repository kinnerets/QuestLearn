import type { AvatarConfig } from '@/lib/types';

/**
 * Modular layered avatar (v5.2). Composes SVG layers from an AvatarConfig:
 * base (girl/boy), skin tone, hairstyle + hair color, top, and accessory.
 * `crop` shows a head+shoulders square for small header slots.
 */
export function Avatar({
  config,
  size = 120,
  crop = false,
}: {
  config: AvatarConfig;
  size?: number;
  crop?: boolean;
}) {
  const { base, skin_tone: skin, hair_color: hair, top_color: top, accessory_id, hairstyle_id } = config;
  const isGirl = base === 'girl';
  const longHair = hairstyle_id !== 'short';
  const viewBox = crop ? '46 32 108 108' : '0 0 200 168';

  return (
    <svg width={size} height={size} viewBox={viewBox} role="img" aria-label="אווטאר">
      {/* shoulders / top */}
      <path d="M34 200 C34 156 62 138 100 138 C138 138 166 156 166 200 Z" fill={top} />
      <path d="M84 140 L100 156 L116 140 Z" fill="rgba(0,0,0,.14)" />
      {/* neck */}
      <path d="M88 118 h24 v16 a12 12 0 0 1 -24 0 Z" fill={skin} />
      <path d="M88 118 h24 v6 a12 12 0 0 1 -24 0 Z" fill="rgba(0,0,0,.08)" />
      {/* hair back (long styles only) */}
      {isGirl && longHair && (
        <path
          d="M52 94 C52 52 74 34 100 34 C126 34 148 52 148 94 L148 152 C140 146 132 144 126 144 L74 144 C68 144 60 146 52 152 Z"
          fill={hair}
        />
      )}
      {/* ears */}
      <circle cx="62" cy="98" r="9" fill={skin} />
      <circle cx="138" cy="98" r="9" fill={skin} />
      {/* face */}
      <ellipse cx="100" cy="94" rx="40" ry="44" fill={skin} />
      {/* fringe / hair top */}
      {isGirl ? (
        <path d="M60 82 C64 50 82 40 100 40 C118 40 136 50 140 82 C128 66 116 60 100 60 C84 60 72 66 60 82 Z" fill={hair} />
      ) : (
        <path d="M58 84 C58 46 78 36 100 36 C122 36 142 46 142 84 C130 66 116 60 100 60 C84 60 70 66 58 84 Z" fill={hair} />
      )}
      {/* brows */}
      <path d="M76 86 q9 -5 18 -1" fill="none" stroke="rgba(0,0,0,.4)" strokeWidth="3" strokeLinecap="round" />
      <path d="M106 85 q9 -4 18 1" fill="none" stroke="rgba(0,0,0,.4)" strokeWidth="3" strokeLinecap="round" />
      {/* eyes */}
      <circle cx="84" cy="98" r="6" fill="#2A1D1A" />
      <circle cx="116" cy="98" r="6" fill="#2A1D1A" />
      <circle cx="86" cy="96" r="2" fill="#fff" />
      <circle cx="118" cy="96" r="2" fill="#fff" />
      {/* blush */}
      <ellipse cx="74" cy="110" rx="7" ry="4.5" fill="#FF6F9C" opacity="0.4" />
      <ellipse cx="126" cy="110" rx="7" ry="4.5" fill="#FF6F9C" opacity="0.4" />
      {/* nose + smile */}
      <path d="M100 104 q3 4 0 7" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M86 116 q14 11 28 0" fill="none" stroke="#C2506E" strokeWidth="3.4" strokeLinecap="round" />
      {/* accessory: bow */}
      {isGirl && accessory_id === 'bow' && (
        <g>
          <path d="M128 44 l14 -6 0 14 z" fill="#FF2A85" />
          <path d="M128 44 l14 6 0 -14 z" fill="#FF2A85" />
          <circle cx="128" cy="44" r="4.5" fill="#C21361" />
        </g>
      )}
      {/* accessory: glasses */}
      {accessory_id === 'glasses' && (
        <g fill="none" stroke="#2A1D1A" strokeWidth="3">
          <circle cx="84" cy="98" r="12" />
          <circle cx="116" cy="98" r="12" />
          <path d="M96 98 h8" strokeLinecap="round" />
          <path d="M72 96 l-9 -3M128 96 l9 -3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
