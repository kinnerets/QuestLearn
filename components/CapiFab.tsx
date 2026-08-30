'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Capi } from './Capi';

// Screens where a floating button would get in the way (immersive / already-Capi).
const HIDE = ['/capi', '/parent', '/profiles', '/placement', '/avatar', '/exercise'];

/** A small, still Capi that floats on every relaxed screen and opens the chat. */
export function CapiFab() {
  const path = usePathname() || '/';
  if (HIDE.some((p) => path === p || path.startsWith(p + '/'))) return null;
  return (
    <Link href="/capi" className="capi-fab" aria-label="שאלי את קפי">
      <Capi mood="chill" size={42} still />
    </Link>
  );
}
