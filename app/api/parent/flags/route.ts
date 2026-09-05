import { NextResponse } from 'next/server';
import { getFlaggedQuestions, getApprovedQuestions, reviewQuestion } from '@/lib/db';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, flagged: [], approved: [] });
  const which = new URL(req.url).searchParams.get('status');
  if (which === 'approved') {
    return NextResponse.json({ ok: true, approved: (await getApprovedQuestions()) ?? [] });
  }
  const flagged = await getFlaggedQuestions();
  return NextResponse.json({ ok: true, flagged: flagged ?? [] });
}

export async function POST(req: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, reason: 'locked' });
  const b = await req.json().catch(() => null);
  const id = b?.id as string | undefined;
  const action = b?.action as 'approve' | 'reject' | 'unapprove' | undefined;
  if (!id || !action || !['approve', 'reject', 'unapprove'].includes(action)) {
    return NextResponse.json({ ok: false, reason: 'bad-input' });
  }
  const ok = await reviewQuestion(id, action);
  return NextResponse.json({ ok });
}
