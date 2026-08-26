import { cookies } from 'next/headers';
import { CHILD_COOKIE } from './constants';

export { CHILD_COOKIE };

/** Which child profile is active. Set client-side by the profile picker. */
export function selectedChildId(): string | null {
  return cookies().get(CHILD_COOKIE)?.value ?? null;
}

/** Parent-area gate. Cookie is httpOnly, set only after the correct PIN. */
export const PARENT_COOKIE = 'ql_parent';

/** The parent PIN. Set PARENT_PIN in Vercel; defaults to 1234 until then. */
export function parentPin(): string {
  return process.env.PARENT_PIN || '1234';
}

export function parentUnlocked(): boolean {
  return cookies().get(PARENT_COOKIE)?.value === '1';
}
