import { NextResponse } from 'next/server';
import { logAttempt } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ ok: false });
  const b = await req.json().catch(() => null);
  if (!b?.questionId || !b?.topicId) return NextResponse.json({ ok: false });
  const ok = await logAttempt(id, {
    questionId: String(b.questionId),
    topicId: String(b.topicId),
    isCorrect: !!b.isCorrect,
    misconception: b.misconception ?? null,
    hintsUsed: Number(b.hintsUsed) || 0,
    chosenAnswer: b.chosenAnswer ?? null,
  });
  return NextResponse.json({ ok });
}
