import { NextResponse } from 'next/server';
import { getChildInterests, setChildInterests } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ interests: [] });
  return NextResponse.json({ interests: await getChildInterests(id) });
}

export async function POST(req: Request) {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ ok: false, reason: 'no-profile' });
  const b = await req.json().catch(() => null);
  const interests = Array.isArray(b?.interests) ? (b.interests as unknown[]).map(String) : [];
  const ok = await setChildInterests(id, interests);
  return NextResponse.json({ ok });
}
