import { NextResponse } from 'next/server';
import { getAssessmentQuestions, gradeAndSaveAssessment, getChildProfileById } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: Request) {
  const id = selectedChildId();
  const child = id ? await getChildProfileById(id) : null;
  const kind = new URL(req.url).searchParams.get('kind') === 'mid' ? 'mid' : 'end';
  const questions = await getAssessmentQuestions(child?.grade ?? 'grade_3', 20, kind);
  return NextResponse.json({ ok: true, questions: questions ?? [] });
}

export async function POST(req: Request) {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ ok: false });
  const child = await getChildProfileById(id);
  const b = await req.json().catch(() => null);
  const answers = Array.isArray(b?.answers)
    ? (b.answers as unknown[]).map((a) => {
        const o = a as { questionId?: string; choiceId?: string };
        return { questionId: String(o.questionId ?? ''), choiceId: String(o.choiceId ?? '') };
      }).filter((a) => a.questionId)
    : [];
  const kind = b?.kind === 'mid' ? 'mid' : 'end';
  const report = await gradeAndSaveAssessment(id, child?.grade ?? 'grade_3', answers, kind);
  return NextResponse.json({ ok: !!report, report });
}
