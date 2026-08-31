export type AssessmentKind = 'mid' | 'end';

export function assessmentLabel(kind: AssessmentKind): string {
  return kind === 'mid' ? 'מבדק מחצית' : 'מבדק סוף שנה';
}

/**
 * Which assessment (if any) is "in season" now:
 *  - end of year: June (through the first days of July).
 *  - mid year: December through January (the usual mid-year testing window).
 * Returns null the rest of the year, so the card only shows when relevant.
 */
export function assessmentSeason(now: Date = new Date()): { kind: AssessmentKind; label: string } | null {
  const month = now.getUTCMonth() + 1; // 1..12
  const day = now.getUTCDate();
  if (month === 6 || (month === 7 && day <= 10)) return { kind: 'end', label: assessmentLabel('end') };
  if (month === 12 || month === 1) return { kind: 'mid', label: assessmentLabel('mid') };
  return null;
}
