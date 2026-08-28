import { NextResponse } from 'next/server';
import { completeQuest } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ coins: 0 }));
  const id = selectedChildId();
  const granted = await completeQuest(Number(body?.coins) || 0, id ?? undefined, Number(body?.xp) || 0);
  return NextResponse.json({ ok: true, granted });
}
