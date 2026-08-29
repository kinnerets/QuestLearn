import { NextResponse } from 'next/server';
import { getPlacementQuestions, getChildProfileById } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const id = selectedChildId();
  const child = id ? await getChildProfileById(id) : null;
  const grade = child?.grade ?? 'grade_3';
  const questions = await getPlacementQuestions(grade);
  return NextResponse.json({ questions: questions ?? [] });
}
