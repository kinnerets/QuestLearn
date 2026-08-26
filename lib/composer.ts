// Spaced-repetition core (SM-2) for the Daily Quest Composer.
// Pure functions — no DB — so they're easy to reason about and test.

export interface Sm2State {
  ease: number;      // ease factor, >= 1.3
  interval: number;  // days until next review
}

export interface Sm2Result {
  ease: number;
  interval: number;
  nextReviewAt: string; // ISO
}

/**
 * Map an answer to an SM-2 quality score (0–5):
 * clean correct = 5, correct after a hint = 3, wrong = 1.
 */
export function qualityFrom(isCorrect: boolean, hintsUsed: number): number {
  if (!isCorrect) return 1;
  return hintsUsed > 0 ? 3 : 5;
}

/** Standard SM-2 update. quality < 3 means relearn today (interval 0). */
export function sm2(prev: Sm2State, quality: number): Sm2Result {
  let ease = prev.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3;

  let interval: number;
  if (quality < 3) interval = 0;
  else if (prev.interval <= 0) interval = 1;
  else if (prev.interval === 1) interval = 3;
  else interval = Math.round(prev.interval * ease);

  const nextReviewAt = new Date(Date.now() + Math.max(interval, 0) * 86_400_000).toISOString();
  return { ease: Number(ease.toFixed(2)), interval, nextReviewAt };
}

/** Running mastery estimate in [0,1], nudged toward the latest outcome. */
export function updateMastery(prev: number, isCorrect: boolean): number {
  const target = isCorrect ? 1 : 0;
  const next = prev + (target - prev) * 0.3; // exponential moving average
  return Number(Math.min(1, Math.max(0, next)).toFixed(2));
}
