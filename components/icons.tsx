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
  <Svg><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.4" /></Svg>
);
export const FlameIcon = () => (
  <Svg><path d="M12 3c1.4 3 4 4.2 4 7.5a4 4 0 0 1-8 0c0-1.6.7-2.8 1.6-3.7.2 1.7 1.9 1.8 1.9.2 0-1.7-.2-2.8.5-4z" /></Svg>
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

export const STATION_ICON = {
  core: CalcIcon,
  lang: SpeechIcon,
  future: SparkIcon,
  lead: HeartIcon,
} as const;
