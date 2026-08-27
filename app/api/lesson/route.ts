import { NextResponse } from 'next/server';
import { getDailyLesson, composeFocus, getChildProfileById } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const round = Math.max(1, Number(searchParams.get('round')) || 1);
  const focus = searchParams.get('focus');
  const id = selectedChildId();
  const child = id ? await getChildProfileById(id) : null;
  const grade = child?.grade ?? 'grade_3';
  const lesson = focus
    ? await composeFocus(grade, focus, round)
    : await getDailyLesson(grade, round);
  return NextResponse.json({ lesson, coins: child?.coins ?? null, name: child?.name ?? null });
}
