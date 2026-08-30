import { NextResponse } from 'next/server';
import { getParentFocus, setParentFocus } from '@/lib/db';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, focus: [] });
  const childId = new URL(request.url).searchParams.get('childId');
  if (!childId) return NextResponse.json({ ok: true, focus: [] });
  return NextResponse.json({ ok: true, focus: await getParentFocus(childId) });
}

export async function POST(req: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, reason: 'locked' });
  const b = await req.json().catch(() => null);
  const childId = b?.childId as string | undefined;
  const subjects = Array.isArray(b?.subjects) ? (b.subjects as unknown[]).map(String) : [];
  if (!childId) return NextResponse.json({ ok: false, reason: 'no-child' });
  return NextResponse.json({ ok: await setParentFocus(childId, subjects) });
}
