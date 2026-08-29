import { NextResponse } from 'next/server';
import { getChildProfileById, placementLevel, setPlacementLevel } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ ok: false, reason: 'no-profile' });
  const child = await getChildProfileById(id);
  if (!child) return NextResponse.json({ ok: false, reason: 'no-child' });
  const b = await req.json().catch(() => null);
  const correct = Math.max(0, Number(b?.correct ?? 0));
  const total = Math.max(1, Number(b?.total ?? 1));
  const level = placementLevel(correct, total, child.grade ?? 'grade_3');
  await setPlacementLevel(id, level);
  return NextResponse.json({ ok: true, level });
}
