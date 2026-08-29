import { NextResponse } from 'next/server';
import { getFlaggedQuestions, reviewQuestion } from '@/lib/db';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, flagged: [] });
  const flagged = await getFlaggedQuestions();
  return NextResponse.json({ ok: true, flagged: flagged ?? [] });
}

export async function POST(req: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, reason: 'locked' });
  const b = await req.json().catch(() => null);
  const id = b?.id as string | undefined;
  const action = b?.action as 'approve' | 'reject' | undefined;
  if (!id || (action !== 'approve' && action !== 'reject')) return NextResponse.json({ ok: false, reason: 'bad-input' });
  const ok = await reviewQuestion(id, action);
  return NextResponse.json({ ok });
}
