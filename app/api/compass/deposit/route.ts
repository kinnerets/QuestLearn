import { NextResponse } from 'next/server';
import { recordDeposit } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ ok: false });
  const b = await req.json().catch(() => null);
  if (!b?.topicId || !b?.questionId) return NextResponse.json({ ok: false });
  const ok = await recordDeposit(id, String(b.topicId), String(b.questionId), b.choice ?? null);
  return NextResponse.json({ ok });
}
