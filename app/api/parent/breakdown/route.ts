import { NextResponse } from 'next/server';
import { getSubjectBreakdown, getParentFocusTopics, getChildProfileById, getRecentWrongByTopic } from '@/lib/db';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, breakdown: [], focusTopics: [] });
  const childId = new URL(request.url).searchParams.get('childId') ?? '';
  if (!childId) return NextResponse.json({ ok: false, breakdown: [], focusTopics: [] });
  const child = await getChildProfileById(childId);
  const [breakdown, focusTopics, recentWrong] = await Promise.all([
    getSubjectBreakdown(child?.grade ?? 'grade_3', childId),
    getParentFocusTopics(childId),
    getRecentWrongByTopic(childId),
  ]);
  return NextResponse.json({ ok: true, breakdown: breakdown ?? [], focusTopics, recentWrong });
}
