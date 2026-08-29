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
  leadership: 'מנהיגות',
};

/** Which station "kind" (icon/colour family) each subject belongs to. */
export const SUBJECT_KIND: Record<string, 'core' | 'lang' | 'future' | 'lead'> = {
  math: 'core', geometry: 'core', hebrew: 'core', bible: 'core', science: 'future',
  arabic: 'lang', english: 'lang',
  future_skills: 'future', geography: 'future',
  leadership: 'lead',
};
