import { NextResponse } from 'next/server';
import { getNextDaily, getChildProfileById } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ next: null, done: true });
  const exclude = new URL(request.url).searchParams.get('exclude') ?? undefined;
  const child = await getChildProfileById(id);
  const r = await getNextDaily(id, child?.grade ?? 'grade_3', exclude);
  return NextResponse.json(r);
}
