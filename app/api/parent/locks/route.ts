import { NextResponse } from 'next/server';
import { getSensitiveLocks, setSubjectLock } from '@/lib/db';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, locks: [] });
  const locks = await getSensitiveLocks();
  return NextResponse.json({ ok: true, locks: locks ?? [] });
}

export async function POST(req: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, reason: 'locked' });
  const b = await req.json().catch(() => null);
  const subject = b?.subject as string | undefined;
  const locked = b?.locked;
  if (!subject || typeof locked !== 'boolean') return NextResponse.json({ ok: false, reason: 'bad-input' });
  const ok = await setSubjectLock(subject, locked);
  return NextResponse.json({ ok });
}
