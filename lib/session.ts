import { cookies } from 'next/headers';
import { CHILD_COOKIE } from './constants';

export { CHILD_COOKIE };

/** Which child profile is active. Set client-side by the profile picker. */
export function selectedChildId(): string | null {
  return cookies().get(CHILD_COOKIE)?.value ?? null;
}
