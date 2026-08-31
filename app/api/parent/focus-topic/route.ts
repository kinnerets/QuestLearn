import { NextResponse } from 'next/server';
import { setParentFocusTopic } from '@/lib/db';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false });
  const b = await request.json().catch(() => null);
  const childId = String(b?.childId ?? '');
  const topicId = String(b?.topicId ?? '');
  const on = !!b?.on;
  if (!childId || !topicId) return NextResponse.json({ ok: false });
  const ok = await setParentFocusTopic(childId, topicId, on);
  return NextResponse.json({ ok });
}
