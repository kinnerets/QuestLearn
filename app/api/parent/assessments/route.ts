import { NextResponse } from 'next/server';
import { getAssessments } from '@/lib/db';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, assessments: [] });
  const childId = new URL(request.url).searchParams.get('childId') ?? '';
  if (!childId) return NextResponse.json({ ok: false, assessments: [] });
  const assessments = await getAssessments(childId);
  return NextResponse.json({ ok: true, assessments });
}
