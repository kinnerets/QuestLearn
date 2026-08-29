// Client-safe shared constants (no server-only imports here).

/** Cookie that stores which child profile is active. */
export const CHILD_COOKIE = 'ql_child';

/** Hebrew label per curriculum subject. */
export const SUBJECT_LABEL: Record<string, string> = {
  math: 'חשבון',
  geometry: 'גאומטריה',
  hebrew: 'עברית',
  bible: 'תנ״ך',
  science: 'מדע',
  arabic: 'ערבית',
  english: 'אנגלית',
  geography: 'גאוגרפיה',
  future_skills: 'יזמות',
  economics: 'כלכלה',
  fashion: 'אופנה',
  politics: 'פוליטיקה',
  ai: 'בינה מלאכותית',
  philosophy: 'פילוסופיה',
  seasonal: 'עונתי',
  leadership: 'מנהיגות',
};

/** Enrichment subjects a parent may want to gate (sensitive) — locked by default. */
export const SENSITIVE_SUBJECTS = new Set(['politics', 'ai']);

/** Which station "kind" (icon/colour family) each subject belongs to. */
export const SUBJECT_KIND: Record<string, 'core' | 'lang' | 'future' | 'lead'> = {
  math: 'core', geometry: 'core', hebrew: 'core', bible: 'core', science: 'future',
  arabic: 'lang', english: 'lang',
  future_skills: 'future', geography: 'future',
  economics: 'future', fashion: 'future', politics: 'future', ai: 'future', philosophy: 'future',
  seasonal: 'future',
  leadership: 'lead',
};
