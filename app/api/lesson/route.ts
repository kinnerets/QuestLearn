import { NextResponse } from 'next/server';
import { getDailyLesson, getChildProfileById } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const id = selectedChildId();
  const child = id ? await getChildProfileById(id) : null;
  const lesson = await getDailyLesson(child?.grade ?? 'grade_3');
  return NextResponse.json({ lesson, coins: child?.coins ?? null, name: child?.name ?? null });
}
