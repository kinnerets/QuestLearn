import type { ReactNode } from 'react';

function Svg({ children, size = 24 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      className="i"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const CoinIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="9.3" fill="#F5B70C" stroke="none" />
    <circle cx="12" cy="12" r="9.3" fill="none" stroke="rgba(120,72,0,.22)" strokeWidth="1" />
    <circle cx="12" cy="12" r="6.9" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1" />
    <path d="M12 7.4 L13.06 10.5 L16.33 10.55 L13.7 12.5 L14.66 15.65 L12 13.75 L9.34 15.65 L10.3 12.5 L7.67 10.55 L10.94 10.5 Z"
      fill="#FFF8E1" stroke="none" />
  </Svg>
);
export const FlameIcon = () => (
  <Svg>
    <path d="M12 2.2c.4 3.5 4.4 4.7 4.4 9.1a4.9 4.9 0 0 1-9.8 0c0-2 .9-3.7 2.2-4.9.2 2.2 2.4 2.3 2.4.2 0-2.1-.3-3.6 .8-4.4z"
      fill="#FB6A2E" stroke="none" />
    <path d="M12 10.4c.2 1.9 2.3 2.5 2.3 4.8a2.6 2.6 0 0 1-5.2 0c0-1.1.5-2 1.2-2.7.1 1.2 1.3 1.2 1.3.1 0-1.1-.2-1.9.4-2.2z"
      fill="#FFC93C" stroke="none" />
  </Svg>
);
export const LevelIcon = () => (
  <Svg>
    <path d="M8.4 12.5 L6.8 22 L10 20 L12 22.3 L14 20 L17.2 22 L15.6 12.5 Z" fill="#FF3D8B" stroke="none" />
    <circle cx="12" cy="9" r="7.1" fill="#F5B70C" stroke="none" />
    <circle cx="12" cy="9" r="7.1" fill="none" stroke="rgba(120,72,0,.22)" strokeWidth="1" />
    <path d="M8.2 10.6 L12 6.4 L15.8 10.6" fill="none" stroke="#FFF8E1" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Achievement-badge glyphs (monochrome — the badge circle colors them). ──
export const FlagIcon = () => (
  <Svg><path d="M6 21V4" /><path d="M6 4.5h11l-2.3 3.3L17 11H6" /></Svg>
);
export const FlameBadgeIcon = () => (
  <Svg><path d="M12 2.6c.4 3.3 4.1 4.5 4.1 8.6a4.6 4.6 0 0 1-9.2 0c0-1.9.8-3.4 2-4.6.2 2 2.3 2.1 2.3.2 0-2-.3-3.3.8-4.2z" fill="currentColor" stroke="none" /></Svg>
);
export const CalendarStarIcon = () => (
  <Svg><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M4 9.5h16" /><path d="M8 3v3.5M16 3v3.5" /><path d="M8.4 14l1.7 1.7 3.5-3.5" /></Svg>
);
export const TargetIcon = () => (
  <Svg><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.6" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></Svg>
);
export const TrophyIcon = () => (
  <Svg>
    <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
    <path d="M7 5H4.6a2.4 2.4 0 0 0 2.6 3" /><path d="M17 5h2.4a2.4 2.4 0 0 1-2.6 3" />
    <path d="M12 13v3" /><path d="M9.3 20h5.4" /><path d="M9.8 20l.4-3.6h3.6l.4 3.6" />
  </Svg>
);
export const CalcIcon = () => (
  <Svg>
    <rect x="4" y="3" width="16" height="18" rx="3" />
    <line x1="8" y1="7.5" x2="16" y2="7.5" />
    <line x1="8.5" y1="12" x2="8.6" y2="12" /><line x1="12" y1="12" x2="12.1" y2="12" /><line x1="15.5" y1="12" x2="15.6" y2="12" />
    <line x1="8.5" y1="16" x2="8.6" y2="16" /><line x1="12" y1="16" x2="12.1" y2="16" /><line x1="15.5" y1="16" x2="15.6" y2="16" />
  </Svg>
);
export const SpeechIcon = () => (
  <Svg><path d="M20 6H8a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1v3l4-3h7a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" /><line x1="10" y1="10.5" x2="18" y2="10.5" /></Svg>
);
export const SparkIcon = () => (
  <Svg><path d="M12 3c2.6 2 3.8 5.4 3.8 8.4l-3.8 2.8-3.8-2.8C8.2 8.4 9.4 5 12 3z" /><path d="M9 14.5l-2 4M15 14.5l2 4" /><circle cx="12" cy="9" r="1.4" /></Svg>
);
export const HeartIcon = () => (
  <Svg><path d="M12 20s-6.5-4.2-6.5-9A3.3 3.3 0 0 1 12 8a3.3 3.3 0 0 1 6.5 3c0 4.8-6.5 9-6.5 9z" /></Svg>
);
export const MapIcon = () => (
  <Svg><path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" /><line x1="9" y1="4" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="20" /></Svg>
);
export const ChartIcon = () => (
  <Svg><line x1="5" y1="20" x2="5" y2="11" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="19" y1="20" x2="19" y2="14" /></Svg>
);
export const GiftIcon = () => (
  <Svg><rect x="4" y="9" width="16" height="11" rx="1" /><line x1="4" y1="13" x2="20" y2="13" /><line x1="12" y1="9" x2="12" y2="20" /><path d="M12 9C11 6 8 6 8 8s3 1 4 1zM12 9c1-3 4-3 4-1s-3 1-4 1z" /></Svg>
);
export const ChevronIcon = () => (
  <Svg><path d="M15 6l-6 6 6 6" /></Svg>
);
export const GridIcon = () => (
  <Svg><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></Svg>
);
export const StarIcon = () => (
  <Svg><path d="M12 4l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4L7.5 18l.9-5L4.8 9.3l5-.7z" /></Svg>
);
export const HomeIcon = () => (
  <Svg><path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" /></Svg>
);
export const EarIcon = () => (
  <Svg><path d="M8.5 9a3.5 3.5 0 1 1 7 0c0 3-3 3-3 5.5a2 2 0 0 1-4 0" /><path d="M17.5 6.5c1.2 1 1.8 2.3 1.8 3.8" /></Svg>
);
export const CheckIcon = () => (
  <Svg><path d="M5 13l4 4L19 7" /></Svg>
);
export const CloseIcon = () => (
  <Svg><line x1="7" y1="7" x2="17" y2="17" /><line x1="17" y1="7" x2="7" y2="17" /></Svg>
);

export const BookIcon = () => (
  <Svg><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" /></Svg>
);
export const CompassIcon = () => (
  <Svg><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></Svg>
);

// Per-subject glyphs so each subject reads at a glance (not one calculator for all).
export const ShapesIcon = () => (
  <Svg><circle cx="7.5" cy="7.5" r="4" /><rect x="13" y="13" width="7" height="7" rx="1" /><path d="M7.5 13.5 L4 20 h7 z" /></Svg>
);
export const ScrollIcon = () => (
  <Svg><path d="M6 4h11a2 2 0 0 1 2 2v11a2 2 0 0 0 2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 0-2-2z" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /></Svg>
);
export const FlaskIcon = () => (
  <Svg><path d="M9 3h6" /><path d="M10 3v6l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3" /><line x1="7.5" y1="15" x2="16.5" y2="15" /></Svg>
);
export const GlobeIcon = () => (
  <Svg><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></Svg>
);
export const BulbIcon = () => (
  <Svg><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" /></Svg>
);
export const AbcIcon = () => (
  <Svg><path d="M3 17V9l3 8M3.7 14h4.6" /><path d="M11 7v10h2.5a2.5 2.5 0 0 0 0-5H11m0 0h2a2 2 0 0 0 0-4h-2" /><path d="M21 9.5A2.5 2.5 0 0 0 16.5 11v3A2.5 2.5 0 0 0 21 15.5" /></Svg>
);

export const ShirtIcon = () => (
  <Svg><path d="M8 3l4 3 4-3 4 3-3 3v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9L4 6z" /></Svg>
);
export const ScaleIcon = () => (
  <Svg><path d="M12 3v18" /><path d="M6 21h12" /><path d="M4 7h16" /><path d="M4 7l-2.5 5a3 3 0 0 0 5 0z" /><path d="M20 7l-2.5 5a3 3 0 0 0 5 0z" /></Svg>
);
export const ChipIcon = () => (
  <Svg><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M10 2v3M14 2v3M10 19v3M14 19v3M2 10h3M2 14h3M19 10h3M19 14h3" /></Svg>
);
export const FeatherIcon = () => (
  <Svg><path d="M20 4C11 4 7 10 6 16l-3 3 2 2 3-3c6-1 12-5 12-14z" /><path d="M16 8L8 16" /></Svg>
);
export const LockIcon = () => (
  <Svg><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>
);
export const GearIcon = () => (
  <Svg><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" /></Svg>
);
export const SwapIcon = () => (
  <Svg><path d="M7 4L4 7l3 3" /><path d="M4 7h11a4 4 0 0 1 4 4" /><path d="M17 20l3-3-3-3" /><path d="M20 17H9a4 4 0 0 1-4-4" /></Svg>
);
export const MicIcon = () => (
  <Svg><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0" /><path d="M12 17v4" /><path d="M9 21h6" /></Svg>
);
export const UnlockIcon = () => (
  <Svg><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 7.9-1" /></Svg>
);

/** Which glyph each curriculum subject shows (color still comes from the kind). */
export const SUBJECT_ICON: Record<string, () => JSX.Element> = {
  math: CalcIcon,
  geometry: ShapesIcon,
  hebrew: BookIcon,
  bible: ScrollIcon,
  science: FlaskIcon,
  arabic: SpeechIcon,
  english: AbcIcon,
  geography: GlobeIcon,
  future_skills: BulbIcon,
  economics: CoinIcon,
  fashion: ShirtIcon,
  politics: ScaleIcon,
  ai: ChipIcon,
  philosophy: FeatherIcon,
  seasonal: StarIcon,
  leadership: HeartIcon,
};

export const LEAD_ICON = { star: StarIcon, home: HomeIcon, ear: EarIcon } as const;

/** A distinct glyph per achievement badge (keys match db.ts StatusBadge). */
export const BADGE_ICON: Record<string, () => JSX.Element> = {
  first_step: FlagIcon,
  streak_3: FlameBadgeIcon,
  streak_7: CalendarStarIcon,
  sharp: TargetIcon,
  century: TrophyIcon,
  gold_heart: HeartIcon,
  wise_time: BulbIcon,
};

// Icons usable inside leadership worlds (compass).
export const COMPASS_ICON = {
  star: StarIcon, heart: HeartIcon, spark: SparkIcon, book: BookIcon, home: HomeIcon, ear: EarIcon,
} as const;

export const STATION_ICON = {
  core: CalcIcon,
  lang: SpeechIcon,
  future: SparkIcon,
  lead: HeartIcon,
} as const;
