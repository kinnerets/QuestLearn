import { NextResponse } from 'next/server';
import { getDailyLesson, composeFocus, getChildProfileById } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const focus = searchParams.get('focus');
  const topic = searchParams.get('topic');
  const id = selectedChildId();
  const child = id ? await getChildProfileById(id) : null;
  const grade = child?.grade ?? 'grade_3';
  const lesson = focus
    ? await composeFocus(grade, focus, id ?? undefined, topic ?? undefined)
    : await getDailyLesson(grade);
  return NextResponse.json({ lesson, coins: child?.coins ?? null, name: child?.name ?? null });
}
